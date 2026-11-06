#!/usr/bin/env python3
"""Checks the unified permission-key count stays arithmetically correct:
  1. The seed line in S1-03 SPEC §10-1: sum of per-system counts == total.
  2. Every live 'القائمة الموحدة N مفتاحاً' mention (S1-01/S1-02/S1-03 SPECs)
     agrees with that total. Historical rows (DECISIONS-LOG / OPEN-QUESTIONS)
     are deliberately excluded: they record what the count was when ruled.
  3. The agent.* count in the seed line equals the agent keys defined in
     AI-VERIFICATION-CONTRACT.md.
Run from the repo root:  python3 scripts/check-counts.py
"""
import re
import sys

ROOT = ""
FAIL = []


def read(p):
    with open(ROOT + p, encoding="utf-8") as f:
        return f.read()


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

print(f"counts: unified total={total}, parts={parts}, agent keys={len(agent_keys)}")
if FAIL:
    for x in FAIL:
        print("FAIL " + x)
    sys.exit(1)
print("counts: OK")
