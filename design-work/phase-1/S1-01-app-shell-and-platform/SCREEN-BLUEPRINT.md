# S1-01 — Screen Blueprint

> **Status:** drafted · **Owner review required**  
> **Source:** S1-01 SPEC.md §§1–8/10, draft §9; DIAGRAMS.md; approved design-system files; Q-385…Q-394.  
> **Purpose:** Design translation only. This file does not replace or approve S1-01 SPEC §9.

## 1. Design contract

### 1.1 Surface count

S1-01 contains **11 in-app screens** and **one operating-system notification surface**. The notification surface is SCR-06 and is not counted as an in-app route.

| ID | Surface | Mode | Primary audience |
|---|---|---|---|
| SCR-01 | Boot and mode resolution | Parent + child | All roles |
| SCR-02 | Parent shell / family dashboard | Parent | Adults with grants; owner is adult + is_owner=true |
| SCR-03 | Child home shell | Child | child / teen |
| SCR-04 | Parent Gate (PIN entry) | Child device | Parent enters PIN; child sees a guarded barrier |
| SCR-05 | Parent Gate setup/change PIN | Parent | Owner only |
| SCR-06 | Persistent notification | OS surface | Parent + child |
| SCR-07 | Persistent SOS control and post-trigger status | Parent + child | All roles |
| SCR-08 | Administrative shell settings and registries | Parent | Adult read by grant; owner edits |
| SCR-09 | Sync and Outbox status | Parent + child, adapted by template | Parent detail; teen status; minimal child has no detail page |
| SCR-10 | Low-bandwidth mode | Parent + child, adapted by template | Owner configures; child sees status |
| SCR-11 | Platform health | Parent | Adult read; owner has full permitted visibility |
| SCR-12 | App update | Parent + child | All roles; ordinary update is parent-led, critical update is mandatory |

### 1.2 Global application frame

**CURRENT FACT**
- One Flutter application has two fixed device modes in Phase 1: parent or child. Pairing establishes the device mode; there is no profile/mode switcher in Phase 1 (Q-062, Q-063, Q-068).
- The shell reads the mode from the paired device record at launch; it does not infer the mode from the currently signed-in user.
- A contextual connection/update status surface sits within the shell. The SOS control is a separate topmost emergency layer and remains visible above ordinary content in both modes.
- No family selector is shown in MVP/Phase 1 (Q-393).
- No navigation destination is shown unless the current adult has the required grant. A hidden destination is not replaced by a dead or disabled navigation item.
- All interface text comes from localization resources. Arabic is the default and RTL; English is also supported (Q-070).

**PROPOSED — frame composition for visual work**
1. Platform safe area.
2. App bar / mode-specific header where the screen uses one.
3. Contextual status banner (offline, low-bandwidth, update required), only when relevant.
4. Scrollable content region with no fixed-height content assumptions.
5. Adaptive primary navigation for parent mode; child navigation only where the approved template permits it.
6. Persistent SOS overlay, independent of navigation and content z-order.

The shell must preserve usable content around the SOS overlay. The overlay must not cover a primary action, PIN digit, or system permission prompt.

### 1.3 Responsive behavior

These are owner-approved rules; they supersede any older compact-only wireframe in draft §9.

| Available width | Primary parent navigation | Content behavior |
|---|---|---|
| Compact: under 600dp | Bottom Navigation, up to five visible destinations | Single primary content column; secondary destinations grouped under “المزيد” only when they exist and are granted |
| Medium: 600–839dp | NavigationRail | Two-column content only where the content hierarchy benefits |
| Expanded/Large: 840dp+ | Persistent side navigation | List/detail layouts where appropriate; no forced compression |

- On Compact at 150–200% system text scale, the bottom bar may show icons with the selected destination label visible; accessible names remain complete (Q-389).
- Do not cap system text scaling, clip labels, or shrink text below 12sp.
- Tablet and foldable layouts are supported as a Phase 1 baseline. Content must not cross a physical hinge; advanced folded-posture optimization remains outside this blueprint (Q-392).
- Settings member/control matrix behavior follows Q-387: under 600dp, one member at a time in expandable control cards; 600–839dp, horizontally scrollable matrix with a fixed control-name column; 840dp+, full matrix.

### 1.4 Visual language

| Area | Approved source | Application in S1-01 |
|---|---|---|
| Brand mark | brand-and-logo.md; Q-043 remains open | Use the temporary Arabic text mark “عائلتي” only where a mark is needed; do not invent a logo SVG or mascot |
| Color | color-tokens.md; Q-383 | Use semantic tokens only. Warning = amber; danger/SOS = red; orange is brand accent, not warning |
| Typography | typography.md; Q-384/Q-389 | IBM Plex Sans Arabic + IBM Plex Sans; system-scaled text |
| Icons | iconography.md; Q-385 | Material Symbols Rounded; no parallel icon set |
| Components | components.md | Use the named Fos components and their defined states |
| RTL | rtl-and-localization-ui.md; Q-386 | Layout follows locale; temporal charts stay chronological LTR |
| Empty/loading/error | states-empty-loading-error.md; Q-388 | Every state is explicit, honest, and does not reveal unauthorized data |

**Contrast and semantics:** use the frozen approved palette values; do not use raw brand hex values for semantic states. Color never carries meaning alone: pair it with a label and icon/shape. Error reference IDs are opaque random identifiers, contain no personal information, and reveal no raw stack trace.

### 1.5 Role and permission model

The only operational roles are **adult**, **teen**, and **child**. The owner is an adult with **is_owner=true**; **owner** is not a fourth role (Q-006, Q-394).

- UI visibility is derived from effective grants and the device mode, not from a hard-coded Owner role.
- Adult read access and owner edit access are distinct where the SPEC says so.
- Child and teen experiences must not expose administrative registries, family controls, plan/payment surfaces, or external links.
- No child analytics events are designed or emitted before Q-046 is resolved.

## 2. Screen designs

The following layout notes are design-level translations. Where §9 is still draft or the source has a named gap, the note is deliberately incomplete.

### SCR-01 — Boot and mode resolution

**Intent:** Open the application, resolve the paired device mode, load cached configuration/feature flags, and route to the correct shell.

**Composition**
- Centered temporary “عائلتي” text mark.
- Short progress indicator; no long branded animation.
- Offline or low-bandwidth status only when applicable.
- No family selector and no mode selector.

**Routing**
- Read the paired device mode and minimum supported app version.
- If a known mandatory security update blocks use, route to SCR-12.
- Otherwise route to SCR-02 (parent mode) or SCR-03 (child mode).
- If refresh fails but a valid cached configuration exists, continue with a clear stale/offline state.

**States**
- Loading: short splash/progress.
- Offline + cached config: continue to the correct mode and show truthful connection state.
- No network + no cached config: UNKNOWN — GAP-S1-01-01; do not invent a setup or recovery journey.
- Config fetch failure + cache available: show cached experience with a status banner.
- Unsupported minimum version: mandatory update surface.

**Components:** FosProgress, FosStatusBanner, FosSkeleton where the parent dashboard loads after routing.

### SCR-02 — Parent shell / family dashboard

**Intent:** The default parent home, showing current family/device signals and destinations available to the current adult.

**Composition**
1. App bar with temporary “عائلتي” text mark and connection state.
2. Contextual banner under the AppBar when offline, low-bandwidth, stale, or update-required.
3. Deterministic family summary from verified and recent source states only.
4. Registered service/widget cards filtered by actual grants and availability.
5. Quick actions only when their control keys are registered and permitted.
6. Adaptive navigation per §1.3.
7. Persistent SOS overlay.

**Data honesty**
- Show online/offline counts, last-update time, and stale-device state only when supplied by the source and accompanied by its age.
- Never display “الجميع بخير” or an AI-derived safety verdict from incomplete/stale state.
- Do not add a 24-hour setup target or countdown (Q-157 remains open).
- No family switcher.

**States:** skeleton over cached-first content; partial failure is scoped to the affected card; offline reads cache and queues writes; empty first-run uses an untimed setup checklist. The checklist's detailed tasks remain owned by their respective systems.

**Components:** FosWidgetCard, FosMemberCard, FosStatusStrip, FosQuickActions, FosStatusBanner, FosSkeleton, FosSosButton.

### SCR-03 — Child home shell

**Intent:** A safe, age-appropriate container for the child/teen systems; not an administrative dashboard.

**Composition**
- **minimal** (under 7): a spacious, low-text home canvas with large touch targets and audio/icon-led navigation. A precise tile inventory and grid count are UNKNOWN until the relevant template decision is completed.
- **standard child** (7–12): a child-oriented content region, with large readable cards and age-appropriate wording.
- **standard teen** (13–17): a more independent, neutral content region; no childish mascot treatment.
- The shell hosts content slots owned by S1-05/S1-06/S1-08 and other authorized systems; this package does not invent their card content or navigation destinations.
- Persistent SOS remains a separate emergency layer. It is not counted as a navigation destination.

**Non-negotiable exclusions:** no parent dashboard, no administrative settings, no payment/upgrade/sale, no external link, no ad, no tracking/analytics, and no free-form semantic colors.

**Template status:** The full content mapping remains open (Q-090 / GAP-S1-01-11). The child-mode guideline's 2×2 or 2×3 suggestion is not promoted to an approved grid here.

**States:** loading skeleton matches the relevant template; offline content must be labelled as cached/stale; failure text is kind and non-punitive; no infinite scroll or forced autoplay.

### SCR-04 — Parent Gate (PIN entry on a child-mode device)

**Intent:** A guarded barrier before a child-device action reserved to the parent.

**Composition**
- Full-screen guarded surface, not a conventional settings page.
- Clear short Arabic explanation that the parent must enter their PIN.
- Six-or-more digit PIN entry using FosPinPad; obscure entered digits.
- One neutral cancel/back action returning to the interrupted action without executing it.
- Remaining-attempt feedback and lockout state.
- No math challenge, no child-visible PIN hint, and no fallback bypass.

**Security/behavior**
- PIN verification is local; PIN and hash never leave the device (Q-142).
- Five consecutive incorrect attempts produce a five-minute lock (SPEC §7; Q-366).
- Verification works offline; audit proof is queued for later synchronization.
- For sensitive server-backed actions, the server challenge/proof happens only after the local gate is passed; it is not a server-side PIN verification.
- On forced close/reopen, the PIN input is cleared and never restored.

**States:** empty input; partial entry; incorrect PIN with remaining attempts; locked; local success; pending server challenge for a sensitive action; cancel. Exact copy follows the approved microcopy system.

### SCR-05 — Parent Gate setup/change PIN

**Intent:** Let only the owner adult establish or change the parent PIN.

**Composition**
- Settings section with a short explanation of why the PIN protects child-device administration.
- Set flow: new PIN → confirm PIN.
- Change flow: current PIN → new PIN → confirm PIN.
- Inline validation for minimum length and prohibited common patterns.
- “نسيت الرقم السري” explains the trusted recovery route; it is not a local reset button.
- No password visibility toggle that exposes digits in a screenshot or notification.

**Access:** adult + is_owner=true only (shell.parent_gate.manage).

**Unknown:** whether a 10-second Undo is technically safe after key re-wrapping. Until GAP-S1-01-09 is resolved, do not draw or promise an Undo action. Success feedback must not imply reversible PIN rollback.

### SCR-06 — Persistent notification (OS surface, not an in-app screen)

**Intent:** One useful persistent notification per mode.

| Device mode | Information purpose | Prohibited content |
|---|---|---|
| Parent | Family/device state in concise form | Message content, precise child location, surveillance language |
| Child | Remaining time in concise, age-appropriate form | Surveillance language, message content, precise location |

- Tap returns to SCR-02 or SCR-03 for the corresponding device mode.
- Explain the monitoring categories once in the shared setup flow owned by S1-02.
- iOS behavior is UNKNOWN (GAP-S1-01-02): this design does not promise an Android-style persistent notification on iOS.
- The system's actual notification permission/state must be represented honestly.

### SCR-07 — Persistent SOS control and post-trigger status

**Intent:** A globally visible emergency action, with a truthful status surface after activation.

**Control**
- FosSosButton is an independent topmost layer on all normal parent/child screens.
- Hold duration is three seconds with progressive tactile feedback.
- Accessibility alternative: explicit two-step confirmation; do not make the emergency path inaccessible.
- The SOS action is never hidden by role-based navigation or low-bandwidth settings.

**After activation**
- Hand off sos_triggered immediately to S1-07; S1-07 owns transport and delivery method.
- Outbox is not an alternative SOS transport.
- Status fields such as sent/delivered/acknowledged are shown only when S1-07 supplies the corresponding state.
- Do not imply that the alert reached a person while delivery or acknowledgment is pending.

**States:** armed; hold-progress; triggered/handed off; waiting for delivery/acknowledgment; acknowledged; resolved/cancelled only as supplied by S1-07; failure with a truthful retry/next step.

### SCR-08 — Administrative shell settings and registries

**Intent:** Read the shared shell configuration and system registries; allow the owner to change only explicitly editable shell settings.

**Composition**
- Grouped settings sections: shell configuration, four registries, feature flags, country/region profile, low-bandwidth entry, sync entry, platform health entry, AI gateway contract status.
- Read-only values show source/authority and a concise “لماذا؟” explanation where appropriate.
- The four registries are a read-only system inventory in this screen; do not create a user-editable registry editor.
- AI gateway section is a contract/status placeholder only. No AI action, suggestion, safety verdict, or execution control is designed here.
- Adult can read only with shell.config.view; owner edits only with shell.config.edit.
- Child and teen cannot access this screen.

**Layout:** settings rows use the responsive matrix behavior in §1.3 when comparing members/controls; otherwise use the standard settings list pattern.

### SCR-09 — Sync and Outbox status

**Intent:** Make queued changes and sync health visible without exposing sensitive payloads.

| Audience | Design level |
|---|---|
| Owner / delegated adult with applicable read grant | Detailed status, pending count, last successful sync, per-event neutral status, explicit “مزامنة الآن” when available |
| Teen | Status only: pending / sending / synced / retry needed |
| Child standard | Status only, phrased simply |
| Child minimal | No detail page; lightweight offline/sync cue in the home shell only |

- Never display raw payload, secret, PIN, child message, or precise location in Outbox rows.
- Failed or pending work remains visible until its source system confirms completion.
- Friendly names for individual event types remain UNKNOWN (GAP-S1-01-06). Do not expose raw internal enum names as final copy.
- SOS is not shown as a normal Outbox delivery item.

### SCR-10 — Low-bandwidth mode

**Intent:** Show and configure the required low-bandwidth behavior for the Yemen region profile.

**Composition**
- Current mode state and its source (automatic detection or owner selection).
- Sync cadence selector: hourly / daily / manual only.
- “مزامنة الآن” when allowed and meaningful.
- Clear notice: no automatic app updates in low-bandwidth mode; updates require explicit approval and Wi-Fi.
- Pending content is labelled “بانتظار المزامنة”; stale content must never appear live.

**Access:** owner can configure; child/teen see state only to the extent allowed by their template. The minimal child gets a home-shell state cue, not an administrative screen.

**Unknown:** GAP-S1-01-04 asks whether the owner can turn off low-bandwidth mode manually in Yemen despite its mandatory Phase 1 status. Therefore this design does not show an off switch or promise a disable path. The default sync cadence is also unknown (GAP-S1-01-05); no option is preselected as an approved default.

### SCR-11 — Platform health

**Intent:** Read-only visibility into memory, connectivity, battery, enforcement availability, and relevant device capability.

**Composition**
- Memory, connection, and battery readings with source timestamp/age.
- Heavy-transition state (automatically reduced below 2GB RAM).
- Android enforcement module state.
- Honest platform availability row for iOS; show “غير متاح على هذا الجهاز” only when that is the verified source state.
- Partial failure is isolated: failure to read battery does not blank memory or connectivity.
- No composite “health score”, no AI-generated safety status, and no control that directly changes protection policy from this diagnostic surface.

**Unknown:** numeric alert thresholds for memory/battery (GAP-S1-01-07) and iOS measurement source (GAP-S1-01-03). Until those are decided, show raw sourced readings and timestamps only; do not invent warning thresholds.

### SCR-12 — App update

**Intent:** Explain version state and provide the correct update route.

| State | Surface behavior |
|---|---|
| Up to date | Quiet confirmation; no blocking panel |
| Ordinary update available | Parent-led store action; child remains in the normal shell |
| Critical security update | Mandatory in-app update route; no bypass |
| Below minimum supported version | Blocking update path to the store |
| Update check failed / offline | Defer the check, show honest state, keep SOS available |

- In low-bandwidth mode, updates require explicit approval and Wi-Fi.
- Do not represent an update as installed until the platform confirms the new version.
- Keep SOS available during deferral/failure paths.

## 3. Global state and accessibility checklist

Every applicable screen must be drawn in these states, not only the happy path:

- Initial/loading.
- Cached/partial content.
- Offline or stale data.
- Permission-denied or not-delegated.
- Device/platform unavailable.
- Validation error or operation failure.
- Pending sync or server confirmation.
- Success/confirmed state.

Accessibility and visual quality:
- Minimum touch target follows the component and role profile; never below the approved 48dp general floor.
- Child targets follow child-mode-ui.md (56dp standard; 72–88dp minimal).
- All UI text uses approved type tokens; system scaling remains uncapped.
- Contrast meets the design-system criteria in both themes; state color is paired with text and icon/shape.
- RTL and English LTR versions are designed and checked, including mixed-script identifiers.
- Do not use fixed heights where text may wrap; no clipped primary labels.
- SOS remains operable with assistive technology and reduced-motion settings.

## 4. Traceability anchors

- Shell/modes/boot: REQ-001, REQ-002, REQ-004, REQ-008, REQ-012, REQ-017, REQ-018.
- Parent Gate: REQ-005, REQ-006, REQ-023; Q-065, Q-142, Q-164, Q-244, Q-366.
- SOS: REQ-007; Q-067, Q-234, Q-231; S1-07 owns delivery.
- Outbox/low-bandwidth: REQ-009, REQ-010; Q-064, Q-195; DS-ST-13.
- Registries/config/AI contract: REQ-011, REQ-012, REQ-014; Q-054, Q-167.
- Health: REQ-003, REQ-013, REQ-019.
- Updates/localization: REQ-020, REQ-021; Q-069, Q-070.
- Responsive layout, owner identity, palette, typography, icons, notification safety: Q-383…Q-394 as individually referenced above.
