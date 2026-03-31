# @ngr-inventory/design-tokens

Tokens de diseño para NGR Inventory UI Foundation. Fuente de verdad visual para colores, tipografía, espaciado, sombras, radio de borde, z-index y transiciones.

Todos los valores se originan en [`docs/ux/visual-language.md`](../../docs/ux/visual-language.md). **No modificar los archivos de este paquete directamente** — los cambios siempre se propagan desde el documento de lenguaje visual.

---

## Contenido

| Archivo                     | Propósito                                                           |
| --------------------------- | ------------------------------------------------------------------- |
| `src/tokens.scss`           | Variables SCSS primitivas (`$color-brand-600`, `$space-4`, etc.)    |
| `src/custom-properties.css` | Propiedades CSS en `:root` (`--color-brand-600`, `--space-4`, etc.) |
| `src/themes/light.css`      | Variables semánticas de tema para `:root, [data-bs-theme='light']`  |
| `src/themes/dark.css`       | Variables semánticas de tema para `[data-bs-theme='dark']`          |
| `src/themes/warm.css`       | Variables semánticas de tema para `[data-bs-theme='warm']`          |
| `src/themes/cold.css`       | Variables semánticas de tema para `[data-bs-theme='cold']`          |
| `src/tokens.ts`             | Objetos tipados `as const` con referencias a variables CSS          |
| `src/index.ts`              | Barrel de exportaciones TypeScript                                  |
| `src/index.scss`            | Barrel SCSS (`@forward 'tokens'`)                                   |

---

## Instalación

El paquete forma parte del workspace. No requiere instalación adicional:

```json
{
  "dependencies": {
    "@ngr-inventory/design-tokens": "workspace:*"
  }
}
```

---

## Uso

### SCSS (compile-time — integración con Bootstrap)

```scss
// Importar todas las variables SCSS
@use '@ngr-inventory/design-tokens' as tokens;

.btn-primary {
  background-color: tokens.$color-brand-600;
  padding: tokens.$space-3 tokens.$space-4;
  border-radius: tokens.$radius-md;
}
```

O importar directamente el archivo de tokens:

```scss
@use '@ngr-inventory/design-tokens/scss' as tokens;
```

### CSS Custom Properties (runtime — theming)

Cargar los tokens primitivos una sola vez, y el tema deseado:

```html
<!-- Tokens primitivos (siempre) -->
<link rel="stylesheet" href="node_modules/@ngr-inventory/design-tokens/css" />

<!-- Tema activo (elegir uno) -->
<link rel="stylesheet" href="node_modules/@ngr-inventory/design-tokens/themes/light" />
<link rel="stylesheet" href="node_modules/@ngr-inventory/design-tokens/themes/dark" />
<link rel="stylesheet" href="node_modules/@ngr-inventory/design-tokens/themes/warm" />
<link rel="stylesheet" href="node_modules/@ngr-inventory/design-tokens/themes/cold" />
```

Luego activar el tema con el atributo `data-bs-theme`:

```html
<html data-bs-theme="dark"></html>
```

### TypeScript / JavaScript

```typescript
import {
  colorBrandTokens,
  colorSuccessTokens,
  spaceTokens,
  radiusTokens,
  shadowTokens,
  typographyTokens,
} from '@ngr-inventory/design-tokens';

// Todos los valores son literales tipados — autocompletado completo
const brandMain = colorBrandTokens[600]; // 'var(--color-brand-600)'
const successBg = colorSuccessTokens.light; // 'var(--color-success-light)'
const padding = spaceTokens.md; // 'var(--space-4)'
const radius = radiusTokens.lg; // 'var(--radius-lg)'
const shadow = shadowTokens.sm; // 'var(--shadow-sm)'
const fontSans = typographyTokens.fontFamily.sans; // 'var(--font-family-sans)'
```

---

## Temas

| Tema    | Selector                         | Descripción                                     |
| ------- | -------------------------------- | ----------------------------------------------- |
| `light` | `:root, [data-bs-theme='light']` | Claro — superficies blancas, texto oscuro       |
| `dark`  | `[data-bs-theme='dark']`         | Oscuro — superficies Slate 800-900, texto claro |
| `warm`  | `[data-bs-theme='warm']`         | Cálido — matices beige sutiles                  |
| `cold`  | `[data-bs-theme='cold']`         | Frío — matices azul-grisáceos                   |

---

## Validación

```bash
# Verificar tipos TypeScript
npm run typecheck --workspace=@ngr-inventory/design-tokens

# Verificar sintaxis CSS/SCSS (desde la raíz)
npm run lint:styles
```
