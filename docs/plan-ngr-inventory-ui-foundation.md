# Plan — NGR Inventory UI Foundation

## 1. Propósito del plan

Definir una **planeación amplia, progresiva y detallada** para construir `ngr-inventory-ui-foundation` como un **workspace UI propio del proyecto**, compuesto por:

- **Foundation Layer**
- **Prototype / Mockup Layer**

El plan busca permitir un desarrollo **paso a paso**, con entregables verificables, pruebas tempranas, refinamiento continuo de UX y una evolución ordenada hacia futuras implementaciones en Angular y React, sin convertir la base en un caos de decisiones improvisadas.

---

## 2. Objetivo estratégico del plan

Este plan deberá guiar la construcción de una base de UI que sea, al mismo tiempo:

1. **muy profesional** en lenguaje visual, consistencia y detalle
2. **muy responsive** en escritorio y tablet, con base preparada para adaptación móvil
3. **muy usable** en contexto administrativo y operativo
4. **muy modular** para evolucionar por partes
5. **muy testeable** para validar componentes, pantallas, flujos y estados
6. **muy apropiada para prototipado** sin backend real
7. **muy preparada** para futura extensión hacia catálogo visual y e-commerce

---

## 3. Principios de ejecución del plan

La ejecución del plan deberá obedecer estos principios:

### 3.1 Construcción por capas
No se deberá intentar “hacer toda la app de una vez”.

Se construirá en este orden lógico:

1. reglas de diseño
2. base técnica del workspace
3. theme y sistema visual
4. layout y componentes base
5. patrones operativos
6. mocks y contratos
7. mockups ejecutables por módulo
8. endurecimiento responsive, accesibilidad y testing
9. preparación para consumidores framework-specific
10. apertura futura a catálogo/e-commerce

### 3.2 Progreso demostrable
Cada fase deberá dejar un resultado **visible y ejecutable**, no solo arquitectura en documentos.

### 3.3 Vertical slices controlados
Aunque la base se construya por capas, los módulos del prototipo deberán avanzar como **rebanadas funcionales visibles** para poder probar UX real.

### 3.4 Calidad desde temprano
Responsive, accesibilidad, estados de error, consistencia y testabilidad no deberán dejarse “para el final”.

### 3.5 Foundation primero, mockups después
El prototipo deberá usar el foundation; no se deberá dejar que el foundation termine secuestrado por hacks del prototipo.

---

## 4. Base técnica y referencias normativas a respetar

Este plan deberá apoyarse en referencias sólidas y no en intuiciones aisladas.

### 4.1 Base visual y de layout
- **Bootstrap 5** como base de layout, responsive, utilidades y personalización por Sass.
- Bootstrap permite personalización por variables, mapas, mixins y funciones Sass, y sus breakpoints son configurables.  
  Referencias:  
  - https://getbootstrap.com/docs/5.3/customize/sass/  
  - https://getbootstrap.com/docs/5.0/layout/breakpoints/  
  - https://getbootstrap.com/docs/5.0/utilities/api/

### 4.2 Documentación visual y desarrollo aislado
- **Storybook** como entorno para construir y documentar componentes y páginas en aislamiento, incluyendo edge cases y estados difíciles.  
  Referencias:  
  - https://storybook.js.org/docs  
  - https://storybook.js.org/docs/writing-docs

### 4.3 Mocking por red y por contrato
- **MSW (Mock Service Worker)** como estrategia principal de mocking, por ser client-agnostic y reutilizable en browser, Node, tests y herramientas.  
  Referencias:  
  - https://mswjs.io/  
  - https://mswjs.io/docs/

### 4.4 Motor del prototipo y entorno dev
- **Vite** como base del `prototype-shell`, por su rapidez y facilidad para proyectos frontend modernos y despliegue estático.  
  Referencias:  
  - https://vite.dev/  
  - https://vite.dev/guide/  
  - https://vite.dev/guide/static-deploy

### 4.5 Testing
- **Vitest** para pruebas unitarias y de componentes por su integración con Vite.  
  Referencia: https://vitest.dev/guide/
- **Playwright** para recorridos E2E multi-browser y multi-device.  
  Referencias:  
  - https://playwright.dev/docs/intro  
  - https://playwright.dev/docs/browsers  
  - https://playwright.dev/docs/best-practices

### 4.6 Contratos de API
- **OpenAPI Generator** con salida neutral tipo `typescript-fetch` como base de contrato compartido.  
  Referencia: https://openapi-generator.tech/docs/generators/typescript-fetch/

### 4.7 Estándares de accesibilidad
- **WCAG 2.2** como referencia normativa mínima.  
  Referencias:  
  - https://www.w3.org/TR/WCAG22/  
  - https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/
- **WAI-ARIA Authoring Practices Guide (APG)** para patrones complejos de UI accesible.  
  Referencias:  
  - https://www.w3.org/WAI/ARIA/apg/  
  - https://www.w3.org/WAI/ARIA/apg/practices/

### 4.8 Referencias de sistema de diseño
- **Material Design 3** como referencia de foundations, styles y components, sin adoptarlo dogmáticamente.  
  Referencias:  
  - https://m3.material.io/  
  - https://m3.material.io/get-started  
  - https://m3.material.io/components
- **USWDS** como referencia de patrones y componentes orientados a claridad, accesibilidad y usabilidad.  
  Referencias:  
  - https://designsystem.digital.gov/  
  - https://designsystem.digital.gov/components/overview/  
  - https://designsystem.digital.gov/patterns/

### 4.9 Design tokens
- **Design Tokens Community Group** como referencia de interoperabilidad para tokens y futura portabilidad entre herramientas y plataformas.  
  Referencias:  
  - https://www.designtokens.org/  
  - https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/

---

## 5. Modelo general de ejecución

El plan se organizará en **corrientes de trabajo** y **fases progresivas**.

### 5.1 Corrientes de trabajo permanentes

1. **Gobierno del workspace**
2. **Diseño y sistema visual**
3. **Base técnica y tooling**
4. **Componentes y patrones**
5. **Mocking y contratos**
6. **Mockups ejecutables**
7. **Responsive y accesibilidad**
8. **Testing y calidad**
9. **Preparación multi-framework**
10. **Extensión futura hacia e-commerce**

### 5.2 Enfoque incremental
Cada fase deberá:
- tener objetivos claros
- dejar entregables concretos
- ser demostrable
- reducir incertidumbre
- habilitar la fase siguiente

---

## 6. Estructura sugerida del workspace a materializar

```text
ngr-inventory-ui-foundation/
  apps/
    prototype-shell/
    angular-demo/
    react-demo/
  packages/
    design-tokens/
    bootstrap-theme/
    ui-core/
    ui-patterns/
    api-contracts/
    api-mocks/
    screen-specs/
    docs-site/
  docs/
    architecture/
    ux/
    accessibility/
    components/
    decisions/
```

### 6.1 Interpretación operativa
- `prototype-shell`: app ejecutable neutra para mockups
- `angular-demo`: consumidor de prueba para validar portabilidad hacia Angular
- `react-demo`: consumidor de prueba para validar portabilidad hacia React
- `design-tokens`: fuente de verdad visual
- `bootstrap-theme`: capa Sass/Bootstrap del proyecto
- `ui-core`: componentes base
- `ui-patterns`: patrones de layout, formularios, tablas y shell
- `api-contracts`: contratos de integración y tipado
- `api-mocks`: escenarios y handlers mock
- `screen-specs`: documentación visual y estados de páginas
- `docs-site`: portal técnico o Storybook/docs extendidos

---

## 7. Estrategia general de librerías

## 7.1 Librerías base a introducir en el plan

### Base estable
- Bootstrap 5
- Bootstrap Icons
- Sass
- Storybook
- MSW
- Vite
- Vitest
- Playwright
- OpenAPI Generator

### Librerías de interacción y formularios
- SweetAlert2
- Floating UI
- flatpickr
- IMask
- Choices.js

### Librerías opcionales según fase
- TanStack Table **o** Tabulator
- Apache ECharts

### Librerías futuras orientadas a catálogo/e-commerce
- Embla Carousel
- PhotoSwipe
- FilePond
- SortableJS
- Fuse.js

## 7.2 Regla de adopción
Ninguna librería deberá entrar por capricho estético. Cada incorporación deberá justificar:
- problema resuelto
- nivel de acoplamiento
- costo de mantenimiento
- impacto en portabilidad
- impacto en accesibilidad
- impacto en bundle y complejidad

---

## 8. Plan maestro por fases

# Fase 0 — Aterrizaje, gobierno y criterios de trabajo

## Objetivo
Preparar el terreno del proyecto para evitar que el foundation nazca ya desordenado.

## Actividades
1. Crear repositorio o workspace base del proyecto.
2. Definir naming oficial del repositorio, paquetes y apps.
3. Definir convenciones de ramas, commits y estructura documental.
4. Definir licencia interna del proyecto y política de terceros.
5. Crear carpeta `docs/` con secciones mínimas:
   - architecture
   - ux
   - accessibility
   - decisions
   - components
6. Crear `THIRD_PARTY_NOTICES.md`.
7. Crear checklist de incorporación de dependencias.
8. Definir política de “no hacks persistentes en foundation”.
9. Definir política de versionado interno del workspace.
10. Definir principio de “prototype consumes foundation”.
11. Definir formato de ADR/decision record.
12. Definir criterios de done por paquete.
13. Definir checklist de revisión visual por PR.
14. Definir checklist de revisión responsive por PR.
15. Definir checklist de revisión accesible por PR.

## Entregables
- repo inicial
- documentación base
- convenciones de trabajo
- tablero maestro de epics y actividades

## Criterio de cierre
Existe estructura mínima del proyecto y reglas claras de ejecución antes de escribir UI real.

---

# Fase 1 — Descubrimiento visual y modelado del lenguaje de interfaz

## Objetivo
Definir el lenguaje visual y operativo del proyecto antes de crear componentes.

## Actividades
1. Levantar inventario de pantallas requeridas desde el frontend de inventario.
2. Clasificar pantallas por prioridad:
   - críticas
   - operativas frecuentes
   - administrativas
   - analíticas/reportes
3. Clasificar patrones repetitivos esperados:
   - tabla con filtros
   - formulario maestro
   - formulario modal
   - detalle con tabs
   - dashboard con cards y charts
   - listado con acciones masivas
   - confirmación destructiva
4. Definir tono visual del sistema:
   - sobrio
   - profesional
   - administrativo
   - moderno, no recargado
5. Definir principios de UX:
   - claridad operativa
   - consistencia
   - densidad visual controlada
   - feedback rápido
   - jerarquía visual limpia
6. Definir tipografía base.
7. Definir paleta primaria y secundaria.
8. Definir escala de neutros.
9. Definir escala de estados:
   - success
   - warning
   - danger
   - info
   - muted
10. Definir reglas de elevación y sombras.
11. Definir radios y bordes.
12. Definir densidad de formularios y tablas.
13. Definir lineamientos de iconografía.
14. Definir criterios de uso de color semántico.
15. Definir “qué NO será” visualmente:
   - no dashboard carnavalesco
   - no tablas saturadas
   - no modales gigantes sin foco
   - no exceso de charts inútiles
16. Revisar Material 3, USWDS y Bootstrap como fuentes de referencia para foundations, components y patterns.
17. Convertir esas referencias en reglas propias del proyecto, no en copia literal.

## Entregables
- brief visual del sistema
- catálogo inicial de patrones UI
- primeros moodboards funcionales
- decisiones visuales base

## Criterio de cierre
Existe un lenguaje visual definido y suficiente para comenzar el sistema de diseño propio.

---

# Fase 2 — Sistema de diseño y design tokens

## Objetivo
Formalizar el sistema visual en tokens reutilizables y controlables.

## Actividades
1. Crear paquete `design-tokens/`.
2. Definir estructura de tokens:
   - color
   - typography
   - spacing
   - radius
   - shadow
   - border
   - z-index
   - size
   - motion
3. Definir tokens semánticos y tokens base.
4. Separar tokens crudos vs tokens de intención.
5. Definir nomenclatura consistente para tokens.
6. Definir reglas de escalas:
   - spacing 4/8-based
   - tipos de control heights
   - tamaños de ícono
7. Definir tokens por estado.
8. Definir tokens para tablas.
9. Definir tokens para formularios.
10. Definir tokens para overlays.
11. Definir tokens para navegación.
12. Definir tokens para responsive breakpoints.
13. Definir tokens para data density.
14. Crear documentación de tokens con ejemplos.
15. Alinear la forma de tokens con prácticas compatibles con DTCG.
16. Preparar salida a CSS variables.
17. Preparar salida a SCSS maps/variables.
18. Preparar salida a JSON consumible por herramientas.
19. Crear reglas de gobernanza de tokens:
   - quién crea
   - quién modifica
   - cuándo deprecarlos
20. Crear versión inicial estable de tokens.

## Entregables
- paquete `design-tokens`
- estructura tokenizada del sistema
- documentación de tokens

## Criterio de cierre
Existe una fuente de verdad visual reutilizable y no dependiente de copiar valores sueltos por toda la UI.

---

# Fase 3 — Bootstrap Theme propio del proyecto

## Objetivo
Construir una capa de theme propia encima de Bootstrap, sin depender de plantillas de terceros.

## Actividades
1. Crear paquete `bootstrap-theme/`.
2. Configurar Bootstrap vía Sass, no por CSS improvisado.
3. Definir `custom.scss` principal.
4. Mapear tokens a variables Bootstrap cuando aplique.
5. Sobrescribir colores de theme.
6. Sobrescribir breakpoints solo si hay justificación.
7. Ajustar tipografía base.
8. Ajustar tamaños de botones.
9. Ajustar tamaños de inputs.
10. Ajustar estilos de alerts, badges y cards.
11. Crear utilidades propias del proyecto con Utility API de Bootstrap cuando convenga.
12. Definir clases de layout compartidas.
13. Definir clases utilitarias de data density.
14. Definir estilos base de tablas.
15. Definir estilos base de formularios.
16. Definir estilos base de estados empty/error/loading.
17. Validar modo dark como decisión futura, no asumirlo de entrada.
18. Crear preview visual del theme.
19. Medir conflictos con librerías complementarias.
20. Documentar reglas de override permitidas y prohibidas.

## Entregables
- paquete `bootstrap-theme`
- theme operativo del proyecto
- preview del theme

## Criterio de cierre
Bootstrap ya luce y se comporta como NGR Inventory, no como Bootstrap “de fábrica”.

---

# Fase 4 — Base técnica del workspace y entorno ejecutable

## Objetivo
Preparar la infraestructura técnica que soportará foundation, documentación, mocks y prototipo.

## Actividades
1. Crear `prototype-shell` con Vite.
2. Configurar TypeScript estricto.
3. Configurar linting y formatting.
4. Configurar alias de rutas.
5. Configurar estructura de paquetes compartidos.
6. Configurar scripts base del workspace.
7. Configurar builds por paquete.
8. Configurar Storybook para documentación visual.
9. Configurar Vitest.
10. Configurar Playwright.
11. Configurar pipeline de verificación local mínima.
12. Configurar pipeline de build de docs.
13. Preparar static deploy del prototipo.
14. Preparar static deploy/documentación de Storybook.
15. Crear entorno de variables para mocks y contratos.
16. Definir política de feature flags solo si aporta.
17. Crear esqueleto de `angular-demo` y `react-demo` aunque inicialmente sean mínimos.
18. Definir interfaz mínima entre foundation y consumidores.

## Entregables
- workspace ejecutable
- prototipo shell arrancando
- Storybook operativo
- testing base operativo

## Criterio de cierre
Ya existe base técnica real para desarrollar el foundation sin rehacer tooling después.

---

# Fase 5 — Layout administrativo y app shell

## Objetivo
Construir el esqueleto operativo de la aplicación administrativa.

## Actividades
1. Diseñar `AppShell`.
2. Diseñar `Sidebar`.
3. Diseñar `Topbar`.
4. Diseñar `PageHeader`.
5. Diseñar `Breadcrumbs`.
6. Diseñar `SectionHeader`.
7. Diseñar área de contenido principal.
8. Diseñar layout para auth.
9. Diseñar layout para páginas de error.
10. Diseñar layout para pantallas densas.
11. Diseñar versión responsive de sidebar:
    - escritorio expandido
    - escritorio colapsado
    - tablet overlay o drawer
12. Definir comportamiento de topbar en responsive.
13. Definir manejo de scroll interior vs scroll página.
14. Definir zonas seguras para tablas largas.
15. Definir patrón sticky para acciones principales si se requiere.
16. Probar shell con contenido de relleno realista.
17. Validar shell con navegación simulada de múltiples módulos.
18. Validar foco, landmarks, jerarquía semántica y accesibilidad.
19. Documentar cuándo usar cada variante del shell.

## Entregables
- `AppShell`
- layouts base
- navegación mock inicial

## Criterio de cierre
El prototipo ya tiene una estructura administrativa profesional y usable sin depender aún del detalle de cada módulo.

---

# Fase 6 — UI Core: componentes base del sistema

## Objetivo
Construir la librería base de componentes reutilizables del proyecto.

## Actividades
1. Crear button base.
2. Crear icon button.
3. Crear text input.
4. Crear textarea.
5. Crear select simple.
6. Crear checkbox.
7. Crear radio.
8. Crear switch/toggle.
9. Crear badge.
10. Crear alert.
11. Crear helper text / validation text.
12. Crear card base.
13. Crear stat card base.
14. Crear divider.
15. Crear spinner / skeleton loader.
16. Crear empty state base.
17. Crear error state base.
18. Crear no-results state.
19. Crear chips/tags operativos.
20. Crear avatar/identity block básico.
21. Crear toolbar action group.
22. Crear dropdown básico.
23. Crear tooltip/popover wrapper.
24. Crear modal base.
25. Crear drawer base si aplica.
26. Crear confirm dialog wrapper con SweetAlert2 o wrapper propio.
27. Crear notification/toast wrapper.
28. Documentar props, variantes y restricciones.
29. Crear stories de todos los componentes.
30. Cubrir estados:
    - default
    - hover
    - focus
    - disabled
    - loading
    - error
    - success

## Entregables
- paquete `ui-core`
- catálogo inicial de componentes
- stories base

## Criterio de cierre
El proyecto cuenta con un set coherente de componentes base propios y documentados.

---

# Fase 7 — UI Patterns: patrones operativos reutilizables

## Objetivo
Construir piezas de mayor nivel que resuelvan problemas repetitivos de una app administrativa.

## Actividades
1. Crear `DataTableShell`.
2. Crear `FilterBar`.
3. Crear `SearchBar`.
4. Crear `BulkActionsBar`.
5. Crear `PaginationBar`.
6. Crear `DataToolbar`.
7. Crear `FormShell`.
8. Crear `FormSection`.
9. Crear `FormActionsFooter`.
10. Crear `MasterDetailLayout`.
11. Crear `TabsPattern`.
12. Crear `SummaryPanel`.
13. Crear `StatsGrid`.
14. Crear `AuditTimeline` base.
15. Crear `KeyValueDetails`.
16. Crear `StatusPill`.
17. Crear `ConfirmActionPattern`.
18. Crear `DestructiveActionPattern`.
19. Crear `AsyncFeedbackPattern`.
20. Crear `ExportFlowPattern`.
21. Crear `PermissionAwareActionGroup`.
22. Crear `NoPermissionState`.
23. Crear `LoadingOverlayPattern`.
24. Crear `RetryableErrorPattern`.
25. Crear `InlineValidationPattern`.
26. Crear `SectionEmptyStatePattern`.
27. Crear `KPIHeaderPattern` para dashboards.
28. Crear `EntityListPagePattern`.
29. Crear `EntityFormPagePattern`.
30. Documentar patrón, propósito, do/don’t, ejemplos y accesibilidad.

## Entregables
- paquete `ui-patterns`
- patrones documentados y demostrables

## Criterio de cierre
Las pantallas ya no tendrán que resolverse a punta de improvisación manual componente por componente.

---

# Fase 8 — Estrategia de tablas, formularios complejos y data-heavy UI

## Objetivo
Resolver con seriedad los patrones más delicados de una app de inventario: tablas y formularios complejos.

## Actividades
1. Elegir estrategia oficial de tabla:
   - TanStack Table o Tabulator
2. Documentar la razón de la elección.
3. Crear wrapper o integración propia de la tabla elegida.
4. Definir columnas, formatos y acciones por fila.
5. Definir manejo de selección simple y múltiple.
6. Definir paginación server-side simulada.
7. Definir filtros rápidos y filtros avanzados.
8. Definir ordenamiento.
9. Definir estados de tabla:
   - loading
   - empty
   - no-results
   - error
10. Definir patrón de densidad de tabla.
11. Definir estrategia para tablas muy anchas.
12. Definir patrón sticky para columnas o headers si se requiere.
13. Definir comportamiento responsive de tablas.
14. Definir cuándo usar tabla vs cards/lista responsive.
15. Definir wrapper de datepicker con flatpickr.
16. Definir wrapper de masks con IMask.
17. Definir wrapper de selects enriquecidos con Choices.js.
18. Definir comportamiento de validación en formularios largos.
19. Definir composición de formularios por secciones.
20. Definir estrategia de confirmación previa a acciones sensibles.
21. Definir comportamiento de submit loading.
22. Definir preservación de datos ante error recuperable.
23. Definir formularios con maestro-detalle para movimientos.
24. Definir reglas de edición inline si se usarán.
25. Crear stories y demos específicas para tablas y formularios pesados.

## Entregables
- patrón oficial de tablas
- wrappers formales para date, mask y select
- formularios complejos demostrables

## Criterio de cierre
La app ya puede representar de forma seria listados y formularios densos, que son el corazón de un inventario.

---

# Fase 9 — Contratos de API y estrategia de mocks

## Objetivo
Construir la capa que permite simular el comportamiento del sistema sin backend real, de forma limpia y reusable.

## Actividades
1. Crear paquete `api-contracts`.
2. Traducir la superficie esperada del frontend a contratos base.
3. Definir shape de respuestas de éxito.
4. Definir shape de errores tipo Problem Details.
5. Definir shape de paginación.
6. Definir shape de filtros.
7. Definir shape de exportaciones.
8. Definir shape de permisos efectivos.
9. Definir shape de usuario autenticado.
10. Definir shape de productos, categorías, proveedores, almacenes, ubicaciones, movimientos, stock, conteos, usuarios, roles, permisos, reportes, auditoría.
11. Preparar generación o soporte desde OpenAPI cuando exista contrato formal.
12. Crear paquete `api-mocks`.
13. Configurar MSW en browser.
14. Configurar MSW para tests.
15. Crear fixtures por dominio.
16. Crear factories/builders para datos mock.
17. Crear escenarios de éxito.
18. Crear escenarios de vacío.
19. Crear escenarios de 401.
20. Crear escenarios de 403.
21. Crear escenarios de 404.
22. Crear escenarios de 409.
23. Crear escenarios de 422.
24. Crear escenarios de 500.
25. Crear escenarios de latencia artificial.
26. Crear escenarios de permisos distintos por usuario.
27. Crear escenarios de exportación síncrona y asíncrona simulada.
28. Crear documentación de handlers y escenarios.
29. Prohibir mocks incrustados dentro de componentes visuales.

## Entregables
- contratos base
- paquete MSW operativo
- catálogo de escenarios mock

## Criterio de cierre
El prototipo puede comportarse como una app real sin necesitar backend, y además esos mocks son reutilizables en demos y tests.

---

# Fase 10 — Storybook y documentación viva del sistema

## Objetivo
Usar Storybook no solo como galería de componentes, sino como documentación viva del foundation y los mockups.

## Actividades
1. Organizar Storybook por capas:
   - tokens
   - ui-core
   - ui-patterns
   - pages/screens
2. Documentar componentes base.
3. Documentar variantes.
4. Documentar estados extremos.
5. Documentar reglas de uso.
6. Documentar anti-patrones.
7. Crear stories de pantallas completas.
8. Crear stories de auth.
9. Crear stories de dashboard.
10. Crear stories de productos.
11. Crear stories de movimientos.
12. Crear stories de stock.
13. Crear stories de conteos.
14. Crear stories de usuarios/roles.
15. Crear stories de reportes.
16. Crear stories de auditoría.
17. Asociar historias a escenarios MSW.
18. Crear docs page por componente crítico.
19. Crear docs page por patrón crítico.
20. Crear docs page por pantalla.
21. Crear índice navegable de componentes.
22. Crear índice navegable de patrones.
23. Crear índice navegable de mockups.
24. Preparar Storybook como sitio de referencia del sistema.

## Entregables
- Storybook usable como portal de documentación
- librería y pantallas visibles en aislamiento

## Criterio de cierre
Ya existe una fuente viva de referencia para diseñar, desarrollar, revisar y mantener consistencia.

---

# Fase 11 — Prototype Shell: navegación y experiencia base

## Objetivo
Convertir el workspace en una app de mockups navegable y convincente.

## Actividades
1. Implementar routing del prototipo.
2. Definir mapa de navegación general.
3. Crear menú inicial por módulos.
4. Crear breadcrumbs dinámicos mock.
5. Crear perfiles de usuario mock.
6. Simular visibilidad por permisos.
7. Simular shell con data de sesión.
8. Simular estados de notificación global.
9. Simular navegación entre pantallas principales.
10. Crear páginas base de error:
    - 401
    - 403
    - 404
    - 500
11. Crear páginas base de auth:
    - login
    - forgot password
    - reset password
12. Validar navegación completa de escritorio.
13. Validar navegación completa de tablet.
14. Validar overlay de sidebar, focus y accesibilidad.
15. Medir coherencia visual general.

## Entregables
- prototipo shell navegable
- shell de autenticación
- shell administrativo

## Criterio de cierre
Ya existe una “app” demostrable y no solo un set de componentes aislados.

---

# Fase 12 — Mockups operativos: Autenticación y sesión

## Objetivo
Resolver el primer vertical slice funcional visible: auth y sesión.

## Actividades
1. Diseñar login.
2. Diseñar forgot password.
3. Diseñar reset password.
4. Diseñar sesión expirada.
5. Diseñar acceso no autorizado.
6. Diseñar feedback de credenciales inválidas.
7. Diseñar loading de login.
8. Diseñar remember-me si aplica.
9. Diseñar bloqueos de doble submit.
10. Simular `/auth/login`, `/auth/logout`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/me`.
11. Crear escenarios de usuario administrador.
12. Crear escenarios de operador.
13. Crear escenarios de consulta.
14. Crear escenarios de expiración de sesión.
15. Crear pruebas de flujo auth en Playwright.
16. Crear stories de auth con todos los estados.

## Entregables
- módulo mock de auth completamente navegable

## Criterio de cierre
Se puede “entrar” al prototipo y vivir el flujo base de autenticación como si fuera una app real.

---

# Fase 13 — Mockups operativos: Dashboard

## Objetivo
Construir un dashboard inicial sobrio, útil y no ornamental.

## Actividades
1. Definir KPIs mínimos del dashboard.
2. Crear cards de métricas.
3. Crear panel de alertas.
4. Crear panel de movimientos recientes.
5. Crear panel de accesos rápidos.
6. Evaluar incorporación de ECharts para métricas visuales.
7. Diseñar layout responsive del dashboard.
8. Diseñar loading del dashboard.
9. Diseñar empty/partial failure states del dashboard.
10. Diseñar fallback cuando falle un widget y no toda la pantalla.
11. Crear escenarios por perfil de usuario.
12. Crear datos mock de dashboard.
13. Crear pruebas visuales del dashboard.
14. Documentar reglas de qué información sí/no debe ir en dashboard.

## Entregables
- dashboard mock operativo y usable

## Criterio de cierre
Existe home administrativa funcional y consistente con el sistema, sin convertirla en un Power BI improvisado.

---

# Fase 14 — Mockups operativos: Catálogo base

## Objetivo
Construir las pantallas de catálogo para productos, categorías y proveedores.

## Actividades
1. Crear lista de productos.
2. Crear filtros de productos.
3. Crear búsqueda de productos.
4. Crear detalle de producto.
5. Crear crear/editar producto.
6. Crear estados de producto activo/inactivo.
7. Crear vista de stock del producto.
8. Crear vista de historial/kardex resumido del producto.
9. Crear lista de categorías.
10. Crear crear/editar categoría.
11. Crear advertencia de impacto por categoría asociada.
12. Crear lista de proveedores.
13. Crear crear/editar proveedor.
14. Crear relación producto-proveedor mock.
15. Crear estados vacíos y no-results.
16. Crear escenarios de 422 en formularios.
17. Crear escenarios de 409 por SKU duplicado mock.
18. Crear pruebas de recorrido catálogo.
19. Crear stories por pantalla.
20. Validar densidad de tablas y formularios.

## Entregables
- módulo de catálogo mock operativo

## Criterio de cierre
El núcleo maestro del inventario ya existe visual y funcionalmente en el prototipo.

---

# Fase 15 — Mockups operativos: Almacenes, ubicaciones y stock

## Objetivo
Construir la parte espacial/operativa del inventario.

## Actividades
1. Crear lista de almacenes.
2. Crear crear/editar almacén.
3. Crear lista de ubicaciones por almacén.
4. Crear crear/editar ubicación.
5. Crear vista de stock consolidado.
6. Crear vista de stock por almacén.
7. Crear vista de stock por ubicación.
8. Crear alertas de bajo stock.
9. Crear filtros por almacén, ubicación, estado.
10. Diseñar tabla de stock responsiva.
11. Diseñar indicadores semánticos de disponibilidad.
12. Simular escenarios de bajo stock.
13. Simular escenarios de ausencia de stock.
14. Simular escenarios de acceso restringido.
15. Crear pruebas de flujos de stock.

## Entregables
- módulo mock de almacenes/ubicaciones/stock

## Criterio de cierre
El prototipo ya permite entender cómo se consultará y navegará el inventario en sus dimensiones operativas.

---

# Fase 16 — Mockups operativos: Movimientos y kardex

## Objetivo
Resolver el corazón operativo del sistema: entradas, salidas, traslados, ajustes y trazabilidad.

## Actividades
1. Diseñar lista de movimientos.
2. Diseñar filtros de movimientos.
3. Diseñar detalle de movimiento.
4. Diseñar formulario de entrada.
5. Diseñar formulario de salida.
6. Diseñar formulario de traslado.
7. Diseñar formulario de ajuste.
8. Diseñar maestro-detalle de ítems.
9. Diseñar confirmación previa a registrar movimiento.
10. Diseñar feedback posterior al registro.
11. Simular validación de stock insuficiente.
12. Simular validación de origen/destino inválido.
13. Simular validación de cantidades inválidas.
14. Simular conflicto de concurrencia o stock cambiante.
15. Diseñar vista de kardex por producto.
16. Diseñar filtros por fecha, tipo, usuario, almacén.
17. Validar legibilidad de trazabilidad histórica.
18. Crear pruebas E2E de flujos de movimiento.
19. Crear stories por tipo de movimiento y error.
20. Validar accesibilidad de formularios densos.

## Entregables
- módulo mock de movimientos y kardex

## Criterio de cierre
Existe una simulación convincente del flujo más crítico del sistema.

---

# Fase 17 — Mockups operativos: Conteos y conciliación

## Objetivo
Construir la UX del ciclo de conteos físicos y ajustes derivados.

## Actividades
1. Crear lista de conteos.
2. Crear crear conteo.
3. Crear detalle de conteo.
4. Crear carga/edición de cantidades contadas.
5. Crear comparación teórico vs contado.
6. Crear vista de diferencias.
7. Crear patrón visual de discrepancia.
8. Crear cierre de conteo.
9. Crear confirmación de conciliación.
10. Simular conteo cerrado.
11. Simular conteo con conflictos.
12. Simular generación de ajuste derivado.
13. Crear pruebas de flujo de conteos.
14. Crear stories y casos límite.

## Entregables
- módulo mock de conteos

## Criterio de cierre
Los flujos de conciliación ya están visualizados y probados antes de ir al frontend final real.

---

# Fase 18 — Mockups operativos: Usuarios, roles, permisos y auditoría

## Objetivo
Construir la experiencia administrativa de acceso y trazabilidad.

## Actividades
1. Crear lista de usuarios.
2. Crear crear/editar usuario.
3. Crear activación/desactivación de usuario.
4. Crear asignación de roles.
5. Crear lista de roles.
6. Crear crear/editar rol.
7. Crear asignación de permisos a roles.
8. Crear visualización de permisos efectivos.
9. Crear pantalla de auditoría operativa.
10. Crear timeline o tabla de auditoría.
11. Crear filtros por acción, usuario, entidad y fecha.
12. Simular perfiles con distintos permisos.
13. Simular acciones no autorizadas.
14. Simular vista con campos solo lectura.
15. Crear pruebas E2E de restricción visual y navegación.
16. Documentar patrón de permission-aware rendering.

## Entregables
- módulo mock de administración y auditoría

## Criterio de cierre
La UI ya representa de forma coherente el gobierno operativo del sistema.

---

# Fase 19 — Mockups operativos: Reportes y exportaciones

## Objetivo
Resolver UX de reportes y exportación antes de conectarse a backend real.

## Actividades
1. Diseñar catálogo de reportes.
2. Diseñar filtros por reporte.
3. Diseñar tabla o vista previa de resultados.
4. Diseñar exportación inmediata.
5. Diseñar exportación en segundo plano simulada.
6. Diseñar feedback de progreso.
7. Diseñar feedback de éxito.
8. Diseñar feedback de error.
9. Diseñar restricción por permisos.
10. Simular download mock o job mock.
11. Diseñar estados de reportes vacíos.
12. Diseñar reporte de stock.
13. Diseñar reporte de movimientos.
14. Diseñar reporte de kardex.
15. Diseñar reporte de low stock.
16. Crear pruebas de recorrido de reportes.
17. Documentar patrón de exportación del sistema.

## Entregables
- módulo mock de reportes y exportaciones

## Criterio de cierre
La app ya permite validar UX realista para una de las zonas más sensibles y propensas a mala experiencia.

---

# Fase 20 — Responsive hardening

## Objetivo
Convertir el foundation y los mockups en una base realmente responsive, no solo “que no explote”.

## Actividades
1. Definir matriz oficial de breakpoints de revisión.
2. Revisar shell en escritorio.
3. Revisar shell en laptop pequeña.
4. Revisar shell en tablet landscape.
5. Revisar shell en tablet portrait.
6. Revisar auth en viewport reducido.
7. Revisar dashboard en ancho medio.
8. Revisar tablas complejas en tablet.
9. Revisar formularios largos en tablet.
10. Definir reglas de colapso de filtros.
11. Definir reglas de wrap para toolbars.
12. Definir reglas de densidad en tablet.
13. Definir cuándo una tabla se vuelve cards/lista.
14. Ajustar touch targets donde sea necesario.
15. Revisar overlays, drawers y modales.
16. Ajustar spacing y jerarquía en viewports medios.
17. Crear checklist responsive por componente.
18. Crear checklist responsive por pantalla.
19. Probar en Playwright con dispositivos emulados.

## Entregables
- base responsive endurecida
- reporte de ajustes responsive

## Criterio de cierre
El sistema ya se comporta profesionalmente en escritorio y tablet, sin improvisaciones gruesas.

---

# Fase 21 — Accesibilidad y usabilidad profunda

## Objetivo
Endurecer la base con criterios reales de accesibilidad y usabilidad profesional.

## Actividades
1. Revisar landmarks semánticos.
2. Revisar estructura de headings.
3. Revisar foco visible.
4. Revisar orden de tabulación.
5. Revisar contraste.
6. Revisar labels y descripciones en formularios.
7. Revisar mensajes de error accesibles.
8. Revisar componentes ARIA complejos usando APG como referencia.
9. Revisar tablas con lectores de pantalla.
10. Revisar diálogos/modales.
11. Revisar dropdowns y popovers.
12. Revisar notificaciones y anuncios dinámicos.
13. Revisar navegación por teclado.
14. Revisar consistencia de feedback.
15. Revisar confirmaciones destructivas.
16. Aplicar heurísticas de usabilidad a pantallas críticas.
17. Corregir fricción cognitiva en formularios y tablas.
18. Documentar recomendaciones de contenido microcopy si aplica.
19. Consolidar checklist WCAG/APG interno del proyecto.

## Entregables
- reporte de accesibilidad y usabilidad
- ajustes aplicados
- checklist interno reusable

## Criterio de cierre
La base deja de ser solo “bonita” y pasa a ser usable con rigor.

---

# Fase 22 — Testing y aseguramiento de calidad continuo

## Objetivo
Hacer que el foundation y el prototipo sean confiables y mantenibles.

## Actividades
1. Definir pirámide de testing del workspace.
2. Crear tests unitarios para tokens/helpers críticos.
3. Crear tests unitarios para wrappers.
4. Crear tests de componentes base.
5. Crear tests de patrones operativos.
6. Crear tests de stories críticas si aplica.
7. Crear tests de accesibilidad automatizable donde tenga sentido.
8. Crear tests E2E de auth.
9. Crear tests E2E de catálogo.
10. Crear tests E2E de movimientos.
11. Crear tests E2E de stock.
12. Crear tests E2E de reportes.
13. Crear tests E2E de permisos.
14. Definir snapshots o estrategias visuales solo si aportan.
15. Definir cobertura mínima razonable.
16. Definir política de regresión visual/manual.
17. Integrar verificación en CI.
18. Documentar cómo correr suites locales y rápidas.

## Entregables
- suite de testing del workspace
- pipeline de calidad mínima

## Criterio de cierre
El proyecto ya no depende solo de “yo lo probé y parece estar bien”.

---

# Fase 23 — Preparación para consumidores Angular y React

## Objetivo
Asegurar que el foundation sirva realmente como base para distintas implementaciones frontend.

## Actividades
1. Crear `angular-demo` mínimo.
2. Integrar theme Bootstrap y tokens en Angular.
3. Validar consumo de estilos y assets.
4. Validar wrappers o adaptadores necesarios para Angular.
5. Validar compatibilidad con standalone components y arquitectura feature-first.
6. Crear `react-demo` mínimo.
7. Integrar theme Bootstrap y tokens en React.
8. Validar consumo de estilos y assets.
9. Validar mocks y contratos en ambos consumers.
10. Validar que lo framework-specific no invada el foundation.
11. Documentar diferencias de adopción por framework.
12. Documentar qué se comparte y qué no.
13. Documentar limitaciones de portabilidad.
14. Crear ejemplos mínimos de pantalla en Angular y React consumiendo foundation.

## Entregables
- demos base en Angular y React
- guía de consumo del foundation

## Criterio de cierre
La promesa de “foundation multi-framework” ya fue comprobada en algo real, aunque sea a escala controlada.

---

# Fase 24 — Preparación futura hacia catálogo visual y e-commerce

## Objetivo
Dejar el foundation listo para crecer hacia una capa futura de visualización comercial de productos.

## Actividades
1. Analizar diferencias entre admin UI y catálogo/e-commerce UI.
2. Definir qué tokens y patrones ya sirven para ambos mundos.
3. Definir qué piezas nuevas harían falta para catálogo:
   - product card comercial
   - gallery
   - carousel
   - lightbox
   - image uploader
   - product media manager
4. Evaluar incorporación futura de Embla Carousel.
5. Evaluar incorporación futura de PhotoSwipe.
6. Evaluar incorporación futura de FilePond.
7. Evaluar incorporación futura de SortableJS.
8. Evaluar incorporación futura de Fuse.js para prototipos de búsqueda local.
9. Diseñar concepto inicial de “admin product detail” vs “commerce product card”.
10. Documentar riesgos de mezclar demasiado pronto UX administrativa y UX comercial.
11. Crear backlog futuro de e-commerce foundation, sin contaminar el alcance actual.

## Entregables
- documento de preparación futura hacia catálogo/e-commerce
- backlog de extensión futura

## Criterio de cierre
La base actual queda lista para evolucionar después sin tener que rehacerse desde cero.

---

## 9. Actividades transversales permanentes

Estas actividades deberán ejecutarse durante casi todo el plan, no en una sola fase.

### 9.1 Documentación continua
- actualizar decisiones
- actualizar reglas de uso
- actualizar componentes y patrones
- actualizar historias de Storybook
- actualizar límites y anti-patrones

### 9.2 Higiene de dependencias
- revisar necesidad real de cada dependencia
- revisar licencias
- revisar compatibilidad con Angular/React
- revisar salud del proyecto externo

### 9.3 Revisión visual continua
- revisar consistencia
- revisar densidad
- revisar jerarquía
- revisar iconografía
- revisar microinteracciones

### 9.4 Revisión de performance razonable
- no abusar de librerías pesadas sin motivo
- vigilar bundle del prototipo
- vigilar peso de librerías de charts/tablas
- vigilar tamaño de assets visuales

### 9.5 Revisión de accesibilidad
- mantener la deuda visible
- no aceptar componentes nuevos sin revisión mínima

---

## 10. Orden recomendado de validación progresiva

Para que el desarrollo sea realmente incremental, cada bloque importante deberá dejar una demo visible.

### Hitos sugeridos
1. **Hito A** — Theme + shell visibles
2. **Hito B** — UI core y patterns documentados
3. **Hito C** — mocks operativos y Storybook serio
4. **Hito D** — auth + dashboard
5. **Hito E** — catálogo base
6. **Hito F** — stock y ubicaciones
7. **Hito G** — movimientos y kardex
8. **Hito H** — conteos
9. **Hito I** — usuarios/roles/auditoría
10. **Hito J** — reportes/exportaciones
11. **Hito K** — responsive hardening
12. **Hito L** — accesibilidad y testing maduros
13. **Hito M** — demos Angular y React
14. **Hito N** — backlog preparado para e-commerce

---

## 11. Definición de “muy profesional” para esta planeación

Como el objetivo declarado es una UI muy profesional, este plan considerará “profesional” una UI que cumpla, como mínimo, con lo siguiente:

1. lenguaje visual consistente
2. densidad administrativa bien resuelta
3. responsive de verdad en escritorio y tablet
4. accesibilidad razonable y deliberada
5. feedback claro y sobrio
6. estados de error bien diseñados
7. tablas y formularios pensados para operación real
8. navegación limpia y predecible
9. permisos visibles correctamente sin falsa seguridad
10. documentación viva y reusable
11. facilidad para migrar o consumir desde Angular/React
12. extensibilidad futura sin rehacer la base

---

## 12. Riesgos principales a vigilar durante la ejecución

1. convertir el foundation en una app monolítica disfrazada
2. meter demasiadas librerías por ansiedad de “completitud”
3. confundir mockup con foundation
4. sobrecomplicar tablas antes de validar UX real
5. construir demasiados componentes antes de definir patrones
6. abandonar responsive hasta el final
7. abandonar accesibilidad hasta el final
8. permitir mocks incrustados en componentes visuales
9. mezclar cosas específicas de Angular/React dentro del foundation base
10. intentar resolver e-commerce demasiado pronto

---

## 13. Criterios de éxito global del plan

El plan se considerará bien ejecutado cuando, al finalizar sus bloques principales, exista:

1. un workspace estable y bien estructurado
2. un sistema de diseño propio y documentado
3. un theme Bootstrap genuinamente propio del proyecto
4. componentes base y patrones reutilizables
5. mocks de API serios y reusables
6. Storybook como documentación viva
7. una app ejecutable de mockups que cubra el inventario administrativo
8. responsive sólido
9. accesibilidad razonable y defendible
10. testing suficiente para evolucionar sin romperlo todo
11. consumidores demostrativos en Angular y React
12. una base lista para abrir la puerta a catálogo/e-commerce después

---

## 14. Cierre

Este plan no está diseñado para “sacar pantallas rápido” sin pensar. Está diseñado para construir una **base UI seria, profesional, usable, incremental y durable**.

La secuencia correcta no será:

> hago unas pantallas bonitas, luego veo cómo ordenarlas.

La secuencia correcta será:

> construyo una base propia, verificable y reusable, y luego hago que las pantallas nazcan de esa base.

Eso toma más disciplina, sí.

Pero también evita que el proyecto termine convertido en una colección de vistas bonitas, inconexas y difíciles de sostener.
