# S1-01 — Android Detailed Experience Design 0.1

> **Status:** Drafted · proposed visual and interaction specification · **not approved**  
> **Target:** Android-first, one Flutter application with the approved native Kotlin enforcement module boundary  
> **Branch:** feat/governance-v2  
> **Design canvas:** 393 × 852dp logical viewport; compact-width behavior is the actual contract  
> **Authority:** This document defines a new design proposal. It does not amend the approved S1-01 planning contract, system design tokens, permissions, technical architecture, or decisions.  
> **Date:** 2026-11-12

---

## 0. How to read this document

Every statement in this document is classified by its authority:

| Marker | Meaning |
|---|---|
| **CURRENT FACT** | Explicitly required by an approved S1-01 contract, decision, or design-system rule |
| **DERIVED** | Necessary visual/interaction consequence of a current fact |
| **PROPOSED** | New composition, placement, content order, or interaction proposed for owner review |
| **OWNER DECISION** | Must remain unresolved until the authorized project owner decides |
| **PLATFORM CONSTRAINT** | Depends on Android version, device, OS capability, or window configuration |
| **OUT OF SCOPE** | Owned by another system; S1-01 only provides a shell entry or hand-off |

This is an Android-first design contract, not an implementation instruction. It is deliberately separate from the approved S1-01 SPEC.md. The legacy §9 screen inventory, its SCR identifiers, wireframes, and old SCR-02 dashboard composition are not used as the information architecture or visual template. They may only be consulted to verify requirement traceability.

### Reuse register

| Source | Reused mechanism | Where it is applied |
|---|---|---|
| S1-01 approved SPEC §§1–8 and §10 | Two fixed device modes, Parent Gate, SOS event hand-off, cached-first shell, Outbox, low-bandwidth profile, registries, platform health, feature flags, update policy | All shell flows and global states |
| S1-01 approved CARD | Responsibility boundary between shell, identity, permissions, enforcement, location, and billing systems | Module ownership and hand-off rules |
| navigation-patterns.md | Role-specific registered navigation, maximum five destinations, preserved tab state, compact/rail/side navigation | Navigation contract |
| spacing-and-grid.md | 4dp rhythm, logical spacing, touch sizes, breakpoints, safe areas, elevation and Z-order | All Android dimensions |
| typography.md + Q-384/Q-389 | IBM Plex Sans Arabic + IBM Plex Sans, Arabic-first, no text-scale cap, adaptive navigation at 150–200% | Type and scale behavior |
| color-tokens.md + Q-383 | Frozen semantic palette and WCAG AA constraints | Light/dark visual tokens |
| iconography.md + Q-385 | Material Symbols Rounded and the typed icon registry | Navigation, status, and actions |
| components.md | Fos component contracts, SOS hold pattern, Parent Gate patterns, persistent notification rules | Shared component anatomy |
| child-mode-ui.md + Q-390 | Age-aware profiles, no external links/ads/child purchases, child-safe interaction principles | Proposed child compositions |
| motion-and-feedback.md | Motion tokens, reduce-motion behavior, performance limits | Transitions, feedback, and SOS haptics |
| Android Developers: edge-to-edge and window size classes | Dynamic system insets, adaptive window sizing, OS bars | Android integration guidance |

---

## 1. Design objective and experience principles

### 1.1 The objective

**PROPOSED:** S1-01 should feel like a coherent Android family environment rather than a stack of unrelated administration screens. Its job is to hold the platform together, keep the active mode clear, make global state understandable, and provide consistent entry points to the registered systems.

The shell does not own the meaning or business logic of every module. It owns the frame, the shared state, the global controls, the transition rules, and truthful system feedback.

### 1.2 Five experience principles

1. **The device mode is unmistakable.** A device paired as Parent stays in Parent mode; a device paired as Child stays in Child mode during Phase 1. Signing in as a different person does not switch the device mode.
2. **The family is represented, not scored.** The parent landing surface may summarize recent verified facts, but it must not invent a family safety score, a risk verdict, or an AI-generated status.
3. **Every status has provenance.** The interface distinguishes confirmed, pending, stale, unavailable, blocked by permission, disabled by owner, and waiting for connectivity.
4. **Children receive a product experience, not an admin console.** No family administration, plan or payment surfaces, permission registries, platform-health details, or admin navigation is exposed in child or teen contexts.
5. **Android is treated as a system environment.** Insets, system bars, notification permissions, gesture navigation, split-screen, window resizing, battery restrictions, and supported enforcement capabilities are not simulated as if the app controls the OS.

### 1.3 Visual language

**PROPOSED:** Use a visual language called **Family Field** for the Parent experience: a calm central family identity, surrounded by clearly separated registered capabilities and concise source-confirmed activity. The composition uses spatial grouping and an editorial hierarchy rather than a conventional stack of identical dashboard cards.

**PROPOSED:** Child surfaces use an **Activity Garden** language: large, clear, age-adaptive areas with visual warmth and short labels. Teen surfaces use a restrained **Personal Space** language: less decoration, direct language, and clear personal transparency controls.

The concepts above are names for visual directions only. They do not create new product features, data fields, permissions, or navigation roles.

---

## 2. Android layout foundations

### 2.1 Reference canvas

| Item | Design value | Authority |
|---|---:|---|
| Primary phone canvas | 393 × 852dp | PROPOSED reference viewport |
| Compact width | Below 600dp | CURRENT FACT |
| Compact page gutters | 16dp each side | CURRENT FACT |
| Main content width at 393dp | 361dp | DERIVED: 393 − 32 |
| Main content behavior | One column, vertical scroll | CURRENT FACT for Compact |
| Primary orientation | Portrait | CURRENT FACT |
| Landscape | Supported without promising the child-minimal composition | CURRENT FACT |
| Base spacing | 4dp | CURRENT FACT |
| Fine-detail exception | 2dp only inside components | CURRENT FACT |

The 393 × 852dp canvas is a layout reference for design review. It is not a statement that every Android phone has that logical viewport. The design must be verified at compact widths from 360dp through 599dp and at representative heights, including short windows.

### 2.2 Edge-to-edge and system insets

**PLATFORM CONSTRAINT:** Android 15 enforces edge-to-edge for apps targeting SDK 35 or higher. The window can draw behind status and navigation bars. The app must read current system insets and prevent controls and important text from being obscured.

**CURRENT FACT:** The design system requires SafeArea handling for cutouts, gesture areas, keyboard, and device bars.

**Design rule:**
- Draw the background behind system bars where visually appropriate.
- Place important content inside the live safe content area, not at a guessed fixed offset.
- Read top, bottom, cutout, IME, and gesture insets from the platform at runtime.
- Never hard-code a universal 24dp status bar or 24dp navigation bar.
- Do not place SOS, a primary action, an input, or a tappable control inside the system gesture exclusion area.
- The scroll container must add the live bottom inset to its content padding; it must not use an arbitrary fixed spacer.
- The Android three-button navigation mode and gesture mode must both be reviewed.
- The status/navigation bar icon contrast follows the current light/dark surface behind them.
- During IME display, the focused field and its submit/continue action remain visible; content scrolls or resizes without clipping.

**Reference:** Android Developers, “Display content edge-to-edge in Views” and “Use window size classes” (links in §15).

### 2.3 Responsive behavior

| Available window width | Shell pattern | Content composition |
|---|---|---|
| Compact <600dp | Bottom Navigation, at most five entries | One column; sheets for quick choices; full pages for detailed work |
| Medium 600–839dp | NavigationRail | Rail + one primary content pane; two columns only where they add clear value |
| Expanded 840–1199dp | Persistent side navigation | Navigation + content; list/detail where a workflow needs it |
| Large ≥1200dp | Persistent side navigation | Constrained reading width; administrative details may use a wider workspace |

**CURRENT FACT:** The project’s approved baseline uses Compact Bottom Navigation, Medium NavigationRail, and Expanded/Large persistent side navigation. Tablet/foldable basic adaptation is required; advanced fold posture optimization remains outside this design gate.

**DERIVED:** Layout decisions must use the available app window, not a device-name check such as “tablet = true”. On foldables and split-screen, window width and height may change while the app is active. The app recomputes its layout without losing the current route, scroll position, or unsaved non-sensitive form state.

### 2.4 Global vertical anatomy — Compact

The app window is divided into logical layers. The exact Android OS inset is dynamic and is not counted as a fixed app component.

| Layer | Proposed/required size | Placement |
|---|---:|---|
| Top system area | Dynamic inset | OS-owned; content may paint behind it |
| App top bar | 56dp content height | Below/behind status area according to edge-to-edge implementation |
| Context status strip | 40dp minimum; grows if translated text wraps | Immediately below AppBar; omitted when there is no status |
| Main scroll area | Remaining height | One content column, 16dp side gutter |
| Navigation surface | 64dp control area, plus live bottom system inset | Fixed at bottom in Compact modes with navigation |
| SOS floating affordance | 56dp adult/teen; 72dp child standard; 72–88dp minimal | Above navigation or inside reserved safe area; never over a primary control |
| System navigation area | Dynamic inset | OS-owned |

The navigation surface’s 64dp is a **PROPOSED composition target** using the approved spacing scale. It must be validated at 150% and 200% text scaling and with Android gesture/three-button navigation. It must grow or switch representation rather than clip.

### 2.5 Page spacing and density

| Relationship | Spacing |
|---|---:|
| Screen edge to content | 16dp |
| AppBar title to action | 12dp |
| Label to supporting text | 4dp |
| Elements within one component | 8–12dp |
| Between normal components | 12–16dp |
| Between major sections | 24dp |
| Between distinct experience groups | 32dp |
| Touch target separation | At least the role-specific minimum |

Use only approved spacing tokens. The numbers in this document are layout targets expressed in dp; the implementation must map them to the shared spacing tokens and may not introduce free-form per-screen values.

---

## 3. Shared Android shell

### 3.1 Root visual stack

**PROPOSED root stack, back to front:**

1. Theme surface/background.
2. Active route content and scroll region.
3. Navigation surface appropriate to the current window width and profile.
4. Global non-blocking status strip or banner.
5. Floating controls that are not emergency actions.
6. Sheets and dialogs.
7. Critical in-app alert surface.
8. SOS emergency affordance and active SOS presentation as the highest app-owned layer.

The SOS layer is the highest app-owned layer. It does not draw above Android system UI, notifications, permission dialogs, or operating-system security surfaces. It respects OS insets.

### 3.2 Top AppBar anatomy

**PROPOSED compact AppBar: 56dp content height.**

| RTL position | Element | Width/behavior |
|---|---|---|
| Start / right | Current product context or page title | Flexible; one line preferred, wraps only where required |
| Beside title | Optional mode/context badge | Only if it prevents ambiguity; not a permanent decorative label |
| End / left | One highest-priority page action | 48dp touch target |
| End / left | Overflow action | 48dp touch target, only when extra actions exist |

Rules:
- Main title uses title.lg or headline.lg according to hierarchy.
- No more than two AppBar actions.
- The back affordance appears only on a pushed detail route and follows RTL.
- The AppBar does not contain a family switcher; MVP has one family per account.
- The AppBar does not contain a role/mode switch; device mode is fixed in Phase 1.
- Connection and update status are shown in the contextual strip, not as unexplained decorative dots.
- A contextual strip never displaces SOS.

### 3.3 Contextual status strip

**PROPOSED:** One compact strip below the AppBar, rendered only when one or more relevant status facts exist.

| State | Copy model | Action |
|---|---|---|
| Offline | “أنت دون اتصال — نعرض البيانات المحفوظة” | Open connection/sync details if allowed |
| Data stale | “آخر تحديث قبل [duration]” | Refresh only where allowed |
| Low-bandwidth profile | “وضع البيانات المحدودة” | Owner can open its controls; others only see state |
| Critical update required | “يلزم تحديث أمني لمتابعة استخدام التطبيق” | Open required update route |
| Some service unavailable | Show only on the affected surface | Retry or explain alternative |

Priority:
1. Critical security update state.
2. Offline state.
3. Stale data state.
4. Low-bandwidth state.
5. Non-blocking informational status.

Do not show five stacked banners. Combine compatible non-critical facts into one strip with clear wording, or show the most important fact with a route to details. Never hide an emergency state behind a normal status strip.

### 3.4 Mode and profile rendering

| Context | Shell responsibilities |
|---|---|
| Android device paired as Parent | Render Parent experience; modules and administration depend on the active adult role and grants |
| Android device paired as Child | Render child/teen experience; no administrative routes or surfaces |
| Adult owner | Adult navigation and controls allowed by owner grants; ownership is an attribute, not a new role |
| Adult non-owner | Only destinations/actions allowed by effective granular grants |
| Teen | Teen navigation and standard teen template; privacy/transparency access remains discoverable |
| Child 7–12 | Child standard template |
| Child under 7 | Child minimal template |

**CURRENT FACT:** Role values are adult, teen, and child only. The owner is adult + is_owner=true. A device has one fixed mode in Phase 1. Do not infer the active mode from the account that happens to be signed in.

### 3.5 Navigation contract

The new visual design does not replace the approved navigation patterns.

| Context | Compact destinations | Notes |
|---|---|---|
| adult + is_owner=true | الرئيسية · العائلة · المحادثات · التحكم · المزيد | Five entries maximum |
| adult + is_owner=false | الرئيسية · المحادثات · الأمان/الموقع · التحكم المتاح بالمنح · المزيد عند الحاجة | Derive from actual grants; no dead destination |
| teen | الرئيسية · المحادثات · تعلّم · أنا | Four entries |
| child standard | الرئيسية · المحادثات · العب وتعلّم · مكافآتي | Four entries |
| child minimal | No navigation bar; one home return control | Main entry tiles only |

These entries are registered and filtered by effective grants, module availability, and feature flags. The table is not permission logic. A module can contribute content to Home or another surface without creating a new top-level destination.

**At 150–200% system text size in Compact:**
- Replace the text-heavy bar with icon-first navigation.
- The selected destination label remains visible.
- Every destination keeps a complete semantic label for TalkBack and accessibility services.
- Never reduce a text size below 12sp to preserve the bar.
- If four or five destinations still do not fit, adapt the navigation representation; do not horizontally squeeze labels.

**Tab state:** Each main destination preserves its navigation stack, scroll position, and safe draft state when switching tabs. Sensitive values are never restored.

### 3.6 Back behavior

- A standard Android back action closes the topmost sheet first, then a detail route, then returns to the active tab’s root.
- A form with unsaved non-sensitive changes asks before discarding.
- Parent mode may leave the top-level app through normal Android behavior after any required confirmation.
- Child kiosk mode does not exit to the launcher through the app’s back route. A protected exit uses Parent Gate and the approved server challenge for state-changing exit.
- Predictive Back must show the route being left and must not preview an unauthorized destination.
- Do not intercept Android security dialogs or system permission UI.

---

## 4. Parent experience — Family Field

### 4.1 Parent landing surface

**Experience identifier:** P-01 Family Field  
**Context:** Parent device only  
**Primary job:** Understand what is current, identify the next useful action, and enter a registered family system.  
**Ownership:** Shell composes; S1-09 owns Command Center widget definitions; each module owns its source data and deep-link destination.

### 4.2 Visual composition at 393dp wide

Content width = 361dp, page gutters = 16dp. The page is a vertical scroll area and never relies on fixed-height cards.

| Vertical order | Component | Width / placement | Height behavior |
|---|---|---|---|
| 1 | AppBar | Full safe content width | 56dp |
| 2 | Context strip | Full width | 0 or 40dp+ |
| 3 | Greeting / family identity | Full width | Auto; title + one supporting line |
| 4 | Family Field visual | Full content width | 180–216dp proposed; content-driven |
| 5 | Verified attention stream | Full width | Hidden if there are no source-confirmed attention items |
| 6 | Registered capabilities | 2-column arrangement where labels fit | Each module contributes its own entry card |
| 7 | Recent activity preview | Full width | Only if a module provides permitted source-attributed events |
| 8 | Bottom navigation | Fixed | 64dp target + live system inset |
| 9 | SOS affordance | Floating, separate layer | 56dp touch target for adult |

### 4.3 Family Field visual

**PROPOSED composition:**
- A calm, full-width navy-toned visual field.
- Center: the current family identity label (not a new family selector).
- Around it: up to three visual anchors representing the currently registered and permitted capability groups selected by S1-09. These are navigation/identity anchors, not status indicators.
- Any status indicator is shown in a separate text-bearing chip with a source and freshness label.
- The visual may use subtle orbital paths or connected points, but it must remain understandable when animation is disabled.
- The surface must not imply a live family location map.
- No member locations, continuous tracking paths, or child-specific activity details are introduced by S1-01.
- If no module can supply a valid contribution, the visual collapses to a simple family identity composition without empty orbit slots.

### 4.4 Attention stream

**CURRENT FACT:** The Command Center summary is deterministic from recent verified source states. AI cannot create a family safety verdict.

**PROPOSED layout:**
- Section heading at start.
- Each attention item is one row: semantic status icon, title, short source-owned summary, freshness/updated-at line, and one route action.
- No item appears unless its owning module emits a valid attention contribution.
- Each status has text and icon; color is supplemental.
- Pending action, acknowledged, resolved, and unavailable are different states.
- A zero-item state is calm and brief; do not manufacture a “family is safe” message.

### 4.5 Registered capability composition

**PROPOSED layout:**
- A section title and optional “عرض الكل” route to the approved destination.
- Two columns when the compact width supports readable labels and full touch targets.
- Each card uses icon (24dp), title (16–18sp), a single source-derived supporting label, and a semantic availability state if needed.
- At 200% text scaling, switch to one column.
- Never show an unregistered control, disabled feature as if it were active, or capability outside the current plan/grants.
- Do not create a parallel system list inside S1-01. The module registry owns the card declarations and links.

### 4.6 Adult non-owner

Same visual shell, different registered destinations and controls. The shell must not infer “owner look” as permission. It reads effective grants. A missing grant means no route in primary navigation. If a user follows a deep link to a route whose grant was revoked, redirect to the nearest allowed surface and explain the restriction.

### 4.7 Empty / first-run state

**PROPOSED:** Use one guided “start here” composition sourced from S1-02 onboarding completion state. Do not introduce a 24-hour completion goal (Q-157 remains open). The shell only displays the next registered onboarding entry supplied by S1-02; it does not create onboarding steps or collect family identity data itself.

---

## 5. Child standard experience — Activity Garden (proposal for Q-090)

**OWNER DECISION:** The detailed child templates are explicitly open under Q-090. The following composition is a concrete proposal for review, not an approved product decision.

### 5.1 Child standard (ages 7–12)

**PROPOSED page composition:**
1. Header: child display name and a non-administrative personal avatar/photo supplied by the owning identity system.
2. A short friendly greeting (one line) with no unapproved mascot.
3. One main focus card sourced from an eligible child module; if there is no current item, show a simple completion/empty state.
4. A two-column set of 2–4 available module entry cards, derived from the registry and child grants.
5. A short request/help entry where the owning module provides the request contract.
6. Bottom navigation with the approved child destinations.
7. SOS affordance remains separate, always visible, and not counted as navigation.

**Layout target at 393dp:**
- Side gutter 16dp.
- Header content 48–56dp.
- Section gaps 16–24dp.
- Main focus region full width, dynamic height, preferred minimum 120dp.
- Module cards 2-column only while each touch target remains at least 56dp and the title can wrap.
- 12dp minimum gap between child touch targets.
- Bottom navigation plus live system inset.
- SOS 72dp, anchored outside the content’s important touch area.

**Child card content:**
- Icon or illustration from an approved asset/registered module.
- Label in short child-friendly language.
- Optional content from the source system only.
- No purchase, price, upgrade, adult controls, private family controls, or external web links.

### 5.2 Child transparency and safety

The shell does not invent the monitored-data categories. It provides a visible entry route only when the owning system registers it. The teen/child disclosure content and consent rules belong to their owning contracts. No hidden monitoring language is allowed.

### 5.3 Empty and error behavior

- Empty: calm, positive, no guilt, no artificial streak or urgency.
- Error: “لم ينجح هذا، جرّب مرة أخرى أو اطلب المساعدة” style; the exact domain message belongs to the module.
- Offline: a concise status; render locally cached content where valid.
- A tap never promises a remote result before a server acknowledgment.
- Child interaction never exposes the raw Outbox event list.

---

## 6. Child minimal experience — Under 7 (proposal for Q-090)

**OWNER DECISION:** This is also within Q-090. The under-7 composition below is a proposed baseline, not a settled screen inventory.

### 6.1 Composition

**PROPOSED:** A visual 2 × 2 grid of large, carefully spaced module entry areas. The actual set of tiles is provided by eligible registered child modules and approved family setup. S1-01 does not hard-code a fixed list of child features.

- Four visible entry areas at the reference viewport where four eligible modules exist.
- 72dp minimum target; prefer 88dp where space allows.
- At least 16dp separation between touch targets.
- Large 64–88dp illustration/icon.
- Very short label or label plus optional spoken name only if an approved system capability exists.
- No conventional bottom navigation, overflow menu, settings, registry, analytics, technical status page, or admin action.
- One simple “home” return affordance may be present where needed; it is not a profile switcher.
- SOS stays independent above all app content, in a large simplified treatment.
- The shell never invents a mascot. Q-043 remains open; use an approved neutral illustration or no illustration.

### 6.2 Layout at 393dp

| Element | Width | Height / rule |
|---|---:|---|
| Safe header | Full width minus 32dp | Auto, minimal title/avatar |
| Tile grid | 361dp | Two equal columns with 16dp gap |
| Each tile | Approximately 172dp | Content-driven; aim for 150–176dp, not fixed |
| Icon/illustration | Centered | 64–88dp |
| Tile label | Centered | 16sp+ base, follows child multiplier and system scale |
| SOS | Floating | 72–88dp, safe and unobstructed |

If fewer than four permitted modules exist, use fewer tiles and center the available content. Do not add placeholder tiles to fill the grid. If the viewport height is short, use a single column or a scrollable grid; do not reduce touch targets.

### 6.3 Motion and sound

- Feedback is immediate and gentle.
- No auto-playing sound. Spoken labels are not included unless explicitly enabled and implemented by an approved platform/module contract.
- No endless feed, infinite scroll, auto-play, countdown pressure, or punitive red status for ordinary completion.
- Reduce Motion and low-resource conditions use static artwork.
- No Lottie/blur-heavy effects on devices below the approved memory threshold.

---

## 7. Teen experience — Personal Space (proposal for Q-090)

**OWNER DECISION:** The precise teen template belongs to Q-090. This section proposes its visual layout while preserving the already approved teen protections.

### 7.1 Composition

1. Header with the teen’s own identity and current page context.
2. One prioritized personal focus area from a permitted module.
3. Registered module entries in a restrained 2-column or 1-column layout depending on text scale and available width.
4. A concise activity preview only when the owning system permits it.
5. A “أنا” / personal area route containing the transparency entry and personal preferences exposed by the relevant system.
6. Approved teen navigation; no owner controls or payment surfaces.
7. Persistent SOS remains available.

### 7.2 Visual treatment

- Navy and warm neutral surfaces; controlled semantic green and orange accents.
- No childlike guide/mascot treatment.
- No family risk score or AI safety judgment.
- No sibling data unless an explicit permission contract permits it.
- No external links or browser in the teen experience.
- All module availability is rendered honestly: not delegated, disabled by owner, unavailable on device, or waiting for approval.

---

## 8. Parent Gate and protected actions

### 8.1 Full-screen Gate

**CURRENT FACT:** Parent Gate is local PIN verification on a Child-mode Android device. It is not an ordinary login screen.

**PROPOSED layout at 393dp:**

| Vertical order | Element | Placement / size |
|---|---|---|
| 1 | Context label | Centered, 12–14sp |
| 2 | Lock symbol | Centered, 40–48dp |
| 3 | Title and reason | Centered, max content width 300dp |
| 4 | PIN progress | Six or more masked slots, centered, 44–52dp region |
| 5 | Numeric pad | Centered, max width 280dp |
| 6 | Cancel | At lower safe region, 48dp target |
| 7 | Error/lock state | Inline below PIN area, not a blocking toast only |

Keypad:
- Three columns.
- Digits laid out as a physical numeric keypad in the conventional order, not mirrored for RTL.
- Each key has a minimum 56dp touch target; 64dp is preferred on Child-mode devices.
- At least 8dp between adult targets and 12dp on Child-mode targets.
- Clear/backspace is a separate labeled control.
- The keyboard is custom and never delegates PIN entry to a visible text field or system keyboard.
- PIN length is at least six digits and common patterns are rejected.
- The PIN itself is never written to saved app state or logs.

### 8.2 Gate states

| State | Visual response |
|---|---|
| Initial | Empty masked slots; short explanation of the requested protected action |
| Typing | Filled dots only; never reveal digits |
| Wrong PIN | Inline message + remaining attempts |
| Fifth consecutive failure | Locked state for five minutes; keypad disabled |
| Local verification success | Gate success state; continue only with the authorized flow |
| Server challenge pending | Show a separate progress message; do not imply that server-side action has completed |
| Server challenge expired/failed | Explain that the protected operation did not complete; allow a valid retry where contract permits |
| Cancel | Return to the exact previous route; do not perform the protected action |

### 8.3 Security boundary

- PIN only unlocks Parent Gate.
- Biometric authentication may unlock the device signing key only after PIN has opened the Gate; it is not an alternate Gate credential.
- The Gate’s PIN and hash never go to the server.
- For state-changing sensitive actions, a server nonce is required and is one-use with a five-minute validity.
- If network is unavailable, the interface must not claim a server-side state change has occurred.
- No local “forgot PIN” reset. The recovery path is owned by the approved trusted recovery process, not an invented UI shortcut.
- Do not offer a bypass through Back, app relaunch, deep link, notification, or accessibility menu.

### 8.4 Parent PIN setup/change

**PROPOSED page flow:**
1. Explain the consequence and security rule.
2. Enter current PIN for a change.
3. Enter new PIN.
4. Re-enter new PIN.
5. Display success only after local storage update and required key-wrapping operation succeed.
6. A forgotten PIN does not reveal or recreate the old PIN. The trusted recovery process is explained as a separate process.

No biometric shortcut is offered as a substitute for the PIN.

---

## 9. SOS — global shell affordance and S1-07 hand-off

### 9.1 Placement

- Always visible in every app screen and both device modes.
- Separate from navigation; it is not a destination tab.
- Rendered above dialogs, sheets, overlays, and the app navigation surface.
- Adult/teen target at least 56dp; child standard at least 72dp; child minimal 72–88dp.
- Place at logical end of the content safe area; in RTL this is the physical left side.
- Keep at least 16dp from content boundaries and outside the bottom system gesture inset.
- Reserve scroll padding so it never covers a primary control or the last item in a list.
- Avoid placement over text input actions and system permission dialogs.

### 9.2 Trigger

**CURRENT FACT:** Hold for three seconds, with progressively clearer haptic feedback. The SOS event is passed to S1-07 immediately. S1-07 owns transport, delivery, retries, SMS fallback, recipient acknowledgment, and resolution.

**PROPOSED visual states:**
1. Idle: stable SOS label and clear touch target.
2. Pressing: radial progress around the button; haptic steps; release before three seconds cancels without creating an event.
3. Triggered: a brief local hand-off confirmation only after the event channel accepts the event.
4. Handed off: the shell routes into the S1-07-owned SOS presentation through the declared deep link or event response.
5. Handoff failure: clearly state that the SOS system did not accept the event; do not show a fabricated “sent” status.

Accessibility alternative: a two-step accessible trigger consistent with the approved FosSosButton component contract. This alternative must not add a delay beyond the approved emergency behavior.

### 9.3 Ownership boundary

The S1-01 design includes only the global SOS control and its hand-off feedback. It does not design a duplicate incident timeline, recipient list, delivery state machine, map, or transport screen. Those belong to S1-07.

---

## 10. Continuity, offline, sync, and low bandwidth

### 10.1 Shared continuity surface

**PROPOSED:** A “Connection & sync” detail route from the Parent shell. Child and teen receive only a concise, non-technical status from the shell.

Parent detail layout:
1. Current connection state.
2. Last successful sync time, clearly formatted in the family/device locale.
3. Pending operation count from the actual Outbox store.
4. A short list of operation summaries only where the module allows display and where privacy permits.
5. A “Sync now” action when online and authorized.
6. Per-event failure/retry detail only for adult users who have the relevant grants.
7. Clear explanation for queued operations: “سيتم إرسالها عند عودة الاتصال”.
8. No false remote success before server acknowledgment.

### 10.2 Offline

- Cached-first rendering is immediate.
- The offline strip does not replace the whole screen.
- Read-only cached views remain available when still valid.
- A write that can be safely queued receives a pending state.
- A state-changing action that requires an online challenge remains incomplete until the server approves it.
- No fabricated delivery status.
- Each Outbox item preserves its stable idempotency key and chronological ordering.
- An event is never silently discarded before server acknowledgment.
- SOS is not delivered through Outbox. S1-07 owns the offline transport decision.

### 10.3 Yemen low-bandwidth profile

**CURRENT FACT:** Low-bandwidth behavior is mandatory. Responses are compressed, automatic updates are disabled, and synchronization is manual or scheduled.

**PROPOSED UI:**
- Small mode chip in the contextual status strip.
- Parent owner sees the setting in the relevant registered shell-controls area.
- Non-owner adults and child/teen profiles can see status only when appropriate; they cannot change this setting without the required grant.
- The owner control shows the configured sync approach and next scheduled time only if a schedule actually exists.
- No automatic “syncing live” animation.
- Do not invent a default schedule or interval.
- Normal update checks can be delayed while offline; critical security state remains truthful and SOS availability is not represented as depending on the normal update check.

### 10.4 Stale data

A stale item is visually different from offline. The label must include the actual age or a source-provided time; never use “live” unless the source provides a current state.

---

## 11. Platform health and Android capability

### 11.1 Parent-only detail view

**CURRENT FACT:** S1-01 monitors memory, connectivity, and battery and disables heavy transitions automatically on devices with less than 2GB RAM. Numeric warning thresholds for memory/battery remain open and must not be invented.

**PROPOSED composition:**
- Overall device summary at top, timestamped.
- Three rows: Memory, Battery, Connectivity.
- One row for enforcement module availability on Android Child devices where the viewer has the necessary permission.
- One row for app version/update state.
- Each row includes: value or honest state, source/freshness, and an explanation route only when useful.
- No arbitrary green “healthy” badge. Use system facts and semantic status states.
- Do not show detailed platform health in child/teen profiles.

### 11.2 Enforcement status

- A Parent device does not display “child enforcement active” from its own local status.
- An Android Child device exposes the local enforcement module state only to permitted local system consumers and the shell status contract.
- The shell renders a state supplied by the Kotlin platform adapter.
- Rule evaluation, weekly schedules, app blocking policy, VPN/DNS decisions, and enforcement detail belong to S1-10.
- If the native module is absent, unavailable, or unhealthy, the shell does not render an “active” state.
- iOS cannot use the Android Kotlin enforcement path. This Android document does not imply equivalent deep enforcement on iOS.

### 11.3 Low-resource response

At device capability below the approved 2GB RAM threshold:
- Disable heavy blur and Lottie transitions automatically.
- Use static imagery and standard page transitions.
- Do not remove safety controls or shrink touch targets.
- Do not reduce font sizes to fit.
- Keep SOS and essential state feedback intact.

---

## 12. Registries, settings, and feature availability

### 12.1 Shell settings route

**PROPOSED:** A single shell-owned platform settings space reachable only through the approved Parent “التحكم” route and the actual grants.

It exposes only S1-01-owned controls:
- Feature/configuration visibility state.
- Region profile and low-bandwidth status.
- Outbox/sync state.
- Platform health summary.
- Registered shell controls and notification channels.
- AI gateway contract status as technical scaffolding only, with no user-facing claim that an AI service is running.

It does not become a second command center or a replacement for S1-03 permissions, S1-09 administrative controls, or S1-04 billing.

### 12.2 Read-only registry view

- Group by registered type: controls, permissions, widgets, notifications.
- Every row shows registered key label, owning system, state, and whether the current profile can view it.
- No unknown control key is rendered as a working switch.
- An unregistered control is rejected with the approved error contract.
- Child/teen profiles never see this route.
- Adults without admin view grants do not see the route in navigation.

### 12.3 Honest availability states

The shell uses the shared semantic availability vocabulary:
- available
- unavailable_on_device
- pending_approval
- not_delegated
- disabled_by_owner
- requires_upgrade
- coming_soon

No action button is active if the module does not declare a working action. A plan limit is never shown as a child upsell.

### 12.4 AI boundary

The shell may display the AI gateway contract as configured/available only if the contract source confirms it. No AI action, AI summary, family safety score, child classification result, or agent control is invented by S1-01. There are zero agent.* capabilities in this system.

---

## 13. Android notifications and updates

### 13.1 Persistent notification

**CURRENT FACT:** One useful ongoing notification per mode; no message content, no precise location, no “we are monitoring you” wording. The explanation is provided once in shared setup.

**PROPOSED Android notification layout:**
- Small app icon.
- One short title.
- One useful source-confirmed line (for example, remaining time or last sync).
- One tap destination to the relevant app surface.
- No family message preview.
- No precise location.
- No sensitive action button.
- Lock-screen visibility follows the privacy contract and Android notification settings.
- If the user disables notifications or Android restricts them, show the actual platform state; do not imply a persistent notification is visible.

### 13.2 Runtime notification permission

**PLATFORM CONSTRAINT:** Android notification permission and notification-channel behavior depend on Android version and the user’s system settings.

- Explain the user value before requesting permission.
- Request through the owning setup flow, not during unrelated navigation.
- A denied permission does not cause a fake “notifications enabled” state.
- The app links to system settings only when the user chooses to manage the permission.
- Do not block SOS event creation on a denied normal notification permission; the S1-07 transport contract decides delivery channels.

### 13.3 Update surfaces

Three states must be visually distinct:

| State | Surface | Behavior |
|---|---|---|
| Normal update available | Non-blocking parent notice | Opens official store route; parent controls normal update timing |
| Below minimum supported version | Blocking update route | Explain why app cannot continue; store action |
| Critical security update | Blocking critical-update route | No bypass; SOS control remains available as required |

Offline behavior:
- Do not fabricate update availability.
- State that version checking is deferred until connection is restored.
- Keep the application’s emergency entry point available according to the approved platform contract.
- Update policy is owned by S1-01; actual package delivery belongs to the store or approved in-app security-update mechanism.

---

## 14. Motion, interaction, accessibility, and localization

### 14.1 Motion

| Interaction | Motion |
|---|---|
| Tab switch | 120–150ms fade; no horizontal full-page slide |
| Detail route | 220–250ms, direction follows RTL |
| Bottom sheet | 220–250ms |
| Small status change | 120–150ms |
| Large visual transition | 350–400ms only when justified |
| Child celebratory motion | 800–1500ms, short and skippable; only when the owning module uses it |

- Reduce Motion must be respected.
- The shell never uses confetti or celebration for administrative or safety events.
- SOS receives distinctive haptics, not decorative animation.
- Under low-resource conditions, static states replace heavy animation.

### 14.2 Touch and accessibility

| Profile | Minimum target | Minimum separation |
|---|---:|---:|
| Adult, including owner and non-owner | 48dp | 8dp |
| Teen | 48dp | 8dp |
| Child standard | 56dp | 12dp |
| Child minimal | 72dp; 88dp preferred | 16dp |

Every icon-only button has an accessible label, hint where needed, and state description. SOS has a persistent TalkBack name and a clear three-second hold instruction. The progress state is announced without repeatedly interrupting the user.

### 14.3 Type and scaling

- Arabic: IBM Plex Sans Arabic.
- Latin: IBM Plex Sans.
- Default body: 16sp.
- Main body text does not fall below 14sp.
- Labels/captions do not fall below 12sp.
- All text follows system scaling; no application-level cap.
- 150–200% text scaling reflows rows into columns, wraps labels, expands cards, and changes Compact navigation as required.
- No fixed-height surface may clip Arabic diacritics or wrapped text.
- Never solve overflow by shrinking text below the approved minimum.

### 14.4 RTL and mixed direction

- Use logical start/end for all layout and anchoring.
- At RTL, the first bottom navigation destination appears at the rightmost position.
- Back and directional arrows mirror. Numeric PIN keypad does not mirror.
- Phone numbers, email, URLs, IDs, and Latin identifiers use isolated LTR runs.
- Date/time/numeral formatting follows the locale settings.
- Maps, realistic images, and non-directional icons are not mirrored.
- Every screen is reviewed in Arabic first and then English.

### 14.5 Color and state

Use semantic theme tokens only:
- Primary: navy.
- Confirmed success: green.
- Warning: amber.
- Danger/SOS: red.
- Information: info blue.
- Brand attention: orange only within its approved text/icon contrast constraints.
- Gold remains reward/decorative, not small text on light surfaces.

No state is represented by color alone. Pair a semantic icon, text label, and freshness/source when relevant. Test all combinations in Light and Dark.

---

## 15. Detailed design inventory and responsibility map

This inventory uses new design IDs, not the old SCR IDs. It identifies design surfaces, not a mandate to create one route per row.

| New ID | Experience surface | Mode | Shell responsibility | Owning system / dependency |
|---|---|---|---|---|
| AN-01 | App entry and mode resolution | Parent + Child | Render cached shell using paired device mode | S1-02 supplies pairing/mode record |
| AN-02 | Family Field landing | Parent | Compose registered contributions and freshness | S1-09 owns Command Center; modules own data |
| AN-03 | Parent top-level navigation | Parent | Render approved role/grant-aware destinations | S1-03 grants; module registry |
| AN-04 | Teen Personal Space | Child mode / teen | Apply teen shell profile, navigation, privacy entry | Q-090 proposal; modules own data |
| AN-05 | Child standard | Child mode / child 7–12 | Apply child profile and permitted module entries | Q-090 proposal; modules own content |
| AN-06 | Child minimal | Child mode / child under 7 | Minimal visual grid, no admin/navigation surface | Q-090 proposal; Q-043 asset dependency |
| AN-07 | Parent Gate | Child mode protected action | Local Gate UI and secure platform handoff | Kotlin Gate adapter; server challenge contract |
| AN-08 | SOS global affordance | Both | Persistent hold control and immediate event handoff | S1-07 owns transport and incident UI |
| AN-09 | Connection & sync detail | Parent; compact state for child/teen | Offline strip, Outbox status, manual sync entry | Outbox/S1-01; modules own operation content |
| AN-10 | Low-bandwidth control surface | Parent owner | Display region profile and manual/scheduled sync settings | S1-01 config; country profile |
| AN-11 | Platform health detail | Parent only | Display verified memory, battery, connectivity, native module status | Android platform adapter; S1-10 owns enforcement |
| AN-12 | Shell registry/configuration | Authorized Parent | Read-only or allowed owner controls for S1-01 only | Registries + effective grants |
| AN-13 | Persistent notification content | Parent + Child modes | Produce mode-appropriate useful content | Android Notification Manager + source module |
| AN-14 | Update states | Parent + Child modes | Explain normal, minimum-version, critical states | Update provider/store |
| AN-15 | Shared accessibility and appearance | By profile/grant | Render locale, theme, text scaling, density | Design system + Android configuration |

---

## 16. Dimension contract by major surface

These are proposed design dimensions, to be mapped to the approved tokens and tested against actual Android insets. Dynamic text, actual content, and system insets can increase the component height.

| Surface | Width | Key dimensions | Scroll behavior |
|---|---|---|---|
| Parent landing | Full safe width; max content width 640–720dp on wide windows | 16dp page gutters; 56dp AppBar; 40dp+ context strip | Main page scrolls; bottom nav pinned |
| Family Field visual | Full content width | 180–216dp preferred visual region; content may grow | No internal scrolling |
| Attention row | Full content width | 56dp minimum row, can grow with wrapping | Part of main page |
| Capability item | 2 columns at compact default if content fits | At least 56dp touch target; 12dp inter-card gap | Main page |
| Child standard tile | 2 columns where available | At least 56dp target; 12dp separation; content-driven card | Main page |
| Child minimal tile | 2 columns, one column if short/narrow | 72–88dp target; 16dp separation; 64–88dp icon | Grid may scroll |
| Parent Gate key | Fixed centered keypad region | 56dp minimum, 64dp preferred on child device | Screen adjusts for IME (custom keypad) |
| SOS | Floating logical end | 56dp adult / 72dp child standard / 72–88dp minimal | Never scrolls away |
| Navigation | Full bottom width | 64dp proposed target + live inset | Fixed |
| Context banner | Full width | 40dp minimum; content-driven | Does not scroll separately |

---

## 17. State matrix — must be designed for every relevant surface

| State | Parent | Teen | Child standard | Child minimal |
|---|---|---|---|---|
| First entry / cached shell | Detailed context and next registered step | Welcoming short intro from the owning setup module | Simple guided content from setup module | Visual/brief guidance; no technical copy |
| Online, fresh | Normal registered modules | Normal permitted modules | Normal permitted modules | Available visual entries |
| Offline | Status strip + cached data + sync detail | Small status only | Small status only | Subtle non-technical signal |
| Stale content | Age + source + refresh action when allowed | Only where content is visible | Only where content is visible | No technical details |
| Permission missing | Explain in the authorized admin context | Child-facing explanation only if owning module declares it | No admin terms | No technical terms |
| Feature disabled | Parent sees actual owner/config state | No dead tile | No dead tile | No placeholder tile |
| Module unavailable on device | Explain and offer supported alternative | Age-appropriate wording if visible | Age-appropriate wording if visible | Hide unsupported entry or use approved message |
| Pending remote action | Show pending, never success | Show request pending | Show a friendly waiting state | Avoid technical status; no false completion |
| Partial module failure | Keep other modules working | Preserve other available entries | Preserve other entries | Preserve other available entries |
| Critical update | Blocking required-update view, SOS remains | Simplified required-update state | Simplified required-update state | One clear icon and store action |
| Reduced motion / low resource | Static, fast transitions | Static or restrained | Simplified child feedback | Static illustrations and essential feedback |
| Text scale 200% | Reflow, icon-first nav and selected label | Reflow, no clipped labels | Stack cards, retain 56dp+ targets | Grid becomes one column if needed |

---

## 18. Acceptance mapping for the visual design package

This section maps the existing requirements; it does not reword or replace their approved acceptance criteria.

| Existing contract | Visual design coverage |
|---|---|
| REQ-001 / ACC-001 | One shared Android app package with separate parent/child mode rendering |
| REQ-017 / ACC-007 | Avoid a decorative boot sequence and preserve the approved cold-start target of less than 1.2 seconds |
| ACC-008 | Parent shell reads retain the approved p95 target below 300ms; the shell must not add avoidable blocking work |
| REQ-002, REQ-018 / ACC-019 | Mode comes from pairing and remains fixed for Phase 1; attempts to change mode/profile are refused without invoking Parent Gate |
| REQ-003 / ACC-017 | Visible Android enforcement availability comes from native Kotlin adapter; rule evaluation stays in S1-10 |
| REQ-004 / ACC-002 / ACC-010 | Navigation and module surfaces are grant-aware; no child admin shell |
| REQ-005, REQ-006, REQ-023 / ACC-003 | Parent Gate input, lock states, secure action handoff and no local recovery shortcut |
| REQ-007 / ACC-004 | Global SOS hold control with visible progress and immediate S1-07 handoff |
| REQ-008, REQ-009 / ACC-005, ACC-016 | Cached-first, offline strip, truthful Outbox and sync-conflict feedback |
| REQ-010 / ACC-006 | Low-bandwidth mode, compressed/manual or scheduled sync representation |
| REQ-011 / ACC-013 | No unregistered interactive control in the UI |
| REQ-012 / ACC-018 | Feature flags/region/plan affect visible modules; cached values and freshness represented honestly |
| REQ-013 / ACC-014 | Health details, low-resource fallback, heavy effects disabled below threshold |
| REQ-014 / ACC-012 | Gateway contract only; no actual AI feature/safety judgment |
| REQ-015 / ACC-009 | Useful persistent notification without surveillance wording or sensitive payload |
| REQ-016 / ACC-015 | No ads/tracking; no child analytics events until Q-046 resolved |
| REQ-019 / ACC-020 | Android enforcement capabilities are platform-specific and not implied on iOS |
| REQ-020 / ACC-021 | Normal, minimum-version, critical-security-update views and offline state |
| REQ-021 / ACC-022 | Arabic default, English, RTL and localized content across all shell surfaces |
| REQ-022 / ACC-011 | Pending command/acknowledgment visual states; no online SLA claim when offline |

Every acceptance criterion still requires automated tests and human review under QUALITY-GATES.md. A visual design artifact is not evidence of an implemented or verified feature.

---

## 19. Explicit open items — not silently decided here

| Item | State | Design treatment |
|---|---|---|
| Q-043 logo and mascot assets | OPEN | No invented mascot, logo SVG, or branded character; use the temporary text identity or neutral assets |
| Q-045 advanced tablet/fold/web scope | OPEN overall | Respect Q-392 baseline; advanced fold postures and web product scope are not claimed here |
| Q-046 child analytics threshold/policy | OPEN | No child analytics events in any child-facing or child-account flow |
| Q-090 content of the three child templates | OPEN | Sections 5–7 are proposals; owner review required |
| Q-039 reference Android device and battery calibration | OPEN | This document is not a device-performance certification |
| GAP-S1-01-07 numeric low-memory/battery alert thresholds | OPEN | Do not invent thresholds or warning labels |
| Android notification permission and device-specific behavior | PLATFORM CONSTRAINT | Follow actual permission/channel state; test on supported Android versions and OEM variants |
| Family setup completion time | OPEN (Q-157) | No 24-hour promise or goal in copy |

### Authority caveat

The repository Charter identifies hussin as the final project decision owner, while the repository/account identity is Bassam. The recorded F-007 discrepancy is not resolved by this design document. This work remains a draft proposal and does not claim owner approval.

---

## 20. Required review and verification plan

### Design review before approval

1. Review the Parent Family Field visual direction against the approved S1-09 Command Center contract.
2. Review each role’s navigation destinations against effective grants and navigation-patterns.md.
3. Review the child standard, child minimal, and teen layouts as explicit Q-090 proposals.
4. Review Parent Gate secure input and server challenge states with the security contract.
5. Review SOS visibility and handoff with S1-07; do not duplicate incident delivery.
6. Review Android system bar, notification, keyboard, gesture, and background behavior on real Android devices.
7. Review the entire Arabic experience first, then English, then mixed-direction data.
8. Review accessibility at 100%, 150%, and 200% text scale and with TalkBack.

### Required design-size matrix

| Width | Height | Profile | Scale | Theme |
|---:|---:|---|---:|---|
| 360dp | 640dp | Parent | 100% | Light |
| 393dp | 852dp | Parent | 100% | Light/Dark |
| 599dp | 800dp | Parent | 150% | Light |
| 600dp | 800dp | Parent | 100% | Dark |
| 839dp | 900dp | Parent | 100% | Light |
| 840dp | 900dp | Parent | 100% | Light/Dark |
| 393dp | 852dp | Child standard | 100% / 200% | Light |
| 393dp | 852dp | Child minimal | 100% / 200% | Light |
| 393dp | 852dp | Teen | 100% / 200% | Light/Dark |
| 393dp | 640dp | Parent Gate | 100% / 200% | Light |
| 393dp | 852dp | Every profile | 100% | Android gesture + 3-button navigation |

### Android physical validation

The prototype is not a substitute for testing on the actual supported device set. At minimum, validate:
- Android 15+ edge-to-edge and insets.
- Android 14 and the minimum supported Android version.
- Gesture navigation and three-button navigation.
- Keyboard-open and keyboard-closed flows.
- Portrait, landscape, split-screen, and resize.
- Notification permission allowed/denied.
- Battery saver and background restriction behavior.
- A device below 2GB RAM and the reference mid-range device from Q-039/Q-027 when available.
- Network loss during Parent Gate server challenge, Outbox flush, and SOS handoff.
- App process death and resume, ensuring sensitive values are never restored.

### Deliverables and gates

- This Markdown file: detailed Android visual and interaction contract.
- Companion HTML: interactive visual study for design review, demo data only.
- Review outcome: draft → owner reviewed → approved. No automatic approval.
- Only after approval should a new detailed screen/route specification be derived from this package.
- Actual application code remains gated by G-012 and the completed design of the stage.

---

## 21. Android platform references

- Android Developers — Display content edge-to-edge in Views: https://developer.android.com/develop/ui/views/layout/edge-to-edge
- Android Developers — Use window size classes: https://developer.android.com/develop/ui/views/layout/use-window-size-classes
- Android Developers — About window insets: https://developer.android.com/develop/ui/compose/system/insets

These references describe OS behavior and APIs. They do not replace project-specific approved contracts.
