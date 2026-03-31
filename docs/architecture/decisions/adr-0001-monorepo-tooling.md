# ADR-0001 — Monorepo con npm Workspaces y ESLint v9 Flat Config

| Campo      | Valor                   |
| ---------- | ----------------------- |
| **Estado** | Aceptado                |
| **Fecha**  | 2026-03-31              |
| **Autor**  | Equipo NGR Inventory UI |
| **Área**   | Tooling, Monorepo       |

---

## Contexto

El proyecto necesita alojar múltiples paquetes relacionados (design tokens, Bootstrap theme, componentes, mocks, docs) y al menos una aplicación ejecutable (prototype-shell). Sin una estructura monorepo, cada paquete viviría en un repositorio separado, lo que haría imposible compartir código, mantener versiones sincronizadas y aplicar governance uniforme.

También necesitamos herramientas de calidad de código que funcionen en ES2022+ y sean mantenibles a largo plazo.

---

## Decisión

### 1. npm Workspaces (monorepo)

Usamos **npm workspaces** (nativo de npm 7+) para gestionar el monorepo.

**Alternativas evaluadas**:

| Opción             | Ventaja                                          | Desventaja                                  | Decisión                 |
| ------------------ | ------------------------------------------------ | ------------------------------------------- | ------------------------ |
| **npm workspaces** | Nativo, sin overhead, compatible con Node 22 LTS | Menos features que Turborepo                | ✅ Elegido               |
| pnpm workspaces    | Mejor gestión de disco, fast                     | Requiere herramienta externa                | ❌ Descartado            |
| Nx                 | Monorepo avanzado, caching                       | Overhead de configuración alto para Phase 0 | ❌ Descartado para ahora |
| Turborepo          | Caching de builds distribuido                    | Requiere configuración de pipeline          | 🔲 Futuro (Phase 4+)     |

**Justificación**: En Phase 0 no tenemos builds que cachear. npm workspaces nos da linkado de paquetes y scripts unificados sin agregar dependencias. Podemos migrar a Turborepo en Phase 4 cuando tengamos builds reales.

### 2. ESLint v9 con Flat Config

Usamos **ESLint v9** con el nuevo formato de flat config (`eslint.config.js`).

**Alternativas evaluadas**:

| Opción                                     | Estado                    | Decisión                                                       |
| ------------------------------------------ | ------------------------- | -------------------------------------------------------------- |
| ESLint v9 flat config (`eslint.config.js`) | Estable, moderno          | ✅ Elegido                                                     |
| ESLint v8 con `.eslintrc.js`               | Deprecated (EOL 2024)     | ❌ Descartado                                                  |
| Biome                                      | Linter + formatter en uno | ❌ Ecosistema más pequeño, sin TypeScript strict type-checking |

**Justificación**: La flat config es el futuro de ESLint y ya es el default en v9. Evita la complejidad de la config basada en objetos extendidos (`.eslintrc`) y hace el árbol de config más predecible.

### 3. Prettier separado de ESLint

**Decisión**: Prettier solo formatea. ESLint solo detecta problemas de código. No usamos `eslint-plugin-prettier` (mezclar responsabilidades genera conflictos y slows down ESLint).

---

## Consecuencias

### Positivas

- Estructura de workspace clara desde el día 1.
- Todos los paquetes comparten el mismo toolchain con zero duplicación de config.
- ESLint v9 flat config es más simple de entender y debuggear.
- `npm install` en raíz instala todas las dependencias del workspace.

### Negativas / Trade-offs

- Sin caching de builds en Phase 0 (Turborepo va en Phase 4+).
- npm workspaces tiene hoisting de dependencias — puede causar dependencias "fantasma". Mitigación: declarar dependencias explícitamente en cada `package.json`.

---

## Referencias

- [npm Workspaces](https://docs.npmjs.com/cli/v10/using-npm/workspaces)
- [ESLint v9 Migration Guide](https://eslint.org/docs/latest/use/migrate-to-9.0.0)
- [ESLint Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files)
