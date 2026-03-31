# ngr-inventory-ui-foundation

> Workspace de diseño y prototipo UI para NGR Inventory — Design System completo + mockups navegables del sistema de inventario.

[![CI](https://github.com/ngr/ngr-inventory-ui-foundation/actions/workflows/ci.yml/badge.svg)](https://github.com/ngr/ngr-inventory-ui-foundation/actions/workflows/ci.yml)

---

## ¿Qué es este proyecto?

Este workspace es la **base de UI del sistema NGR Inventory**. No es una aplicación frontend convencional: es un **workspace de diseño y prototipado** compuesto por:

- **Foundation Layer** — Design tokens, tema Bootstrap 5 personalizado, librería de componentes base, patrones operacionales, contratos de API con mocks MSW.
- **Prototype Layer** — Aplicación Vite ejecutable con 16 módulos navegables del sistema de inventario real, con datos mockeados.

---

## Mapa del workspace

```
ngr-inventory-ui-foundation/
  apps/
    prototype-shell/     ← App Vite ejecutable (prototipo navegable)
    angular-demo/        ← Consumer Angular (futuro)
    react-demo/          ← Consumer React (futuro)
  packages/
    design-tokens/       ← Tokens de diseño (DTCG-compatible)
    bootstrap-theme/     ← Proyecto Sass/Bootstrap personalizado
    ui-core/             ← Componentes base
    ui-patterns/         ← Patrones operacionales reutilizables
    api-contracts/       ← Contratos de integración (TypeScript)
    api-mocks/           ← Escenarios y handlers MSW
    screen-specs/        ← Especificaciones visuales documentadas
    docs-site/           ← Storybook y documentación extendida
  docs/
    architecture/        ← ADRs y estándares de código
    ux/                  ← Documentación de UX y lenguaje visual
    accessibility/       ← Guías de accesibilidad WCAG 2.2
    components/          ← Documentación por componente
```

---

## Tech Stack

| Capa            | Herramienta                       |
| --------------- | --------------------------------- |
| Lenguaje        | TypeScript (strict)               |
| Build           | Vite                              |
| CSS Framework   | Bootstrap 5 + Sass                |
| Documentación   | Storybook                         |
| Tests unitarios | Vitest                            |
| Tests E2E       | Playwright                        |
| Mocks de API    | MSW (Mock Service Worker)         |
| Linting         | ESLint v9 (flat config)           |
| Formato         | Prettier                          |
| CSS Linting     | Stylelint                         |
| Commits         | Commitlint + Conventional Commits |
| Git hooks       | Husky + lint-staged               |

---

## Módulos del prototipo (16)

`auth` · `dashboard` · `productos` · `categorías` · `proveedores` · `almacenes` · `ubicaciones` · `movimientos` · `stock` · `kardex` · `conteos` · `usuarios` · `roles/permisos` · `reportes` · `auditoría`

---

## Primeros pasos

### Requisitos previos

- **Node.js** >= 22.x (ver `.nvmrc`)
- **npm** >= 10.x

### Instalación

```bash
# Usar la versión de Node correcta
nvm use

# Instalar todas las dependencias del workspace
npm install

# Inicializar git hooks (Husky)
npm run prepare
```

### Comandos disponibles

```bash
# Linting
npm run lint          # ESLint
npm run lint:fix      # ESLint con corrección automática

# Formato
npm run format        # Prettier (escritura)
npm run format:check  # Prettier (verificación, para CI)

# TypeScript
npm run typecheck     # tsc --noEmit (sin emitir archivos)

# Estilos
npm run stylelint     # Stylelint sobre *.scss
```

---

## Convenciones

- **Código**: inglés (nombres de variables, funciones, clases, archivos)
- **Comentarios**: español (inline, JSDoc)
- **Texto de UI**: español (labels, placeholders, mensajes)
- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/) — ver `CONTRIBUTING.md`
- **Branches**: `main` (producción), `develop` (integración), `feature/nombre`, `fix/nombre`

---

## Documentación

- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — Guía de contribución y criterios de trabajo
- [`docs/architecture/CODING-STANDARDS.md`](./docs/architecture/CODING-STANDARDS.md) — Estándares de código
- [`docs/architecture/decisions/`](./docs/architecture/decisions/) — Architecture Decision Records (ADRs)

---

## Accesibilidad

Este proyecto sigue **WCAG 2.2 AA** como estándar mínimo. Cada fase incluye revisión de accesibilidad. Ver `docs/accessibility/`.

---

## Plan de implementación

El proyecto sigue un plan de 24 fases documentado en [`docs/plan-ngr-inventory-ui-foundation.md`](./docs/plan-ngr-inventory-ui-foundation.md).
