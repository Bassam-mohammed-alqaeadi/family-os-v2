# S1-01 — Design Foundation & Read-only Audit

- **Status:** drafted — design work only
- **Branch:** `feat/governance-v2`
- **Created:** 2026-11-11
- **Scope:** S1-01 App Shell & Platform
- **Workspace rule:** this artifact is inside `design-work/`; it does not amend approved governance, specifications, design-system sources, application code, or database files.

## 1. Verification snapshot

### Verified on `feat/governance-v2`

| Item | Result | Evidence |
|---|---|---|
| Repository | Found | `Bassam-mohammed-alqaeadi/family-os-v2` |
| Active work branch | Exists and readable | `feat/governance-v2` |
| Previous branch | `feat/benchmark-intelligence-program` exists; charter marks it read-only | `CHARTER.md §6` |
| Governance authority | Present | `docs/family-os/governance/CHARTER.md`, `decisions/DECISIONS-LOG.md`, `OPEN-QUESTIONS.md`, `ROADMAP.md`, `architecture/ARCHITECTURE.md` |
| Design authorization | Granted | `Q-346`: Phase 1 design authorized, starting with S1-01 |
| Design workspace | Present | `design-work/README.md` |
| S1-01 planning spec | Present; approved for planning | `docs/family-os/governance/phases/phase-1/S1-01-app-shell-and-platform/SPEC.md` |
| S1-01 diagrams | Present; approved | `.../S1-01-app-shell-and-platform/DIAGRAMS.md` |
| Design system | Present; approved for implementation | `docs/family-os/governance/design-system/` |
| Existing S1-01 design deliverables | No prior S1-01 artifact was found at the checked paths | This new workspace artifact starts the design record |

**Revision limitation:** the GitHub branch search confirms the branch exists, and branch-scoped file reads succeeded. The available branch-search response did not expose the branch HEAD SHA, so this audit does not assert an exact current HEAD commit.

## 2. Authority and source hierarchy

1. `CHARTER.md`
2. `decisions/DECISIONS-LOG.md`
3. `OPEN-QUESTIONS.md` for unresolved items
4. S1-01 `SPEC.md` and `DIAGRAMS.md`
5. Approved design-system sources:
   - `design-system/color-tokens.md`
   - `design-system/typography.md`
   - `design-system/spacing-and-grid.md`
   - `design-system/navigation-patterns.md`
   - `design-system/components.md`
   - `design-system/states-empty-loading-error.md`
   - `design-system/motion-and-feedback.md`
   - `design-system/iconography.md`
   - `design-system/microcopy-and-tone.md`
   - `design-system/ui-glossary.md`

No source above is edited by this deliverable.

## 3. Audit findings that affect design

### F-001 — Stale constraints inside S1-01 SPEC §9

The current S1-01 `SPEC.md §9` still contains a constraint saying the final Arabic font and 50–950 color ramps are not approved (references Q-042/Q-044). That statement is stale against the current approved decisions and design-system sources:

- **Q-383:** final brand ramps 50–950 and semantic status colors are fixed; Amber Warning is `#9A5B00`, Danger `#B42318`, Info `#2457A6`; Orange `#CF5B2C` is brand accent, not Warning.
- **Q-384:** IBM Plex Sans Arabic + IBM Plex Sans are approved for the Phase 1 interface.
- `design-system/color-tokens.md` and `typography.md` are marked approved for implementation and contain the adopted values.

**Handling:** use the current approved design-system files and Q-383/Q-384 as the design authority. Do not modify SPEC §9 from this workspace. Record this as a documentation inconsistency for an explicit governance/specification correction if the owner wants it corrected.

### F-002 — Brand assets remain open

- **Q-043:** original logo SVG and guide character assets remain open.
- Until supplied/approved, use only the approved temporary text wordmark `عائلتي` using the brand tokens. Do not invent a logo mark, mascot, or illustration.

### F-003 — Responsive scope

- **Q-045:** full tablet/foldable/web support remains open.
- Design phone-first. Respect the approved breakpoints and avoid layout breakage at Medium/Expanded/Large; do not claim full tablet/web product scope until Q-045 is resolved.

### F-004 — Child analytics

- **Q-046:** child analytics policy remains open.
- S1-01 SPEC explicitly prohibits analytics events for child screens until resolved. Do not add analytics indicators or imply child tracking.

### F-005 — Setup duration

- **Q-157:** the “first family member within 24 hours” target has no approved source.
- Do not display a 24-hour target, countdown, or completion promise. The onboarding checklist may show steps and completion state without a time goal.

### F-006 — Cross-system dependency

- **Q-090** concerns the detailed contents of the three age/display templates in S1-02, not a new S1-01 product feature.
- For S1-01, reserve the child-mode content area without inventing the child home content. Mark dependent content as `UNKNOWN — S1-02/Q-090` until the relevant design decision is resolved.

## 4. Approved S1-01 product frame

S1-01 provides the shared shell for one Flutter application with two device modes. The device mode is fixed by pairing:

- Parent Mode: administrative/dashboard experience, constrained by actual permissions.
- Child Mode: child/teen experience, with no administrative surface.
- Kotlin native enforcement is hosted by the app but enforcement policy evaluation belongs to S1-10.
- Persistent SOS is a global layer in both modes.
- Offline status and mandatory-update banners are global conditional layers.
- S1-01 does not own identity/OTP, family membership/permissions, enforcement policy, location/SOS delivery, or billing feature screens.

## 5. First design pass — shell skeleton

These are structural low-fidelity layouts, not approved visual designs. All colors, typography, spacing, icons, and components must resolve through the approved design-system tokens and components.

### SCR-01 — Launch and mode resolution

**Traceability:** SPEC §2 scenario 2-1, §3 REQ-001/002/008/012/017/018, §9 SCR-01; DIAGRAMS §3–4.

**Behavior to preserve**
- Read the fixed device mode from `device_mode`.
- Load cached configuration and feature flags; do not block the shell on network availability.
- Route to Parent Mode or Child Mode according to the paired device mode.
- Route to the mandatory-update surface only when the supported-version rule requires it.
- Never offer a mode switch or profile switch from this screen.
- Show the offline banner only when offline; do not render a fake successful sync state.

**Low-fidelity frame**

```text
┌────────────────────────────────────┐
│                                    │
│             عائلتي                 │
│                                    │
│         [Launch indicator]         │
│                                    │
│                                    │
│ [Offline status — conditional]     │
└────────────────────────────────────┘
                 [SOS layer]
```

**States**
- Loading: brief launch surface; no long decorative animation.
- Offline: continue from cached configuration and show truthful offline status.
- Configuration fetch failure with cache: use cached configuration and disclose its age/status.
- Configuration unavailable with no usable cache: unresolved behavior must be checked against the full SPEC before designing a recovery screen; do not invent a fallback.
- Success: route according to paired device mode.

### SCR-02 — Parent shell (first structural pass)

**Traceability:** SPEC §2 scenario 2-1, §3 REQ-001/004/008/012, §9 SCR-02; design-system/navigation-patterns.md §§1–5.

**Low-fidelity frame**

```text
┌────────────────────────────────────┐
│ عائلتي                 [Connection]│
│ [Context status banner — if needed]│
├────────────────────────────────────┤
│                                    │
│  Family overview / cached readings │
│  - Family status                   │
│  - Last successful sync + age      │
│                                    │
│  [Registered module surfaces]      │
│  (only items allowed by registry   │
│   and the user's actual grants)    │
│                                    │
├────────────────────────────────────┤
│ Home | Family | Messages | Control │
│                         [More]     │
└────────────────────────────────────┘
             [Persistent SOS layer]
```

**Rules**
- The actual tab set is derived from registered navigation eligibility and effective grants; the frame above is a layout placeholder, not a hard-coded tab decision.
- Maximum five primary navigation items.
- On Compact, use bottom navigation; on Medium use a navigation rail; on Expanded/Large use persistent navigation with a constrained content area.
- Owner is not a separate role: use `adult + is_owner=true`; never create a `role.owner` variant.
- Cached readings appear immediately with truthful freshness; partial section failure must not collapse the whole shell.
- Keep the SOS layer above the content/navigation stack and separate from ordinary navigation.

### SCR-03 — Child shell boundary (not yet detailed)

The shell must not expose parent administration, settings, or control tabs in Child Mode. The content composition of the child home remains `UNKNOWN — S1-02/Q-090`; this pass defines only the shell boundary and global layers (SOS/offline/update).

## 6. Design-system constraints for all upcoming artifacts

- Colors: use semantic roles only (for example `surface.base`, `text.primary`, `primary.default`, `warning.default`, `danger.default`, `info.default`); never paste Hex values into screen specs.
- Typography: IBM Plex Sans Arabic + IBM Plex Sans; Arabic-first, RTL by default.
- Layout: 4dp grid, logical start/end spacing, minimum touch targets by experience profile.
- Navigation: registry- and permission-driven; maximum five primary destinations.
- Components: reuse `Fos*` components; no bespoke screen-level component when a catalog component exists.
- States: define loading, empty, error, offline, partial, and success behavior where applicable.
- Motion: functional, restrained, respects reduced motion and low-end devices.
- Language: use the approved Arabic UI glossary and concise MSA-lite microcopy.

## 7. Next design sequence

1. Complete S1-01 screen-by-screen design records for SCR-01 through SCR-12 (SCR-06 is notification content, not an in-app screen).
2. For each screen: requirement traceability → information hierarchy → low-fi wireframe → state matrix → responsive behavior → component/token mapping → accessibility review.
3. Keep cross-system content explicitly bounded; do not design S1-02/S1-07/S1-09/S1-10 functionality inside S1-01.
4. Submit each screen for owner review before treating the design as approved.
5. Only after the screen set is reviewed, create high-fidelity mockups and a clickable prototype.

## 8. Explicit non-changes

This audit/design pass does not change:
- `main` or the previous branch.
- Governance decisions or open questions.
- S1-01 `SPEC.md` or `DIAGRAMS.md`.
- The approved design-system sources.
- Application code, packages, CI, or database schema.


### F-007 — Project-owner identity needs confirmation before further approval gates

The current `CHARTER.md §3` names the project owner as `hussin`, while this GitHub repository is under `Bassam-mohammed-alqaeadi` and the current conversation is with Bassam. The available evidence does not establish whether these identify the same person, an alias, or different people.

**Handling:** do not infer identity or transfer decision authority. This does not invalidate the read-only audit or this non-binding draft artifact, but owner approval of screen designs and any governance decision must wait until the project-owner identity/authority is confirmed.
