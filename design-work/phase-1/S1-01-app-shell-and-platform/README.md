# S1-01 Design Work — App Shell & Platform

> **Status:** drafted — not owner-approved  
> **Workspace:** design-work/phase-1/S1-01-app-shell-and-platform/  
> **Branch:** feat/governance-v2  
> **Date:** 2026-11-11

## Purpose

This package translates the S1-01 planning contract into a reviewable interface-design blueprint. It is a design deliverable, not an implementation and not an amendment to approved governance source files.

S1-01 is the first system in Phase 1 authorized for design under Q-346. Its scope is the shared application shell, parent/child mode containers, Parent Gate, persistent SOS surface, offline/synchronisation surfaces, platform health, administrative shell settings, and update handling.

## Package contents

| File | Purpose |
|---|---|
| SCREEN-BLUEPRINT.md | Global shell rules and the 11 in-app screens plus the operating-system notification surface |
| USER-FLOWS.md | Entry, navigation, Parent Gate, SOS, sync, low-bandwidth, and update flows |
| OPEN-ITEMS-AND-RECONCILIATION.md | Explicit unknowns and stale draft statements that must not silently become design decisions |

## Source precedence

1. Approved owner decisions in docs/family-os/governance/decisions/DECISIONS-LOG.md take precedence.
2. Approved S1-01 planning contract: SPEC.md §§1–8 and §10, plus the approved DIAGRAMS.md.
3. Approved design-system sources: the 15 files in docs/family-os/governance/design-system/.
4. Draft-only source: S1-01 SPEC.md §9 is a draft and is used as a traceable starting point, not as an approved screen contract.
5. Any unresolved behavior remains UNKNOWN; a layout proposal in this package does not close a product or platform question.

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
- Visual work is mobile-first, while the approved responsive navigation and tablet baseline in Q-392 are respected.

## Review gate

This package remains drafted until the owner reviews the screen blueprint, flows, and open-item register. Approved, implemented, and verified are separate states under QUALITY-GATES.md; this document claims none of the latter two.
