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

Plus the R2-CI-03 extensions (2026-11-08):
  5. Screen ids in the coverage table vs the §9 index. The index is the
     table under the heading containing "فهرس الشاشات"; its first column
     holds the system's screen ids. Every screen-like token in a
     with-screen coverage row whose prefix is one of the system's own
     index prefixes must be an id listed in that index. Screen-id
     prefixes differ per system (SCR-, S102-, R03-, S04-, S05-, S06-,
     LO-, CH-, H09-, S10-), so the valid prefixes are derived from the
     index itself, not hardcoded. Tokens with other prefixes are
     ignored: system references such as "S1-09" in a parenthesis, and
     prose such as "كل الشاشات (قاعدة عابرة)" which names no screen.
     No-interface rows are skipped: their cells may mention another
     system's screen or a system reference in prose.
  6. REQ refs in every CARD.md and DIAGRAMS.md resolve. A ref is
     written bare ("REQ-001"), in a slash list ("REQ-001/002" — the
     numbers after the slash carry no "REQ-" prefix), in a range
     ("REQ-001…REQ-017"), or qualified with a system ("S1-03 REQ-019").
     A qualified ref must be defined in the NAMED system. A bare ref
     is valid if it is defined in ANY Phase-1 SPEC (global validity:
     cross-system refs exist, e.g. "S1-03 REQ-019" cited from S1-09,
     so per-file validity would false-fail).
  7. §8 acceptance criteria (ACC) cites. Every EXPLICIT REQ cite in an
     ACC entry must resolve: a bare cite ("← REQ-017", "[REQ-001/002]")
     must be defined in the ACC's OWN system — cross-system cites in
     ACCs are written qualified ("S1-09 REQ-018"), so a bare cite means
     this system — and a qualified cite must be defined in the named
     system. An ACC with no explicit REQ cite is NOT a failure: a few
     ACCs legitimately cite a section or a decision instead (performance
     targets, permission-key matrices, audit domains); they are listed
     as informational only. Prose matching (linking a citeless ACC to
     a REQ by meaning) is explicitly out of scope here.

Run from the repo root:  python3 scripts/check-coverage.py
Expected grand total: 204 REQ
(188 with a screen, 16 with no interface and a stated reason) — 202 after the R1–R5 close-out + REQ-017 in S1-04 (R2-S104-18, Q-252 wave) + REQ-018 in S1-04 (NEW-S104-05, Q-258 wave).
"""
import glob
import re
import sys

ROOT = ""
FAIL = []

REQ_DEF = re.compile(r"\*\*REQ-(\d+):\*\*")
ROW = re.compile(r"^\|\s*REQ-(\d+)\b")
HEADING = re.compile(r"^#{1,6}\s+.*تغطية REQ")
INDEX_HEADING = re.compile(r"^#{1,6}\s+.*فهرس الشاشات")
SCREEN_ID = re.compile(r"^[A-Z]+\d*-\d{2}$")
SCREEN_TOKEN = re.compile(r"\b([A-Z]+\d*)-(\d{2})\b")
ACC_SECTION = re.compile(r"^## 8\.")
SECTION2 = re.compile(r"^## ")
ACC_TOP = re.compile(r"^- \*\*ACC-([0-9]+[a-z]?)\b")

# One tokenizer for every "REQ-NNN" reference form in the docs:
#   qualified: "S1-03 REQ-019" (also "S1-03 (REQ-004" — optional paren)
#   slash list: "REQ-001/002/003" (continuations carry no REQ- prefix)
#   range: "REQ-001…REQ-017" (or "...")
#   bare: "REQ-001"
# Yields (number, system-or-None); system is set only for qualified refs.
REQ_REF = re.compile(
    r"(?:\b(S1-\d\d)\s*\(?\s*REQ-(\d+)((?:/\d+)*)"
    r"|REQ-(\d+)((?:/\d+)+)"
    r"|REQ-(\d+)\s*(?:\.\.\.|…)\s*REQ-(\d+)"
    r"|REQ-(\d+))"
)


def iter_req_refs(text):
    for m in REQ_REF.finditer(text):
        if m.group(1) is not None:
            system = m.group(1)
            nums = [m.group(2)]
            if m.group(3):
                nums += [n for n in m.group(3).split("/") if n]
            for n in nums:
                yield n, system
        elif m.group(4) is not None:
            nums = [m.group(4)]
            nums += [n for n in m.group(5).split("/") if n]
            for n in nums:
                yield n, None
        elif m.group(6) is not None:
            a, b = int(m.group(6)), int(m.group(7))
            for n in range(min(a, b), max(a, b) + 1):
                yield "%03d" % n, None
        else:
            yield m.group(8), None


grand_total = 0
grand_screen = 0
grand_no_ui = 0

defined_by_sys = {}
acc_entries = []  # (sysid, accid, joined_text, path)
card_diagram_paths = []

n_index_screens = 0
n_cov_screen_refs = 0

for path in sorted(glob.glob(
        ROOT + "docs/family-os/governance/phases/phase-1/*/SPEC.md")):
    sysid = path.split("/")[-2][:5]  # e.g. S1-04
    text = open(path, encoding="utf-8").read()
    lines = text.splitlines()
    defined = sorted(set(REQ_DEF.findall(text)))
    defined_by_sys[sysid] = set(defined)

    # --- §9 screen index: table under the "فهرس الشاشات" heading ---
    index_ids = set()
    for i, line in enumerate(lines):
        if INDEX_HEADING.match(line):
            in_table = False
            for sub in lines[i + 1:]:
                if sub.startswith("|"):
                    in_table = True
                    cells = [c.strip() for c in
                             sub.strip().strip("|").split("|")]
                    if cells and SCREEN_ID.match(cells[0]):
                        index_ids.add(cells[0])
                elif in_table:
                    break
            break
    if not index_ids:
        FAIL.append(f"{path}: no §9 screen index found")
    n_index_screens += len(index_ids)
    prefixes = {s.split("-")[0] for s in index_ids}

    # --- coverage table (existing check + screen-id validation) ---
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
                if not no_ui and len(cells) > 1:
                    for prefix, num in SCREEN_TOKEN.findall(cells[1]):
                        if prefix in prefixes:
                            n_cov_screen_refs += 1
                            token = f"{prefix}-{num}"
                            if token not in index_ids:
                                FAIL.append(
                                    f"{path}: coverage table cites "
                                    f"screen {token} (REQ-{req}), "
                                    f"not in the §9 index")

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

    # --- §8 ACC entries (validated in the second pass) ---
    s8 = None
    e8 = None
    for i, line in enumerate(lines):
        if ACC_SECTION.match(line):
            s8 = i
        elif s8 is not None and SECTION2.match(line):
            e8 = i
            break
    if s8 is not None:
        sec = lines[s8:e8]
        current = None
        for line in sec:
            m = ACC_TOP.match(line)
            if m:
                if current is not None:
                    acc_entries.append(current)
                current = (sysid, m.group(1), [line], path)
            elif current is not None:
                current[2].append(line)
        if current is not None:
            acc_entries.append(current)

print(f"coverage: total={grand_total} screen={grand_screen} no-ui={grand_no_ui}")
if grand_total != 204:
    FAIL.append(f"grand total is {grand_total}, expected 204")

# --- second pass: cross-file REQ refs (needs every SPEC's defined set) ---
global_defined = set()
for s in defined_by_sys.values():
    global_defined |= s

for path in sorted(glob.glob(
        ROOT + "docs/family-os/governance/phases/phase-1/*/CARD.md")
        + glob.glob(
        ROOT + "docs/family-os/governance/phases/phase-1/*/DIAGRAMS.md")):
    card_diagram_paths.append(path)

n_cd_refs = 0
for path in card_diagram_paths:
    text = open(path, encoding="utf-8").read()
    refs = list(iter_req_refs(text))
    seen_bad = set()
    for num, system in refs:
        if system is not None:
            ok = num in defined_by_sys.get(system, set())
            scope = system
        else:
            ok = num in global_defined
            scope = "any SPEC"
        if not ok and (num, scope) not in seen_bad:
            seen_bad.add((num, scope))
            FAIL.append(
                f"{path}: REQ-{num} cited but not defined in {scope}")
    n_cd_refs += len(refs)

n_acc_cites = 0
n_acc_no_cite = []
for sysid, accid, entry_lines, path in acc_entries:
    joined = " ".join(x.strip() for x in entry_lines)
    refs = list(iter_req_refs(joined))
    if not refs:
        n_acc_no_cite.append(f"{sysid} ACC-{accid}")
        continue
    n_acc_cites += len(refs)
    own_defined = defined_by_sys[sysid]
    seen_bad = set()
    for num, system in refs:
        if system is not None:
            ok = num in defined_by_sys.get(system, set())
            scope = system
        else:
            ok = num in own_defined
            scope = f"{sysid} SPEC"
        if not ok and (num, scope) not in seen_bad:
            seen_bad.add((num, scope))
            FAIL.append(
                f"{path}: ACC-{accid} cites REQ-{num}, "
                f"not defined in {scope}")

print(f"screens: {n_index_screens} §9 index entries, "
      f"{n_cov_screen_refs} coverage screen refs checked")
print(f"card-diagrams: {n_cd_refs} REQ refs checked")
print(f"acc: {n_acc_cites} explicit REQ cites checked "
      f"across {len(acc_entries)} ACCs; "
      f"{len(n_acc_no_cite)} ACCs without an explicit REQ cite "
      f"(informational, not a failure)")
if n_acc_no_cite:
    print("acc: no explicit REQ cite: " + ", ".join(n_acc_no_cite))

if FAIL:
    for x in FAIL:
        print("FAIL " + x)
    sys.exit(1)
print("coverage: OK")
