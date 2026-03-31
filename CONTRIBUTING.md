# Guía de Contribución — ngr-inventory-ui-foundation

Bienvenido/a al workspace. Esta guía establece los **criterios de trabajo** para contribuir al proyecto de forma consistente y sostenible.

---

## Tabla de contenidos

1. [Configuración del entorno](#configuración-del-entorno)
2. [Convenciones de código](#convenciones-de-código)
3. [Convenciones de commits](#convenciones-de-commits)
4. [Flujo de trabajo con branches](#flujo-de-trabajo-con-branches)
5. [Proceso de Pull Request](#proceso-de-pull-request)
6. [Checklist de PR](#checklist-de-pr)
7. [Checklist de adopción de dependencias](#checklist-de-adopción-de-dependencias)

---

## Configuración del entorno

```bash
# 1. Usar la versión correcta de Node
nvm use

# 2. Instalar dependencias del workspace
npm install

# 3. Inicializar git hooks
npm run prepare

# 4. Verificar que todo está en orden
npm run lint && npm run format:check && npm run typecheck
```

---

## Convenciones de código

### Idioma

| Elemento                                          | Idioma      |
| ------------------------------------------------- | ----------- |
| Nombres de variables, funciones, clases, archivos | **Inglés**  |
| Comentarios inline y JSDoc                        | **Español** |
| Texto de UI (labels, placeholders, mensajes)      | **Español** |

### TypeScript

- Modo `strict` habilitado — nunca usar `// @ts-ignore` sin justificación documentada.
- Sin `any` explícito — usar tipos correctos o `unknown` con narrowing.
- Imports de tipo con `import type { ... }`.
- Organizar imports: builtins → externos → internos → relativos.

### Archivos y carpetas

- Archivos: `kebab-case.ts` (ej: `product-card.ts`)
- Clases: `PascalCase`
- Funciones y variables: `camelCase`
- Constantes: `SCREAMING_SNAKE_CASE`
- Componentes: `PascalCase.ts` o `PascalCase/index.ts`

### Sass/CSS

- Sin colores hardcodeados — usar tokens CSS o variables Sass.
- Sin `!important` salvo casos excepcionales documentados.
- Clases con BEM: `.block__element--modifier`.
- Regla selector pattern: `kebab-case` para bloques BEM.

---

## Convenciones de commits

Este proyecto usa [Conventional Commits](https://www.conventionalcommits.org/).

### Formato

```
<tipo>(<scope>): <descripción>

[cuerpo opcional]

[footer opcional — ej: Closes #123]
```

### Tipos permitidos

| Tipo       | Cuándo usarlo                                          |
| ---------- | ------------------------------------------------------ |
| `feat`     | Nueva funcionalidad visible para el usuario            |
| `fix`      | Corrección de un bug                                   |
| `docs`     | Solo cambios en documentación                          |
| `style`    | Formato, espacios, punto y coma — sin cambio de lógica |
| `refactor` | Refactorización — sin nueva funcionalidad ni bug fix   |
| `test`     | Agrega o modifica tests                                |
| `chore`    | Tareas de mantenimiento, tooling, dependencias         |
| `build`    | Cambios en el build system o dependencias externas     |
| `ci`       | Cambios en archivos y scripts de CI/CD                 |
| `perf`     | Mejora de performance                                  |
| `revert`   | Revierte un commit anterior                            |

### Scope

Usar `kebab-case`. Ejemplos: `design-tokens`, `ui-core`, `bootstrap-theme`, `ci`, `docs`.

### Ejemplos válidos

```bash
feat(design-tokens): agregar tokens de color para tema oscuro
fix(ui-core): corregir overflow en componente tabla
docs(contributing): actualizar checklist de PR
chore(deps): actualizar typescript a 5.7.3
ci: agregar job de typecheck al workflow
```

### Longitud máxima del header: 100 caracteres.

---

## Flujo de trabajo con branches

```
main          ← producción / releases
  └── develop ← integración continua
        ├── feature/nombre-descriptivo
        ├── fix/nombre-descriptivo
        ├── docs/nombre-descriptivo
        └── chore/nombre-descriptivo
```

- Toda rama parte de `develop`.
- PRs siempre hacia `develop` (salvo hotfixes hacia `main`).
- Nombre de rama: `tipo/descripcion-en-kebab-case`.

---

## Proceso de Pull Request

1. Crear rama desde `develop`.
2. Implementar los cambios siguiendo las convenciones.
3. Ejecutar `npm run lint && npm run format:check && npm run typecheck` localmente.
4. Completar el **checklist de PR** (ver sección siguiente).
5. Abrir PR con título en formato Conventional Commits.
6. Solicitar revisión mínima de 1 persona.
7. Resolver todos los comentarios antes de hacer merge.
8. Hacer squash merge o rebase merge (no merge commit) hacia `develop`.

---

## Checklist de PR

Antes de solicitar revisión, verificar que:

### General

- [ ] El código compila sin errores (`npm run typecheck`)
- [ ] ESLint y Prettier pasan sin warnings relevantes (`npm run lint && npm run format:check`)
- [ ] Los commits siguen Conventional Commits
- [ ] No se incluyeron archivos `.env` ni credenciales

### Visual (cuando aplica)

- [ ] Se verificó en Chrome y Firefox
- [ ] Se verificó en viewport móvil (375px mínimo)
- [ ] Se verificó en viewport desktop (1440px)
- [ ] Los colores son solo tokens — sin colores hardcodeados
- [ ] El componente tiene variantes de estado (hover, focus, disabled, active)

### Responsivo

- [ ] Se verificó en breakpoints: xs (< 576px), sm, md, lg, xl (≥ 1200px)
- [ ] No hay desbordamientos horizontales en mobile
- [ ] La tipografía escala correctamente entre breakpoints

### Accesibilidad (WCAG 2.2 AA)

- [ ] Ratio de contraste ≥ 4.5:1 para texto normal, ≥ 3:1 para texto grande
- [ ] Todos los elementos interactivos son accesibles por teclado (Tab, Enter, Espacio)
- [ ] Los íconos puramente decorativos tienen `aria-hidden="true"`
- [ ] Los íconos funcionales tienen `aria-label` descriptivo
- [ ] Imágenes con `alt` apropiado
- [ ] Formularios con `label` asociado a cada campo
- [ ] Sin trampas de teclado (keyboard traps)

### Tests (cuando aplica)

- [ ] Tests unitarios cubren la lógica nueva o modificada
- [ ] Los tests existentes siguen pasando

---

## Checklist de adopción de dependencias

Antes de agregar una nueva dependencia al workspace, verificar:

- [ ] **Necesidad**: ¿Existe una alternativa nativa (Web API, TypeScript) que evite la dependencia?
- [ ] **Licencia**: Compatible con el proyecto (MIT, Apache 2.0, ISC preferidos).
- [ ] **Mantenimiento**: ¿Tiene actividad reciente en el repo? ¿Sigue siendo mantenida?
- [ ] **Tamaño**: ¿El bundle size es razonable para el beneficio que aporta?
- [ ] **Tree-shaking**: ¿Soporta ES modules y tree-shaking?
- [ ] **TypeScript**: ¿Tiene tipos incluidos o `@types/` disponible?
- [ ] **Conflictos**: ¿Genera conflictos con dependencias existentes?
- [ ] **Documentación**: ¿Tiene documentación suficiente para que el equipo pueda usarla?
- [ ] **Wrapper**: Si es una librería UI externa, ¿se creó un wrapper para aislarla del resto del código?

---

## Recursos

- [Conventional Commits](https://www.conventionalcommits.org/)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/)
- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict)
- [ESLint v9 Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files)
