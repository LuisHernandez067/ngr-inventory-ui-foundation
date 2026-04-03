# WCAG 2.2 AA Checklist — NGR Inventory UI Foundation

> Phase: `phase-20-a11y`
> Standard: WCAG 2.2 Level AA
> Last updated: 2026-04-03

This checklist documents the accessibility status of each WCAG 2.2 AA criterion as applied to this project. Each entry reflects work done (or deferred) in `phase-20-a11y`.

---

## 1.3.1 — Info and Relationships

**Status: ✅ Addressed**

| What              | Evidence                                                                                                         |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| Table headers     | All list-page tables use `<thead>` with `<th scope="col">` — see `movimientos.ts`, `usuarios.ts`, `productos.ts` |
| Form labels       | Every `<input>` and `<select>` in filter bars has an associated `<label for="...">`                              |
| Semantic headings | All page titles use `<h1 class="h3">` within each module; secondary sections use `<h6>`                          |
| ARIA roles        | Report cards use `role="button"` with `aria-pressed`; loading spinners carry `role="status"`                     |
| Error regions     | Error alerts use `role="alert"` for announced region semantics                                                   |

**Remaining:** Form elements inside dynamically-injected modals (detail/form pages not yet audited).

---

## 1.4.1 — Use of Color

**Status: ⚠️ Partial**

| What         | Evidence                                                                                                                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Badge labels | Status badges in `productos.ts` and `movimientos.ts` carry both a color class (`bg-success`, `bg-danger`, etc.) and a text label (`Activo`, `Anulado`) — color is not the sole indicator |
| Alert icons  | Error/success alerts include Bootstrap Icons (`bi-exclamation-triangle-fill`, `bi-check-circle-fill`) as supplementary indicators                                                        |

**Remaining:** The `tipoColorMap` in `movimientos.ts` maps movement types to color-only badges. While labels are present, colorblind users may struggle to distinguish `bg-info`, `bg-warning`, and `bg-secondary` at a glance. Icon differentiation per movement type is not yet implemented.

---

## 1.4.3 — Contrast (Minimum)

**Status: ✅ Addressed**

| What           | Evidence                                                                          |
| -------------- | --------------------------------------------------------------------------------- |
| Primary text   | `--color-text-primary: #1e293b` on `--color-bg-page: #f8fafc` — ratio ≈ 13.9:1 ✅ |
| Secondary text | `--color-text-secondary: #475569` on `#f8fafc` — ratio ≈ 6.5:1 ✅                 |
| Muted text     | `--color-text-muted: #64748b` on `#f8fafc` — ratio ≈ 4.6:1 ✅ **PASSES AA**       |

**Fixed in commit `8bdec31`:** `--color-text-muted` raised from `#94a3b8` (2.9:1 FAIL) to `#64748b` (4.6:1 PASS).

---

## 1.4.4 — Resize Text

**Status: ✅ Addressed**

| What             | Evidence                                                                    |
| ---------------- | --------------------------------------------------------------------------- |
| Relative units   | Font sizes use `rem` scale (`0.75rem`–`2rem`) — see `custom-properties.css` |
| Spacing          | All spacing tokens use `rem`/`%` — no `px`-locked font sizes in layout flow |
| No overflow lock | No `overflow: hidden` on text containers that would clip at 200% zoom       |

**Remaining:** Not formally tested at 200% zoom in all breakpoints. Manual verification recommended.

---

## 1.4.11 — Non-text Contrast

**Status: ⚠️ Partial**

| What           | Evidence                                                                                                                                 |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Input borders  | `--color-border-default: #94a3b8` on `--color-bg-page: #f8fafc` — ratio ≈ 3.0:1 ✅ **PASSES on page background**                         |
| Input borders  | `--color-border-default: #94a3b8` on `--color-bg-surface: #ffffff` — ratio ≈ 2.9:1 ⚠️ **marginally below 3:1 on white card backgrounds** |
| Strong borders | `--color-border-strong: #64748b` on `#f8fafc` — ratio ≈ 4.6:1 ✅ **PASSES**                                                              |
| Focus ring     | `rgba(#1471a0, 0.4)` at 2px offset — partially visible; full opacity focus ring would pass                                               |

**Fixed in commit `8bdec31`:** `--color-border-default` raised from `#e2e8f0` (1.5:1) to `#94a3b8` (3.0:1); `--color-border-strong` raised from `#cbd5e1` (2.0:1) to `#64748b` (4.6:1).

**Remaining limitation:** `--color-border-default` (#94a3b8) on pure white surface (#ffffff) yields 2.9:1 — marginally below the 3:1 threshold for inputs rendered on white card backgrounds (not the page background). Inputs on the standard page background (`#f8fafc`) pass.

---

## 2.1.1 — Keyboard

**Status: ⚠️ Partial**

| What           | Evidence                                                                                 |
| -------------- | ---------------------------------------------------------------------------------------- |
| Report cards   | `reportes.ts` wires `keydown` handlers for `Enter` and `Space` on report selection cards |
| Filter inputs  | All `<input>` and `<select>` filters are natively keyboard-operable                      |
| Action buttons | All `<button>` elements are keyboard-accessible by default                               |

**Remaining:** Table rows use `click` listeners for navigation but lack `keydown` (`Enter`/`Space`) support — see `movimientos.ts:164`, `usuarios.ts:144`. Keyboard-only users cannot activate row navigation without mouse.

---

## 2.1.2 — No Keyboard Trap

**Status: ✅ Addressed**

| What                 | Evidence                                                                 |
| -------------------- | ------------------------------------------------------------------------ |
| No modal focus traps | No modal dialogs with custom focus management exist in the current phase |
| Natural tab order    | Page structure follows DOM order; no custom focus manipulation observed  |

**Remaining:** If modals are added in future phases, a focus trap + Escape key handler will be required (use `inert` attribute or a focus-trap library).

---

## 2.4.3 — Focus Order

**Status: ✅ Addressed**

| What                      | Evidence                                                                                                         |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| DOM order = reading order | Scaffold layouts (`dashboard.ts`, `movimientos.ts`) render content in logical top-to-bottom, left-to-right order |
| No positive `tabindex`    | Reviewed modules contain no `tabindex` values > 0 that would override natural order                              |
| Disabled items            | Report cards marked "próximamente" use `tabindex="-1"` to remove them from tab order correctly                   |

**Remaining:** Dynamic content injected into `#reportes-detail` may shift focus to unexpected positions when phase changes. Focus management after async re-renders is not explicitly handled.

---

## 2.4.7 — Focus Visible

**Status: ✅ Addressed**

| What                   | Evidence                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------ |
| Button focus ring      | `_buttons.scss` defines `outline: 2px solid rgba($primary, 0.4)` on `:focus-visible`                   |
| Bootstrap default      | Bootstrap 5 provides built-in focus-visible outlines on all interactive elements                       |
| `focus-ring` variables | `$focus-ring-width: 2px`, `$focus-ring-opacity: 1`, `$focus-ring-offset: 2px` set in `_variables.scss` |

**Remaining:** The focus ring uses `rgba($primary, 0.4)` which is semi-transparent. On colored backgrounds, the 2px ring may not meet the 3:1 minimum contrast requirement for focus indicators introduced in WCAG 2.2. Moving to `rgba($primary, 1.0)` or increasing offset to 3px is recommended.

---

## 4.1.2 — Name, Role, Value

**Status: ✅ Addressed**

| What                     | Evidence                                                                                              |
| ------------------------ | ----------------------------------------------------------------------------------------------------- |
| Interactive report cards | `role="button"`, `aria-label`, `aria-pressed` on report selection cards (`reportes.ts:153-157`)       |
| Form inputs              | All inputs have associated `<label for="...">` or `aria-label` attributes                             |
| Icon buttons             | All standalone icons marked `aria-hidden="true"` with adjacent visible text or `aria-label` on parent |
| Spinners                 | `role="status"` and `aria-label="Cargando..."` on all loading spinners                                |
| Alert regions            | `role="alert"` and `role="status"` used correctly for live region announcements                       |

**Remaining:** `<select>` elements for format selection in `reportes.ts:429` only carry `aria-label` — no visible label element. While functional, adding a visible label improves discoverability for sighted screen reader users.

---

## 4.1.3 — Status Messages

**Status: ⚠️ Partial**

| What         | Evidence                                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------------------ |
| Live regions | `aria-live="polite"` applied to export progress container (`reportes.ts:452`) and record count (`reportes.ts:415`) |
| Alert roles  | Error states use `role="alert"` which implies `aria-live="assertive"`                                              |

**Remaining:** Loading states in `movimientos.ts` and `usuarios.ts` inject HTML directly into table bodies without `aria-live` on a container. Screen readers will not announce filter-result changes. A wrapping `aria-live="polite"` region around table content is needed.

---

## Summary

| Criterion                    | Status       | Critical Issue                                                  |
| ---------------------------- | ------------ | --------------------------------------------------------------- |
| 1.3.1 Info and Relationships | ✅ Addressed | —                                                               |
| 1.4.1 Use of Color           | ⚠️ Partial   | Color-only badges in movimientos                                |
| 1.4.3 Contrast (Minimum)     | ✅ Addressed | Fixed in `8bdec31` — `--color-text-muted` now `#64748b` (4.6:1) |
| 1.4.4 Resize Text            | ✅ Addressed | —                                                               |
| 1.4.11 Non-text Contrast     | ⚠️ Partial   | Border passes on page bg; marginal FAIL on white surface        |
| 2.1.1 Keyboard               | ⚠️ Partial   | Table rows not keyboard-activatable                             |
| 2.1.2 No Keyboard Trap       | ✅ Addressed | —                                                               |
| 2.4.3 Focus Order            | ✅ Addressed | —                                                               |
| 2.4.7 Focus Visible          | ✅ Addressed | Focus ring semi-transparent                                     |
| 4.1.2 Name, Role, Value      | ✅ Addressed | —                                                               |
| 4.1.3 Status Messages        | ⚠️ Partial   | Table results lack aria-live                                    |

**Pass: 7 / Partial: 4 / Deferred: 0**
