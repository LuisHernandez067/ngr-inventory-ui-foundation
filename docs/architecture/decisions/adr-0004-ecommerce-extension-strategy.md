# ADR-0004 — E-Commerce Extension Strategy

| Campo      | Valor                                |
| ---------- | ------------------------------------ |
| **Estado** | Aceptado                             |
| **Fecha**  | 2026-04-03                           |
| **Autor**  | Equipo NGR Inventory UI              |
| **Área**   | Arquitectura, Estrategia de producto |

---

## Status

Accepted

---

## Context

The `ngr-inventory-ui-foundation` workspace was built as an **admin inventory UI foundation**:
a monorepo providing design tokens, Bootstrap theme, UI core components, UI patterns,
API mocks, and executable mockups for a back-office inventory management application.

The 24-phase plan (see `docs/plan-ngr-inventory-ui-foundation.md`) explicitly included
a final phase — Fase 24 — dedicated to preparing the foundation for a potential future
e-commerce extension. Phase 23 (this phase) delivers that preparation.

The strategic question is: **when e-commerce work is greenlit, how should it relate
to the existing foundation?**

Three options were evaluated:

1. **Extend the existing foundation** — build e-commerce components on top of the same
   design tokens, Bootstrap theme, and toolchain.
2. **Build a separate e-commerce frontend** — a new repository with its own design system.
3. **Add e-commerce components now** — introduce commerce UI into the current admin-focused
   packages without waiting for a formal greenlight.

The constraint established by the plan is explicit:

> "Crear backlog futuro de e-commerce foundation, **sin contaminar el alcance actual**."

---

## Decision

We will **extend the existing Foundation Layer** for e-commerce when that work is
formally scoped and greenlit.

Specifically:

- The CSS layer (design tokens in `packages/design-tokens` and Bootstrap theme in
  `packages/bootstrap-theme`) is framework-agnostic and requires **no modification**
  to support e-commerce use cases.
- E-commerce UI components MUST live in a **new package** (`packages/ui-commerce` or
  equivalent), never inside `packages/ui-core` or `packages/ui-patterns`. Admin and
  commerce concerns must not contaminate each other's packages.
- New e-commerce packages MUST follow the same monorepo patterns established in
  ADR-0001 (npm workspaces, ESLint flat config, Vitest, Playwright, Storybook).
- The Angular and React demo apps may be extended to demonstrate commerce components
  without creating new repositories.
- **No e-commerce code is introduced in the current phase.** This ADR documents the
  future strategy; it does not authorize any code changes.

---

## Consequences

### Positivas

- **Single source of design truth**: All design tokens, color palette, typography scale,
  spacing system, and shadow tokens transfer to e-commerce without modification.
  There is no duplication of foundational visual decisions.
- **No infrastructure duplication**: The Angular and React demos, the Storybook docs-site,
  the MSW mock layer, and the Vitest/Playwright testing setup are all reusable by
  e-commerce packages.
- **Proven multi-framework support**: Phase 22 demonstrated that the foundation works
  in both Angular and React. E-commerce components in `ui-commerce` will inherit that
  proof.
- **Lower initial investment**: When e-commerce work begins, the team starts with a
  complete toolchain, an established token system, and 10+ base components to build on.
- **Consistent developer experience**: One monorepo, one ESLint config, one build system.
  Contributors do not need to context-switch between repositories.

### Negativas / Trade-offs

- **Risk of package boundary erosion**: If package boundaries are not enforced, admin
  assumptions will leak into commerce components (e.g., using the admin `AppShell`
  inside a commerce product card story). Mitigation: enforce the `packages/ui-commerce`
  boundary in PR review.
- **Bootstrap coupling for commerce visuals**: Some commerce page patterns (full-bleed
  hero sections, dark overlay banners, parallax imagery) may conflict with Bootstrap's
  container and grid system, which was tuned for the admin context. A future ADR may
  need to evaluate whether commerce page templates use Bootstrap's grid or a custom
  CSS Grid layout.
- **If commerce UX diverges strongly, some patterns will need abstraction**: The
  current `Button`, `Card`, and `SearchBar` components are admin-optimized. If commerce
  requires significantly different variants, the admin-focused implementations will need
  to be abstracted (not modified). This is a refactor cost, not a blocker.
- **This document may become stale**: The gap analysis and library evaluations in
  `docs/ecommerce/ecommerce-prep.md` represent the state of the foundation and the
  library ecosystem as of 2026-04-03. Review them when e-commerce work begins.

---

## Alternatives Considered

### Alternativa 1 — Build a separate e-commerce frontend (new repository)

**Rationale for rejection**: This would duplicate the entire infrastructure: design
tokens, Bootstrap theme, component library, testing setup, CI/CD pipeline, and
documentation. The cost of maintaining two systems in sync — especially for visual
consistency — is high. Divergence over time is likely. The monorepo approach (ADR-0001)
was chosen precisely to avoid this kind of fragmentation.

### Alternativa 2 — Add e-commerce components to the current phase (contaminate scope)

**Rationale for rejection**: No confirmed e-commerce requirements exist yet. Building
commerce components before requirements are known leads to over-engineering and wasted
effort. The plan's explicit constraint ("sin contaminar el alcance actual") reflects the
principle that premature optimization is harmful. The admin inventory foundation should
be complete and stable before commerce concerns are introduced.

### Alternativa 3 — Adopt a full e-commerce framework (Medusa, Saleor, Vendure)

**Rationale for rejection**: These frameworks are opinionated about their own
frontend architecture and would require abandoning the Foundation Layer rather than
extending it. They are appropriate for projects that need an out-of-the-box e-commerce
platform, not for a project where the UI design system is a primary deliverable.

### Alternativa 4 — Add e-commerce tokens to the current design-tokens package now

**Rationale for rejection**: Adding tokens like `--price-color`, `--cart-badge-bg`,
or `--product-card-image-ratio` to `packages/design-tokens` now would introduce
commerce-specific semantics into a package that is currently clean and admin-focused.
The correct approach is to add these tokens to a new package (e.g.,
`packages/design-tokens-commerce`) when they are actually needed.

---

## Notas de Implementación

When e-commerce work is greenlit, the recommended starting point is:

1. Read `docs/ecommerce/ecommerce-prep.md` — gap analysis, library evaluations, and
   risks are documented there.
2. Read `docs/ecommerce/backlog-ecommerce-foundation.md` — phased backlog with effort
   estimates and foundation dependencies.
3. Create `packages/ui-commerce` following the pattern of `packages/ui-core`.
4. Write ADR-0005 documenting the technical choices for the `ui-commerce` package
   (library selections, component API conventions, etc.).

---

## Referencias

- `docs/plan-ngr-inventory-ui-foundation.md` — Fase 24 scope (lines 1178–1209)
- `docs/ecommerce/ecommerce-prep.md` — Gap analysis and library evaluations
- `docs/ecommerce/backlog-ecommerce-foundation.md` — Phased e-commerce backlog
- `docs/architecture/decisions/adr-0001-monorepo-tooling.md` — Monorepo decision
- `docs/architecture/decisions/adr-0003-bootstrap-over-tailwind.md` — CSS framework decision
- `docs/architecture/multiframework-guide.md` — Angular and React integration guide
