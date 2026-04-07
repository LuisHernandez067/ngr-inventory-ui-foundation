# ngr-inventory-ui-foundation

> Design system profesional y workspace de prototipado UI para **NGR Inventory** — la base compartida de interfaz para múltiples aplicaciones frontend.

![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?logo=bootstrap&logoColor=white)
![Storybook](https://img.shields.io/badge/Storybook-8.x-FF4785?logo=storybook&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-2.x-6E9F18?logo=vitest&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-1.49-2EAD33?logo=playwright&logoColor=white)
![WCAG 2.2 AA](https://img.shields.io/badge/Accesibilidad-WCAG%202.2%20AA-005A9C)

---

## ¿Qué es este proyecto?

`ngr-inventory-ui-foundation` es el **monorepo central de UI** para el ecosistema NGR Inventory. No es una aplicación de usuario final: es la infraestructura visual compartida que garantiza consistencia de diseño, comportamiento y calidad entre todas las aplicaciones del sistema.

El proyecto cumple una doble función estratégica:

**Foundation Layer** — Provee los bloques de construcción reutilizables: tokens de diseño, tema Bootstrap 5 personalizado, componentes base, patrones operativos, contratos de API TypeScript y handlers MSW para desarrollo desconectado. Todo el sistema frontend consume esta capa.

**Prototype Layer** — Una aplicación Vite completamente navegable con 16+ módulos del sistema de inventario, construida sobre la foundation layer. Permite validar flujos de usuario, decisiones de diseño y requisitos funcionales antes de implementar en los frameworks de destino (Angular, React u otros).

---

## 🏗️ Arquitectura

### Estructura del monorepo

```
ngr-inventory-ui-foundation/
├── apps/
│   ├── prototype-shell/      # Prototipo navegable completo (16+ módulos)
│   ├── angular-demo/         # Demo de integración Angular (próximamente)
│   └── react-demo/           # Demo de integración React (próximamente)
├── packages/
│   ├── design-tokens/        # Tokens de diseño y variables CSS
│   ├── bootstrap-theme/      # Override completo del tema Bootstrap con NGR
│   ├── ui-core/              # 10 componentes base
│   ├── ui-patterns/          # 10 patrones operativos
│   ├── api-contracts/        # Tipos y contratos de API TypeScript
│   ├── api-mocks/            # Handlers MSW para todos los dominios
│   ├── docs-site/            # Storybook 8
│   └── screen-specs/         # Especificaciones de pantalla
├── docs/
│   ├── architecture/         # ADRs y estándares de código
│   ├── ux/                   # Documentación de UX y lenguaje visual
│   ├── accessibility/        # Guías de accesibilidad WCAG 2.2
│   └── components/           # Documentación por componente
└── .atl/                     # Configuración de agentes SDD
```

### Arquitectura de capas

```
┌─────────────────────────────────────────────────┐
│              prototype-shell (app)               │
│         Angular Demo / React Demo (apps)         │
├─────────────────────────────────────────────────┤
│                  ui-patterns                     │
│   (DataTable, Pagination, FilterChips, ...)      │
├─────────────────────────────────────────────────┤
│                    ui-core                       │
│    (Button, Card, Alert, Badge, Avatar, ...)     │
├─────────────────────────────────────────────────┤
│                bootstrap-theme                   │
│        (Override completo Bootstrap 5)           │
├─────────────────────────────────────────────────┤
│                 design-tokens                    │
│    (Variables CSS: color, espaciado, tipos)      │
└─────────────────────────────────────────────────┘
```

### Descripción de packages y apps

| Package / App              | Nombre npm                       | Descripción                                                                                                                                                 |
| -------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/design-tokens`   | `@ngr-inventory/design-tokens`   | Variables CSS y tokens de tipografía, color, espaciado, bordes y sombras. Compatible con DTCG. Soporta 4 temas.                                             |
| `packages/bootstrap-theme` | `@ngr-inventory/bootstrap-theme` | Customización completa de Bootstrap 5 con la identidad visual NGR: colores, tipografías y overrides de componentes.                                         |
| `packages/ui-core`         | `@ngr-inventory/ui-core`         | 10 componentes base framework-agnostic: Button, Badge, Alert, Spinner, EmptyState, Card, Avatar, Tooltip, ConfirmDialog, PageHeader.                        |
| `packages/ui-patterns`     | `@ngr-inventory/ui-patterns`     | 10 patrones operativos: StatusBadge, FilterChips, SearchBar, Pagination, FormField, LoadingOverlay, ActionMenu, TableToolbar, ConfirmableButton, DataTable. |
| `packages/api-contracts`   | `@ngr-inventory/api-contracts`   | Interfaces TypeScript, DTOs y enums que definen los contratos de integración con el backend.                                                                |
| `packages/api-mocks`       | `@ngr-inventory/api-mocks`       | Handlers MSW para: productos, movimientos, conteos, stock, reportes, usuarios, almacenes y kardex.                                                          |
| `packages/docs-site`       | —                                | Storybook 8: catálogo interactivo de componentes y patrones.                                                                                                |
| `packages/screen-specs`    | —                                | Especificaciones de pantalla documentadas por módulo.                                                                                                       |
| `apps/prototype-shell`     | —                                | Aplicación Vite navegable con los 16+ módulos del sistema de inventario.                                                                                    |
| `apps/angular-demo`        | —                                | (Próximamente) Demo de integración con Angular.                                                                                                             |
| `apps/react-demo`          | —                                | (Próximamente) Demo de integración con React.                                                                                                               |

---

## 🎨 Sistema de temas

El foundation soporta cuatro variantes de tema controladas mediante el atributo HTML `data-bs-theme`:

| Tema   | Valor   | Descripción                                      |
| ------ | ------- | ------------------------------------------------ |
| Claro  | `light` | Predeterminado. Fondo blanco, interfaz estándar. |
| Oscuro | `dark`  | Fondo oscuro, alto contraste nocturno.           |
| Cálido | `warm`  | Paleta tierra (ambarinos, sienas).               |
| Frío   | `cold`  | Paleta fría (azules y grises).                   |

El tema se aplica en el elemento raíz del documento y se propaga automáticamente a todos los componentes y tokens:

```html
<!-- Tema claro (predeterminado) -->
<html data-bs-theme="light">
  <!-- Tema oscuro -->
  <html data-bs-theme="dark">
    <!-- Tema cálido -->
    <html data-bs-theme="warm">
      <!-- Tema frío -->
      <html data-bs-theme="cold"></html>
    </html>
  </html>
</html>
```

Para cambiar el tema en tiempo de ejecución, consulte la sección [Cambio de tema en runtime](#cambio-de-tema-en-runtime).

---

## ⚙️ Requisitos previos

| Herramienta       | Versión mínima                 | Notas                                                                                                  |
| ----------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------ |
| Node.js           | `>= 22.0.0`                    | Se recomienda usar [nvm](https://github.com/nvm-sh/nvm). El archivo `.nvmrc` define la versión exacta. |
| npm               | `>= 10.0.0`                    | Incluido con Node.js 22.                                                                               |
| Sistema operativo | Linux / macOS / Windows (WSL2) | En Windows se recomienda WSL2 para compatibilidad con git hooks.                                       |

---

## 🚀 Instalación y configuración inicial

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd ngr-inventory-ui-foundation

# 2. Activar la versión de Node correcta (requiere nvm)
nvm use

# 3. Instalar todas las dependencias del workspace
npm install

# 4. Inicializar git hooks (Husky)
npm run prepare
```

Tras la instalación, el workspace estará listo. Los git hooks de commitlint y lint-staged quedan activos automáticamente.

---

## 📋 Scripts disponibles

Todos los scripts se ejecutan desde la raíz del monorepo.

### Desarrollo

| Script               | Descripción                                                        |
| -------------------- | ------------------------------------------------------------------ |
| `npm run dev`        | Inicia el servidor de desarrollo del prototipo (`localhost:5173`). |
| `npm run dev:chrome` | Igual que `dev`, forzando Google Chrome como navegador.            |

### Build

| Script          | Descripción                                               |
| --------------- | --------------------------------------------------------- |
| `npm run build` | Compila el prototipo para producción (TypeScript + Vite). |

### Testing

| Script                  | Descripción                                             |
| ----------------------- | ------------------------------------------------------- |
| `npm test`              | Ejecuta todos los tests unitarios con Vitest (modo CI). |
| `npm run test:coverage` | Genera reporte de cobertura de tests unitarios.         |
| `npm run test:e2e`      | Ejecuta las suites E2E con Playwright.                  |

### Documentación

| Script                     | Descripción                                             |
| -------------------------- | ------------------------------------------------------- |
| `npm run storybook`        | Inicia Storybook en modo desarrollo (`localhost:6006`). |
| `npm run storybook:chrome` | Igual que `storybook`, forzando Google Chrome.          |
| `npm run storybook:build`  | Genera el build estático de Storybook.                  |

### Calidad de código

| Script                 | Descripción                                           |
| ---------------------- | ----------------------------------------------------- |
| `npm run lint`         | Ejecuta ESLint sobre todo el workspace.               |
| `npm run lint:fix`     | Ejecuta ESLint y aplica correcciones automáticas.     |
| `npm run format`       | Formatea todos los archivos con Prettier.             |
| `npm run format:check` | Verifica el formato sin modificar archivos (para CI). |
| `npm run typecheck`    | Verifica tipos TypeScript sin emitir archivos.        |
| `npm run stylelint`    | Ejecuta Stylelint sobre archivos `*.scss`.            |

---

## 📖 Manual de integración

Esta sección describe cómo integrar los packages del foundation en proyectos frontend externos (Angular, React, Vue u otros frameworks).

### Visión general de consumo

Los packages del foundation pueden consumirse de dos formas:

1. **Dentro del monorepo** — Las aplicaciones en `apps/` referencian los packages directamente mediante npm workspaces. No requiere publicación.

2. **Como dependencia publicada** — Cuando los packages estén publicados en el registro npm corporativo, se instalan como cualquier otra dependencia: `npm install @ngr-inventory/ui-core`.

En ambos casos, la API de integración es idéntica.

---

### Integración de estilos

El entry point `./styles` de `@ngr-inventory/ui-core` incluye, en orden:

- Los tokens de diseño (`@ngr-inventory/design-tokens`)
- El tema Bootstrap NGR (`@ngr-inventory/bootstrap-theme`)
- Los estilos de SweetAlert2 adaptados al tema
- Los estilos base de todos los componentes ui-core

**Importar una sola vez en el entry point de la aplicación:**

```scss
/* Angular — styles.scss o referencia en angular.json */
@import '@ngr-inventory/ui-core/styles';
```

```ts
// React — src/main.tsx
import '@ngr-inventory/ui-core/styles';
```

```ts
// Vue — src/main.ts
import '@ngr-inventory/ui-core/styles';
```

```ts
// Vite (vanilla) — src/main.ts
import '@ngr-inventory/ui-core/styles';
```

> **Nota:** No es necesario importar por separado `@ngr-inventory/design-tokens` ni `@ngr-inventory/bootstrap-theme`. El entry point de estilos los incluye en el orden correcto.

---

### Uso de tokens de diseño

Una vez importados los estilos, todas las variables CSS están disponibles globalmente. Las variables siguen el prefijo `--ngr-`:

```css
.my-component {
  /* Colores */
  color: var(--ngr-color-primary);
  background-color: var(--ngr-color-surface);

  /* Espaciado */
  padding: var(--ngr-spacing-md);
  margin-bottom: var(--ngr-spacing-lg);

  /* Tipografía */
  font-size: var(--ngr-font-size-base);
  font-family: var(--ngr-font-family-base);

  /* Bordes */
  border-radius: var(--ngr-border-radius-base);
  border: 1px solid var(--ngr-color-border);

  /* Sombras */
  box-shadow: var(--ngr-shadow-sm);
}
```

Las variables se adaptan automáticamente al tema activo (`data-bs-theme`) sin ningún cambio en el CSS del consumidor.

---

### Uso de componentes (ui-core)

Los componentes de `@ngr-inventory/ui-core` son **framework-agnostic**: están implementados en TypeScript vanilla y generan HTML estándar. En Angular o React se utilizan como la base de un componente wrapper del framework correspondiente.

**Instalación:**

```bash
npm install @ngr-inventory/ui-core
```

**Importación de componentes:**

```ts
import { Button, Alert, ConfirmDialog } from '@ngr-inventory/ui-core';
```

**Ejemplo — Button:**

```ts
import { Button } from '@ngr-inventory/ui-core';

const button = new Button({
  label: 'Guardar cambios',
  variant: 'primary',
  size: 'md',
  onClick: () => handleSave(),
});

container.appendChild(button.render());
```

**Ejemplo — Alert:**

```ts
import { Alert } from '@ngr-inventory/ui-core';

const alert = new Alert({
  type: 'success',
  message: 'El producto fue actualizado correctamente.',
  dismissible: true,
});

container.appendChild(alert.render());
```

**Ejemplo — ConfirmDialog:**

```ts
import { ConfirmDialog } from '@ngr-inventory/ui-core';

const dialog = new ConfirmDialog({
  title: 'Eliminar producto',
  message: '¿Confirma que desea eliminar este producto? Esta acción no puede deshacerse.',
  confirmLabel: 'Eliminar',
  cancelLabel: 'Cancelar',
  onConfirm: () => deleteProduct(productId),
  onCancel: () => dialog.close(),
});

dialog.open();
```

---

### Uso de patrones (ui-patterns)

Los patrones de `@ngr-inventory/ui-patterns` componen componentes ui-core en estructuras de mayor nivel para casos de uso operativos concretos.

**Ejemplo — DataTable:**

```ts
import { DataTable } from '@ngr-inventory/ui-patterns';

const table = new DataTable({
  columns: [
    { key: 'sku', label: 'SKU', sortable: true },
    { key: 'name', label: 'Nombre', sortable: true },
    { key: 'stock', label: 'Stock', sortable: true, align: 'right' },
  ],
  data: products,
  onRowClick: (row) => navigateTo(`/products/${row.id}`),
});

container.appendChild(table.render());
```

**Ejemplo — Pagination:**

```ts
import { Pagination } from '@ngr-inventory/ui-patterns';

const pagination = new Pagination({
  currentPage: 1,
  totalPages: 12,
  onPageChange: (page) => loadPage(page),
});

container.appendChild(pagination.render());
```

---

### Uso de mocks de API (MSW)

`@ngr-inventory/api-mocks` provee handlers MSW listos para interceptar todas las llamadas al backend durante el desarrollo y en tests.

**Inicialización en una aplicación Vite:**

```ts
// src/mocks/browser.ts
import { setupWorker } from 'msw/browser';
import { allHandlers } from '@ngr-inventory/api-mocks';

export const worker = setupWorker(...allHandlers);
```

```ts
// src/main.ts
import { worker } from './mocks/browser';

if (import.meta.env.DEV) {
  await worker.start({ onUnhandledRequest: 'warn' });
}
```

**Handlers disponibles por dominio:**

| Dominio               | Cobertura                           |
| --------------------- | ----------------------------------- |
| Productos             | CRUD completo, búsqueda, paginación |
| Movimientos           | Listado, detalle, filtros por tipo  |
| Conteos de inventario | Apertura, cierre, ajuste            |
| Stock por almacén     | Consulta, transferencia             |
| Reportes              | Generación, descarga                |
| Usuarios              | Autenticación, CRUD, roles          |
| Almacenes             | CRUD, ubicaciones                   |
| Kardex                | Historial de movimientos            |

---

### Cambio de tema en runtime

Para cambiar el tema de forma programática, modificar el atributo `data-bs-theme` en el elemento raíz:

```ts
type NgfTheme = 'light' | 'dark' | 'warm' | 'cold';

function setTheme(theme: NgfTheme): void {
  document.documentElement.setAttribute('data-bs-theme', theme);
  localStorage.setItem('ngr-theme', theme);
}

function getTheme(): NgfTheme {
  return (localStorage.getItem('ngr-theme') as NgfTheme) ?? 'light';
}

// Restaurar tema al iniciar la app
setTheme(getTheme());
```

---

### Entry points de @ngr-inventory/ui-core

| Entry point      | Importación                                                      | Contenido                                                                    |
| ---------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `.`              | `import { ... } from '@ngr-inventory/ui-core'`                   | Todos los componentes JavaScript/TypeScript exportados.                      |
| `./styles`       | `import '@ngr-inventory/ui-core/styles'`                         | Estilos completos: tokens + Bootstrap theme NGR + SweetAlert2 + componentes. |
| `./components/*` | `import { ... } from '@ngr-inventory/ui-core/components/Button'` | Acceso directo a un componente individual (tree-shaking manual).             |

---

### Checklist de integración

Antes de dar por completa la integración del foundation en un proyecto nuevo, verificar:

- [ ] `@ngr-inventory/ui-core` declarado en las dependencias del proyecto.
- [ ] `import '@ngr-inventory/ui-core/styles'` importado **una sola vez** en el entry point de la aplicación.
- [ ] El atributo `data-bs-theme` está definido en el elemento `<html>` (o se establece en tiempo de ejecución).
- [ ] El bundler del proyecto puede resolver los exports del package (verificar compatibilidad con `"type": "module"`).
- [ ] Los handlers MSW están inicializados si el proyecto utiliza datos mockeados en desarrollo.
- [ ] Se verificó el contraste de colores con el tema elegido (WCAG 2.2 AA).
- [ ] Los tests del proyecto importan los mismos handlers MSW para consistencia.

---

## 📚 Storybook

Storybook es el catálogo interactivo de todos los componentes y patrones del foundation. Documenta props, variantes, estados y guías de uso.

```bash
# Iniciar Storybook en modo desarrollo
npm run storybook
# → http://localhost:6006

# Generar build estático de Storybook
npm run storybook:build
```

El catálogo incluye:

- **Tokens de diseño** — Paletas de color, escalas de tipografía y espaciado.
- **Componentes ui-core** — Todas las variantes de los 10 componentes base.
- **Patrones ui-patterns** — Demos interactivos de los 10 patrones operativos.
- **Guías de accesibilidad** — Notas de uso accesible por componente.

---

## 🧪 Testing

### Tests unitarios (Vitest)

El workspace cuenta con **69 archivos de test** que cubren ui-core, ui-patterns, api-mocks y todos los módulos del prototipo.

```bash
# Ejecutar todos los tests en modo CI
npm test

# Ejecutar con reporte de cobertura
npm run test:coverage

# Ejecutar en modo watch (desarrollo)
npm -w packages/ui-core run test:watch
```

### Tests E2E (Playwright)

Cinco suites E2E cubren los flujos principales del prototipo:

| Suite               | Escenarios                                  |
| ------------------- | ------------------------------------------- |
| `auth`              | Login, logout, sesión expirada.             |
| `catalogo`          | Listado, búsqueda, detalle de producto.     |
| `almacenes-stock`   | Consulta de stock, transferencias.          |
| `prototype-general` | Navegación entre módulos, flujos críticos.  |
| `responsive`        | Comportamiento en mobile, tablet y desktop. |

```bash
# Ejecutar suites E2E (requiere el prototipo en ejecución)
npm run test:e2e
```

> Los tests E2E utilizan `@axe-core/playwright` para validaciones de accesibilidad automatizadas.

---

## 🤝 Contribución

### Convención de commits

Este proyecto utiliza [Conventional Commits](https://www.conventionalcommits.org/) aplicado mediante commitlint. Todo commit que no cumpla el formato será rechazado por el git hook.

```
<tipo>(<alcance>): <descripción>

Tipos permitidos:
  feat      Nueva funcionalidad
  fix       Corrección de error
  docs      Cambios en documentación
  style     Formato, sin cambios de lógica
  refactor  Refactorización sin cambios funcionales
  test      Adición o modificación de tests
  chore     Tareas de mantenimiento (build, CI, deps)
  perf      Mejoras de rendimiento
  ci        Cambios en pipelines de CI/CD
```

Ejemplos válidos:

```
feat(ui-core): add Tooltip component with keyboard support
fix(api-mocks): correct pagination offset in products handler
docs(readme): update integration guide for Angular 18
test(ui-patterns): add DataTable sort coverage
```

### Flujo de trabajo

1. Crear una rama desde `develop`: `feature/nombre-descriptivo` o `fix/nombre-del-error`.
2. Implementar los cambios siguiendo los estándares de código ([`docs/architecture/CODING-STANDARDS.md`](./docs/architecture/CODING-STANDARDS.md)).
3. Asegurarse de que todos los tests pasen: `npm test && npm run test:e2e`.
4. Verificar linting y formato: `npm run lint && npm run format:check`.
5. Abrir un Pull Request hacia `develop` con descripción clara del cambio.

### Estándares de código

- **Idioma del código**: inglés (variables, funciones, clases, archivos, comentarios JSDoc).
- **Idioma del texto de UI**: español (labels, placeholders, mensajes de error).
- **Formato**: Prettier con configuración del repositorio (no modificar).
- **Tipos**: TypeScript en modo `strict`. No se permite `any` sin justificación documentada.
- **Componentes**: seguir el patrón establecido en `packages/ui-core/src/components/`.

Para más detalles, consultar:

- [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- [`docs/architecture/CODING-STANDARDS.md`](./docs/architecture/CODING-STANDARDS.md)
- [`docs/architecture/decisions/`](./docs/architecture/decisions/) — Architecture Decision Records

---

## ♿ Accesibilidad

`ngr-inventory-ui-foundation` adopta **WCAG 2.2 Nivel AA** como estándar mínimo e irrenunciable. Este compromiso abarca:

| Criterio                       | Aplicación                                                                              |
| ------------------------------ | --------------------------------------------------------------------------------------- |
| Contraste de color (1.4.3)     | Ratio mínimo 4.5:1 para texto normal, 3:1 para texto grande. Verificado en los 4 temas. |
| Navegación por teclado (2.1.1) | Todos los componentes interactivos son accesibles con teclado.                          |
| Indicadores de foco (2.4.7)    | Focus ring visible y con contraste suficiente en todos los componentes.                 |
| Etiquetas y roles ARIA (4.1.2) | Uso correcto de `role`, `aria-label`, `aria-describedby` y estados ARIA.                |
| Textos alternativos (1.1.1)    | Todas las imágenes y elementos no textuales tienen alternativa textual.                 |
| Anuncios de estado (4.1.3)     | Cambios de estado relevantes son anunciados con `aria-live`.                            |

Las suites E2E con Playwright incluyen validaciones automatizadas de accesibilidad mediante `@axe-core/playwright`. La revisión manual se realiza en cada fase del plan de implementación.

Ver documentación detallada en [`docs/accessibility/`](./docs/accessibility/).

---

## 🗺️ Roadmap

El proyecto sigue un plan estructurado de implementación por fases. El detalle completo está en [`docs/plan-ngr-inventory-ui-foundation.md`](./docs/plan-ngr-inventory-ui-foundation.md).

### Estado actual

| Fase                               | Área                      | Estado        |
| ---------------------------------- | ------------------------- | ------------- |
| Foundation (tokens, tema, ui-core) | Design system base        | ✅ Completado |
| ui-patterns                        | Patrones operativos       | ✅ Completado |
| api-contracts + api-mocks          | Capa de integración       | ✅ Completado |
| prototype-shell (16+ módulos)      | Prototipo navegable       | ✅ Completado |
| Storybook 8 (docs-site)            | Documentación interactiva | ✅ Completado |
| Testing unitario (69 suites)       | Cobertura de calidad      | ✅ Completado |
| Testing E2E (5 suites Playwright)  | Flujos de usuario         | ✅ Completado |

### Próximas fases

| Fase                        | Área                        | Estado         |
| --------------------------- | --------------------------- | -------------- |
| angular-demo                | Demo de integración Angular | 🔲 Planificado |
| react-demo                  | Demo de integración React   | 🔲 Planificado |
| Publicación en registro npm | Distribución de packages    | 🔲 Planificado |
| CI/CD pipeline completo     | Automatización              | 🔲 En progreso |

---

## 📄 Licencia

Este proyecto es de uso interno de NGR Inventory. Todos los derechos reservados.
