# ADR-0003 — Bootstrap 5 + Sass como Framework CSS Base

| Campo      | Valor                        |
| ---------- | ---------------------------- |
| **Estado** | Aceptado                     |
| **Fecha**  | 2026-03-31                   |
| **Autor**  | Equipo NGR Inventory UI      |
| **Área**   | CSS Framework, Design System |

---

## Contexto

El proyecto necesita un framework CSS para construir un design system y prototipo de aplicación de inventario. La elección del framework CSS tiene impacto profundo en:

- Cómo se definen y consumen los tokens de diseño
- La velocidad de prototipado
- La portabilidad entre Angular, React y Vite
- La curva de aprendizaje del equipo
- La capacidad de theming (light, dark, warm, cold)

---

## Decisión

Usamos **Bootstrap 5 + Sass** como framework CSS base, con un layer de personalización completo vía variables Sass y CSS Custom Properties.

**No usamos Tailwind CSS** en este proyecto.

---

## Evaluación de alternativas

| Framework                      | Modelo                 | Ventajas para este proyecto                                     | Desventajas                                                               | Decisión      |
| ------------------------------ | ---------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------- |
| **Bootstrap 5 + Sass**         | Components + utilities | Componentes listos, theming vía variables Sass, multi-framework | Bundle más grande sin purging configurado                                 | ✅ Elegido    |
| Tailwind CSS                   | Utility-first          | Bundle mínimo con JIT, gran ecosistema                          | No tiene sistema de componentes — todo desde cero, dificulta portabilidad | ❌ Descartado |
| Material UI / Angular Material | Component-first        | Componentes completos                                           | Lock-in a React/Angular, difícil portabilidad                             | ❌ Descartado |
| CSS puro + Design Tokens       | Custom                 | Máximo control                                                  | Demasiado tiempo de construcción desde cero                               | ❌ Descartado |
| Bulma                          | Component-based        | Ligero, modular                                                 | Menos activo, menos ecosistema                                            | ❌ Descartado |

---

## Justificación detallada: Bootstrap sobre Tailwind

### 1. Portabilidad multi-framework

Bootstrap es **agnóstico al framework**. Los componentes se implementan vía clases CSS — funcionan igual en:

- Vite (prototype-shell)
- Angular (angular-demo)
- React (react-demo)

Tailwind también es agnóstico, pero requiere configurar el JIT purge por framework. La diferencia: con Bootstrap tenemos componentes reales; con Tailwind tendríamos que construir cada componente desde utilidades.

### 2. Theming con Sass variables y CSS Custom Properties

Bootstrap 5 expone su sistema de diseño vía variables Sass (`$primary`, `$body-bg`, etc.) que se sobreescriben ANTES de importar Bootstrap. Esto nos permite:

```scss
// packages/bootstrap-theme/src/_variables.scss
$primary: var(--color-brand-primary); // Token CSS
$border-radius: var(--radius-base); // Token CSS

@import 'bootstrap/scss/bootstrap';
```

Para el sistema de temas (light, dark, warm, cold):

```html
<html data-bs-theme="dark"></html>
```

Bootstrap 5.3+ tiene soporte nativo de color schemes. Extendemos esto con CSS Custom Properties propias.

### 3. Velocidad de prototipado

Para prototipar 16 módulos de inventario con layouts complejos (tablas, formularios, dashboards), Bootstrap ofrece:

- Grid system robusto
- Componentes listos (Modal, Dropdown, Toast, Alert, Badge, etc.)
- Helpers de responsive visibility
- Clases de utilidad para spacing, flexbox, etc.

Con Tailwind partiríamos de cero en cada componente compuesto.

### 4. Equipo y contexto

El equipo tiene experiencia previa con Bootstrap. La curva de aprendizaje de Tailwind + construir todos los componentes compuestos aumentaría significativamente el tiempo de Phase 3-6.

---

## Cómo usamos Bootstrap

```
packages/
  design-tokens/         ← CSS Custom Properties (--color-*, --spacing-*, etc.)
  bootstrap-theme/       ← Sass que override Bootstrap + exporta clases CSS
  ui-core/               ← Componentes TypeScript que usan clases de bootstrap-theme
```

### Capas de abstracción

1. **Tokens** — valores primitivos como CSS Custom Properties.
2. **Bootstrap override** — mapea tokens a variables Sass de Bootstrap.
3. **Componentes** — TypeScript/HTML usando clases Bootstrap + clases propias.
4. **Jamás** Bootstrap directamente en la app — siempre a través de `ui-core`.

---

## Consecuencias

### Positivas

- Prototipado rápido con componentes reales desde Phase 3.
- Theming completo vía Sass + CSS Custom Properties.
- Sin lock-in a un meta-framework (Angular-specific, React-specific).
- Documentación abundante y comunidad activa.

### Negativas / Trade-offs

- Bundle CSS más grande que Tailwind si no se configura purging (PurgeCSS / Vite plugin).
- Los componentes Bootstrap de JS (Dropdowns, Modals) no son reactivos — en Phase 6 se wrapearán en componentes TypeScript.
- Menor "moderno" en percepción del equipo (Tailwind tiene más hype actualmente).

---

## Mitigaciones

- Bundle: Se configurará PurgeCSS en Phase 4 (Vite build).
- Componentes JS: Se crearán wrappers en `ui-core` para cada componente Bootstrap que use JS.

---

## Referencias

- [Bootstrap 5 Theming](https://getbootstrap.com/docs/5.3/customize/overview/)
- [Bootstrap 5 Color Modes](https://getbootstrap.com/docs/5.3/customize/color-modes/)
- [Bootstrap Sass Variables](https://getbootstrap.com/docs/5.3/customize/sass/)
