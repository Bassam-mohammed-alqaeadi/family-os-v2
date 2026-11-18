#!/usr/bin/env python3
"""Checks that every textual cross-reference inside the governed docs
resolves to something that exists:

  * ``S1-NN §x`` (optional ``SPEC``/``DIAGRAMS``/``CARD`` between the system
    and the section sign, optional subsection ``§x-y`` and an optional
    Arabic-letter sub-item ``§x-y-أ``; a range ``§§a–b`` validates both
    endpoints): the system must be S1-01..S1-10 AND the section must exist
    in that system's SPEC.md or DIAGRAMS.md (both files are addressable
    targets; CARD.md has its own numbering and is not indexed).
    Section ids come from parsing the headings (``## 1. ...``,
    ``### 4.1 ...`` / ``### 4-1 ...``, scenario headings such as
    ``### سيناريو 2-1:``); ``4.1`` normalises to ``4-1``. A heading
    such as ``#### 4-1-أ. ...`` also counts as section ``4-1`` (the
    letter marks a sub-item of it). ``§7-N`` is the Nth item under
    ``## 7.`` (``الحالات الحدية والأخطاء``), numbered or bulleted,
    in document order — the items are not headings, so they are
    parsed separately.
  * ``Q-NNN``: the question must exist as a row ``| Q-NNN |`` in
    docs/family-os/governance/decisions/DECISIONS-LOG.md OR in
    docs/family-os/governance/OPEN-QUESTIONS.md (ruled questions
    live in the log; open questions live in the open-questions
    file). Slash groups such as ``Q-163/Q-164`` check every member.
  * ``REQ-NNN``: the requirement must be *defined* (``- **REQ-NNN:**``)
    in SOME Phase-1 SPEC — validity is global, because cross-system
    references exist. Slash groups such as ``REQ-008/009`` or
    ``REQ-004/005/006`` check every member.

Scope: docs/family-os/governance/ + docs/family-os/ai-layer-spec.md +
docs/family-os/README.md (same scope as check-links.py), EXCEPT
docs/family-os/governance/REVIEW-COMPLETE-AUDIT.md, a frozen
historical review record (it quotes old ruling text as evidence
of the findings themselves — never edited, never checked).

Rulings (Juno, 2026-11-08, R2-CI-04 — also recorded as rule 9 in
the repo AGENTS.md): Q authority is the union above; ``§7-N``
is the Nth item under ``## 7.``; SPEC.md and DIAGRAMS.md are
both addressable; REVIEW-COMPLETE-AUDIT.md is excluded.

No code is skipped: fenced code blocks (including mermaid diagrams) and
inline code spans are checked like prose. A survey of the tree showed
every reference inside fences/spans resolves under these rules, so
excluding them would only hide real references.

NOT validated (deliberately out of scope): ``D-NN`` decisions (a
different numbering, not Q numbers); ``G-NN`` rules; bare ``§x``
references with no system prefix (intra-document); file:line citations
such as ``S1-01/SPEC.md:38``; a bare ``S1-NN`` mention with no ``§``;
audit ids (``R2-S104-14``), acceptance ids (``ACC-007``), design-system
ids (``DS-CC-10``) and use-case ids (``UC1``).

Run from the repo root:  python3 scripts/check-refs.py
To run against another copy of the tree (e.g. a mutation-test scratch dir):
  FAMILY_OS_ROOT=/path/to/copy/ python3 scripts/check-refs.py
CI runs this as the fifth docs check (.github/workflows/ci.yml).
"""
import os
import re
import sys

ROOT = os.environ.get("FAMILY_OS_ROOT", "")
if ROOT and not ROOT.endswith("/"):
    ROOT += "/"

SCOPE_DIRS = ("docs/family-os/governance/",)
SCOPE_FILES = ("docs/family-os/ai-layer-spec.md", "docs/family-os/README.md")
PHASE1 = "docs/family-os/governance/phases/phase-1"
DECISIONS_LOG = "docs/family-os/governance/decisions/DECISIONS-LOG.md"
OPEN_QUESTIONS = "docs/family-os/governance/OPEN-QUESTIONS.md"
EXCLUDED = ("docs/family-os/governance/REVIEW-COMPLETE-AUDIT.md",)
AR = r"[\u0600-\u06FF]"  # one Arabic letter (sub-item suffix, e.g. -أ)
# A suffix counts only as ONE letter: "-مخطط" is §N plus the word "مخطط",
# not sub-item "-م" (e.g. "§2-مخطط دورة الصلاحية" is §2, not §2-م).
AR_SUFFIX = r"(?:-" + AR + r"(?!" + AR + r"))?"

FAIL = []


def read(p):
    with open(ROOT + p, encoding="utf-8") as f:
        return f.read()


def scoped_files():
    out = []
    for d in SCOPE_DIRS:
        for base, _dirs, names in os.walk(ROOT + d):
            for name in names:
                if name.endswith(".md"):
                    p = os.path.relpath(os.path.join(base, name), ROOT or ".")
                    if p not in EXCLUDED:
                        out.append(p)
    for p in SCOPE_FILES:
        if os.path.isfile(ROOT + p):
            out.append(p)
    return sorted(set(out))


# ---------------------------------------------------------------- indexes

HEADING_RE = re.compile(
    r"^#{1,4}\s+(\d+(?:[.-]\d+)?" + AR_SUFFIX + r")\b"
)
SCENARIO_RE = re.compile(
    r"^#{1,4}\s+.*?\b(2-\d+" + AR_SUFFIX + r")\s*:"
)


def spec_sections(path):
    """Valid section ids of one SPEC.md or DIAGRAMS.md, from its headings."""
    secs = set()
    for line in read(path).splitlines():
        m = HEADING_RE.match(line) or SCENARIO_RE.match(line)
        if m:
            sec = m.group(1).replace(".", "-")
            secs.add(sec)
            # "4-1-أ" is a sub-item of section 4-1: both ids exist.
            m2 = re.match(r"^(.*)-" + AR + r"$", sec)
            if m2:
                secs.add(m2.group(1))
    return secs


def section7_items(path):
    """``§7-N`` ids: the Nth item under ``## 7.`` (numbered or
    bulleted, document order). Items are lines, not headings."""
    items = set()
    in_s7 = False
    n = 0
    for line in read(path).splitlines():
        if re.match(r"^## 7\.", line):
            in_s7 = True
            continue
        if in_s7 and re.match(r"^## ", line):
            break
        if in_s7 and (re.match(r"^\d+\.\s", line) or re.match(r"^- ", line)):
            n += 1
            items.add("7-%d" % n)
    return items


systems = {}  # "S1-01" -> set of section ids (SPEC.md ∪ DIAGRAMS.md)
for base, _dirs, names in os.walk(ROOT + PHASE1):
    if "SPEC.md" in names:
        sid = os.path.basename(base)[:5]
        spec = os.path.relpath(os.path.join(base, "SPEC.md"), ROOT or ".")
        secs = spec_sections(spec) | section7_items(spec)
        if "DIAGRAMS.md" in names:
            diag = os.path.relpath(os.path.join(base, "DIAGRAMS.md"), ROOT or ".")
            secs |= spec_sections(diag)
        systems[sid] = secs

if len(systems) != 10:
    FAIL.append(f"expected 10 Phase-1 SPECs, found {len(systems)}: {sorted(systems)}")

# Decided + open questions: rows "| Q-NNN |" in DECISIONS-LOG.md
# or OPEN-QUESTIONS.md (ruling 2026-11-08).
questions = {
    "Q-%03d" % int(n)
    for n in re.findall(r"^\| Q-(\d+) \|", read(DECISIONS_LOG), re.M)
} | {
    "Q-%03d" % int(n)
    for n in re.findall(r"^\| Q-(\d+) \|", read(OPEN_QUESTIONS), re.M)
}

# Defined requirements: "- **REQ-NNN:**" in any Phase-1 SPEC.
defined_reqs = set()
for base, _dirs, names in os.walk(ROOT + PHASE1):
    if "SPEC.md" in names:
        defined_reqs |= {
            "REQ-%03d" % int(n)
            for n in re.findall(
                r"^- \*\*REQ-(\d+):\*\*",
                read(os.path.relpath(os.path.join(base, "SPEC.md"), ROOT or ".")),
                re.M,
            )
        }

# ---------------------------------------------------------------- checks

# S1-NN [SPEC|DIAGRAMS|CARD] [punct/space] §x[-y][-أ]  or  §§a–b (range).
SEP = r"(?:\s*[`\(\)\.,\u061b\[\]])*\s*"
SEC = r"(\d+(?:-\d+)?" + AR_SUFFIX + r")"
S1_RE = re.compile(
    r"S1-(\d{1,2})"
    r"(?:\s+(?:SPEC|DIAGRAMS|CARD))?"
    + SEP
    + r"(?:§§\s*(\d+)\s*[-\u2013\u2014]\s*(\d+)|§\s*" + SEC + r")"
)
Q_RE = re.compile(r"(?<![A-Za-z0-9])Q-(\d{1,3})((?:/\d{1,3})*)")
REQ_RE = re.compile(r"(?<![A-Za-z0-9])REQ-(\d{1,3})((?:/\d{1,3})*)")


def expand(num, tail):
    """'Q-163' + '/164' -> ['Q-163', 'Q-164'] (prefix set by caller)."""
    out = [int(num)]
    out += [int(x) for x in tail.split("/") if x]
    return out


n_s1 = n_q = n_req = 0
for path in scoped_files():
    for lineno, line in enumerate(read(path).splitlines(), 1):
        for m in S1_RE.finditer(line):
            n_s1 += 1
            sid = "S1-%02d" % int(m.group(1))
            if sid not in systems:
                FAIL.append(f"{path}:{lineno}: no such system in {m.group(0)!r}")
                continue
            secs = systems[sid]
            if m.group(2) is not None:  # §§a–b range: both endpoints must exist
                for endpoint in (m.group(2), m.group(3)):
                    if endpoint not in secs:
                        FAIL.append(
                            f"{path}:{lineno}: {m.group(0)!r} — "
                            f"§{endpoint} does not exist in {sid} SPEC.md or DIAGRAMS.md"
                        )
            elif m.group(4) not in secs:
                FAIL.append(
                    f"{path}:{lineno}: {m.group(0)!r} — "
                    f"§{m.group(4)} does not exist in {sid} SPEC.md or DIAGRAMS.md"
                )
        for m in Q_RE.finditer(line):
            for n in expand(m.group(1), m.group(2)):
                n_q += 1
                q = "Q-%03d" % n
                if q not in questions:
                    FAIL.append(
                        f"{path}:{lineno}: {q} is not a row in "
                        f"DECISIONS-LOG.md nor OPEN-QUESTIONS.md"
                    )
        for m in REQ_RE.finditer(line):
            for n in expand(m.group(1), m.group(2)):
                n_req += 1
                req = "REQ-%03d" % n
                if req not in defined_reqs:
                    FAIL.append(
                        f"{path}:{lineno}: {req} is not defined in any "
                        f"Phase-1 SPEC"
                    )

files = scoped_files()
print(
    f"refs: {len(files)} files, {n_s1} S1-§ refs, {n_q} Q refs, "
    f"{n_req} REQ refs; {len(questions)} Q rows (log + open), "
    f"{len(defined_reqs)} defined REQs, "
    f"{sum(len(s) for s in systems.values())} sections (SPEC ∪ DIAGRAMS)"
)
if FAIL:
    for x in FAIL:
        print("FAIL " + x)
    print(f"refs: FAIL ({len(FAIL)} dangling references)")
    sys.exit(1)
print("refs: OK")
