#!/usr/bin/env python3
"""Checks that every relative Markdown link inside the governed docs
resolves to a file that exists in the repo. Skips http(s)/mailto links
and pure #anchors. Directory targets count as valid (GitHub renders them).
Fragment targets are not validated (headers move); file existence is.
Scope: docs/family-os/governance/ + docs/family-os/ai-layer-spec.md +
docs/family-os/README.md. The inventories/ tree is frozen reference
material and is deliberately out of scope (its READMEs link to local-only
index files such as sources.json, per the indexes-only policy).
Run from the repo root:  python3 scripts/check-links.py
"""
import os
import re
import subprocess
import sys

tracked = set(
    subprocess.check_output(["git", "ls-files", "docs/"], text=True).split()
)
SCOPE = ("docs/family-os/governance/", "docs/family-os/ai-layer-spec.md", "docs/family-os/README.md")
LINK_RE = re.compile(r"\[[^\]]*\]\(([^)\s]+)\)")
failures = []
checked = 0

for path in sorted(tracked):
    if not path.endswith(".md") or not path.startswith(SCOPE):
        continue
    base = os.path.dirname(path)
    with open(path, encoding="utf-8") as f:
        text = f.read()
    for target in LINK_RE.findall(text):
        if target.startswith(("http://", "https://", "mailto:", "#")):
            continue
        target = target.split("#", 1)[0]
        if not target:
            continue
        checked += 1
        resolved = os.path.normpath(os.path.join(base, target))
        if resolved not in tracked and not os.path.isfile(resolved) and not os.path.isdir(resolved):
            failures.append(f"{path}: broken link -> {target} (resolves to {resolved})")

scoped = [p for p in tracked if p.endswith(".md") and p.startswith(SCOPE)]
print(f"links: {checked} relative links checked in {len(scoped)} files")
if failures:
    for x in failures:
        print("FAIL " + x)
    sys.exit(1)
print("links: OK")
