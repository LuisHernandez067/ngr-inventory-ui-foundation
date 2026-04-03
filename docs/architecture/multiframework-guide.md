# Multi-Framework Integration Guide

## Overview

The NGR Inventory UI Foundation Layer is **framework-agnostic**. The value lies entirely in the CSS layer: design tokens, the Bootstrap theme, and component styles. TypeScript is only present for tooling utilities — there are no framework-specific rendering functions to integrate.

This means any frontend framework (React, Angular, Vue, Svelte, etc.) can consume the Foundation Layer directly by importing CSS and using Bootstrap classes in native templates.

---

## What's Shared (Framework-Agnostic)

| Layer           | Package                          | How to consume                                           |
| --------------- | -------------------------------- | -------------------------------------------------------- |
| Design tokens   | `@ngr-inventory/design-tokens`   | `import '@ngr-inventory/design-tokens/css'` in TS entry  |
| Bootstrap theme | `@ngr-inventory/bootstrap-theme` | `@use '@ngr-inventory/bootstrap-theme'` in SCSS entry    |
| API mocks       | `@ngr-inventory/api-mocks`       | `import { startWorker } from '@ngr-inventory/api-mocks'` |
| API contracts   | `@ngr-inventory/api-contracts`   | TypeScript types only — no runtime code                  |

---

## What's Framework-Specific

The following concerns are **always** handled by the framework layer and have no shared implementation in this foundation:

- Component templates (JSX, Angular templates, Vue SFC `<template>`, etc.)
- Client-side routing
- State management (Redux, NgRx, Signals, Zustand, etc.)
- Form handling and validation
- Dependency injection

---

## What NOT to Use in Framework Apps

> ⚠️ **Do NOT use `@ngr-inventory/ui-core` or `@ngr-inventory/ui-patterns`** render functions in Angular or React apps.

These packages expose vanilla JS HTML-string factories (`renderProductRow(...)`, `createCard(...)`, etc.) built specifically for the `apps/prototype-shell` — a server-rendered HTML prototype with no framework. They produce raw HTML strings, not framework-compatible component instances.

**In framework apps:**

- Use **Bootstrap CSS classes directly** in your framework templates
- Use the **CSS custom properties** from `@ngr-inventory/design-tokens` for theming
- Do **not** call `ui-core` or `ui-patterns` render functions

---

## React Integration

### Setup

- Bundler: **Vite** with `@vitejs/plugin-react`
- Design tokens: imported as a CSS side-effect in `main.tsx`
- Bootstrap theme: loaded via SCSS entry file

#### `main.tsx` entry

```tsx
import '@ngr-inventory/design-tokens/css'; // CSS custom properties on :root
import './styles/main.scss'; // NGR Bootstrap theme

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

async function initMocks(): Promise<void> {
  if (import.meta.env.DEV) {
    const { startWorker } = await import('@ngr-inventory/api-mocks');
    await startWorker();
  }
}

async function mount(): Promise<void> {
  await initMocks();
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

mount().catch(console.error);
```

#### `src/styles/main.scss`

```scss
@use '@ngr-inventory/bootstrap-theme';
```

### MSW Setup (development)

The `initMocks()` pattern above uses a **conditional dynamic import** so MSW is never bundled into production. The Service Worker file (`mockServiceWorker.js`) must be present in `public/` — this is handled automatically by the `postinstall` script in `packages/api-mocks`.

### Example: Product list component

```tsx
import { useState, useEffect } from 'react';
import type { Producto } from '@ngr-inventory/api-contracts';

export function ProductList() {
  const [products, setProducts] = useState<Producto[]>([]);

  useEffect(() => {
    fetch('/api/productos')
      .then((res) => res.json())
      .then(setProducts);
  }, []);

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header">
        <h2 className="h5 mb-0">Productos</h2>
      </div>
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th scope="col">Nombre</th>
              <th scope="col">Categoría</th>
              <th scope="col">Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.nombre}</td>
                <td>{p.categoria}</td>
                <td>{p.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

### `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@ngr-inventory/design-tokens': resolve(__dirname, '../../packages/design-tokens'),
      '@ngr-inventory/bootstrap-theme': resolve(__dirname, '../../packages/bootstrap-theme'),
      '@ngr-inventory/api-mocks': resolve(__dirname, '../../packages/api-mocks'),
      '@ngr-inventory/api-contracts': resolve(__dirname, '../../packages/api-contracts'),
    },
  },
  optimizeDeps: { exclude: ['msw/node'] },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: [
          'legacy-js-api',
          'import',
          'global-builtin',
          'color-functions',
          'if-function',
        ],
        quietDeps: true,
        loadPaths: [resolve(__dirname, '../../node_modules')],
      },
    },
  },
  server: { port: 5174, open: true },
});
```

---

## Angular Integration

### Setup

- Bundler: **Vite** with `@analogjs/vite-plugin-angular` (standalone plugin, not full Analog.js)
- Same token/theme import pattern as React
- `tsconfig.json` overrides required: `verbatimModuleSyntax: false`, `experimentalDecorators: true`

> **Why `verbatimModuleSyntax: false`?** Angular's `@Component` decorator metadata emission is incompatible with `verbatimModuleSyntax: true` (the workspace base setting). The Angular demo overrides this locally.

#### `main.ts` entry

```typescript
import '@ngr-inventory/design-tokens/css'; // CSS custom properties on :root
import './styles/main.scss'; // NGR Bootstrap theme

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

async function initMocks(): Promise<void> {
  if (import.meta.env.DEV) {
    const { startWorker } = await import('@ngr-inventory/api-mocks');
    await startWorker();
  }
}

async function mount(): Promise<void> {
  await initMocks();
  await bootstrapApplication(AppComponent);
}

mount().catch(console.error);
```

#### `src/styles/main.scss`

```scss
@use '@ngr-inventory/bootstrap-theme';
```

### MSW Setup (development)

Identical to React: conditional dynamic import + Service Worker in `public/`. MSW intercepts `fetch()` regardless of whether the HTTP client is `HttpClient` or native `fetch`. The Angular demo uses native `fetch` to keep the setup minimal.

### Example: Product list component

```typescript
import { Component, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import type { Producto } from '@ngr-inventory/api-contracts';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [NgFor],
  template: `
    <div class="card border-0 shadow-sm">
      <div class="card-header">
        <h2 class="h5 mb-0">Productos</h2>
      </div>
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th scope="col">Nombre</th>
              <th scope="col">Categoría</th>
              <th scope="col">Stock</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of products">
              <td>{{ p.nombre }}</td>
              <td>{{ p.categoria }}</td>
              <td>{{ p.stock }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class ProductListComponent implements OnInit {
  products: Producto[] = [];

  ngOnInit(): void {
    fetch('/api/productos')
      .then((res) => res.json())
      .then((data: Producto[]) => (this.products = data));
  }
}
```

### `tsconfig.json` overrides

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "moduleResolution": "Bundler",
    "module": "ES2022",
    "verbatimModuleSyntax": false,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": false,
    "baseUrl": ".",
    "types": ["vite/client"]
  },
  "include": ["src", "vite.config.ts"]
}
```

### `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import { resolve } from 'path';

export default defineConfig({
  plugins: [angular()],
  resolve: {
    alias: {
      '@ngr-inventory/design-tokens': resolve(__dirname, '../../packages/design-tokens'),
      '@ngr-inventory/bootstrap-theme': resolve(__dirname, '../../packages/bootstrap-theme'),
      '@ngr-inventory/api-mocks': resolve(__dirname, '../../packages/api-mocks'),
      '@ngr-inventory/api-contracts': resolve(__dirname, '../../packages/api-contracts'),
    },
  },
  optimizeDeps: { exclude: ['msw/node'] },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: [
          'legacy-js-api',
          'import',
          'global-builtin',
          'color-functions',
          'if-function',
        ],
        quietDeps: true,
        loadPaths: [resolve(__dirname, '../../node_modules')],
      },
    },
  },
  server: { port: 5175, open: true },
});
```

---

## Design Token Reference

All tokens are CSS custom properties defined on `:root`. Import `@ngr-inventory/design-tokens/css` once in your entry file and they're available globally.

### Brand Colors (NGR Blue)

| Token               | Value     | Use                        |
| ------------------- | --------- | -------------------------- |
| `--color-brand-50`  | `#eef7fb` | Light tint backgrounds     |
| `--color-brand-100` | `#d5ecf5` | Subtle hover states        |
| `--color-brand-300` | `#73bedd` | Disabled states            |
| `--color-brand-500` | `#1d8ab4` | Default brand color        |
| `--color-brand-600` | `#1471a0` | Active/primary interactive |
| `--color-brand-700` | `#0f5a82` | Hover on primary buttons   |
| `--color-brand-800` | `#0a3f5e` | Dark emphasis              |

### Semantic Theme Tokens (Light Theme)

| Token                       | Value     | Use                                   |
| --------------------------- | --------- | ------------------------------------- |
| `--color-bg-page`           | `#f8fafc` | Page background                       |
| `--color-bg-surface`        | `#fff`    | Card/panel background                 |
| `--color-bg-surface-raised` | `#f1f5f9` | Elevated surface                      |
| `--color-border-default`    | `#94a3b8` | Standard border (WCAG 3:1 ✅)         |
| `--color-border-strong`     | `#64748b` | Emphasis border (WCAG 4.6:1 ✅)       |
| `--color-text-primary`      | `#1e293b` | Body text                             |
| `--color-text-secondary`    | `#475569` | Supporting text                       |
| `--color-text-muted`        | `#64748b` | Metadata / timestamps (WCAG 4.6:1 ✅) |
| `--color-text-inverted`     | `#fff`    | Text on dark backgrounds              |

### Semantic State Colors

| Token                     | Value     | Use                     |
| ------------------------- | --------- | ----------------------- |
| `--color-success-default` | `#16a34a` | Success indicators      |
| `--color-warning-default` | `#ca8a04` | Warning indicators      |
| `--color-danger-default`  | `#dc2626` | Error/danger indicators |
| `--color-info-default`    | `#0284c7` | Informational elements  |

### Typography

| Token                | Value                           |
| -------------------- | ------------------------------- |
| `--font-family-sans` | Inter, system-ui stack          |
| `--font-family-mono` | JetBrains Mono, monospace stack |
| `--font-size-sm`     | `0.875rem` (14px)               |
| `--font-size-base`   | `1rem` (16px)                   |
| `--font-size-lg`     | `1.125rem` (18px)               |
| `--font-size-xl`     | `1.25rem` (20px)                |

### Spacing (4px base)

| Token       | Value           |
| ----------- | --------------- |
| `--space-1` | `0.25rem` (4px) |
| `--space-2` | `0.5rem` (8px)  |
| `--space-4` | `1rem` (16px)   |
| `--space-6` | `1.5rem` (24px) |
| `--space-8` | `2rem` (32px)   |

### Shadows

| Token         | Use                   |
| ------------- | --------------------- |
| `--shadow-sm` | Subtle card elevation |
| `--shadow-md` | Dropdown, popover     |
| `--shadow-lg` | Modal overlay         |

### Usage example in component styles

```css
.my-panel {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-default);
  box-shadow: var(--shadow-sm);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  color: var(--color-text-primary);
}

.my-panel-title {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-brand-600);
}
```

---

## Vite Alias Configuration

The `resolve.alias` map lets Vite resolve workspace package imports without `node_modules` symlinks.

### Pattern used in both demo apps

```typescript
import { resolve } from 'path';

// In defineConfig({ resolve: { alias: { ... } } })
{
  '@ngr-inventory/design-tokens': resolve(__dirname, '../../packages/design-tokens'),
  '@ngr-inventory/bootstrap-theme': resolve(__dirname, '../../packages/bootstrap-theme'),
  '@ngr-inventory/api-mocks': resolve(__dirname, '../../packages/api-mocks'),
  '@ngr-inventory/api-contracts': resolve(__dirname, '../../packages/api-contracts'),
}
```

> **Note:** `../../` is relative to each app's directory (e.g., `apps/react-demo/`), so it correctly resolves to the workspace root's `packages/` directory.

### Why aliases instead of just npm workspaces?

In a monorepo with `"*"` workspace references, `npm install` creates symlinks in `node_modules`. Vite resolves these correctly at runtime. The aliases are an **explicit fallback** that also works when:

- Running Vite without a full install (e.g., CI setup steps)
- The symlink is broken on Windows (WSL2 compatibility)
- You need to point at the **source files directly** (no build step required for packages)

---

## Framework Comparison at a Glance

| Concern            | React Demo               | Angular Demo                                         |
| ------------------ | ------------------------ | ---------------------------------------------------- |
| Bundler plugin     | `@vitejs/plugin-react`   | `@analogjs/vite-plugin-angular`                      |
| Dev server port    | `5174`                   | `5175`                                               |
| Entry file         | `src/main.tsx`           | `src/main.ts`                                        |
| Template syntax    | JSX                      | Angular template DSL                                 |
| Component file     | `.tsx`                   | `.component.ts`                                      |
| HTTP client        | `fetch` + `useEffect`    | `fetch` + `ngOnInit`                                 |
| Module system      | `tsconfig` → `react-jsx` | `tsconfig` → `ES2022`, `verbatimModuleSyntax: false` |
| MSW init pattern   | Identical                | Identical                                            |
| Token/theme import | Identical                | Identical                                            |
| Bootstrap classes  | Used directly in JSX     | Used directly in template                            |

Both apps consume the **same MSW handlers**, the **same design tokens**, and the **same Bootstrap theme** — zero duplication in the Foundation Layer.
