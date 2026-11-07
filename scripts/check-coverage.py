#!/usr/bin/env python3
"""Check REQ coverage tables in the ten Phase-1 SPECs.

For each SPEC.md:
  1. Collect every REQ id defined in the spec body as **REQ-NNN:**.
  2. Collect every row of the coverage table (the section whose heading
     contains "تغطية REQ"), classifying each row as with-screen or
     no-interface when its screen cell contains "بلا واجهة".
  3. Fail on duplicates in the table, on a defined REQ missing from the
     table, or on a table row with no matching definition.
  4. Print per-system counts and the grand total.

Run from the repo root:  python3 scripts/check-coverage.py
Expected grand total after the R1–R5 close-out: 202 REQ
(187 with a screen, 15 with no interface and a stated reason).
"""
import glob
import re
import sys

ROOT = ""
FAIL = []

REQ_DEF = re.compile(r"\*\*REQ-(\d+):\*\*")
ROW = re.compile(r"^\|\s*REQ-(\d+)\b")
HEADING = re.compile(r"^#{1,6}\s+.*تغطية REQ")

grand_total = 0
grand_screen = 0
grand_no_ui = 0

for path in sorted(glob.glob(
        ROOT + "docs/family-os/governance/phases/phase-1/*/SPEC.md")):
    text = open(path, encoding="utf-8").read()
    lines = text.splitlines()
    defined = sorted(set(REQ_DEF.findall(text)))

    rows = {}
    in_table = False
    for line in lines:
        if HEADING.match(line):
            in_table = True
            continue
        if in_table and line.startswith("#"):
            break
        if in_table:
            m = ROW.match(line)
            if m:
                req = m.group(1)
                cells = [c.strip() for c in line.strip().strip("|").split("|")]
                no_ui = len(cells) > 1 and "بلا واجهة" in cells[1]
                if req in rows:
                    FAIL.append(f"{path}: REQ-{req} appears twice in the coverage table")
                rows[req] = no_ui

    if not rows:
        FAIL.append(f"{path}: no coverage table found")
        continue

    missing = [r for r in defined if r not in rows]
    phantom = [r for r in rows if r not in defined]
    if missing:
        FAIL.append(f"{path}: defined but not in coverage table: "
                    + ", ".join("REQ-" + r for r in missing))
    if phantom:
        FAIL.append(f"{path}: in coverage table but not defined: "
                    + ", ".join("REQ-" + r for r in phantom))

    n_screen = sum(1 for v in rows.values() if not v)
    n_no_ui = sum(1 for v in rows.values() if v)
    print(f"{path.split('/')[-2]}: total={len(rows)} "
          f"screen={n_screen} no-ui={n_no_ui}")
    grand_total += len(rows)
    grand_screen += n_screen
    grand_no_ui += n_no_ui

print(f"coverage: total={grand_total} screen={grand_screen} no-ui={grand_no_ui}")
if grand_total != 202:
    FAIL.append(f"grand total is {grand_total}, expected 202")
if FAIL:
    for x in FAIL:
        print("FAIL " + x)
    sys.exit(1)
print("coverage: OK")
