#!/usr/bin/env python3
"""Checks the unified permission-key count stays arithmetically correct:
  1. The seed line in S1-03 SPEC §10-1: sum of per-system counts == total.
  2. Every live 'القائمة الموحدة N مفتاحاً' mention (S1-01/S1-02/S1-03 SPECs)
     agrees with that total. Historical rows (DECISIONS-LOG / OPEN-QUESTIONS)
     are deliberately excluded: they record what the count was when ruled.
  3. The agent.* count in the seed line equals the agent keys defined in
     AI-VERIFICATION-CONTRACT.md.
  4. Every SPEC §6 key list agrees with the seed: for each of the 10 systems
     the §6 list's per-domain count equals the matching seed part, every key
     is well-formed `domain.action` snake_case, every key's domain is one the
     system owns, no key repeats inside a list or across two systems, and
     sum(§6 counts) + agent keys == seed total. The §10-1 seed lists counts
     only, not individual key names, so there is no name list in the seed to
     compare against: the name checks here are structural (form, ownership,
     uniqueness). The agent.* keys live in AI-VERIFICATION-CONTRACT.md, not
     in any SPEC §6, so they are counted from the contract (check 3) and
     added to the §6 sum, not expected inside a §6 list.
     §6 formats differ per system and the parser handles both: a Markdown
     table whose first cell is the backticked key (S1-01/02/03/07/08/09) and
     a bullet list of backticked keys (S1-04/05/06/10). Only the key-list
     structure is read: prose mentions inside §6 are NOT keys — e.g. S1-01
     names `location.sos.trigger` only to say it belongs to S1-07, S1-08
     names `chat.classifier.teen` only to say it is NOT a permission key,
     and S1-06 re-mentions `tasks.submit` in a reuse note.
Run from the repo root:  python3 scripts/check-counts.py
To run against another copy of the tree (e.g. a mutation-test scratch dir):
  FAMILY_OS_ROOT=/path/to/copy/ python3 scripts/check-counts.py
"""
import os
import re
import sys

ROOT = os.environ.get("FAMILY_OS_ROOT", "")
if ROOT and not ROOT.endswith("/"):
    ROOT += "/"
FAIL = []

KEY_RE = re.compile(r"^[a-z]+[a-z0-9_]*(?:\.[a-z]+[a-z0-9_]*)+$")
TABLE_KEY_RE = re.compile(r"^\|\s*`([^`]+)`\s*\|")
BULLET_KEY_RE = re.compile(r"^-\s*`([^`]+)`\s*[—\-]")

# In seed order: (SPEC path, domains owned by this system's §6 list).
# S1-06 owns two prefixes, but the seed records one combined count (9).
SPEC_SECTIONS = [
    ("docs/family-os/governance/phases/phase-1/S1-01-app-shell-and-platform/SPEC.md", {"shell"}),
    ("docs/family-os/governance/phases/phase-1/S1-02-identity-and-onboarding/SPEC.md", {"identity"}),
    ("docs/family-os/governance/phases/phase-1/S1-03-family-roles-and-permissions/SPEC.md", {"roles"}),
    ("docs/family-os/governance/phases/phase-1/S1-04-plans-and-subscriptions/SPEC.md", {"billing"}),
    ("docs/family-os/governance/phases/phase-1/S1-05-rewards-children/SPEC.md", {"rewards"}),
    ("docs/family-os/governance/phases/phase-1/S1-06-tasks-and-calendar/SPEC.md", {"tasks", "calendar"}),
    ("docs/family-os/governance/phases/phase-1/S1-07-location-basic/SPEC.md", {"location"}),
    ("docs/family-os/governance/phases/phase-1/S1-08-chat-basic/SPEC.md", {"chat"}),
    ("docs/family-os/governance/phases/phase-1/S1-09-command-center-and-settings/SPEC.md", {"hub"}),
    ("docs/family-os/governance/phases/phase-1/S1-10-protection-and-enforcement/SPEC.md", {"protection"}),
]


def read(p):
    with open(ROOT + p, encoding="utf-8") as f:
        return f.read()


def section6_keys(path):
    """Return the ordered §6 key list of one SPEC, or None + FAIL if §6
    cannot be located. Only the key-list structure is read (table rows
    whose first cell is a backticked key, or bullets starting with a
    backticked key); prose mentions are ignored by construction."""
    lines = read(path).splitlines()
    try:
        start = next(i for i, line in enumerate(lines) if line.startswith("## 6. "))
    except StopIteration:
        FAIL.append(f"{path}: §6 heading not found")
        return None
    try:
        end = next(i for i, line in enumerate(lines) if i > start and line.startswith("## 7. "))
    except StopIteration:
        FAIL.append(f"{path}: §7 heading not found after §6")
        return None
    keys = []
    for line in lines[start:end]:
        m = TABLE_KEY_RE.match(line) or BULLET_KEY_RE.match(line)
        if m:
            keys.append(m.group(1))
    return keys


seed = read("docs/family-os/governance/phases/phase-1/S1-03-family-roles-and-permissions/SPEC.md")
m = re.search(r"بذرة المفاتيح الموحدة \((\d+) مفتاحاً\):(.+?)(?: — Ktor|$)", seed, re.S)
if not m:
    print("FAIL: seed line not found in S1-03 SPEC §10-1")
    sys.exit(1)
total = int(m.group(1))
parts = [int(x) for x in re.findall(r"\((\d+)\)", m.group(2))]
if sum(parts) != total:
    FAIL.append(f"seed arithmetic: parts {parts} sum to {sum(parts)}, total says {total}")

for p in [
    "docs/family-os/governance/phases/phase-1/S1-01-app-shell-and-platform/SPEC.md",
    "docs/family-os/governance/phases/phase-1/S1-02-identity-and-onboarding/SPEC.md",
    "docs/family-os/governance/phases/phase-1/S1-03-family-roles-and-permissions/SPEC.md",
]:
    for n in re.findall(r"القائمة الموحدة (\d+) مفتاحاً", read(p)):
        if int(n) != total:
            FAIL.append(f"{p}: unified count says {n}, seed total is {total}")

contract = read("docs/family-os/governance/AI-VERIFICATION-CONTRACT.md")
agent_keys = sorted(set(re.findall(r"`(agent\.[a-z_.]+)`", contract)))
agent_in_seed = re.search(r"`agent\.\*` ‏\((\d+)\)", seed)
if agent_in_seed and int(agent_in_seed.group(1)) != len(agent_keys):
    FAIL.append(
        f"agent.* count: seed says {agent_in_seed.group(1)}, contract defines {len(agent_keys)}: {agent_keys}"
    )

# Check 4: every SPEC §6 key list vs the seed parts.
if len(parts) != len(SPEC_SECTIONS) + 1:
    FAIL.append(
        f"seed shape: {len(parts)} parts, expected {len(SPEC_SECTIONS)} §6 counts + 1 agent count"
    )
else:
    seen = {}  # key -> first system that listed it
    s6_counts = []
    for i, (path, domains) in enumerate(SPEC_SECTIONS):
        keys = section6_keys(path)
        if keys is None:
            continue
        s6_counts.append(len(keys))
        if len(keys) != parts[i]:
            FAIL.append(f"{path}: §6 lists {len(keys)} keys, seed part is {parts[i]}: {keys}")
        for key in keys:
            if not KEY_RE.match(key):
                FAIL.append(f"{path}: malformed key {key!r} (expected domain.action snake_case)")
                continue
            if key.split(".")[0] not in domains:
                FAIL.append(f"{path}: key {key!r} is outside this system's domains {sorted(domains)}")
            if key in seen:
                FAIL.append(f"key {key!r} listed in both {seen[key]} §6 and {path} §6")
            else:
                seen[key] = path
        if len(keys) != len(set(keys)):
            dups = sorted({k for k in keys if keys.count(k) > 1})
            FAIL.append(f"{path}: duplicate keys in §6: {dups}")
    if len(s6_counts) == len(SPEC_SECTIONS):
        for key in agent_keys:
            if key in seen:
                FAIL.append(f"agent key {key!r} also listed in {seen[key]} §6")
        if sum(s6_counts) + len(agent_keys) != total:
            FAIL.append(
                f"§6+agent total: §6 counts {s6_counts} sum to {sum(s6_counts)}, "
                f"+ {len(agent_keys)} agent keys = {sum(s6_counts) + len(agent_keys)}, seed total is {total}"
            )

print(f"counts: unified total={total}, parts={parts}, agent keys={len(agent_keys)}")
if FAIL:
    for x in FAIL:
        print("FAIL " + x)
    sys.exit(1)
print("counts: OK")
