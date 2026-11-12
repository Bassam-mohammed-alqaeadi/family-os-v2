# S1-01 Design Workbench — Current Direction

> **Status:** Draft / exploratory. No owner approval is implied by these files.  
> **Branch:** feat/governance-v2

## Current design authority

The current Android-first design package is now:

1. **05-android-detailed-experience-spec.md** — the detailed visual and interaction contract: Android layers, dimensions, role templates, global states, Parent Gate, SOS placement, responsive behavior, and acceptance traceability.
2. **06-android-interactive-design.html** — the self-contained interactive Android phone preview for reviewing the detailed composition and key state changes.
3. **03-platform-experience-foundation.md** — the proposed reusable experience architecture for the platform and the 60-system target.
4. **04-interactive-experience-studio.html** — the earlier exploratory prototype; useful for the original concept and architecture map, but superseded as the primary Android screen-detail reference.

The detailed package uses a new visual composition. It does not inherit the legacy SCR-01…SCR-12 information architecture or the previous SCR-02 composition. It preserves approved role-specific navigation contracts and permission rules.

## Historical S1-01 drafts — do not use as visual templates

The following files are retained for audit/history only:
- 00-design-foundation-and-audit.md
- 01-scr-02-parent-shell-high-fidelity.md
- 02-scr-02-consistency-review.md

Their product requirements and observations may be consulted for traceability, but their layouts, navigation assumptions, visual composition, sample content, and local token exceptions are **not** the template for the new experience.

## Android detailed prototype use

Open 06-android-interactive-design.html in a modern browser. It is a self-contained HTML file with no external libraries or backend connection. It includes Parent and child/teen surfaces, navigation destinations, Parent Gate, SOS hand-off demonstration, offline/sync, platform health, critical update, light/dark theme, text scaling, and a dimensions inspector.

**The prototype is a visual study, not an Android build.** It does not call Android APIs, access real device state, authenticate a PIN, send SOS, or synchronize data.

## Earlier exploratory studio

Open 04-interactive-experience-studio.html for the first shell concept and the architecture map. It remains useful as a historical design exploration, but the Android-specific detail contract in 05 and 06 is the current review target.

The earlier prototype includes:
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
- New experience surfaces and child-template compositions are marked proposed until explicitly reviewed.
- The approved navigation patterns, role model, permission model, color/typography/spacing tokens, and Android platform constraints remain binding.
- Q-090 child/teen template content remains open; sections 5–7 of the Android spec are proposals for owner review.
- Q-043 mascot/logo assets remain open; the prototype does not invent a mascot.
- Android edge-to-edge and window insets must be validated on real Android devices and OS navigation modes.
- Do not invent the names or functional boundaries of systems 11–60.
- Do not edit approved governance/specification/design-system sources from this workspace.
- Do not mark any design as approved, implemented, or verified without the required review and evidence.

## Governance caveat

The repository's design audit records F-007: project-owner identity/approval authority is unresolved between the charter's named owner and the repository identity. This work remains non-binding draft exploration until that authority is reconciled.
