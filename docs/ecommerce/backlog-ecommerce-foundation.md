# E-Commerce Foundation — Future Backlog

## Overview

This document organizes the future e-commerce extension work into three strategic phases.
It is a **planning backlog**, not a sprint plan or a commitment. Work should only begin
when e-commerce is formally greenlit.

**Guiding principle**: Extend the existing Foundation Layer — do not replace it.
See `docs/architecture/decisions/adr-0004-ecommerce-extension-strategy.md` for the
formal decision.

**Related documents**:

- `docs/ecommerce/ecommerce-prep.md` — gap analysis and library evaluations
- `docs/architecture/decisions/adr-0004-ecommerce-extension-strategy.md` — strategic ADR

**Effort sizing**: XS (<1 day) / S (1–2 days) / M (3–5 days) / L (1–2 weeks) / XL (>2 weeks)

---

## Phase 1 — Product Catalog and Search

**Goal**: Allow customers to browse, discover, and view products. This phase makes the
product catalog visible and searchable without any transactional capability.

**Key libraries to install in this phase**: Fuse.js (search), PhotoSwipe (gallery),
Embla Carousel (image strip).

**New package to create**: `packages/ui-commerce` — all commerce components live here,
never in `ui-core` or `ui-patterns`.

| Feature                                                | Effort | Foundation Dependency                                                    | Priority |
| ------------------------------------------------------ | ------ | ------------------------------------------------------------------------ | -------- |
| Commerce product card (image-first layout, price, CTA) | M      | `@ngr-inventory/design-tokens`, `@ngr-inventory/ui-core` (Badge, Button) | High     |
| Product detail page template                           | M      | `@ngr-inventory/design-tokens`, AppShell layout                          | High     |
| Product image carousel (Embla Carousel)                | S      | `@ngr-inventory/design-tokens`, Bootstrap grid                           | High     |
| Product image lightbox / gallery (PhotoSwipe)          | S      | `@ngr-inventory/design-tokens`, z-index tokens                           | High     |
| Commerce top navigation shell (no sidebar)             | L      | `@ngr-inventory/bootstrap-theme`, `@ngr-inventory/design-tokens`         | High     |
| Client-side product search widget (Fuse.js)            | S      | `@ngr-inventory/ui-patterns` SearchBar, MSW mock data                    | Medium   |
| Category filter chips (extension of FilterChips)       | S      | `@ngr-inventory/ui-patterns` FilterChips                                 | Medium   |
| Price and promotion display component                  | XS     | `@ngr-inventory/design-tokens` (color-success, color-danger)             | Medium   |
| Product list page template (grid + filters)            | M      | ui-commerce card, FilterChips, Pagination                                | Medium   |
| Image zoom on hover / click                            | XS     | PhotoSwipe integration                                                   | Low      |
| Category landing page template                         | M      | ui-commerce card, commerce navigation                                    | Low      |
| Storybook stories for all Phase 1 components           | S      | `@ngr-inventory/docs-site`                                               | High     |
| MSW handlers for product catalog endpoints             | S      | `@ngr-inventory/api-mocks`                                               | High     |

---

## Phase 2 — Cart and Checkout

**Goal**: Allow customers to add products to a cart and complete a purchase flow.
This phase adds transactional UX on top of the product catalog from Phase 1.

**Key libraries to install in this phase**: Embla Carousel (product suggestions in cart),
SortableJS (order item reordering if needed), FilePond (product image upload — admin side).

| Feature                                                  | Effort | Foundation Dependency                                                  | Priority |
| -------------------------------------------------------- | ------ | ---------------------------------------------------------------------- | -------- |
| Add-to-cart button variant                               | XS     | `@ngr-inventory/ui-core` Button                                        | High     |
| Cart state management (signals or Redux slice)           | M      | `@ngr-inventory/api-contracts` (Cart type)                             | High     |
| Cart indicator badge in top navigation                   | XS     | `@ngr-inventory/ui-core` Badge                                         | High     |
| Cart drawer / slide-in panel                             | M      | `@ngr-inventory/design-tokens`, z-index tokens                         | High     |
| Cart item row component                                  | S      | `@ngr-inventory/design-tokens`, ui-commerce                            | High     |
| Order summary panel                                      | M      | `@ngr-inventory/design-tokens`, ui-commerce                            | High     |
| Multi-step checkout form                                 | L      | `@ngr-inventory/ui-patterns` FormField, `@ngr-inventory/api-contracts` | High     |
| Checkout progress indicator (stepper)                    | S      | `@ngr-inventory/design-tokens`                                         | Medium   |
| "Related products" horizontal carousel (Embla)           | S      | ui-commerce product card, Embla Carousel                               | Medium   |
| Wishlist toggle component                                | XS     | `@ngr-inventory/ui-core` Button, `@ngr-inventory/design-tokens`        | Low      |
| Product image uploader — admin side (FilePond)           | M      | `@ngr-inventory/ui-core`, `@ngr-inventory/api-mocks`                   | Medium   |
| Category / product drag-and-drop reordering (SortableJS) | M      | `@ngr-inventory/ui-patterns` DataTable, SortableJS                     | Low      |
| MSW handlers for cart and checkout endpoints             | S      | `@ngr-inventory/api-mocks`                                             | High     |
| Storybook stories for all Phase 2 components             | S      | `@ngr-inventory/docs-site`                                             | High     |

---

## Phase 3 — Payments and Orders

**Goal**: Process payments and allow customers and admins to manage orders. This is
the most complex phase and requires integration with external payment providers.

**Key libraries**: FilePond (order document uploads), potential payment SDK
(Stripe.js or MercadoPago SDK — to be evaluated separately).

| Feature                                              | Effort | Foundation Dependency                                                  | Priority |
| ---------------------------------------------------- | ------ | ---------------------------------------------------------------------- | -------- |
| Payment method selector component                    | M      | `@ngr-inventory/ui-core`, `@ngr-inventory/design-tokens`               | High     |
| Payment provider integration (Stripe or MercadoPago) | XL     | `@ngr-inventory/api-contracts` (Payment type), MSW payment mock        | High     |
| Payment status badge / feedback                      | XS     | `@ngr-inventory/ui-core` Badge, StatusBadge                            | High     |
| Order confirmation page template                     | M      | ui-commerce, `@ngr-inventory/design-tokens`                            | High     |
| Order history table (customer-facing)                | M      | `@ngr-inventory/ui-patterns` DataTable (adapted)                       | High     |
| Order detail page template                           | M      | ui-commerce, `@ngr-inventory/design-tokens`                            | High     |
| Invoice download component                           | S      | `@ngr-inventory/ui-core`, `@ngr-inventory/api-mocks`                   | Medium   |
| Refund request flow                                  | L      | `@ngr-inventory/ui-patterns` FormField, `@ngr-inventory/api-contracts` | Medium   |
| Customer account section (profile, addresses)        | L      | `@ngr-inventory/ui-patterns`, `@ngr-inventory/api-contracts`           | Medium   |
| Order document upload (FilePond)                     | S      | FilePond, `@ngr-inventory/api-mocks`                                   | Low      |
| Email template integration (transactional)           | XL     | External: Postmark / SendGrid / Resend                                 | Low      |
| Admin order management views                         | L      | `@ngr-inventory/ui-patterns` DataTable, admin AppShell                 | Medium   |
| MSW handlers for payment and order endpoints         | M      | `@ngr-inventory/api-mocks`                                             | High     |
| Storybook stories for all Phase 3 components         | M      | `@ngr-inventory/docs-site`                                             | High     |
| ADR-0005: Payment provider selection                 | S      | `docs/architecture/decisions/`                                         | High     |
