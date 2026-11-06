#!/usr/bin/env python3
"""Run OpenTofu checks or transfer an encrypted, commit-bound plan through R2."""
import argparse
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


def encryption_env(passphrase):
    if not re.fullmatch(r"[0-9a-f]{64}", passphrase or ""):
        raise ValueError("TOFU_ENCRYPTION_PASSPHRASE must be a securely generated 64-character lowercase hex key.")
    env = os.environ.copy()
    env.update(TF_INPUT="false", TF_IN_AUTOMATION="true", TF_WORKSPACE="default", AWS_EC2_METADATA_DISABLED="true")
    env["TF_ENCRYPTION"] = f'''
key_provider "pbkdf2" "state_key" {{ passphrase = "{passphrase}" }}
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
        raise RuntimeError(f"OpenTofu {args[0]} failed; detailed live output is suppressed to protect state/plan values. Reproduce in an authorized private terminal.")
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


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("operation", choices=("validate", "plan", "apply", "show"))
    parser.add_argument("--environment", choices=("staging", "production"))
    parser.add_argument("--plan-file", type=Path)
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
            print(tofu(["show", str(args.plan_file.resolve())], env))
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
                changes = [(item["address"], "/".join(item["change"]["actions"])) for item in details.get("resource_changes", []) if item["change"]["actions"] != ["no-op"]]
                client.put_object(Bucket=BUCKET, Key=key, Body=data, IfNoneMatch="*")
                with open(os.environ["GITHUB_OUTPUT"], "a") as output:
                    output.write(f"plan_key={key}\nplan_sha256={digest}\n")
                with open(os.environ["GITHUB_STEP_SUMMARY"], "a") as summary:
                    summary.write(f"### OpenTofu plan: {args.environment}\n\nCommit: {sha}\n\nPlan SHA-256: {digest}\n\n")
                    summary.write("\n".join(f"- {address}: {action}" for address, action in changes) or "No resource changes.")
                    summary.write("\n\nValues and the encrypted saved plan stay private in R2. Apply uses this exact plan and rejects stale state.\n")
                print(f"Encrypted plan saved; {len(changes)} resource changes. Review the job summary.")
            else:
                data = client.get_object(Bucket=BUCKET, Key=key)["Body"].read()
                verify_plan(data, os.environ.get("PLAN_SHA256"))
                plan.write_bytes(data)
                try:
                    tofu(["apply", "-lock-timeout=60s", str(plan)], env)
                finally:
                    snapshot(client, args.environment, run_id, attempt, "after-apply")
                print("Saved plan applied successfully. No plan was regenerated.")
        return 0
    except Exception as error:
        # Provider/backend/SDK errors can include sensitive values or signed requests.
        print(str(error) if isinstance(error, (ValueError, RuntimeError)) else "Infrastructure operation failed; inspect credentials and the backend in a private terminal.", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
