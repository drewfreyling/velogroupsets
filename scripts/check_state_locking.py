"""Exercise actual OpenTofu lock contention/release on a unique disposable state key."""
from pathlib import Path
import subprocess
import tempfile
import time
import uuid


def check_locking(env, backend=None, client=None):
    from infra import BUCKET, encrypted, tofu
    key = f"lock-checks/{uuid.uuid4().hex}/terraform.tfstate"
    success = False
    with tempfile.TemporaryDirectory() as temp:
        root = Path(temp)
        kind = "s3" if backend else "local"
        (root / "main.tf").write_text('terraform {\n  backend "' + kind + '" {}\n}\n' + '''
resource "terraform_data" "hold" {
  provisioner "local-exec" { command = "python3 hold.py" }
}
''')
        if not backend:
            with (root / "main.tf").open("a") as config:
                config.write('\noutput "probe_public" { value = "synthetic public output" }\noutput "probe_private" {\n value = "synthetic private output"\n sensitive = true\n}\n')
        (root / "hold.py").write_text('''from pathlib import Path
import time
Path("ready").touch()
for _ in range(600):
    if Path("release").exists():
        break
    time.sleep(0.1)
else:
    raise SystemExit("Lock probe timed out")
''')
        command = ["init"]
        if backend:
            command.extend([f"-backend-config={backend}", f"-backend-config=key={key}"])
        tofu(command, env, cwd=root, public=not backend)
        with open(root / "probe.log", "w+") as log:
            process = subprocess.Popen(["tofu", "apply", "-auto-approve", "-no-color"], cwd=root, env=env, stdout=log, stderr=log)
            try:
                for _ in range(300):
                    if (root / "ready").exists():
                        break
                    if process.poll() is not None:
                        raise RuntimeError("Lock probe failed to acquire its isolated state lock.")
                    time.sleep(0.1)
                else:
                    raise RuntimeError("Timed out waiting for the isolated lock probe.")
                contender = subprocess.run(["tofu", "plan", "-lock-timeout=1s", "-no-color"], cwd=root, env=env, capture_output=True, text=True, timeout=30)
                if contender.returncode == 0 or "Error acquiring the state lock" not in contender.stderr:
                    raise RuntimeError("Backend did not reject a concurrent OpenTofu operation with a lock error.")
            finally:
                (root / "release").touch()
                try:
                    process.wait(timeout=30)
                except subprocess.TimeoutExpired:
                    process.terminate()
                    process.wait(timeout=10)
            if process.returncode:
                raise RuntimeError("Lock probe failed to finish and release its lock.")
        tofu(["plan", "-lock-timeout=1s", "-out=probe.tofuplan"], env, cwd=root)
        if not encrypted((root / "probe.tofuplan").read_bytes()):
            raise RuntimeError("OpenTofu did not encrypt the saved probe plan.")
        if not backend and not encrypted((root / "terraform.tfstate").read_bytes()):
            raise RuntimeError("OpenTofu did not encrypt local state.")
        if not backend:
            from prepare_web_deploy import read_state_outputs
            outputs = read_state_outputs((root / "terraform.tfstate").read_bytes(), env)
            if (outputs["probe_public"]["value"] != "synthetic public output"
                    or outputs["probe_public"]["sensitive"] is not False
                    or outputs["probe_private"]["sensitive"] is not True):
                raise RuntimeError("Isolated encrypted output extraction lost values or sensitivity metadata.")
        tofu(["destroy", "-auto-approve", "-lock-timeout=1s"], env, cwd=root)
        success = True
    if success and client:
        # Unique probe key only. Never force-unlock or delete any real state/lock.
        client.delete_object(Bucket=BUCKET, Key=key)
    print("OpenTofu lock contention and release check passed." + (" (local backend only)" if not backend else " (R2 backend)"))
