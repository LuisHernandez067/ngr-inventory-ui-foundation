# E-Commerce Preparation — NGR Inventory UI Foundation

## Overview

This document bridges the current **admin inventory UI foundation** and a potential future
**e-commerce extension**. It does **not** introduce any e-commerce code — the plan explicitly
requires that this phase avoids contaminating the current admin scope
(`"sin contaminar el alcance actual"`).

Its purpose is to:

1. Document the UX differences between admin and commerce contexts so that future decisions
   are made deliberately.
2. Assess what parts of the current foundation can be reused as-is for e-commerce.
3. Identify the gaps: components and capabilities that do not yet exist.
4. Evaluate the five candidate libraries for future use.
5. Define risks and a phased recommendation.

Paired documents:

- `docs/ecommerce/backlog-ecommerce-foundation.md` — phased backlog for e-commerce work
- `docs/architecture/decisions/adr-0004-ecommerce-extension-strategy.md` — formal ADR

---

## Admin vs Commerce UX

The admin inventory UI and a customer-facing commerce UI share infrastructure (tokens,
Bootstrap theme, TypeScript types) but serve **fundamentally different audiences with
different goals**.

| Aspect                   | Admin Inventory UI                             | E-Commerce UI                                    |
| ------------------------ | ---------------------------------------------- | ------------------------------------------------ |
| **Primary audience**     | Warehouse operators, admins, managers          | End customers, shoppers                          |
| **Primary goal**         | Operate, control and audit inventory           | Browse, discover and purchase products           |
| **Navigation model**     | Sidebar + module hierarchy                     | Top nav, mega-menu, breadcrumb trail             |
| **Information density**  | High density — tables, filters, bulk actions   | Low density — cards, imagery, whitespace         |
| **Trust signals**        | Role-based permissions, audit trail            | Payment security, reviews, social proof          |
| **Primary interaction**  | Data entry, batch operations, form submissions | Product selection, cart, checkout                |
| **Media usage**          | Minimal — status icons, avatar thumbnails      | Central — product galleries, zoom, carousels     |
| **Performance priority** | Functional responsiveness, not initial load    | Initial render, image loading, perceived speed   |
| **Accessibility focus**  | Keyboard navigation, ARIA for complex widgets  | Screen reader product descriptions, focus on CTA |
| **Error handling**       | Inline validation, 422/409 feedback            | Cart errors, payment failures, stock alerts      |

### The Canonical Divergence: Product Card

The most instructive example of UX divergence is the **product card**:

- **Admin context** (`packages/ui-core`): The current `Card` component is a generic
  information container optimized for density. It renders metadata, status badges, and
  action menus. Images are optional thumbnails.
- **Commerce context** (does not yet exist): A commerce product card is image-first,
  with price display, promotion badges, add-to-cart CTA, wishlist toggle, and rating
  stars. It must work in a responsive grid with lazy-loaded imagery and hover states.

These are different components built from the same token system — not the same component
adapted with a flag.

---

## Foundation Readiness

"Ready" means: usable in an e-commerce context without modification or significant rework.

| Feature                                | Status  | Notes                                                                                                      |
| -------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------- |
| Design tokens (CSS custom properties)  | Ready   | `--color-*`, `--space-*`, `--font-*`, `--radius-*`, `--shadow-*` — all framework-agnostic and transferable |
| Color palette (brand, semantic, slate) | Ready   | Full scale from 50–950; semantic success/warning/danger/info included                                      |
| Typography scale                       | Ready   | `--font-size-xs` through `--font-size-3xl`, weight and line-height tokens                                  |
| Spacing scale (4px base)               | Ready   | `--space-1` through `--space-24` — consistent across admin and commerce                                    |
| Border radius tokens                   | Ready   | `--radius-sm` through `--radius-full` — works for cards, buttons, pills                                    |
| Shadow tokens                          | Ready   | `--shadow-xs` through `--shadow-xl` — elevation system ready                                               |
| Z-index tokens                         | Ready   | Dropdown through toast layers defined                                                                      |
| Bootstrap theme override               | Ready   | Custom `bootstrap-theme` package overrides Bootstrap with project tokens                                   |
| Responsive breakpoints                 | Ready   | Bootstrap's grid and breakpoints available; no custom changes needed for e-commerce                        |
| AppShell (Sidebar + Navbar)            | Partial | Admin-specific shell; a commerce shell would be different (top nav, no sidebar)                            |
| `Button` component (ui-core)           | Partial | Variants exist; "Add to Cart" CTA style not yet defined                                                    |
| `Card` component (ui-core)             | Partial | Generic container usable; image-first product card not included                                            |
| `Badge` component (ui-core)            | Ready   | Can represent price tags, promotions, stock status                                                         |
| `Spinner` / `EmptyState` (ui-core)     | Ready   | Universal loading/empty patterns reusable in commerce                                                      |
| `StatusBadge` (ui-patterns)            | Ready   | Can be repurposed for stock status, order status                                                           |
| `SearchBar` (ui-patterns)              | Partial | Component exists; commerce search needs typeahead/autocomplete                                             |
| `FilterChips` (ui-patterns)            | Ready   | Directly usable for product filters (category, price range, etc.)                                          |
| `Pagination` (ui-patterns)             | Ready   | Standard product list pagination                                                                           |
| MSW API mocks                          | Ready   | Easy to extend with product catalog, cart, and order endpoints                                             |
| TypeScript types (`api-contracts`)     | Ready   | Product, category, and supplier types already defined                                                      |
| WCAG 2.2 AA baseline                   | Ready   | Accessibility foundation established; commerce requires same level                                         |
| Vitest + Playwright testing infra      | Ready   | Can be reused for e-commerce component and E2E tests                                                       |
| Storybook docs-site                    | Ready   | Commerce stories can be added in a new `ecommerce/` directory                                              |

### Token Categories That Transfer Without Modification

All **primitive tokens** transfer directly:

- **Color**: `--color-brand-*`, `--color-slate-*`, `--color-success-*`, `--color-warning-*`,
  `--color-danger-*`, `--color-info-*`
- **Typography**: `--font-family-sans`, `--font-size-*`, `--font-weight-*`, `--line-height-*`
- **Spacing**: `--space-1` through `--space-24`
- **Radius**: `--radius-sm` through `--radius-full`
- **Shadow**: `--shadow-xs` through `--shadow-xl`
- **Z-index**: All layers
- **Transitions**: `--transition-fast`, `--transition-base`, `--transition-slow`

**Semantic theme tokens** (in `light.css`) also transfer: `--color-bg-page`,
`--color-bg-surface`, `--color-text-primary`, `--color-border-default`, etc.

---

## Gap Analysis

Items that **do not exist** in the current foundation and would be required for a
functional e-commerce extension.

| Missing Feature                        | Suggested Library                  | Estimated Effort | Priority |
| -------------------------------------- | ---------------------------------- | ---------------- | -------- |
| Commerce product card (image-first)    | None — custom component            | M                | High     |
| Product image gallery / lightbox       | PhotoSwipe                         | S                | High     |
| Product image carousel                 | Embla Carousel                     | S                | High     |
| Client-side product search             | Fuse.js                            | S                | Medium   |
| Category filter with hierarchy         | None — extension of FilterChips    | S                | Medium   |
| Price / promotion display component    | None — custom component            | XS               | Medium   |
| "Add to Cart" button variant           | None — extension of Button         | XS               | Medium   |
| Cart indicator (badge in top nav)      | None — custom component            | XS               | Medium   |
| Product image uploader (admin side)    | FilePond                           | M                | Medium   |
| Drag-and-drop product/category sorting | SortableJS                         | M                | Low      |
| Wishlist toggle component              | None — custom component            | XS               | Low      |
| Commerce top navigation shell          | None — custom layout               | L                | High     |
| Product media manager                  | FilePond + custom logic            | L                | Low      |
| Order summary panel                    | None — custom component            | M                | Medium   |
| Cart drawer / slide-in panel           | None — extension of existing modal | M                | Medium   |

---

## Library Evaluations

> **Important**: None of the libraries below are installed. These are **forward-looking
> evaluations only**. No library should be added until e-commerce work is formally
> greenlit and scoped.

---

### Embla Carousel

**Purpose**: Product image carousels — primary image switcher on product detail pages,
"related products" horizontal scroll strips.

| Attribute              | Detail                                      |
| ---------------------- | ------------------------------------------- |
| Bundle size            | ~7 KB (minified + gzipped)                  |
| License                | MIT                                         |
| Repository health      | Active, >5k GitHub stars                    |
| Framework dependencies | None — vanilla JS + CSS                     |
| Accessibility          | ARIA roles and keyboard navigation built-in |

**Integration notes**: Embla is CSS-first and framework-agnostic. It works naturally
with Bootstrap's grid system. The carousel is initialized via a DOM reference, making
it compatible with Vite, Angular, and React. No conflicts with the existing Bootstrap
carousel (which we do not use). Minimal configuration required for a standard
product gallery implementation.

**Fit score with this foundation**: Excellent. Low bundle cost, no framework lock-in,
aligns with the project's philosophy of choosing minimal, focused libraries.

---

### PhotoSwipe

**Purpose**: Lightbox/zoom for product images — full-screen gallery with touch support,
zoom, and keyboard navigation.

| Attribute              | Detail                                            |
| ---------------------- | ------------------------------------------------- |
| Bundle size            | ~15 KB (minified + gzipped)                       |
| License                | MIT                                               |
| Repository health      | Active, >23k GitHub stars                         |
| Framework dependencies | None — vanilla JS                                 |
| Accessibility          | Full keyboard navigation, ARIA labels, focus trap |

**Integration notes**: PhotoSwipe is pure JavaScript with no framework dependencies.
It opens as a full-page overlay (using `--z-index-modal` layer from our tokens).
Typically paired with a thumbnail grid (Embla or static grid). Angular and React
both have community wrapper components, but the vanilla JS API is simple enough to
wrap in-house.

**Fit score with this foundation**: High. Larger than Embla but provides a capability
(full-screen image zoom) that has no lightweight substitute.

---

### FilePond

**Purpose**: Product image uploads — admin-side uploader for product images, with
preview, validation, and progress feedback.

| Attribute              | Detail                                            |
| ---------------------- | ------------------------------------------------- |
| Bundle size            | ~30 KB (core, minified + gzipped)                 |
| License                | MIT                                               |
| Repository health      | Active, >15k GitHub stars                         |
| Framework dependencies | Official adapters for React, Angular, Vue, Svelte |
| Accessibility          | ARIA labels, keyboard support, focus management   |

**Integration notes**: FilePond's core is framework-agnostic, but official Angular
(`ngx-filepond`) and React (`react-filepond`) adapters exist. The plugin architecture
allows adding image preview, image crop, and file validation independently. Heavier
than the other libraries in this list — use only when upload UX is a real requirement,
not a nice-to-have. Compatible with MSW for mock upload endpoints.

**Fit score with this foundation**: Good, but conditional. Only warranted if the
product image upload workflow is in scope. Do not add preemptively.

---

### SortableJS

**Purpose**: Drag-and-drop product ordering and category tree reordering in admin views.

| Attribute              | Detail                                                        |
| ---------------------- | ------------------------------------------------------------- |
| Bundle size            | ~15 KB (minified + gzipped)                                   |
| License                | MIT                                                           |
| Repository health      | Active, >29k GitHub stars                                     |
| Framework dependencies | None — vanilla JS; Vue/React/Angular wrappers available       |
| Accessibility          | Limited — drag-and-drop has inherent accessibility challenges |

**Integration notes**: SortableJS is vanilla JS and integrates with any DOM structure.
Works well with Bootstrap list groups and table rows. The main accessibility concern is
that drag-and-drop operations are difficult for keyboard and screen reader users —
always provide a keyboard-accessible alternative (e.g., up/down buttons). Compatible
with Vite's module system without configuration.

**Fit score with this foundation**: Moderate. Useful for admin product management
(reorder categories, set display order). Must be paired with keyboard alternatives
to maintain WCAG compliance.

---

### Fuse.js

**Purpose**: Client-side fuzzy search for product catalog — fast in-memory search
without a backend round-trip for small-to-medium product sets.

| Attribute              | Detail                              |
| ---------------------- | ----------------------------------- |
| Bundle size            | ~24 KB (minified + gzipped)         |
| License                | Apache 2.0                          |
| Repository health      | Active, >18k GitHub stars           |
| Framework dependencies | None — pure JavaScript              |
| Accessibility          | N/A — library is logic-only, no DOM |

**Integration notes**: Fuse.js operates on a JavaScript array of objects. It requires
loading the product dataset client-side, making it suitable for catalogs up to a few
thousand products. For larger catalogs, server-side search (e.g., Elasticsearch,
Algolia, or a database FTS query) is preferred and should be the target architecture.
The `SearchBar` component in `ui-patterns` can be extended to use Fuse.js as a
drop-in data source.

> **Note**: Fuse.js is ideal for **prototype and demo purposes** (works with MSW mock
> data). For production e-commerce, plan for a server-side search solution from day one.

**Fit score with this foundation**: High for prototyping; limited for production
scale. Excellent bridge between the current MSW mock layer and a real search backend.

---

## Risks

| Risk                                                                                                                                                                | Likelihood | Mitigation                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Premature UX mixing** — Admin and commerce components bleed into each other's packages, violating package boundaries                                              | Medium     | Enforce strict package boundaries: e-commerce components MUST live in a new package (e.g., `packages/ui-commerce`), never in `ui-core` or `ui-patterns`          |
| **Scope creep during this phase** — The desire to "just add a few commerce tokens" leads to contaminating the admin foundation                                      | High       | This phase is docs-only. Any code change is out of scope and should be rejected in PR review                                                                     |
| **Documentation staleness** — By the time e-commerce work starts, this document may be outdated (new Bootstrap version, library updates)                            | Medium     | Review this document as the first step when e-commerce is greenlit. Treat it as a starting point, not a binding specification                                    |
| **Bootstrap coupling for commerce visuals** — Some commerce patterns (full-bleed hero sections, dark overlays, parallax) fight against Bootstrap's container system | Low-Medium | Evaluate whether Bootstrap's grid is appropriate for commerce page templates, or whether a separate layout system (CSS Grid with custom properties) is warranted |
| **Library abandonment** — One or more of the evaluated libraries may be abandoned or deprecated before e-commerce work begins                                       | Low        | All five libraries are MIT/Apache, have active communities, and can be forked or replaced. The key is not to be coupled to any single library's API              |

---

## Recommendations

When e-commerce work is formally greenlit, the recommended sequence is:

1. **Read this document and the ADR** (`adr-0004`) — validate that the strategic
   decision to extend (not replace) the foundation still holds.
2. **Create `packages/ui-commerce`** — a new package in the monorepo, parallel to
   `ui-core` and `ui-patterns`, for all commerce-specific components.
3. **Implement Phase 1 backlog items** (catalog and search) — see
   `docs/ecommerce/backlog-ecommerce-foundation.md` for the phased breakdown.
4. **Install Fuse.js first** — lowest risk, smallest bundle, unlocks prototype search
   immediately without committing to a backend search architecture.
5. **Install Embla Carousel and PhotoSwipe together** — they are complementary (Embla
   for the main image strip, PhotoSwipe for the zoom/lightbox) and share setup effort.
6. **Defer FilePond and SortableJS** — these are Phase 2/3 concerns and carry more
   integration complexity.
7. **Write ADR-0005 at that time** — a follow-up ADR documenting the technical choices
   made when `ui-commerce` is started.
