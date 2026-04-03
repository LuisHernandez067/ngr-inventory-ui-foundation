# Nielsen Heuristics Review — NGR Inventory UI Foundation

> Phase: `phase-20-a11y`
> Methodology: Nielsen's 10 Usability Heuristics (NN/g)
> Severity: 1 = cosmetic · 2 = minor · 3 = major · 4 = catastrophic
> **[CRÍTICO]** = severity 4

Modules reviewed:

- **Dashboard** (`apps/prototype-shell/src/pages/dashboard/dashboard.ts`)
- **Productos** (`apps/prototype-shell/src/pages/modules/productos.ts`)
- **Movimientos** (`apps/prototype-shell/src/pages/modules/movimientos.ts`)
- **Reportes** (`apps/prototype-shell/src/pages/modules/reportes.ts`)
- **Usuarios** (`apps/prototype-shell/src/pages/modules/usuarios.ts`)

---

## Nielsen's 10 Heuristics — Reference

| #   | Heuristic                                               |
| --- | ------------------------------------------------------- |
| H1  | Visibility of system status                             |
| H2  | Match between system and the real world                 |
| H3  | User control and freedom                                |
| H4  | Consistency and standards                               |
| H5  | Error prevention                                        |
| H6  | Recognition rather than recall                          |
| H7  | Flexibility and efficiency of use                       |
| H8  | Aesthetic and minimalist design                         |
| H9  | Help users recognize, diagnose, and recover from errors |
| H10 | Help and documentation                                  |

---

## Dashboard

_Orchestrates 4 widgets: KPI cards, alerts panel, movements panel, quick access. Role-based visibility._

| #   | Heuristic                        | Issue                                                                                                                                                                                                                                                                                   | Severity |
| --- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 1   | H1 — Visibility of system status | KPI cards and panels load asynchronously with no coordinated loading indicator at the page level. Each widget manages its own spinner silently. If multiple widgets fail, the user sees fragmented empty panels with no overall status message.                                         | 2        |
| 2   | H3 — User control and freedom    | The Dashboard has no refresh action. If data is stale or a widget failed silently, the user must navigate away and back to retry — there is no reload button or last-updated timestamp that indicates when data was fetched.                                                            | 2        |
| 3   | H1 — Visibility of system status | The "Actualizado:" timestamp in the header reflects the time the _page rendered_ (a JS `Date` call), not the time the _data was fetched_ from the API. This is misleading — if an API call takes 3 seconds, the timestamp will be off. Stale data situations are invisible to the user. | 3        |

---

## Productos

_List page with status filter dropdown. Supports role-based action button (Nuevo producto)._

| #   | Heuristic                           | Issue                                                                                                                                                                                                                                                                                                                                        | Severity |
| --- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 1   | H6 — Recognition rather than recall | The status filter (`Todos / Activo / Inactivo / Descontinuado`) resets to "Todos" every time the page is mounted (`destroy()` tears down the inner page). If a user navigates to a product detail and returns, their filter selection is lost — they must remember and re-apply the filter manually.                                         | 3        |
| 2   | H9 — Help users recognize errors    | Status badges use `bg-secondary` as a fallback for unknown status values (`map[status] ?? 'bg-secondary'`). An unknown status renders as a gray badge with the raw string value (e.g., `"archived"`). Users have no way to understand what this means, and operators cannot diagnose data quality issues.                                    | 2        |
| 3   | H5 — Error prevention               | The search input triggers `fetchAndRender()` on every `input` event (keystroke-by-keystroke), with no debounce. On slow connections or large datasets, this causes a cascade of in-flight requests that may resolve out of order. While `AbortController` mitigates this, the UX result (flickering table updates) can feel broken to users. | 2        |

---

## Movimientos

_Full-featured list with 5 filters (search, tipo, estado, fecha desde/hasta). All filters trigger immediate re-fetch._

| #   | Heuristic                                   | Issue                                                                                                                                                                                                                                                                                                                                       | Severity |
| --- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 1   | **[CRÍTICO]** H3 — User control and freedom | Table rows navigate to the detail view via `window.location.hash = '#/movimientos/' + id` on a `click` listener. There is no keyboard handler (`keydown` for Enter/Space) on these rows. Keyboard-only users are completely locked out of navigating to any movement detail — they can reach the table via Tab but cannot activate any row. | 4        |
| 2   | H1 — Visibility of system status            | When multiple filters are active simultaneously and return zero results, the empty state shows only "Sin movimientos registrados" with no indication of _which filters_ are causing the empty result. Users must mentally correlate the filter bar state with the empty table.                                                              | 2        |
| 3   | H7 — Flexibility and efficiency of use      | Date filters (`fecha-desde`, `fecha-hasta`) have no preset shortcuts ("Hoy", "Esta semana", "Este mes"). Inventory operators who review daily movements must manually set the same date range every session. No persistence of filter state across navigation.                                                                              | 2        |

---

## Reportes

_Multi-phase state machine: idle → filtering → previewing → exporting → done/error. Complex two-column layout._

| #   | Heuristic                                   | Issue                                                                                                                                                                                                                                                                                                                                                                                                          | Severity |
| --- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 1   | H1 — Visibility of system status            | During the `exporting` phase, the UI shows a spinner and the Job ID (`code` element). However, there is no progress indicator, estimated time, or percentage. For large datasets that trigger the background export path (`> 200 rows`), users have no signal about how long to wait — only a perpetually spinning indicator.                                                                                  | 3        |
| 2   | **[CRÍTICO]** H3 — User control and freedom | During the `exporting` phase (polling active), there is no cancel button. The `intervalId` polls every 1.5 seconds but the user cannot stop it. If the user closes the browser tab or navigates away, `destroy()` calls `clearPolling()` — but while on the page, they are trapped waiting with no escape. An "Cancelar exportación" button is absent from the exporting phase template.                       | 4        |
| 3   | H9 — Help users recognize errors            | The `error` phase renders a generic message from `state.errorMessage`. While API errors include status codes and detail text, network errors fall through to `'No se pudo iniciar la exportación.'` — no guidance on what to do next (check connection, retry later, contact admin). The "Reintentar" button retransitions to `previewing` unconditionally rather than back to the phase that actually failed. | 3        |

---

## Usuarios

_List with role and active-status filters. Role-gated "Nuevo Usuario" button. Roles loaded dynamically._

| #   | Heuristic                                   | Issue                                                                                                                                                                                                                                                                                                                                      | Severity |
| --- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| 1   | **[CRÍTICO]** H3 — User control and freedom | Same as Movimientos: table row navigation on `click` only — no `keydown` handler. Keyboard-only users cannot access any user detail record from the list. This is a systemic issue across all list modules using the same click-wired `tr[data-id]` pattern.                                                                               | 4        |
| 2   | H4 — Consistency and standards              | The `#btn-clear-filters` button appears _inside the table body_ as a `btn-link` within a `<td>` — only visible when the table is empty due to filters. This is an unconventional location for a filter control action. Other pages (Movimientos) have no equivalent clear-filters mechanism at all, creating inconsistency across modules. | 2        |
| 3   | H1 — Visibility of system status            | The role filter `<select>` is populated asynchronously from `GET /api/roles`. Between page mount and the roles fetch completing, the dropdown shows only "Todos los roles". If the fetch fails silently (the `catch` swallows the error), users see a permanently empty role filter with no indication that the list is incomplete.        | 2        |

---

## Severity-4 (CRÍTICO) Issues Summary

| Module          | Issue                                                                                        |
| --------------- | -------------------------------------------------------------------------------------------- |
| **Movimientos** | Table rows have no keyboard handler — keyboard-only users cannot navigate to movement detail |
| **Reportes**    | Exporting phase has no cancel action — users are trapped in polling with no escape           |
| **Usuarios**    | Table rows have no keyboard handler — keyboard-only users cannot navigate to user detail     |

---

## Cross-Module Patterns (Systemic Issues)

These issues appear in multiple modules and should be resolved at the `createListPage` factory or shared template level, not module-by-module:

| Pattern                                            | Heuristic        | Severity | Affected Modules                                      |
| -------------------------------------------------- | ---------------- | -------- | ----------------------------------------------------- |
| Click-only `tr[data-id]` navigation                | H3 / H2.1.1 WCAG | **4**    | Movimientos, Usuarios, Productos (via createListPage) |
| Filter state not persisted across navigation       | H3               | 3        | Productos, Movimientos, Usuarios                      |
| No debounce on search input                        | H5               | 2        | Productos, Movimientos                                |
| Empty-state messages don't describe active filters | H1               | 2        | Movimientos, Usuarios                                 |
