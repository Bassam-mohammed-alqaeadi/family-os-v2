# S1-01 — User Flows and State Transitions

> **Status:** drafted · **Owner review required**  
> **Source:** S1-01 approved planning contract §§1–8/10 and DIAGRAMS; draft screen inventory §9; Q-062…Q-070, Q-142, Q-164, Q-195, Q-231, Q-234, Q-244, Q-366, Q-385…Q-394.

## 1. Launch and mode resolution

**Flow**
1. User opens the app.
2. Shell reads the paired device mode.
3. Shell loads local configuration and feature-flag cache.
4. Shell checks the minimum supported app version.
5. If a known mandatory security update blocks use, show SCR-12.
6. Otherwise, route to SCR-02 for parent mode or SCR-03 for child mode.
7. If refresh fails but a valid cache exists, continue with a truthful stale/offline banner.
8. If there is no network and no cached configuration, remain an explicit UNKNOWN state (GAP-S1-01-01).

**Rules**
- Device mode comes from the paired device record, not from a user selection.
- No mode switch or family switch is offered in Phase 1.
- A cached configuration may support continuation; no-cache/offline behavior remains unknown.
- The mandatory minimum-version route takes precedence over ordinary shell content when the platform confirms it is required.

## 2. Parent navigation and destination access

**Flow**
1. SCR-02 loads registered navigation destinations.
2. The shell resolves the current adult's effective grants.
3. Granted destinations are shown; ungranted destinations are hidden from primary navigation.
4. The selected destination opens its owning system.
5. Returning from an owned system restores the parent shell context.

**Rules**
- Compact uses Bottom Navigation; Medium uses NavigationRail; Expanded/Large uses persistent side navigation (Q-392).
- At 150–200% text scaling in Compact, show icons and the selected destination label without truncating accessible names (Q-389).
- Navigation is derived from grants and registries; the parent shell does not invent tabs for systems that are not registered or accessible.
- No family selector appears.

## 3. Child home and guarded action

**Flow**
1. Child opens an allowed system surface from SCR-03.
2. If the requested action does not require the parent gate, the owning system handles it.
3. If the action is restricted, the shell opens SCR-04.
4. Parent enters PIN; local verification succeeds or fails.
5. On failure, show remaining attempts. Five consecutive failures lock the gate for five minutes.
6. On local success, continue a local guarded action, or request the server challenge for a sensitive server-backed action.
7. After the local gate is passed, the device signs the challenge; the owning service verifies the proof.

**Rules**
- Local PIN validation is offline-capable. The PIN and hash never leave the device.
- The server challenge is not a PIN verification endpoint; it is a proof for sensitive server-backed operations after local validation.
- On app restart the PIN entry buffer is empty.
- No bypass, math challenge, or child-visible PIN disclosure is designed.

## 4. SOS activation and status

**Flow**
1. SOS control is visible above the current parent or child screen.
2. User holds the control for three seconds.
3. If the hold is not completed, return to the armed state.
4. On completion, emit sos_triggered immediately to S1-07.
5. S1-07 owns transport and delivery.
6. The shell displays only the delivery/acknowledgment/resolution states supplied by S1-07.

**Rules**
- Outbox is not an alternate SOS transport.
- The UI must distinguish handed-off, sent, delivered, acknowledged, and resolved only to the extent the owning S1-07 contract provides those states.
- A screen must never imply a human received the alert before confirmation.
- Accessibility alternative is a deliberate two-step action, not a longer delay on the primary emergency path.

## 5. Sync and low-bandwidth behavior

**Flow**
1. A local user action is persisted locally and an Outbox event is queued.
2. If the network is unavailable, keep the event pending and show offline status.
3. On manual or scheduled sync, compress and send events in strict chronological order.
4. Mark an event synced only after server acknowledgment.
5. On failure, retain pending/retry status and avoid silent loss.

**Low-bandwidth constraints**
- Low-bandwidth behavior is mandatory for the Yemen region profile in Phase 1 (Q-064).
- Low-bandwidth mode supports hourly, daily, or manual-only sync cadence. Its default is unresolved.
- No automatic application updates in this mode; updates require explicit approval and Wi-Fi.
- Cached content must be marked as cached/old; content awaiting synchronization is shown as pending, not live.
- Whether the owner may disable low-bandwidth mode manually in Yemen is unresolved; this flow intentionally contains no off branch.

## 6. Update flow

**Flow**
1. Check the app version.
2. If below the minimum supported version, show SCR-12 as a blocking update surface.
3. Otherwise, if a critical security update is required, use the mandatory in-app update route.
4. Otherwise, if an ordinary update is available, show a parent-led store action.
5. If no update is required, continue to the current shell.
6. After opening the store, re-check the installed version before claiming completion.

**Rules**
- If offline before a version check, defer the check and keep SOS available.
- If a mandatory security requirement is already known, there is no bypass.
- Never report an update as complete until the installed version is verified.

## 7. Explicit exclusions from these flows

- No family switcher or profile switcher in Phase 1 (Q-063, Q-393).
- No admin shell on child/teen home.
- No AI-generated safety judgment or automatic protection action (Q-391).
- No child analytics events before Q-046 is decided.
- No dedicated ACK screen in S1-01; acknowledgment is a state supplied by S1-07 (Q-231).
- No product behavior invented for iOS persistent notification, iOS device-health readings, or iOS secure storage.
