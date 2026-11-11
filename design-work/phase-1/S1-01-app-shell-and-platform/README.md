# S1-01 Design Work — App Shell & Platform

> **Status:** drafted — not owner-approved  
> **Workspace:** design-work/phase-1/S1-01-app-shell-and-platform/  
> **Branch:** feat/governance-v2  
> **Date:** 2026-11-11

## Purpose

This package translates the S1-01 planning contract into a reviewable interface-design blueprint. It is a design deliverable, not an implementation and not an amendment to approved governance source files.

## Package contents

| File | Purpose |
|---|---|
| SCREEN-BLUEPRINT.md | Global shell rules and screen-by-screen design contract |
| USER-FLOWS.md | Entry, navigation, Parent Gate, SOS, sync, low-bandwidth, and update flows |
| WIREFRAMES.md | Low-fidelity structural wireframes for the shell and all S1-01 surfaces |
| COMPONENT-MATRIX.md | Screen-to-component map, semantic tokens, responsive rules, and state coverage |
| OPEN-ITEMS-AND-RECONCILIATION.md | Explicit unknowns and reconciliation of older draft statements with later decisions |

## Source precedence

1. Approved owner decisions in docs/family-os/governance/decisions/DECISIONS-LOG.md take precedence.
2. Approved S1-01 planning contract: SPEC.md §§1–8 and §10, plus approved DIAGRAMS.md.
3. Approved design-system sources: the 15 files in docs/family-os/governance/design-system/.
4. Draft-only source: S1-01 SPEC.md §9 is a traceable starting point, not an approved screen contract.
5. Any unresolved behavior remains UNKNOWN; a layout proposal does not close a product or platform question.

## Design status

- CURRENT FACT means directly specified by an approved source or decision.
- OWNER DECISION means an explicit product/owner decision already recorded.
- PROPOSED means a design recommendation for review; it is not approved behavior.
- PLATFORM CONSTRAINT means behavior is bounded by Android/iOS or device capabilities.
- UNKNOWN means the source does not answer the question. Do not design a false promise around it.

## Scope guard

- No application source code, database, API, permission policy, or approved governance document is changed by this package.
- No backend or device-enforcement capability is represented as implemented merely because a screen depicts it.
- No child analytics, hidden-surveillance language, family switcher, free-form child colors, or additional owner role is introduced.
- The package does not decide unresolved iOS behavior, security storage, retention, child-safety escalation, or template contents.
- Visual work is mobile-first, while approved responsive navigation and the tablet baseline in Q-392 are respected.

## Review gate

This package remains drafted until the owner reviews the screen blueprint, flows, wireframes, component matrix, and open-item register. Approved, implemented, and verified are separate states under QUALITY-GATES.md; this document claims none of the latter two.
