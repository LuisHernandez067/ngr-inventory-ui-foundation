# Foundation Components — Index

This document is the reference index for all UI components in the
`ngr-inventory-ui-foundation` monorepo. It covers the three foundation packages
(`ui-core`, `ui-patterns`, and the layout layer) plus the design token stories.

Each row links to the component's Storybook story. Story names match the exact
`.stories.ts` files in `packages/docs-site/src/stories/`.

> **Usage note**: Use Bootstrap utility classes and the project's design tokens in
> framework-specific templates. Do not call `render()` functions from the story files
> directly in Angular or React applications — those functions are Storybook helpers.
> See `docs/architecture/multiframework-guide.md` for integration guidance.

---

## Layout

Components in the admin application shell. Located in `packages/docs-site/src/stories/layout/`.

| Component              | Package                      | Storybook Story                            | Usage                                                                                       |
| ---------------------- | ---------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------- |
| Admin Shell (AppShell) | `@ngr-inventory/ui-patterns` | `Layout/Admin Shell` (`Layout.stories.ts`) | Full-page admin layout with sidebar and navbar — wrap all admin module pages with this      |
| Navbar                 | `@ngr-inventory/ui-patterns` | `Layout/Navbar` (`Navbar.stories.ts`)      | Top navigation bar with logo, user menu, and notifications — always used inside Admin Shell |
| Sidebar                | `@ngr-inventory/ui-patterns` | `Layout/Sidebar` (`Sidebar.stories.ts`)    | Collapsible left navigation with module links — supports expanded and collapsed states      |

---

## UI Core

Base components. Located in `packages/ui-core/src/components/` and
`packages/docs-site/src/stories/ui-core/`.

| Component     | Package                  | Storybook Story                                      | Usage                                                                                        |
| ------------- | ------------------------ | ---------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Alert         | `@ngr-inventory/ui-core` | `UI Core/Alert` (`Alert.stories.ts`)                 | Inline feedback messages — use for form errors, warnings, and info notices                   |
| Avatar        | `@ngr-inventory/ui-core` | `UI Core/Avatar` (`Avatar.stories.ts`)               | User identity display — initials or image with optional size variants                        |
| Badge         | `@ngr-inventory/ui-core` | `UI Core/Badge` (`Badge.stories.ts`)                 | Count indicators and status labels — supports pill and standard variants                     |
| Button        | `@ngr-inventory/ui-core` | `UI Core/Button` (`Button.stories.ts`)               | Primary interactive control — variants: primary, secondary, danger, ghost; sizes: sm, md, lg |
| Card          | `@ngr-inventory/ui-core` | `UI Core/Card` (`Card.stories.ts`)                   | Generic content container — use for summary panels, stat blocks, and section grouping        |
| ConfirmDialog | `@ngr-inventory/ui-core` | `UI Core/ConfirmDialog` (`ConfirmDialog.stories.ts`) | Blocking confirmation modal for destructive or irreversible actions                          |
| EmptyState    | `@ngr-inventory/ui-core` | `UI Core/EmptyState` (`EmptyState.stories.ts`)       | Zero-data feedback — use when a list or table has no items to display                        |
| PageHeader    | `@ngr-inventory/ui-core` | `UI Core/PageHeader` (`PageHeader.stories.ts`)       | Module title block with optional subtitle, breadcrumb, and CTA slot                          |
| Spinner       | `@ngr-inventory/ui-core` | `UI Core/Spinner` (`Spinner.stories.ts`)             | Loading indicator — inline or full-area; use with LoadingOverlay for async operations        |
| Tooltip       | `@ngr-inventory/ui-core` | `UI Core/Tooltip` (`Tooltip.stories.ts`)             | Contextual label on hover — supports four placements (top, bottom, left, right)              |

---

## UI Patterns

Composite operational patterns. Located in `packages/ui-patterns/src/patterns/` and
`packages/docs-site/src/stories/ui-patterns/`.

| Component         | Package                      | Storybook Story                                                  | Usage                                                                                        |
| ----------------- | ---------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| ActionMenu        | `@ngr-inventory/ui-patterns` | `UI Patterns/ActionMenu` (`ActionMenu.stories.ts`)               | Row-level kebab menu — use in DataTable rows for edit, delete, and contextual actions        |
| ConfirmableButton | `@ngr-inventory/ui-patterns` | `UI Patterns/ConfirmableButton` (`ConfirmableButton.stories.ts`) | Button with inline confirm state — for destructive single-item actions without a full dialog |
| DataTable         | `@ngr-inventory/ui-patterns` | `UI Patterns/DataTable` (`DataTable.stories.ts`)                 | Full operational table with sorting, pagination, empty state, loading state, and row actions |
| FilterChips       | `@ngr-inventory/ui-patterns` | `UI Patterns/FilterChips` (`FilterChips.stories.ts`)             | Active filter display strip with individual remove and "clear all" — use below FilterBar     |
| FormField         | `@ngr-inventory/ui-patterns` | `UI Patterns/FormField` (`FormField.stories.ts`)                 | Form control wrapper with label, helper text, and validation error — use for all inputs      |
| LoadingOverlay    | `@ngr-inventory/ui-patterns` | `UI Patterns/LoadingOverlay` (`LoadingOverlay.stories.ts`)       | Full-area async loading screen — use for page-level and section-level loading states         |
| Pagination        | `@ngr-inventory/ui-patterns` | `UI Patterns/Pagination` (`Pagination.stories.ts`)               | Page navigation control — supports server-side pagination with configurable page size        |
| SearchBar         | `@ngr-inventory/ui-patterns` | `UI Patterns/SearchBar` (`SearchBar.stories.ts`)                 | Text search input with clear button — can be used standalone or inside TableToolbar          |
| StatusBadge       | `@ngr-inventory/ui-patterns` | `UI Patterns/StatusBadge` (`StatusBadge.stories.ts`)             | Semantic status pill — maps string status values to color-coded badge variants               |
| TableToolbar      | `@ngr-inventory/ui-patterns` | `UI Patterns/TableToolbar` (`TableToolbar.stories.ts`)           | Toolbar above DataTable — composes SearchBar, filter triggers, and bulk action slots         |

---

## Design Token Stories (Fundamentos)

Visual documentation of the design token system. Located in
`packages/docs-site/src/stories/fundamentos/` and `packages/docs-site/src/stories/tokens.stories.ts`.

| Story               | Storybook Path                                               | Description                                                                                    |
| ------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Color tokens        | `Fundamentos/Tokens de Color` (`tokens.stories.ts`)          | Full palette: brand scale (50–950), semantic (success, warning, danger, info), neutral (slate) |
| Borders and shadows | `Tokens/Bordes y Sombras` (`fundamentos/borders.stories.ts`) | Border radius tokens and shadow elevation system                                               |
| Spacing             | `Tokens/Espaciado` (`fundamentos/spacing.stories.ts`)        | 4px-based spacing scale from `--space-1` (4px) to `--space-24` (96px)                          |
| Typography          | `Tokens/Tipografía` (`fundamentos/typography.stories.ts`)    | Font families, size scale, weight tokens, and line-height values                               |

---

## Mockups and Screens

Full-page operational mockups in `packages/docs-site/src/stories/mockups/`.
These are **not reusable components** — they are executable usage examples that
demonstrate how foundation components compose into real application screens.

| Module      | Storybook Path         | Screens Covered                                         |
| ----------- | ---------------------- | ------------------------------------------------------- |
| Auth        | `mockups/auth/`        | Login, forgot password, reset password, session expired |
| Dashboard   | `mockups/dashboard/`   | KPI overview, alerts, recent activity                   |
| Productos   | `mockups/productos/`   | Product list, product detail, create/edit product       |
| Categorías  | `mockups/categorias/`  | Category list, create/edit category                     |
| Proveedores | `mockups/proveedores/` | Supplier list, create/edit supplier                     |
| Almacenes   | `mockups/almacenes/`   | Warehouse list, create/edit warehouse                   |
| Ubicaciones | `mockups/ubicaciones/` | Location list per warehouse                             |
| Stock       | `mockups/stock/`       | Consolidated stock view, low-stock alerts               |
| Movimientos | `mockups/movimientos/` | Movement list, entrada, salida, traslado, ajuste        |
| Kardex      | `mockups/kardex/`      | Kardex view per product                                 |
| Conteos     | `mockups/conteos/`     | Count list, count detail, discrepancy view              |
| Usuarios    | `mockups/usuarios/`    | User list, create/edit user, role assignment            |
| Roles       | `mockups/roles/`       | Role list, permissions assignment                       |
| Reportes    | `mockups/reportes/`    | Report catalog, export flow                             |
