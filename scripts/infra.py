#!/usr/bin/env python3
"""Run OpenTofu checks or transfer an encrypted, commit-bound plan through R2."""
import argparse
import base64
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / "infra" / "opentofu"
ACCOUNT = "5ccb67114ff0fa1a13cb46ef3d08cb49"
BUCKET = "velogroupsets-infra-state"
ENDPOINT = f"https://{ACCOUNT}.r2.cloudflarestorage.com"


def failure_summary(text):
    """Allowlist categories/codes; never echo arbitrary provider error text."""
    categories = []
    patterns = {
        "decryption failed; check the unchanged encryption key": r"decrypt|cipher: message authentication failed",
        "saved plan is stale; generate a new plan": r"saved plan is stale|saved plan does not match|different state lineage",
        "authentication or permission error": r"authentication|unauthorized|forbidden|accessdenied|permission denied|authorization",
        "resource already exists; inspect/import before retrying": r"already exists|already_exists",
        "provider returned inconsistent state": r"provider produced inconsistent|inconsistent result",
        "state lock error": r"error acquiring the state lock|error releasing the state lock",
        "rate limit": r"rate.limit|too many requests",
    }
    for label, pattern in patterns.items():
        if re.search(pattern, text, re.I):
            categories.append(label)
    statuses = sorted(set(re.findall(r"\b(?:HTTP(?: status)?[ :=]*|StatusCode[ :=]*|status[ :=]*)([45][0-9]{2})\b", text, re.I)))
    codes = sorted(set(re.findall(r'["\x27]?code["\x27]?\s*[:=]\s*([0-9]{3,8})\b', text, re.I)))
    addresses = sorted(set(re.findall(r"\bcloudflare_[a-z0-9_]+\.[a-z0-9_]+\b", text)))
    parts = categories + (["HTTP " + ",".join(statuses)] if statuses else []) + (["API codes " + ",".join(codes)] if codes else [])
    if addresses:
        parts.append("resources: " + ", ".join(addresses))
    return "; ".join(parts) or "unclassified command failure; inspect the encrypted private diagnostic"


class CommandFailure(RuntimeError):
    def __init__(self, operation, stdout, stderr):
        self.operation, self.stdout, self.stderr = operation, stdout, stderr
        super().__init__(f"OpenTofu {operation} failed: {failure_summary(stdout + chr(10) + stderr)}")


def encryption_env(passphrase):
    if not isinstance(passphrase, str) or len(passphrase) < 16:
        raise ValueError("TOFU_ENCRYPTION_PASSPHRASE must contain at least 16 characters.")
    # HCL decodes the exact string, preserving existing keys while preventing
    # interpolation/quote injection from password-manager passphrases.
    encoded = base64.b64encode(passphrase.encode("utf-8")).decode("ascii")
    env = os.environ.copy()
    env.update(TF_INPUT="false", TF_IN_AUTOMATION="true", TF_WORKSPACE="default", AWS_EC2_METADATA_DISABLED="true")
    env["TF_ENCRYPTION"] = f'''
key_provider "pbkdf2" "state_key" {{ passphrase = base64decode("{encoded}") }}
method "aes_gcm" "encrypted" {{ keys = key_provider.pbkdf2.state_key }}
state {{
  method = method.aes_gcm.encrypted
  enforced = true
}}
plan {{
  method = method.aes_gcm.encrypted
  enforced = true
}}
'''
    # Never enable diagnostic logs in the public workflow.
    env.pop("TF_LOG", None)
    env.pop("TF_LOG_PATH", None)
    return env


def tofu(args, env, cwd=CONFIG, public=False):
    result = subprocess.run(["tofu", *args], cwd=cwd, env=env, capture_output=True, text=True)
    if public:
        print(result.stdout, end="")
        print(result.stderr, end="", file=sys.stderr)
    if result.returncode:
        raise CommandFailure(args[0], result.stdout, result.stderr)
    return result.stdout


def encrypted(data):
    try:
        return json.loads(data).get("encryption_version") == "v0"
    except (ValueError, AttributeError, UnicodeDecodeError):
        return False


def verify_plan(data, digest):
    if not re.fullmatch(r"[0-9a-f]{64}", digest or "") or hashlib.sha256(data).hexdigest() != digest:
        raise ValueError("Saved plan checksum does not match the reviewed job output.")
    if not encrypted(data):
        raise ValueError("Refusing an unencrypted plan.")


def plan_key(environment, run_id, attempt, sha):
    if environment not in ("staging", "production") or not re.fullmatch(r"[0-9a-f]{40}", sha):
        raise ValueError("Invalid environment or source commit.")
    if not re.fullmatch(r"[0-9]+", run_id) or not re.fullmatch(r"[0-9]+", attempt):
        raise ValueError("Numeric GitHub run ID and attempt are required.")
    return f"plans/{environment}/{run_id}/{attempt}/{sha}/plan.tofuplan"


def require_reviewers(repository, environment, token):
    request = Request(f"https://api.github.com/repos/{repository}/environments/{environment}", headers={
        "Authorization": f"Bearer {token}", "Accept": "application/vnd.github+json",
    })
    with urlopen(request, timeout=30) as response:
        rules = json.load(response).get("protection_rules", [])
    if not any(rule.get("type") == "required_reviewers" and rule.get("reviewers") for rule in rules):
        raise ValueError("Apply environment must have a required reviewer configured in GitHub.")


def s3_client():
    import boto3
    from botocore.config import Config
    for name in ("AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"):
        if not os.environ.get(name):
            raise ValueError(f"{name} is required for private R2 state storage.")
    return boto3.client("s3", endpoint_url=ENDPOINT, region_name="auto", config=Config(
        signature_version="s3v4", s3={"addressing_style": "path"},
        request_checksum_calculation="when_required", response_checksum_validation="when_required",
    ))


def snapshot(client, environment, run_id, attempt, phase):
    from botocore.exceptions import ClientError
    try:
        data = client.get_object(Bucket=BUCKET, Key=f"state/{environment}/terraform.tfstate")["Body"].read()
    except ClientError as error:
        if error.response["Error"]["Code"] in ("NoSuchKey", "404"):
            return
        raise
    if not encrypted(data):
        raise ValueError("Refusing an unencrypted state snapshot.")
    client.put_object(Bucket=BUCKET, Key=f"snapshots/{environment}/{run_id}/{attempt}/{phase}.tfstate", Body=data, IfNoneMatch="*")


def save_failure(client, error, env, environment, run_id, attempt):
    """Use native OpenTofu encryption for a private diagnostic, with no API resources."""
    key = f"diagnostics/{environment}/{run_id}/{attempt}/apply-failure.tfstate"
    with tempfile.TemporaryDirectory() as temp:
        root = Path(temp)
        (root / "main.tf").write_text('''terraform {
  backend "local" {}
}
variable "details" {
  type = string
  sensitive = true
}
resource "terraform_data" "failure" {
  input = var.details
}
''')
        payload = json.dumps({"operation": error.operation, "stdout": error.stdout, "stderr": error.stderr})
        (root / "failure.auto.tfvars.json").write_text(json.dumps({"details": payload}))
        tofu(["init"], env, cwd=root)
        tofu(["apply", "-auto-approve"], env, cwd=root)
        data = (root / "terraform.tfstate").read_bytes()
        if not encrypted(data):
            raise ValueError("Refusing to upload unencrypted diagnostics.")
        client.put_object(Bucket=BUCKET, Key=key, Body=data, IfNoneMatch="*")
    print(f"Encrypted private diagnostic saved: {key}", flush=True)


def resources_in(module):
    return module.get("resources", []) + [r for child in module.get("child_modules", []) for r in resources_in(child)]


def inspect_state(client, env, environment, inspect_key):
    from botocore.exceptions import ClientError
    tofu(["init", "-backend=false", "-lockfile=readonly"], env)
    keys = [f"state/{environment}/terraform.tfstate"]
    if inspect_key:
        if not re.fullmatch(rf"(?:plans/{environment}/[0-9]+/[0-9]+/[a-f0-9]{{40}}/plan\.tofuplan|diagnostics/{environment}/[0-9]+/[0-9]+/apply-failure\.tfstate)", inspect_key):
            raise ValueError("Inspection key must be a saved plan or diagnostic in the selected environment.")
        keys.append(inspect_key)
    with tempfile.TemporaryDirectory() as temp:
        path = Path(temp) / "encrypted-input"
        for key in keys:
            try:
                data = client.get_object(Bucket=BUCKET, Key=key)["Body"].read()
            except ClientError as error:
                if error.response["Error"]["Code"] in ("NoSuchKey", "404"):
                    print(f"No stored object at {key}.")
                    continue
                raise
            if not encrypted(data):
                raise ValueError("Refusing unencrypted inspection input.")
            path.write_bytes(data)
            details = json.loads(tofu(["show", "-json", str(path)], env))
            records = resources_in(details.get("values", {}).get("root_module", {}))
            if key.startswith("diagnostics/"):
                record = next(r for r in records if r["address"] == "terraform_data.failure")
                diagnostic = json.loads(record["values"]["input"])
                print("Private diagnostic classification: " + failure_summary(diagnostic["stdout"] + "\n" + diagnostic["stderr"]))
            elif key.startswith("plans/"):
                changes = details.get("resource_changes", [])
                print(f"Saved plan decrypts successfully; {len(changes)} resource entries:")
                for change in changes:
                    print(change["address"] + ": " + "/".join(change["change"]["actions"]))
                    before, after = change["change"].get("before") or {}, change["change"].get("after") or {}
                    fields = sorted(k for k in before.keys() | after.keys() if before.get(k) != after.get(k))
                    if fields:
                        print("Changed attribute names: " + ", ".join(fields))
                    # Finite, non-secret provider-setting diagnostics; never dump values.
                    if change["address"] == "cloudflare_d1_database.community":
                        previous = before.get("read_replication") or {}
                        desired = after.get("read_replication") or {}
                        for label, value in (("API", previous.get("mode")), ("configuration", desired.get("mode"))):
                            if value in ("auto", "disabled"):
                                print(f"D1 {label} read-replication mode: {value}")
                            elif value is None:
                                print(f"D1 {label} read-replication mode: omitted")
            else:
                print(f"Stored state decrypts successfully; {len(records)} managed resources:")
                for record in records:
                    print(record["address"])
    print("Read-only inspection completed; no remote state or Cloudflare resources changed.")


def review_actions(details):
    """Include import-only state adoption in review, without exposing import IDs."""
    result = []
    for item in details.get("resource_changes", []):
        change = item["change"]
        importing = change.get("importing") is not None
        if change["actions"] != ["no-op"] or importing:
            action = ("import/" if importing else "") + "/".join(change["actions"])
            result.append((item["address"], action))
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("operation", choices=("validate", "plan", "apply", "show", "inspect"))
    parser.add_argument("--environment", choices=("staging", "production"))
    parser.add_argument("--plan-file", type=Path)
    parser.add_argument("--json", dest="json_output", action="store_true", help="Private-terminal show only: includes sensitive values.")
    parser.add_argument("--inspect-key", default="")
    args = parser.parse_args()
    try:
        # A public test-only key is used solely for offline, mocked checks.
        env = encryption_env("0" * 64 if args.operation == "validate" else os.environ.get("TOFU_ENCRYPTION_PASSPHRASE"))
        if args.operation == "validate":
            for command in (["fmt", "-check", "-recursive"], ["init", "-backend=false", "-lockfile=readonly"], ["validate"], ["test"]):
                tofu(command, env, public=True)
            from check_state_locking import check_locking
            check_locking(env)
            return 0
        if args.operation == "show":
            if not args.plan_file:
                raise ValueError("show requires --plan-file in a trusted private terminal.")
            print(tofu(["show", *(["-json"] if args.json_output else []), str(args.plan_file.resolve())], env))
            return 0
        if not args.environment or os.environ.get("GITHUB_REF") != "refs/heads/main":
            raise ValueError("Live operations require an explicit environment and main branch.")
        if not os.environ.get("CLOUDFLARE_API_TOKEN"):
            raise ValueError("CLOUDFLARE_API_TOKEN is required.")
        run_id, attempt, sha = (os.environ.get(name, "") for name in ("GITHUB_RUN_ID", "GITHUB_RUN_ATTEMPT", "GITHUB_SHA"))
        key = plan_key(args.environment, run_id, attempt, sha)
        if args.operation == "apply":
            require_reviewers(os.environ["GITHUB_REPOSITORY"], args.environment, os.environ["GH_TOKEN"])
            key = os.environ.get("PLAN_KEY", "")
            # A re-run of the apply job can use the original plan attempt, never another commit/run/environment.
            pattern = f"plans/{args.environment}/{run_id}/[0-9]+/{sha}/plan.tofuplan"
            if not re.fullmatch(pattern, key):
                raise ValueError("Saved plan belongs to another commit, run or environment.")
        client = s3_client()
        if args.operation == "inspect":
            inspect_state(client, env, args.environment, args.inspect_key)
            return 0
        backend = CONFIG / "backends" / f"{args.environment}.hcl"
        from check_state_locking import check_locking
        check_locking(env, backend, client)
        tofu(["init", "-reconfigure", "-lockfile=readonly", f"-backend-config={backend}"], env)
        snapshot(client, args.environment, run_id, attempt, "before-" + args.operation)
        with tempfile.TemporaryDirectory() as temp:
            plan = Path(temp) / "saved.tofuplan"
            if args.operation == "plan":
                tofu(["plan", "-lock-timeout=60s", f"-var-file=environments/{args.environment}.tfvars", f"-out={plan}"], env)
                data = plan.read_bytes()
                digest = hashlib.sha256(data).hexdigest()
                verify_plan(data, digest)
                details = json.loads(tofu(["show", "-json", str(plan)], env))
                changes = review_actions(details)
                client.put_object(Bucket=BUCKET, Key=key, Body=data, IfNoneMatch="*")
                with open(os.environ["GITHUB_OUTPUT"], "a") as output:
                    output.write(f"plan_key={key}\nplan_sha256={digest}\n")
                with open(os.environ["GITHUB_STEP_SUMMARY"], "a") as summary:
                    summary.write(f"### OpenTofu plan: {args.environment}\n\nCommit: {sha}\n\nPlan SHA-256: {digest}\n\n")
                    summary.write("\n".join(f"- {address}: {action}" for address, action in changes) or "No resource changes.")
                    summary.write("\n\nValues and the encrypted saved plan stay private in R2. Apply uses this exact plan and rejects stale state.\n")
                print(f"Encrypted plan saved; {len(changes)} resource changes. Review the job summary.")
                for address, action in changes:
                    print(f"Plan change: {address}: {action}", flush=True)
            else:
                data = client.get_object(Bucket=BUCKET, Key=key)["Body"].read()
                verify_plan(data, os.environ.get("PLAN_SHA256"))
                plan.write_bytes(data)
                try:
                    # Diagnose decryption/schema problems before any resource mutation.
                    tofu(["show", "-json", str(plan)], env)
                    tofu(["apply", "-lock-timeout=60s", str(plan)], env)
                except CommandFailure as error:
                    try:
                        save_failure(client, error, env, args.environment, run_id, attempt)
                    except Exception:
                        print("Private diagnostic upload failed; original failure preserved.", file=sys.stderr)
                    raise
                finally:
                    active_failure = sys.exc_info()[0] is not None
                    try:
                        snapshot(client, args.environment, run_id, attempt, "after-apply")
                    except Exception:
                        if not active_failure:
                            raise
                        print("Post-apply snapshot failed; original failure preserved.", file=sys.stderr)
                print("Saved plan applied successfully. No plan was regenerated.")
        return 0
    except Exception as error:
        # Provider/backend/SDK errors can include sensitive values or signed requests.
        print(str(error) if isinstance(error, (ValueError, RuntimeError)) else "Infrastructure operation failed; inspect credentials and the backend in a private terminal.", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
