# Family OS — Platform Experience Foundation 0.1

> **Status:** Proposed design architecture / non-binding visual direction  
> **Scope:** Re-imagine the platform experience foundation and S1-01 visual shell from first principles.  
> **Workspace:** design-work/S1-01/  
> **Created:** 2026-11-12  
> **Approval:** Not approved. This document does not change governance, product decisions, system specifications, or implementation.

## 1. Design mandate

The goal is not to polish the current SCR-01…SCR-12 inventory or restyle the existing SCR-02 dashboard. Those screen descriptions and wireframes are explicitly treated as **legacy design proposals**, not as the information architecture or visual blueprint for the new concept.

The new direction starts from the platform's responsibilities and the jobs the experience must enable. Screen groupings, navigation, information hierarchy, interaction patterns, and visual compositions are re-imagined here. Only approved product constraints, capability boundaries, security rules, and measurable requirements remain binding.

### Design intent

Build one coherent family operating environment that feels:
- Calm and confident, not surveillance-heavy or alarmist.
- Exceptionally clear about what is known, stale, unavailable, pending, or confirmed.
- Parent-capable without exposing administration to children.
- Respectful and age-adaptive for children and teenagers.
- Native to Arabic-first use, while working cleanly in English and mixed-direction content.
- Modular enough to host 60 systems across six product stages without 60 independent visual languages.

## 2. Source hierarchy and what is / is not inherited

### Binding inputs retained

1. The governance charter and recorded owner decisions remain the source of authority.
2. S1-01 approved planning contract §§1–8 and §10 remain the functional boundary and requirement source.
3. The architecture and context map remain the capability ownership and integration boundary.
4. Approved design tokens remain the current shared baseline: colors, typography, spacing, responsive widths, icon family, states, motion, and accessibility.
5. The 22 S1-01 acceptance criteria remain the acceptance baseline.
6. Security/privacy invariants remain non-negotiable: no child-admin surfaces, local Parent Gate PIN verification, SOS hand-off ownership, no false status claims, no hidden tracking language, and no child analytics before its open question is resolved.

### Not inherited as a design template

- The existing SCR-01…SCR-12 screen grouping and screen-by-screen compositions.
- Existing low-fidelity ASCII wireframes and the old SCR-02 high-fidelity composition.
- The assumption that one conventional bottom-tab dashboard is the correct parent experience.
- Any hard-coded navigation destination list.
- Any sample family name, avatar, count, timestamp, status, or metric as real product data.
- Any owner role: ownership remains an attribute on adult (is_owner=true), not a fourth role.
- Any layout that pulls another system's feature detail into S1-01.

The old screen inventory can still be used as a traceability source for what its authors believed the requirement covered. It is not the source for the new experience architecture.

## 3. Product scale: six stages, sixty systems

### Current repository position

- Phase 1 is explicitly defined as ten systems, in the execution order recorded by Q-199.
- The active roadmap describes phases 2–6 as product domains and goals, but does not yet provide ten approved system specifications for each of those five phases.
- Phase 7 is a hardening/release stage in the current roadmap, not a seventh product-feature stage.
- Therefore, the design foundation is built to scale to the stated target of six stages × ten systems, but this document does **not** invent the missing names or boundaries for systems 11–60.

### Design scaling rule

The platform has one shared experience system and many registered product modules:

- The **platform shell** owns context, device mode, permissions-aware navigation, global safety surfaces, platform state, localization, and visual consistency.
- A **system module** owns its domain content, task flows, domain-specific screens, control definitions, and events.
- The **design system** owns reusable components, semantic tokens, interaction states, responsive patterns, and accessibility rules.
- A module may contribute views to shared surfaces, but may not create a parallel shell, a new role model, or private copies of global components.

This structure prevents six phases from becoming six unrelated applications and prevents sixty systems from creating sixty competing navigation systems.

## 4. Proposed platform experience architecture

The following is a **design proposal**, not a change to the approved technical architecture.

### Layer A — Platform context

The shell resolves and exposes:
- Device mode: parent or child, established by pairing in Phase 1.
- Current member context: adult, teen, or child; owner is adult + is_owner=true.
- Effective permissions and feature availability.
- Region, locale, time zone, theme profile, and text scaling.
- Platform capabilities: Android/iOS, device health, notification capability, and unsupported functions.

The shell consumes these values; it does not recreate identity, membership, or authorization logic.

### Layer B — Trust and safety kernel

A globally consistent layer for:
- Persistent SOS control and source-confirmed SOS state.
- Parent Gate for guarded actions on a child-mode device.
- Permission/availability truth: granted, not delegated, locked, unavailable on device, pending approval, or plan-limited.
- Audit-linked feedback for administrative actions.
- Clear disclosure and age-appropriate privacy surfaces owned by the system that collects the data.

SOS is a top-level emergency affordance, not a normal navigation destination. Its delivery and transport remain owned by S1-07.

### Layer C — Continuity fabric

A single user-facing continuity model for:
- Cached-first rendering.
- Online/offline/stale state.
- Pending synchronization and retry.
- Conflict resolution.
- Yemen low-bandwidth behavior.
- Version/update state.

The UI must distinguish local persistence, server acceptance, delivery, and human acknowledgment. A successful tap is not proof that a remote action completed.

### Layer D — Experience shell

The shell presents the correct experience for the current context. The new concept is **task- and context-oriented**, not a fixed collection of system screens.

Proposed top-level experience surfaces:
1. **Home / Focus:** the most useful current context and items requiring attention, drawn only from registered, permission-eligible modules.
2. **Spaces / Capabilities:** a discoverable set of the systems available to this user, grouped by family purpose instead of exposing implementation IDs.
3. **Activity / History:** a source-attributed timeline of actions, changes, and delivery states where the owning system exposes them.
4. **Controls / Preferences:** settings and system controls generated from registered control definitions and effective grants.
5. **Account / Device:** the current person's own preferences and device/platform details, separate from family administration.

These are proposed experience surfaces, not approved navigation labels or a replacement permission model. Their final count and labels must be validated against the complete system contracts and responsive behavior.

### Layer E — Registered system modules

A module is not just a screen. It declares what it contributes to the platform:
- Its purpose and user jobs.
- Eligible contexts and grants.
- Entry surfaces and deep links.
- Home/Focus contributions.
- Capability cards and control definitions.
- Platform availability and offline behavior.
- Events, notifications, and status semantics.
- Localization keys and accessibility requirements.
- Acceptance criteria and traceability.

No module can claim a capability is available on a device unless its platform contract confirms it.

## 5. Proposed module registration contract

This is a design-level schema for organizing the 60-system design programme. It is not a server API or database schema.

| Field | Meaning | Why the platform needs it |
|---|---|---|
| system_id | Stable identifier such as S1-01 | Traceability across phases |
| phase_id | Product stage 1–6 | Roadmap and release grouping |
| domain | Family-facing domain name | Human-readable discovery |
| purpose | Outcome the module enables | Prevents navigation made from internal feature names |
| eligible_contexts | adult / teen / child + template constraints | Context-aware rendering |
| required_grants | Permission keys | No unauthorized destination or action |
| entry_points | Deep links and experience entry points | Consistent routing |
| surface_contributions | Home, Spaces, Activity, Controls, Account contributions | Controlled composition |
| control_definitions | Typed settings and control metadata | Generated control experiences |
| availability | Android / iOS / device capability states | Honest platform support |
| offline_contract | Cached/read/write/queue behavior | Truthful connectivity UX |
| events_and_states | Source-owned status and delivery states | No fabricated global state |
| localization_keys | Arabic/English keys and glossary terms | Consistent language |
| design_contract | Components, tokens, states, motion, responsive behavior | Shared visual quality |
| acceptance | Traceable and testable criteria | Design-to-build hand-off |

## 6. The reusable visual grammar

### 6.1 Brand and color

Use the current approved tokens as the starting baseline, not arbitrary screen-specific hex values.

- Navy is the primary structural and trust color.
- Warm cream and neutral surfaces create a calm canvas.
- Green communicates confirmed success only.
- Amber is the system Warning role.
- Red is reserved for Danger and SOS.
- Orange remains brand accent/attention; it is not a substitute for system Warning.
- Status is always conveyed by icon/shape + label + source/time where relevant, never by color alone.

Any deliberate change to the approved palette requires its own explicit decision. The visual prototype uses the approved token roles and does not create local palette exceptions.

### 6.2 Typography

- Arabic: IBM Plex Sans Arabic.
- Latin: IBM Plex Sans.
- Arabic is the default; all text layouts support RTL and LTR.
- Do not cap system text scaling.
- Do not clip text or reduce it below the approved minimum.
- Numeral style follows the user's locale unless a specific product decision says otherwise.

### 6.3 Layout and spatial rhythm

- Use the approved 4dp base rhythm and the single documented 2dp exception.
- Compact: below 600dp; Medium: 600–839dp; Expanded/Large: 840dp and above.
- Bottom Navigation / NavigationRail / persistent navigation remain available as responsive primitives. The new experience may use a different information architecture within these primitives.
- Foldable content must respect physical hinges and available pane geometry.

### 6.4 Component behavior

Components are contracts, not decoration. Each reusable component must define:
- Default, focus, pressed, disabled, loading, and error states where relevant.
- RTL/LTR behavior.
- Adult/teen/child experience profile behavior.
- Accessibility semantics and touch targets.
- Reduced-motion behavior.
- Offline/stale/partial/unavailable behavior where it presents remote state.

The prototype should reuse approved component concepts and may propose new patterns in this workspace only; it must not claim they are already implemented in the code package.

## 7. The new S1-01 concept

S1-01 is treated as the platform experience foundation, not as a set of twelve predetermined screens.

### Parent experience concept

A **Family Command Space**:
- One clear context header.
- A compact family/platform status surface with explicit freshness.
- A dynamically composed set of eligible system spaces.
- A focused attention area, but only from source-confirmed signals.
- A global SOS affordance.
- Adaptive access to activity, controls, and account/device details.
- No fixed system list, no made-up counts, and no hidden administrative paths.

### Child / teen experience concept

A **Personal Family Space**:
- A welcoming, age-appropriate surface.
- A clear, non-threatening explanation of the current device/time/protection state.
- Child/teen system capabilities surfaced by their contracts.
- A simple way to ask for help or make a request where the owning system permits it.
- No parent administration or payment surface.
- SOS remains persistent and independent.
- Child templates remain a product-design area, not a copied tile arrangement from an old wireframe.

### Shared shell behaviors

- Device mode is immutable for Phase 1 and comes from pairing.
- Parent Gate is invoked only where the approved action requires it.
- SOS remains visible in both modes.
- Offline and stale data are visible without blocking cached-first use.
- Low-bandwidth behavior does not promise automatic updates.
- Unsupported platform capability is displayed honestly.
- AI in S1-01 is contract scaffolding only; no AI-generated family safety verdict.

## 8. Design method for each system

Each of the sixty system packages uses the same delivery template, while its actual information architecture is specific to the domain:

1. **Evidence and boundaries:** approved requirements, decisions, dependencies, and owner-resolved unknowns.
2. **User jobs:** primary jobs, frequency, context, risk, and urgency.
3. **Experience map:** how a user discovers, enters, completes, and returns from each job.
4. **Information architecture:** domain objects, navigation entry points, hierarchy, and relationships.
5. **Interaction model:** actions, approvals, undo, loading, offline, conflict, and error.
6. **Visual composition:** low-fi exploration, chosen direction, high-fi screen states.
7. **Responsive behavior:** phone, tablet, foldable panes, and text-scale behavior.
8. **Component/token contract:** reused and proposed components, semantic roles, motion, and accessibility.
9. **Traceability and acceptance:** each design decision maps to requirements and each criterion can be verified.
10. **Owner review:** draft → reviewed → approved; no design is marked approved by the author.

## 9. Design status vocabulary

| Status | Meaning |
|---|---|
| CURRENT FACT | Explicit in an approved specification or decision |
| PROPOSED | New experience or visual direction for review |
| DERIVED | Logical design conclusion from approved evidence |
| UNKNOWN | The source does not define the behavior |
| PLATFORM CONSTRAINT | Capability depends on Android/iOS/device support |
| DEMO DATA | Sample content used only to make the prototype understandable |

A visible sample value in the browser prototype is not product data, a backend response, or proof of implementation.

## 10. Boundaries and unresolved matters

- The repository records a project-owner identity mismatch in F-007 (CHARTER.md §3 vs repository identity). This design foundation remains a draft and does not assert approval authority.
- Q-045's full tablet/foldable/web scope remains open; this concept respects approved layout baselines but does not claim full web product scope.
- Q-046 child analytics remains open; the concept does not add child analytics.
- Q-090 child-template content remains open; this prototype's child examples are visual exploration only.
- Q-043 logo/mascot source remains open; use the approved temporary wordmark only, and no invented logo or mascot.
- The detailed system contracts for stages 2–6 are not all present in the current repository snapshot. Do not create their names or capabilities by inference.
- Q-381 encryption requirements are not a claim that implementation exists. Never show an encryption badge unless the service has verified the required implementation.

## 11. Next design gate

The interactive studio is a **direction-setting prototype**. Its purpose is to let the product owner assess the new shell concept, modes, key states, and visual language before the full S1-01 screen specification is redrafted.

After review, the accepted direction must be reconciled against S1-01 requirements and the design-system contracts. Only then should a complete, new S1-01 design specification be authored. The old SCR-01…SCR-12 layout inventory is not the template for that work.
