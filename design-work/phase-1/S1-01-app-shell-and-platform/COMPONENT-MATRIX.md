# S1-01 — Component and Token Matrix

> **Status:** drafted · **Owner review required**  
> **Purpose:** Connect each S1-01 surface to existing design-system components, semantic tokens, states, and responsive rules. This is a reuse map; it does not define new components or implement them. The only operational roles are adult, teen, and child; owner is adult + is_owner=true (Q-006/Q-394).

## 1. Screen-to-component mapping

| Screen | Primary components from approved catalog | State-specific components | Notes / boundaries |
|---|---|---|---|
| SCR-01 Boot | FosProgress, FosStatusBanner | FosSkeleton | Splash is short; no new brand asset; offline banner only when true |
| SCR-02 Parent shell | FosWidgetCard, FosMemberCard, FosStatusStrip, FosQuickActions, FosSosButton | FosSkeleton, FosEmptyState, FosErrorState, FosStatusBanner | Widgets require registration and grants; status must show freshness |
| SCR-03 Child shell | FosCard, FosAvatar, FosButton, FosSosButton | FosEmptyState, FosStatusBanner, FosSkeleton | Actual child feature cards are owned by their systems; template tile set remains open |
| SCR-04 Parent Gate | FosParentGate, FosPinPad, FosButton | FosInlineError, FosStatusBanner, FosProgress | Local PIN check; five failures / five-minute lock; no math challenge |
| SCR-05 PIN settings | FosSettingRow, FosPinPad, FosButton | FosInlineError, FosSnackbar, FosStatusBanner | Owner-only; don't add Undo until GAP-S1-01-09 is resolved |
| SCR-06 Persistent notification | FosPersistentNotification | Platform notification status | OS surface, not an in-app route; iOS behavior unresolved |
| SCR-07 SOS | FosSosButton, FosButton | FosProgress, FosStatusBanner, FosDialog only where source permits | Emergency layer above ordinary surfaces; S1-07 owns delivery states |
| SCR-08 Shell settings | FosSettingRow, FosProvenanceChip, FosLockIndicator, FosAvailabilityBadge, FosExpansionTile | FosStatusBanner, FosInlineError, FosSnackbar | Registries/feature flags/region/AI contract are primarily read-only |
| SCR-09 Sync / Outbox | FosCard, FosListTile, FosStatusBanner, FosButton | FosSkeleton, FosErrorState, FosEmptyState | Detailed events only for adults with grants; no raw payloads |
| SCR-10 Low-bandwidth | FosSettingRow, FosSegmented, FosSwitch, FosStatusBanner, FosBadge, FosButton | FosInlineError, FosSnackbar | Do not render disable action or default cadence as approved while gaps remain |
| SCR-11 Health | FosCard, FosListTile, FosAvailabilityBadge | FosSkeleton, FosInlineError, FosStatusBanner | Read-only; no composite health score, no fabricated iOS metrics |
| SCR-12 Update | FosButton, FosProgress, FosStatusBanner, FosDialog only where non-blocking confirmation is appropriate | FosErrorState, FosSkeleton | Mandatory update has no bypass; SOS remains available |

**Catalog guard:** a component not listed above may be used only where the source screen contract and an existing design-system definition support it. Do not create S1-01-only variants to work around a catalog limitation.

## 2. Semantic token mapping

The frozen palette is governed by Q-383; typography by Q-384/Q-389; and the approved general icon family by Q-385. This matrix references semantic names only and does not repeat primitive hex values.

| UI purpose | Semantic role / token family | Use in S1-01 |
|---|---|---|
| Main action | primary.default / primary.hover / primary.pressed | Save, confirm, navigation action where permitted |
| Secondary action | surface.raised + border.default + text.primary | Cancel, return, secondary navigation action |
| Brand accent | accent.attention | Small brand accent only; never Warning |
| Brand reward decoration | accent.reward | Not a general status color; do not use for warning |
| Success | success.default | Confirmed sync/update/action; only after source confirmation |
| Warning | warning.default (amber) | Stale state, retry-needed, limited capability when semantically a warning |
| Danger / SOS | danger.default (red) | Emergency and critical/destructive state |
| Informational | info.default | Neutral explanation, update availability, platform note |
| Main text | text.primary | Screen titles, primary labels |
| Supporting text | text.secondary / text.muted | Descriptions and timestamps, within contrast requirements |
| Surfaces | surface.base / surface.raised / surface.sunken | App shell, cards, grouped sections |
| Borders | border.subtle / border.default / border.strong | Non-interactive dividers vs interactive control boundaries |
| Focus | focus.ring | Keyboard/switch focus; always visible |

- Use dark-theme semantic roles from color-tokens.md §5; do not invert light-theme hex values mechanically.
- Never use color alone to convey status; combine text, icon/shape, and state.
- Gold 500 is decorative, not small text on light surfaces.
- Orange 500 is not small text on cream; use the approved stronger orange role where a brand action needs text contrast.
- No raw hexadecimal values in screen annotations or component variants.

## 3. Spacing, shape, and elevation

Responsive width classes/navigation follow Q-392; Compact text-scale adaptation follows Q-389. The dimension rules below are transcribed from spacing-and-grid.md and are not a separate token set.

| Context | Token / rule | S1-01 application |
|---|---|---|
| Page margin | spacing system: Compact/Medium 16–24dp, Large 32dp | Apply according to breakpoint; don't hardcode per screen |
| Within component | space.2–space.5 typical | Label/value and icon/text separation |
| Between components | space.4–space.7 typical | Related rows, cards, grouped controls |
| Between sections | space.7–space.10 typical | Separate dashboard/settings groups |
| Adult / teen hit area | ≥48dp | All interactive controls |
| Child standard hit area | ≥56dp | Child buttons/cards |
| Child minimal hit area | ≥72dp; 88dp preferred | Large home tiles and SOS alternative |
| Adult radius | md–lg | Parent cards/controls by ThemeProfile |
| Teen radius | lg | Teen cards/controls by ThemeProfile |
| Child radius | xl | Child cards/buttons |
| Minimal radius | xl-full | Rounded large tiles |
| SOS / emergency | elev.4 | Above ordinary content/dialog layers |

Concrete dimensions resolve only through the spacing scale and ThemeProfile. The values above are source-derived design constraints, not permission to introduce arbitrary values.

## 4. Motion and feedback matrix

| Interaction | Motion token / feedback | Constraint |
|---|---|---|
| Tap / pressed | motion.fast / immediate tactile response | Never delay an emergency action |
| Open details | motion.normal or source-approved transform | Direction follows locale |
| Open bottom sheet | motion.normal | Sheet is the default quick-action surface on phone |
| Form validation error | Brief field feedback + text/icon | Reduced-motion preference is respected |
| Sync progress | FosProgress / in-place status | Keep content visible; don't block unrelated work |
| SOS hold | Three-second progress ring + escalating haptic | Reduced motion simplifies visuals; emergency feedback remains perceivable |
| PIN invalid | Brief non-punitive feedback | No progressive delay; lockout only after five failed attempts |
| Update check | Short progress, then verified result | Never claim installed before platform confirms |

## 5. State coverage matrix

| Screen | Loading | Empty | Error | Offline / stale | Restricted / unavailable | Success / confirmed |
|---|---|---|---|---|---|---|
| SCR-01 | Splash / progress | N/A | Cached fallback or explicit UNKNOWN | Offline banner | Minimum-version update | Mode resolved |
| SCR-02 | Cached-first skeleton | Untimed setup checklist | Local card error | Age-labelled family/device state | Hide destinations without grants | Updated source-backed status |
| SCR-03 | Template-specific skeleton | Age-appropriate empty state | Kind retry wording | Cached label / pending sync | No admin destinations | Source-confirmed action feedback |
| SCR-04 | Sensitive challenge wait only | Empty PIN input | Invalid PIN | Local validation still works | Five-minute lock | Gate opened locally |
| SCR-05 | Save progress | N/A | Inline validation | Local PIN work; audit proof queued | Owner-only access | Saved only after local result |
| SCR-06 | N/A | No notification only if actual OS state says absent | Permission/platform state | Cached useful line | iOS behavior unresolved | Current useful information |
| SCR-07 | Hold progress | N/A | Source-confirmed delivery failure | Handoff to S1-07; no Outbox substitute | Never hide SOS by role/grant | Sent/delivered/acknowledged only as source confirms |
| SCR-08 | Section skeleton | Empty registered section only if source says none | Section-level error | Cached config with freshness | Read/edit separated by grants | Change audited where required |
| SCR-09 | Event list skeleton | No pending events | Retry state / partial failure | Pending and last-sync age | Detail hidden from child | Synced only after server ack |
| SCR-10 | Config load | N/A | Inline setting error | Low-bandwidth status | Manual disable unresolved | Mode change only after confirmed setting |
| SCR-11 | Per-metric skeleton | N/A | Metric-level unavailable | Connection state with time | iOS measurement unknown | Reading with source timestamp |
| SCR-12 | Version check | Up-to-date state | Check failure | Deferred check; SOS remains | Mandatory route | Installed version rechecked |

## 6. Access / visibility mapping

| Surface | Adult with read grant | Owner adult | Teen | Child standard | Child minimal |
|---|---|---|---|---|---|
| SCR-02 Parent shell | Only granted widgets/destinations | Granted parent dashboard and owner controls | No | No | No |
| SCR-03 Child shell | No | No | Yes | Yes | Yes |
| SCR-04 Parent Gate on child device | Parent enters PIN where required | Parent enters PIN where required | Guarded barrier | Guarded barrier | Guarded barrier |
| SCR-05 PIN management | No | Yes | No | No | No |
| SCR-06 Notification | Parent-mode useful state | Parent-mode useful state | Child-mode useful state | Child-mode useful state | Simplified child-mode useful state |
| SCR-07 SOS | Visible | Visible | Visible | Visible | Visible and simplified |
| SCR-08 Shell settings | Read only where granted | Read/edit according to owner permissions | No | No | No |
| SCR-09 Sync | Detail only with applicable read grant | Detail | Status only | Status only | Cue only |
| SCR-10 Low bandwidth | Read if granted | Configure if permitted | Status only if template exposes it | Status only if template exposes it | Cue only |
| SCR-11 Health | Read if granted | Full permitted view | No | No | No |
| SCR-12 Update | See required update state | Parent-led ordinary update; mandatory state | Mandatory only | Mandatory only | Mandatory only |

No entry in this matrix creates a new role or grant. Actual authorization remains governed by the current permission keys and approved S1-01 contract.

## 7. Asset and licensing rules

- General icons: Material Symbols Rounded (Apache 2.0), with license notice preserved when assets are distributed.
- No new Family OS logo, mascot, mentor character, or mentor voice is authored in this S1-01 package; related identity questions remain open.
- SOS is an interface control, not a standalone decorative illustration. Its icon and text must remain recognizable and accessible.
- Status illustrations must use the approved brand language and state palette; no extracted brand-distinctive imagery is reused as Family OS identity.
