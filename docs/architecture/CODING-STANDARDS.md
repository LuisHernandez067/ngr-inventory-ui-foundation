# Estándares de Código — ngr-inventory-ui-foundation

> Documento de referencia para todo el equipo. Define convenciones obligatorias y guías recomendadas para mantener la base de código coherente y mantenible.

---

## Idioma del código

| Elemento                    | Idioma  | Ejemplo                                    |
| --------------------------- | ------- | ------------------------------------------ |
| Variables                   | Inglés  | `const productList = []`                   |
| Funciones                   | Inglés  | `function calculateTotal()`                |
| Clases / Interfaces / Types | Inglés  | `interface ProductCard`                    |
| Nombres de archivos         | Inglés  | `product-card.ts`                          |
| Comentarios inline          | Español | `// Filtra productos sin stock`            |
| JSDoc                       | Español | `/** @param items - Lista de productos */` |
| Texto UI (labels, mensajes) | Español | `placeholder="Buscar producto..."`         |

---

## TypeScript

### Configuración base

El proyecto usa `tsconfig.base.json` con modo strict completo. Todos los packages extienden esta config.

### Reglas obligatorias

```typescript
// ✅ Correcto — import de tipo explícito
import type { Product } from './types.js';

// ❌ Incorrecto — mezcla con import de valor
import { type Product, fetchProducts } from './types.js';

// ✅ Correcto — tipo explícito, sin any
const items: Product[] = [];

// ❌ Incorrecto — nunca usar any
const items: any[] = [];

// ✅ Correcto — unknown con narrowing
function process(input: unknown): string {
  if (typeof input !== 'string') throw new Error('Tipo inválido');
  return input.trim();
}
```

### Naming conventions

| Elemento              | Convención           | Ejemplo                         |
| --------------------- | -------------------- | ------------------------------- |
| Variables y funciones | camelCase            | `productCount`, `fetchData()`   |
| Clases                | PascalCase           | `ProductService`                |
| Interfaces y Types    | PascalCase           | `ProductCard`, `ApiResponse<T>` |
| Enums                 | PascalCase           | `StockStatus`                   |
| Constantes globales   | SCREAMING_SNAKE_CASE | `MAX_PAGE_SIZE`                 |
| Archivos              | kebab-case           | `product-service.ts`            |
| Directorios           | kebab-case           | `design-tokens/`                |

---

## Organización de imports

```typescript
// 1. Builtins de Node (sin alias)
import { readFile } from 'node:fs/promises';

// 2. Dependencias externas
import type { Config } from 'typescript-eslint';

// 3. Paquetes internos del workspace (path aliases)
import type { DesignToken } from '@ngr/design-tokens';

// 4. Imports relativos
import { formatDate } from '../utils/date.js';
import type { Product } from './types.js';
```

---

## Sass / CSS

### Tokens obligatorios

Nunca hardcodear colores. Usar tokens CSS o variables Sass:

```scss
// ✅ Correcto — token CSS
.card {
  background-color: var(--color-surface-primary);
  color: var(--color-text-primary);
}

// ❌ Incorrecto — color hardcodeado
.card {
  background-color: #ffffff;
  color: #333333;
}
```

### BEM (Block-Element-Modifier)

```scss
// Bloque
.product-card {
}

// Elemento
.product-card__title {
}
.product-card__image {
}

// Modificador
.product-card--featured {
}
.product-card__title--truncated {
}
```

### Reglas prohibidas

- ❌ `!important` — salvo casos excepcionales documentados con comentario.
- ❌ Selectores de id (`#id`) en componentes.
- ❌ `color: red` o cualquier color con nombre CSS.

---

## Accesibilidad (WCAG 2.2 AA)

### Contraste mínimo

| Tipo de texto                     | Ratio mínimo |
| --------------------------------- | ------------ |
| Texto normal (< 18px)             | 4.5:1        |
| Texto grande (≥ 18px o 14px bold) | 3:1          |
| Componentes de UI e íconos        | 3:1          |

### Markup semántico

```html
<!-- ✅ Semántico -->
<nav aria-label="Navegación principal">
  <ul>
    <li><a href="/dashboard">Dashboard</a></li>
  </ul>
</nav>

<!-- ❌ Sin semántica -->
<div class="nav">
  <div class="nav-item">Dashboard</div>
</div>
```

### Formularios

```html
<!-- ✅ label asociado explícitamente -->
<label for="product-search">Buscar producto</label>
<input id="product-search" type="search" />

<!-- ✅ Alternativa con aria-label para íconos -->
<button aria-label="Cerrar ventana">
  <i class="bi bi-x" aria-hidden="true"></i>
</button>
```

---

## Estructura de archivos por paquete

Cada paquete en `packages/` sigue esta estructura mínima (cuando aplica):

```
packages/nombre-paquete/
  src/
    index.ts          ← Barrel export
  package.json        ← Con name, version, exports
  tsconfig.json       ← Extiende ../../tsconfig.base.json
  README.md           ← Documentación del paquete
```

---

## Prohibiciones

| Práctica                         | Por qué está prohibida                      |
| -------------------------------- | ------------------------------------------- |
| `console.log()` en producción    | Usar logger o remover antes de commit       |
| `any` explícito                  | Usa `unknown` + narrowing o tipos correctos |
| Commits sin mensaje Conventional | El hook rechaza el commit                   |
| Colores hardcodeados en CSS      | Dificulta theming y mantenimiento           |
| Dependencias sin checklist       | Ver CONTRIBUTING.md — checklist de adopción |
| `!important` sin documentar      | Crea cascadas CSS incontrolables            |
| Merge commits en `develop`       | Usar squash merge o rebase                  |

---

## Referencias

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Sass Guidelines](https://sass-guidelin.es/)
- [BEM Methodology](https://getbem.com/)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [Conventional Commits](https://www.conventionalcommits.org/)
