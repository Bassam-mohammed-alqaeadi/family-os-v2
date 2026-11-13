# S1-01 — Low-Fidelity Wireframes

> **Status:** drafted · **Owner review required**  
> **Purpose:** Structural wireframes for design review. These are not final visual assets and do not approve open product decisions.

## 1. Global frame

### 1.1 Parent mode — Compact

    ┌─────────────────────────────────────┐
    │ عائلتي                         [●]  │  AppBar / connection state
    ├─────────────────────────────────────┤
    │ [Context banner — only when needed] │
    ├─────────────────────────────────────┤
    │                                     │
    │          Screen content             │
    │                                     │
    │                                     │
    │                          [ SOS ]    │  Emergency layer
    ├─────────────────────────────────────┤
    │ [Home] [Family] [Chat] [Control] […]│  Bottom Navigation; ≤5
    └─────────────────────────────────────┘

Navigation items are generated from registered destinations and current grants. The contextual banner appears only when a relevant state exists. SOS sits at emergency elevation and cannot be covered by ordinary content or dialogs.

### 1.2 Parent mode — Medium

    ┌──────────────────────────────────────────────────────────┐
    │ [Rail]  │ عائلتي                                      [●] │
    │         ├────────────────────────────────────────────────┤
    │ [Home]  │ [Context banner — if needed]                    │
    │ [Family]├────────────────────────────────────────────────┤
    │ [Chat]  │                                                │
    │ [Control]│                Main content                   │
    │ [More]  │                                                │
    │         │                                      [ SOS ]   │
    └─────────┴────────────────────────────────────────────────┘

### 1.3 Parent mode — Expanded / Large

    ┌──────────────────────────────────────────────────────────────────┐
    │ [Persistent navigation] │ عائلتي                            [●] │
    │                          ├───────────────────────────────────────┤
    │ [Home]                   │ [Context banner — if needed]          │
    │ [Family]                 ├───────────────────────────────────────┤
    │ [Chat]                   │                                       │
    │ [Control]                │        Responsive content area        │
    │ [More]                   │                                       │
    │                          │                             [ SOS ]  │
    └──────────────────────────┴───────────────────────────────────────┘

### 1.4 Child mode — Standard

    ┌─────────────────────────────────────┐
    │ [Avatar]  [Name]       [Time left]   │
    ├─────────────────────────────────────┤
    │ [Relevant status only]               │
    ├─────────────────────────────────────┤
    │                                     │
    │          Child system cards         │
    │                                     │
    │   [Ask parent]                      │
    │                          [ SOS ]    │
    ├─────────────────────────────────────┤
    │ [Home] [Chat] [Learn] [Rewards]     │
    └─────────────────────────────────────┘

This is a shell layout only. The actual child/teen content slots are owned by their respective systems.

### 1.5 Child mode — Minimal

    ┌─────────────────────────────────────┐
    │                                     │
    │              [SOS]                  │
    │                                     │
    │                                     │
    │       [Large tile cluster — layout TBD] │
    │                                     │
    │                                     │
    │              [بيت]                  │
    └─────────────────────────────────────┘

The number, labels, and destinations of the tiles remain UNKNOWN under Q-090. This frame deliberately does not choose the draft's 2×2 or 2×3 grid. SOS is a separate emergency action, not part of the navigation count.

## 2. Screen wireframes

### SCR-01 — Boot and mode resolution

    ┌─────────────────────────────────────┐
    │                                     │
    │              عائلتي                 │
    │                                     │
    │           [Progress]                │
    │                                     │
    │ [Offline / low-bandwidth — if true] │
    └─────────────────────────────────────┘

No family picker, mode switcher, onboarding shortcut, or decorative long animation. A no-cache/offline first launch remains UNKNOWN (GAP-S1-01-01).

### SCR-02 — Parent shell / family dashboard

    ┌─────────────────────────────────────┐
    │ عائلتي                         [●]  │
    ├─────────────────────────────────────┤
    │ [Offline / stale / update banner]   │
    ├─────────────────────────────────────┤
    │ [Family status — source + age]      │
    │ Online [n]  Offline [n]  Updated [t] │
    ├─────────────────────────────────────┤
    │ [P0/P1 needs attention — if any]    │
    ├─────────────────────────────────────┤
    │ [Quick action] [Quick action]       │
    ├─────────────────────────────────────┤
    │ [Member card]     [Member card]     │
    │ [Registered service widget]         │
    │ [Registered service widget]         │
    │                          [ SOS ]    │
    ├─────────────────────────────────────┤
    │ [Adaptive parent navigation]        │
    └─────────────────────────────────────┘

Cards appear only when their WidgetRegistration exists and the current user has access. Never display a global safe/unsafe interpretation unsupported by source data. Stale source values show their age; failure in one card does not disable the rest of the dashboard.

### SCR-03 — Child home shell

**Standard child / teen:** use the child standard shell in §1.4 with system-owned content cards. The parent cannot repurpose this screen into an admin console.

**Minimal:** use §1.5; exact tiles and labels remain UNKNOWN. No tile inventory is approved here.

### SCR-04 — Parent Gate (PIN entry)

    ┌─────────────────────────────────────┐
    │                                     │
    │       يتطلب هذا الإجراء PIN الأب    │
    │                                     │
    │           [ ● ● ○ ○ ○ ○ ]           │
    │                                     │
    │       [ 1 ]   [ 2 ]   [ 3 ]          │
    │       [ 4 ]   [ 5 ]   [ 6 ]          │
    │       [ 7 ]   [ 8 ]   [ 9 ]          │
    │       [⌫ ]    [ 0 ]   [   ]          │
    │                                     │
    │       [Cancel / Return]             │
    │                                     │
    └─────────────────────────────────────┘

Use FosParentGate + FosPinPad. The six positions are a minimum-length illustration, not a new PIN rule. Filled dots reveal no digit value. Show remaining attempts; after five consecutive failures, lock for five minutes. Do not save or restore entered PIN digits across app restarts.

### SCR-05 — Parent Gate setup/change PIN

    ┌─────────────────────────────────────┐
    │ ←  إعداد الرقم السري                │
    ├─────────────────────────────────────┤
    │ [Short purpose and security note]   │
    │ [Current PIN]  (change flow only)   │
    │ [New PIN]                           │
    │ [Confirm new PIN]                   │
    │ [Inline validation]                 │
    │ [Trusted recovery explanation]      │
    │                                     │
    │             [Save]                  │
    └─────────────────────────────────────┘

Owner-only. “Forgot PIN” explains the trusted recovery channel; it is not a local reset action. No Undo is drawn until GAP-S1-01-09 is resolved.

### SCR-06 — Persistent notification (OS surface)

    ┌─────────────────────────────────────┐
    │ [App icon]  عائلتي                  │
    │             [Useful state line]     │
    │             [Tap to open app]       │
    └─────────────────────────────────────┘

Parent mode: concise family/device state. Child mode: remaining time in age-appropriate wording. No message body, precise location, surveillance language, or invented iOS parity.

### SCR-07 — Persistent SOS and post-trigger status

**Persistent control**

    ┌───────────┐
    │    SOS    │  Hold for 3 seconds
    │ [progress]│
    └───────────┘

**Status surface after triggering**

    ┌─────────────────────────────────────┐
    │              [SOS icon]             │
    │                                     │
    │           تم بدء طلب الطوارئ        │
    │                                     │
    │       [Source-confirmed status]     │
    │       [Delivery / acknowledgment]   │
    │                                     │
    │       [Next action if permitted]    │
    └─────────────────────────────────────┘

The text must correspond to the exact state supplied by S1-07. “Sent” is not the same as “delivered”, “acknowledged”, or “resolved”.

### SCR-08 — Administrative shell settings and registries

    ┌─────────────────────────────────────┐
    │ ←  إعدادات التطبيق                  │
    ├─────────────────────────────────────┤
    │ [Shell configuration]               │
    │   [Setting row + effective value]   │
    │   [Setting row + effective value]   │
    │ [Four registries — read-only]      │
    │ [Feature flags — source/status]     │
    │ [Region profile — read-only]       │
    │ [AI gateway contract — structure]  │
    │ [Sync] [Low bandwidth] [Health]     │
    └─────────────────────────────────────┘

Render read-only registries as inventory rows, never as editable controls. The AI gateway section is structural only, with no assistant actions. Owner edits and adult read access are independently granted.

### SCR-09 — Sync and Outbox status

    ┌─────────────────────────────────────┐
    │ ←  المزامنة                         │
    ├─────────────────────────────────────┤
    │ [Connection / last sync status]     │
    │ [Pending count]  [Last success]     │
    │                                     │
    │ [مزامنة الآن]                       │
    │                                     │
    │ [Pending event — neutral label]     │
    │ [Sending / retry / synced state]    │
    │ [Pending event — neutral label]     │
    └─────────────────────────────────────┘

Detailed list is for authorized adults only. Teen and standard child get status, not raw event detail. Minimal child receives a simple status cue only. No payloads, PIN material, message contents, precise locations, or internal enum strings.

### SCR-10 — Low-bandwidth mode

    ┌─────────────────────────────────────┐
    │ ←  وضع النطاق المنخفض              │
    ├─────────────────────────────────────┤
    │ [Current state + source]            │
    │                                     │
    │ جدولة المزامنة                      │
    │ [كل ساعة] [يومياً] [يدوي فقط]       │
    │                                     │
    │ [مزامنة الآن]                       │
    │ [No auto-updates notice]            │
    │ [Pending content status]            │
    └─────────────────────────────────────┘

No option is visually preselected as the approved default until GAP-S1-01-05 is resolved. No disable switch is drawn until GAP-S1-01-04 is resolved.

### SCR-11 — Platform health

    ┌─────────────────────────────────────┐
    │ ←  صحة المنصة                       │
    ├─────────────────────────────────────┤
    │ [Memory]     [Value + timestamp]    │
    │ [Network]    [Value + timestamp]    │
    │ [Battery]    [Value + timestamp]    │
    │ [Heavy transitions: system state]  │
    │ [Enforcement: platform state]      │
    │ [Capability availability]          │
    └─────────────────────────────────────┘

Read-only diagnostics. No health score. Failed metrics remain individually unavailable; the panel does not collapse. No numeric warning thresholds until GAP-S1-01-07 is resolved. iOS metric collection source remains UNKNOWN.

### SCR-12 — App update

    ┌─────────────────────────────────────┐
    │                                     │
    │           [Update icon]             │
    │                                     │
    │          [Update state]             │
    │       [What needs to happen]        │
    │                                     │
    │          [Store / Update]           │
    │                                     │
    │    [No bypass when mandatory]       │
    └─────────────────────────────────────┘

Ordinary update: non-blocking and parent-led. Critical security update or unsupported minimum version: mandatory route. Offline checks are deferred; SOS remains available.

## 3. Responsive conversion rules

The width classes and navigation patterns follow Q-392 and the approved spacing/navigation specifications. Compact behavior at 150–200% text scaling follows Q-389; system text scaling remains uncapped.

| Surface | Compact | Medium | Expanded / Large |
|---|---|---|---|
| Parent dashboard | Single column; cards stack or form a compact grid where space allows | Main content may use two columns; rail remains visible | Adaptive dashboard grid; readable bounded content |
| Parent settings | One setting/member flow at a time where matrix applies | Scrollable matrix with fixed control-name column | Full matrix; list/detail split where meaningful |
| Sync / Outbox | Summary then detail list | Summary and event list side by side if readable | Summary, filters and detail pane |
| Platform health | Vertical diagnostic rows | Two-column diagnostic cards where source exists | Diagnostic cards in a bounded grid |
| Parent Gate | Full-screen focused PIN surface | Centered bounded panel; guarded state retained | Centered bounded panel; background controls not exposed |
| Child standard | One primary content column | Spacious card layout | Bounded content region; preserve touch targets |
| Child minimal | Tile surface | Same simple interaction, centered/bounded | Do not add adult-style navigation to fill space |

## 4. Dimension and token rules

Dimensions and touch targets follow spacing-and-grid.md §2–§6; palette roles follow Q-383; typography follows Q-384/Q-389; the operational role model follows Q-006/Q-394.

- Page margins and component spacing come from spacing-and-grid.md; no arbitrary screen-specific values.
- The spacing system uses the approved 4dp scale; the only 2dp exception is internal space.1.
- Adult/teen touch target: at least 48dp; child standard: 56dp; child minimal: 72dp (88dp preferred).
- Radius comes from ThemeProfile: adult md–lg, teen lg, child xl, minimal xl-full.
- SOS uses emergency top elevation above ordinary content/dialog layers.
- Icons use Material Symbols Rounded at approved semantic sizes.
- Color values are never placed directly in this wireframe; use semantic tokens from color-tokens.md.
- Typography uses IBM Plex Sans Arabic / IBM Plex Sans and follows uncapped system text scaling.

## 5. Review note

These wireframes are intentionally structural. The next visual-detail pass should follow owner review of the S1-01 screen blueprint and open-item register. Final Figma frames, component variants, and asset work must preserve the source precedence and uncertainty labels in README.md.
