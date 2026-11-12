# S1-01 Design Workbench — Current Direction

> **Status:** Draft / exploratory. No owner approval is implied by these files.  
> **Branch:** feat/governance-v2

## Current design authority

The current design direction begins with these artifacts:

1. **03-platform-experience-foundation.md** — the proposed reusable experience architecture for the platform and the 60-system target.
2. **04-interactive-experience-studio.html** — the interactive Android-frame browser prototype for the new shell concept.

These are the active starting point for the new design direction. They do not inherit the existing SCR-01…SCR-12 information architecture or the previous SCR-02 composition.

## Historical S1-01 drafts — do not use as visual templates

The following files are retained for audit/history only:
- 00-design-foundation-and-audit.md
- 01-scr-02-parent-shell-high-fidelity.md
- 02-scr-02-consistency-review.md

Their product requirements and observations may be consulted for traceability, but their layouts, navigation assumptions, visual composition, sample content, and local token exceptions are **not** the template for the new experience.

## Prototype use

Open 04-interactive-experience-studio.html in a modern browser. It is a self-contained HTML file with no external libraries or backend connection.

The prototype includes:
- Parent and child experience contexts.
- Child profile explorations: minimal, child standard, and teen standard.
- Parent Gate PIN interaction and five-attempt / five-minute demo lockout.
- SOS long-press interaction (3 seconds) and a non-sending simulation path.
- Online/offline and stale-data states.
- Light/dark studio and phone preview, and text scaling.
- A six-stage / sixty-system target map, clearly separating the ten Phase 1 systems defined in the repository from future system definitions that are not yet present.

**Important:** Every family/device/status value in the prototype is demo data. It does not perform real authentication, verify a real PIN, send SOS, read device health, write to a backend, or change app permissions.

## Source discipline

- Approved requirements, decisions, security boundaries, platform constraints, and design tokens remain binding.
- Existing screen inventories and wireframes are not binding visual direction.
- New experience surfaces and information architecture are marked proposed until explicitly reviewed.
- Do not invent the names or functional boundaries of systems 11–60.
- Do not edit approved governance/specification/design-system sources from this workspace.
- Do not mark any design as approved, implemented, or verified without the required review and evidence.

## Governance caveat

The repository's design audit records F-007: project-owner identity/approval authority is unresolved between the charter's named owner and the repository identity. This work remains non-binding draft exploration until that authority is reconciled.
