#!/usr/bin/env python3
"""Validate incoming commits and PR titles without executing untrusted text."""
import json
import os
from pathlib import Path
import re
import subprocess
import sys

HEADER = re.compile(r"^[a-z][a-z0-9-]*(?:\([a-zA-Z0-9_./-]+\))?!?: \S.*$")


def valid_header(subject):
    return bool(HEADER.fullmatch(subject))


def git(*args):
    return subprocess.check_output(["git", *args], text=True).strip()


def main():
    event_path = os.environ.get("GITHUB_EVENT_PATH")
    event = json.loads(Path(event_path).read_text()) if event_path else {}
    failures = []
    if "pull_request" in event:
        pr = event["pull_request"]
        if not valid_header(pr["title"]):
            failures.append("PR title must use Conventional Commits format.")
        revision = f'{pr["base"]["sha"]}..{pr["head"]["sha"]}'
    elif event.get("before", "").strip("0"):
        revision = f'{event["before"]}..HEAD'
    else:
        revision = "HEAD"
    # For local runs / initial pushes, check only the newest commit.
    args = ["log", "--format=%H%x00%s"]
    if revision == "HEAD":
        args.append("-1")
    for line in git(*args, revision).splitlines():
        sha, subject = line.split("\0", 1)
        if not valid_header(subject):
            failures.append(f"Commit {sha[:12]} is not Conventional Commits: {subject}")
    if failures:
        print("\n".join(failures), file=sys.stderr)
        return 1
    print("Commit messages and any PR title follow Conventional Commits.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
