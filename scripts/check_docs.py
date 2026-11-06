#!/usr/bin/env python3
"""Check local Markdown links, anchors, code fences, and shared system diagrams."""
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]


def main():
    failures = []
    for path in sorted(ROOT.rglob("*.md")):
        if any(part.startswith(".") or part == "node_modules" for part in path.relative_to(ROOT).parts):
            continue
        text = path.read_text()
        if len(re.findall(r"^```", text, re.M)) % 2:
            failures.append(f"{path.relative_to(ROOT)}: unbalanced code fences")
        for link in re.findall(r"\[[^\]]+\]\(([^)]+)\)", text):
            parsed = urlsplit(link)
            if parsed.scheme or parsed.netloc:
                continue
            target = (path.parent / unquote(parsed.path)).resolve() if parsed.path else path
            if not target.is_relative_to(ROOT) or not target.exists():
                failures.append(f"{path.relative_to(ROOT)}: missing target {link}")
            elif parsed.fragment and target.suffix == ".md":
                headings = re.findall(r"^#{1,6} (.+)$", target.read_text(), re.M)
                anchors = {re.sub(r"\s", "-", re.sub(r"[^\w\s-]", "", h.lower())) for h in headings}
                if unquote(parsed.fragment) not in anchors:
                    failures.append(f"{path.relative_to(ROOT)}: missing anchor {link}")
    diagrams = []
    for name in ("README.md", "docs/architecture.md"):
        match = re.search(r"```mermaid\n([\s\S]*?)```", (ROOT / name).read_text())
        diagrams.append(match.group(1) if match else None)
    if not diagrams[0] or diagrams[0] != diagrams[1]:
        failures.append("README and architecture system diagrams differ or are missing.")
    if failures:
        print("\n".join(failures), file=sys.stderr)
        return 1
    print("Local documentation links, anchors, fences and shared diagrams passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
