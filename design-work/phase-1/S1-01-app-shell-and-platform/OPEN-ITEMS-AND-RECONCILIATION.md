# S1-01 — Open Design Items and Source Reconciliation

> **Status:** drafted · Open items are not resolved by this package.  
> **Purpose:** Preserve uncertainty and prevent old draft language from leaking into approved visual work.

## 1. S1-01 design / platform gaps

| ID | Known gap | Classification | Design handling now | Owner / next gate |
|---|---|---|---|---|
| GAP-S1-01-01 | First launch while offline with no cached configuration | UNKNOWN | Do not draw a made-up recovery or pairing path; keep the state explicitly unresolved | Product / S1-01 design review |
| GAP-S1-01-02 | Persistent notification behavior on iOS | PLATFORM CONSTRAINT / UNKNOWN | Do not promise Android-style persistent notification parity | Platform architecture |
| GAP-S1-01-03 | iOS source for memory/connectivity/battery health measurements | PLATFORM CONSTRAINT / UNKNOWN | No fabricated iOS metrics or health source | Platform architecture |
| GAP-S1-01-04 | Whether the owner may manually turn off mandatory Yemen low-bandwidth mode | OWNER DECISION | No off switch and no claimed disable path until ruled | Owner |
| GAP-S1-01-05 | Default sync cadence (hourly / daily / manual only) | UNKNOWN | Present the allowed choices without selecting an approved default | Owner |
| GAP-S1-01-06 | Human-friendly names for Outbox event types | UNKNOWN | Avoid raw internal enum names and payloads; use neutral status until owning systems define labels | Owning systems / design |
| GAP-S1-01-07 | Numeric alert thresholds for memory and battery | UNKNOWN | Display sourced readings and timestamps only; do not invent warning thresholds | Product + platform |
| GAP-S1-01-08 | iOS secure-storage mechanism for PIN hash / protected key | PLATFORM CONSTRAINT / UNKNOWN | Do not name an unverified implementation in UI or technical annotation | Platform architecture / security |
| GAP-S1-01-09 | Whether a safe 10-second Undo is possible after PIN change and key re-wrapping | UNKNOWN | Do not draw an Undo affordance until proven safe | Security + owner |
| GAP-S1-01-10 | Nested navigator vs flat go_router route structure | PLATFORM / ARCHITECTURE DECISION | Keep route destinations and transitions documented; do not lock internal router architecture in visual design | Architecture |
| GAP-S1-01-11 | Full content mapping of minimal, child standard, and teen standard templates across systems | UNKNOWN | Use shell/content slots only; no final tile inventory or screen map | Owner + S1-02/S1-05/S1-06/S1-08/S1-09 design |
| GAP-S1-01-12 | English counterparts for draft Arabic copy and localization/TMS details | UNKNOWN | Arabic is primary; do not fabricate approved translations; keys remain traceable | Localization review |
| GAP-S1-01-13 | Where/how MQTT acknowledgment (ack) is surfaced to the user | UNKNOWN | No dedicated S1-01 ACK screen; display only source-confirmed status inside the owning SOS surface | Owner + S1-07 |

## 2. Cross-cutting open items that constrain visual design

| Item | Current state | Impact |
|---|---|---|
| Q-043 / B-001 / B-002 | Logo asset and mentor/mascot identity remain open | Use the temporary Arabic text mark only; do not invent SVG logo, mascot, or voice |
| Q-045 / S-001 | Full tablet/fold/web scope remains open in the question register; Q-392 sets the Phase 1 responsive baseline | Apply the approved width classes and hinge-safe content; do not claim complete web or advanced fold posture design |
| Q-041 | Arabic + English are supported; additional languages/TMS remain open | Prepare localization keys and layouts; have English copy reviewed, not inferred |
| Q-046 | Child analytics policy remains open | No child analytics events in the design or acceptance assumptions |
| Q-090 | Cross-system template content is to be completed in design | This package only defines S1-01 shell behavior; it cannot complete all systems' content decisions |
| Q-157 | “First family member within 24 hours” has no approved source | No timer, deadline, or speed promise in setup UI |
| CH-003 | Parent alert thresholds for child distress need child-safety/legal review | Do not design a new distress-escalation policy in S1-01 |

## 3. Reconciliation against newer approved decisions

The following draft §9 statements are older than the approved decisions below. This package applies the newer decision in its own design work; it does **not** silently rewrite the approved source specification.

| Draft source statement | Newer governing decision | Treatment in this package |
|---|---|---|
| §9 uses owner as if it were an operational role | Q-006 / Q-394 | Use only adult, teen, child; owner is adult + is_owner=true |
| Parent shell is described with a bottom navigation bar only | Q-392; Q-389 | Use Bottom Navigation / NavigationRail / persistent side navigation by available width; adapt Compact navigation at 150–200% text scale |
| §9 states the final font and full palette are not yet available | Q-383 / Q-384 | Use the frozen 50–950 palette and approved IBM Plex font family |
| Older notes imply owner-specific navigation | Q-394 | Resolve visibility from adult grants plus is_owner attribute; do not create Owner role or Owner permission profile |
| Older draft may imply a generic status/health summary | Q-391 | Any dashboard summary is deterministic from recent, verified source states; no AI-generated safety verdict |
| Older draft allows broad child appearance changes | Q-390 | Child appearance uses approved ThemeProfiles and semantic tokens only; no free Hex |
| Older screen layouts assume compact phone behavior only | Q-392 | Preserve the approved Phase 1 tablet/fold baseline and hinge-safe layout |

## 4. Design review checklist

Before moving this package to approved, verify:

- [ ] Every screen maps to at least one S1-01 requirement and one governing design-system source.
- [ ] Parent/child mode and role/grant visibility are consistent with Q-006/Q-062/Q-063/Q-394.
- [ ] No family selector, role named owner, or profile switching has entered the design.
- [ ] The shell adapts at 600dp and 840dp; no clipping at 150% or 200% text scale.
- [ ] SOS remains above all ordinary content and has truthful state transitions.
- [ ] Offline, stale, pending, and unavailable states are visually distinct and non-deceptive.
- [ ] No AI-generated safety verdict, child analytics, or unapproved child-safety notification behavior is introduced.
- [ ] All child surfaces have no payments, external links, ads, or hidden administrative controls.
- [ ] Open gaps above remain visible and are not resolved by design inference.
- [ ] The owner explicitly accepts or revises the visual proposals.

## 5. Change log

- 2026-11-11 — Initial S1-01 design package created from the current branch's approved planning sources and current design-system decisions. No governance source or application code changed.
