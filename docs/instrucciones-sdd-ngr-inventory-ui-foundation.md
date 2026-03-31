# Instrucciones SDD — NGR Inventory UI Foundation

## 1. Propósito de este documento

Este documento define **cómo debe desarrollarse `ngr-inventory-ui-foundation` usando IA**, bajo un enfoque **SDD (Spec-Driven Development)** y utilizando **gentle-ai stack** como capa de orquestación, memoria, skills y flujo de trabajo.

La intención no es “pedirle cosas a la IA y ver qué sale”. La intención es establecer un marco de trabajo donde los agentes y subagentes:

- entiendan el **objetivo real** del proyecto,
- trabajen con **contexto suficiente**,
- codifiquen en ciclos pequeños y verificables,
- prueben antes de dar por terminado un cambio,
- documenten decisiones y hallazgos,
- y mantengan la coherencia técnica, visual, funcional y arquitectónica del foundation.

Este documento **no es el requerimiento del proyecto** ni el plan general. Es la **guía operativa de desarrollo asistido por IA**.

---

## 2. Naturaleza del proyecto

`ngr-inventory-ui-foundation` **no es solo una librería visual** y **no es solo un prototipo**.

Es un **workspace UI** compuesto por dos capas complementarias:

### 2.1 Foundation Layer
Base reusable y relativamente estable del ecosistema UI.

Debe incluir, como mínimo:

- design tokens,
- theme base basado en Bootstrap + Sass,
- estilos globales y utilidades propias,
- wrappers/adapters de librerías UI gratuitas,
- componentes base reutilizables,
- patrones UI operativos,
- reglas de responsive,
- reglas de accesibilidad,
- lineamientos de theming dinámico,
- contrato de interacción entre componentes y estados.

### 2.2 Prototype / Mockup Layer
Aplicación ejecutable que consume el foundation y representa pantallas reales del sistema.

Debe incluir:

- mockups navegables,
- mocks de API,
- estados loading / empty / success / error,
- variantes por permisos,
- escenarios extremos,
- pantallas reales del dominio de inventario.

### 2.3 Regla fundamental

**Foundation ≠ Mockup**

pero

**Foundation + Prototype Layer = Workspace serio y útil**.

Los agentes deben respetar esta separación en todo momento.

---

## 3. Meta principal del desarrollo con IA

La IA debe ayudar a construir un sistema UI que sea:

- **muy profesional visualmente**, 
- **muy usable**, 
- **muy consistente**, 
- **muy responsive**, 
- **muy detallado**, 
- **muy accesible**, 
- **muy mantenible**,
- **muy fácil de portar a Angular y React**,
- y **muy fácil de probar sin backend real**.

El objetivo no es simplemente “que funcione”.

El objetivo es que el resultado se sienta como una **base de producto seria**, con calidad visual alta, comportamiento profesional y suficiente estructura para convertirse luego en implementaciones de frontend reales.

---

## 4. Supuestos del flujo SDD con gentle-ai stack

Según la documentación pública de **gentle-ai**, el stack agrega una capa de trabajo basada en:

- **persistent memory**,
- **Spec-Driven Development workflow**,
- **skills especializados**,
- **MCP servers**,
- **selector de modelos**,
- y **asignación por fase** para que distintos modelos trabajen mejor en distintos momentos.

El mismo proyecto describe a **Engram** como memoria persistente, y en la documentación de **Gentleman-Skills** se describe que los skills aportan contexto especializado para frameworks, librerías y patrones. Además, el ecosistema SDD alrededor de gentle-ai y spec-kit trabaja por fases como **constitución/principios, especificación, planificación, tareas, implementación y verificación**.  
Fuentes oficiales:
- https://github.com/Gentleman-Programming/gentle-ai
- https://github.com/Gentleman-Programming/gentle-ai/blob/main/docs/intended-usage.md
- https://github.com/Gentleman-Programming/Gentleman-Skills
- https://github.com/github/spec-kit
- https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/

### 4.1 Implicación para este proyecto

Los agentes **no deben improvisar implementación directamente**.

Deben trabajar así:

1. entender principios y restricciones,
2. entender el feature o subproblema,
3. investigar si hace falta,
4. definir el objetivo exacto del cambio,
5. dividirlo en pasos verificables,
6. implementar una parte pequeña,
7. probarla,
8. ajustar si falla,
9. documentar hallazgos,
10. y solo entonces pasar al siguiente bloque.

### 4.2 Filosofía operativa

**Planificar primero. Implementar después. Verificar siempre.**

No saltar a escribir código si:
- no está claro el objetivo,
- no está claro el alcance,
- no está claro el estado esperado,
- o no está clara la fuente de verdad técnica o visual.

---

## 5. Qué deben entender todos los subagentes antes de tocar código

Todo subagente que participe en este proyecto debe interiorizar lo siguiente.

### 5.1 El proyecto es multi-framework por diseño

El foundation no debe quedar casado con Angular, React ni otro framework.

Por tanto:
- la base visual,
- los tokens,
- los mocks,
- los estados,
- los contratos,
- y los patrones de interacción

se diseñan de forma **portable**.

### 5.2 El foundation debe poder vivir sin backend real

El proyecto debe poder desarrollarse y validarse con:
- mocks de API,
- fixtures reutilizables,
- escenarios controlados,
- prototipos navegables,
- documentación visual aislada.

### 5.3 La estética es prioridad de primer nivel

La UI no puede ser solo “correcta”.

Debe verse:
- elegante,
- limpia,
- moderna,
- administrativamente seria,
- clara en jerarquía visual,
- sobria donde corresponde,
- pero con suficiente riqueza visual para sentirse premium.

### 5.4 La usabilidad es tan importante como la estética

La UI debe:
- guiar bien,
- evitar errores,
- mostrar estados con claridad,
- no saturar al usuario,
- facilitar tablas y formularios complejos,
- y mantener continuidad entre módulos.

### 5.5 El responsive no es “arreglarlo al final”

Cada tarea UI debe contemplar desde el inicio:
- escritorio grande,
- laptop,
- tablet,
- y mobile razonable si aplica al prototipo.

### 5.6 El sistema de temas es parte del core

No es una mejora futura optativa.

Debe existir una arquitectura real para:
- tema claro,
- tema oscuro,
- temas fríos,
- temas cálidos,
- variantes custom,
- persistencia de preferencia,
- actualización visual consistente,
- y extensibilidad futura.

### 5.7 El proyecto debe construir confianza

Cada feature debe dejar evidencia de calidad:
- stories,
- demos,
- mocks,
- tests,
- accesibilidad básica,
- y documentación mínima.

---

## 6. Roles ideales de subagentes

No todos los agentes deben hacer de todo. La calidad sube mucho cuando cada subagente tiene un rol claro.

### 6.1 Orchestrator
Responsable de:
- leer el requerimiento/plan/contexto,
- decidir el siguiente bloque de trabajo,
- dividirlo en subtareas,
- coordinar investigación, diseño, implementación y verificación,
- validar Definition of Done antes de cerrar una tarea.

No debe:
- codificar grandes bloques sin plan,
- mezclar decisiones técnicas y visuales sin validación,
- saltarse la verificación.

### 6.2 Research Agent
Responsable de:
- consultar documentación oficial,
- revisar licencias,
- validar APIs y patrones de librerías,
- comprobar compatibilidad,
- resumir buenas prácticas y riesgos.

Debe priorizar:
- docs oficiales,
- repositorios oficiales,
- guías primarias,
- estándares.

### 6.3 Design System Agent
Responsable de:
- tokens,
- tipografía,
- color,
- spacing,
- escalas,
- densidad,
- iconografía,
- sombras,
- bordes,
- layout,
- guidelines visuales.

Debe pensar en:
- legibilidad,
- consistencia,
- elegancia,
- contraste,
- temas,
- estados,
- y responsive.

### 6.4 UX / Accessibility Agent
Responsable de:
- validar jerarquía visual,
- flujos,
- feedback,
- foco,
- navegación por teclado,
- mensajes de error,
- patrones ARIA cuando apliquen,
- y cumplimiento de criterios WCAG 2.2 AA relevantes.

### 6.5 Architecture Agent
Responsable de:
- estructura del workspace,
- separación foundation/prototype,
- contratos internos,
- decisiones de carpeta,
- wrappers de librerías,
- puertos/adapters,
- organización portable a distintos frameworks.

### 6.6 Implementation Agent
Responsable de:
- codificar el cambio solicitado,
- respetar el style guide,
- no romper otros módulos,
- mantener trazabilidad del cambio,
- y dejar el código listo para testear.

### 6.7 Testing / QA Agent
Responsable de:
- historias en Storybook,
- test unitarios y de componente,
- validación de mocks,
- recorridos Playwright,
- revisión responsive,
- revisión de estados edge case,
- y control de regresión visual/funcional.

### 6.8 Refactor Agent
Responsable de:
- consolidar duplicación,
- mejorar naming,
- mejorar separación de capas,
- endurecer theming,
- mejorar legibilidad,
- sin cambiar comportamiento sin justificación.

### 6.9 Documentation Agent
Responsable de:
- README de paquete,
- decisiones clave,
- uso de componentes,
- reglas de theming,
- fuentes oficiales,
- y notas para continuidad entre iteraciones.

---

## 7. Qué necesita entender un subagente para no fallar

Un subagente suele fallar cuando trabaja con contexto insuficiente o ambiguo.

Antes de ejecutar una tarea, todo subagente debe conocer explícitamente:

### 7.1 Objetivo funcional exacto
- qué pantalla, componente o capa se está trabajando,
- qué problema resuelve,
- qué usuario lo usaría,
- qué estados debe soportar.

### 7.2 Nivel de reutilización esperado
- si es componente base,
- si es patrón reusable,
- si es solo un mockup,
- si es wrapper de librería,
- si es específico del prototipo.

### 7.3 Restricciones de diseño
- estilo visual esperado,
- tono profesional,
- densidad,
- responsive,
- color system,
- estados,
- animación permitida o no.

### 7.4 Restricciones técnicas
- no acoplar a framework sin necesidad,
- no hardcodear colores en componentes finales,
- no introducir dependencias sin validar,
- no usar librerías duplicadas para la misma función,
- no romper el sistema de temas,
- no meter lógica de mocks dentro del core reusable.

### 7.5 Forma de validación
- cómo se probará,
- qué historia/story debe existir,
- qué test debe pasar,
- qué viewport mínimo debe verificarse,
- qué estados deben demostrarse.

### 7.6 Fuentes obligatorias de consulta
- documentación oficial de la librería,
- README oficial del repo,
- docs del estándar relevante,
- requerimientos y documentos internos del proyecto.

---

## 8. Flujo de trabajo obligatorio por cada tarea

Todo desarrollo con IA en este proyecto debe seguir este ciclo.

## 8.1 Paso 1 — Comprensión
Antes de codificar, el agente debe responder:

- ¿qué se construye?
- ¿para qué sirve?
- ¿en qué capa vive?
- ¿qué parte es reusable y qué parte es prototipo?
- ¿qué dependencias toca?
- ¿qué estados debe cubrir?
- ¿qué no debe romper?

Si esto no está claro, no se implementa.

## 8.2 Paso 2 — Consulta de documentación
Antes de usar o modificar una librería, el agente debe revisar su documentación oficial.

Especialmente para:
- Bootstrap,
- Storybook,
- MSW,
- Vite,
- Vitest,
- Playwright,
- SweetAlert2,
- Floating UI,
- TanStack Table o Tabulator,
- flatpickr,
- IMask,
- Choices.js,
- ECharts,
- OpenAPI Generator.

## 8.3 Paso 3 — Diseño del cambio
Antes de escribir código, el agente debe definir:

- inputs,
- outputs,
- estados,
- dependencia visual,
- dependencia técnica,
- estrategia de test,
- estrategia responsive,
- estrategia de accesibilidad,
- impacto en temas.

## 8.4 Paso 4 — Implementación pequeña y verificable
La unidad de trabajo debe ser pequeña.

No hacer cambios gigantes que mezclen:
- layout,
- tokens,
- stories,
- tests,
- mocks,
- componentes,
- y rutas,

si todo eso puede separarse.

## 8.5 Paso 5 — Verificación inmediata
Después de cada bloque:

- correr pruebas relevantes,
- revisar lint/typecheck,
- validar layout,
- revisar estado loading/error/empty si aplica,
- revisar responsive,
- revisar tema claro/oscuro si aplica,
- revisar story/documentación mínima.

## 8.6 Paso 6 — Ajuste
Si falla algo:

- corregir de inmediato,
- no seguir “porque luego se arregla”,
- documentar la causa si fue una decisión importante.

## 8.7 Paso 7 — Cierre del bloque
Un bloque solo se considera terminado si:

- funciona,
- se ve bien,
- es reusable cuando debe serlo,
- tiene prueba o evidencia,
- y deja contexto claro para el siguiente paso.

---

## 9. Reglas visuales y de producto

La prioridad estética del proyecto es alta. Por tanto, los agentes deben seguir reglas visuales fuertes.

### 9.1 Principios visuales obligatorios

La UI debe ser:
- limpia,
- elegante,
- consistente,
- con jerarquía visual clara,
- con uso intencional del color,
- con estados distinguibles,
- con tablas y formularios sobrios,
- con densidad administrativa profesional.

### 9.2 Qué evitar visualmente

No se acepta:
- look genérico de demo improvisada,
- exceso de colores llamativos,
- contrastes pobres,
- iconografía incoherente,
- espaciado caótico,
- botones con estilos inconsistentes,
- formularios visualmente duros o desalineados,
- pantallas saturadas,
- componentes que parezcan de librerías distintas pegadas con cinta.

### 9.3 Jerarquía visual esperada

Cada pantalla debe dejar claro:
- título,
- propósito,
- filtros,
- bloque principal,
- acciones primarias,
- acciones secundarias,
- estados del sistema,
- navegación contextual.

### 9.4 Tablas
Las tablas deben sentirse de producto serio, no de CRUD escolar.

Deben cuidar:
- legibilidad,
- alineación,
- densidad,
- estado hover,
- filas clicables cuando aplique,
- columna de acciones clara,
- paginación limpia,
- filtros coherentes,
- responsive con estrategia definida.

### 9.5 Formularios
Los formularios deben priorizar:
- agrupación semántica,
- labels visibles,
- ayuda contextual breve,
- mensajes de error accionables,
- inputs consistentes,
- orden lógico,
- feedback de submit,
- estados disabled/loading elegantes.

---

## 10. Sistema de temas y adaptación dinámica de color

Este punto es prioridad explícita del proyecto.

## 10.1 Meta del sistema de temas

El foundation debe soportar:
- tema claro,
- tema oscuro,
- tema frío,
- tema cálido,
- tema de alto contraste si se decide,
- tema custom futuro,
- persistencia de preferencia,
- aplicación global del tema,
- aplicación parcial por componentes si aplica,
- y consistencia visual total entre pantallas.

## 10.2 Principio técnico

Los agentes deben construir el theming con una combinación de:

- **design tokens**,
- **Sass variables/maps**, 
- **Bootstrap CSS variables**,
- y **modos de color compatibles con `data-bs-theme`**.

Bootstrap 5.3 documenta soporte para **color modes** y uso de `data-bs-theme`, así como personalización por Sass y CSS variables.  
Fuentes oficiales:
- https://getbootstrap.com/docs/5.3/customize/color-modes/
- https://getbootstrap.com/docs/5.3/customize/css-variables/
- https://getbootstrap.com/docs/5.3/customize/sass/

## 10.3 Reglas de implementación

- No hardcodear colores finales en componentes de producto.
- Los componentes deben consumir variables/tokens, no hex dispersos.
- Toda variante visual debe poder trazarse a tokens.
- Los estados semánticos (success, warning, danger, info, neutral) deben existir por sistema.
- El tema no debe romper contraste ni legibilidad.
- Todo cambio de tema debe probarse al menos en:
  - shell,
  - tabla,
  - formulario,
  - modal,
  - alert/feedback,
  - dashboard card.

## 10.4 Selector de temas

Debe existir, como parte del workspace, una base para:
- alternar tema claro/oscuro,
- seleccionar familias cromáticas,
- persistir elección,
- previsualizar el impacto,
- y validar integridad visual del sistema.

---

## 11. Reglas técnicas del foundation

### 11.1 Núcleo base recomendado

El proyecto debe apoyarse, como base, en herramientas gratuitas y bien documentadas.

### Librerías principales
- Bootstrap — https://getbootstrap.com/
- Bootstrap Icons — https://icons.getbootstrap.com/
- SweetAlert2 — https://sweetalert2.github.io/
- Floating UI — https://floating-ui.com/
- Storybook — https://storybook.js.org/
- MSW — https://mswjs.io/
- Vite — https://vite.dev/
- Vitest — https://vitest.dev/
- Playwright — https://playwright.dev/
- OpenAPI Generator — https://openapi-generator.tech/

### Librerías complementarias probables
- flatpickr — https://flatpickr.js.org/
- IMask — https://imask.js.org/
- Choices.js — https://choices-js.github.io/Choices/
- Apache ECharts — https://echarts.apache.org/
- TanStack Table — https://tanstack.com/table/
- Tabulator — https://tabulator.info/

### 11.2 Regla de adopción de librerías

Ninguna librería entra al proyecto si no cumple al menos esto:
- licencia aceptable,
- documentación oficial razonable,
- mantenimiento visible,
- utilidad clara,
- no duplicar otra librería ya aprobada,
- y no contradecir la arquitectura portable del foundation.

### 11.3 Wrappers

Toda librería externa con impacto UI relevante debe entrar detrás de una capa propia cuando tenga sentido.

Ejemplos:
- `ConfirmDialogService` por encima de SweetAlert2,
- `FloatingDropdown` por encima de Floating UI,
- `DateInput` por encima de flatpickr,
- `MaskedInput` por encima de IMask,
- `SelectRich` por encima de Choices.js,
- `ChartCard` por encima de ECharts.

### 11.4 Resultado esperado

Si en el futuro se cambia una librería, el foundation no debe quedar destruido.

---

## 12. Reglas para Foundation Layer vs Prototype Layer

### 12.1 Qué sí pertenece al Foundation Layer
- tokens,
- theme,
- utilidades,
- shell reusable,
- componentes base,
- patrones UI,
- wrappers de librerías,
- estados reutilizables,
- contratos visuales,
- helpers de theming,
- helpers de responsive,
- guidelines.

### 12.2 Qué sí pertenece al Prototype Layer
- pantallas mock,
- navegación demostrativa,
- datos ficticios,
- escenarios por rol,
- estados extremos del producto,
- flows navegables,
- demostración del foundation aplicado al dominio.

### 12.3 Qué no debe pasar
- meter mocks duros dentro del foundation reusable,
- meter lógica framework-specific en la base portable,
- mezclar historia visual con código de bajo nivel,
- hacer que el foundation dependa de una pantalla puntual.

---

## 13. Reglas de mocks y contratos

### 13.1 Filosofía

Los agentes deben desarrollar pensando que el prototipo debe funcionar sin backend real.

### 13.2 Estrategia recomendada

Usar **MSW** para que los mocks sean:
- agnósticos al cliente HTTP,
- reutilizables en browser y Node,
- útiles para stories,
- útiles para tests,
- útiles para el prototype shell,
- y útiles en futuras apps Angular/React.

MSW documenta explícitamente que sus mocks son **client-agnostic** y reutilizables entre frameworks, herramientas y entornos.  
Fuente oficial:
- https://mswjs.io/
- https://mswjs.io/docs/

### 13.3 Reglas de modelado de mocks

Cada recurso debe tener:
- fixtures base,
- variantes por estado,
- errores semánticos,
- latencia simulada cuando haga falta,
- y naming claro.

Ejemplo:
- `products.success`
- `products.empty`
- `products.forbidden`
- `products.server-error`
- `movements.validation-error`
- `reports.export-in-progress`

### 13.4 Regla crítica

El mock debe representar comportamiento del sistema, no solo “datos para llenar tablas”.

---

## 14. Reglas de Storybook y documentación visual

Storybook debe usarse para:
- componentes base,
- patrones,
- páginas clave,
- edge cases,
- temas,
- responsive,
- y documentación visual.

Storybook se presenta oficialmente como un **frontend workshop** para construir componentes y páginas en aislamiento, documentarlas y probar estados difíciles.  
Fuentes oficiales:
- https://storybook.js.org/
- https://storybook.js.org/docs
- https://storybook.js.org/docs/writing-tests
- https://storybook.js.org/docs/builders/vite

### 14.1 Cada historia debe responder
- qué muestra,
- qué estado representa,
- qué tema aplica,
- qué viewport se espera,
- qué interacción debe probarse,
- qué datos mock usa.

### 14.2 Historias mínimas por componente serio
- default,
- hover/focus si aplica,
- disabled,
- loading,
- error,
- variante temática,
- responsive relevante.

---

## 15. Reglas de testing

### 15.1 Tipos de prueba mínimos

Cada bloque funcional serio debe aspirar a tener, según aplique:
- test unitario,
- test de componente,
- historia usable en Storybook,
- mock verificable,
- prueba de interacción,
- y smoke/e2e básico.

### 15.2 Herramientas sugeridas
- Vitest para unit/component testing,
- Storybook Test cuando aporte,
- Playwright para flows de usuario y mocks de red.

Vitest documenta browser mode y Storybook documenta su integración con Vitest. Playwright documenta el mocking de tráfico HTTP/HTTPS.  
Fuentes oficiales:
- https://vitest.dev/guide/
- https://vitest.dev/guide/browser/
- https://storybook.js.org/docs/writing-tests/integrations/vitest-addon
- https://playwright.dev/docs/mock

### 15.3 Regla de verificación por UI

No basta con que “compile”.

Debe validarse:
- tema claro,
- tema oscuro,
- responsive,
- estado vacío,
- estado de error,
- estado loading,
- navegación razonable,
- foco visible,
- y consistencia visual.

---

## 16. Estándares de programación y calidad

## 16.1 Estándares generales

Los agentes deben aplicar:
- TypeScript estricto,
- naming explícito,
- funciones con responsabilidad clara,
- separación entre configuración, lógica y presentación,
- módulos pequeños,
- adapters/wrappers cuando una dependencia externa lo requiera,
- y código fácil de leer por humanos.

## 16.2 Reglas de código

- No usar nombres vagos.
- No mezclar UI, mocks y acceso a datos en el mismo archivo sin razón.
- No repetir tokens/estilos mágicos.
- No introducir deuda visual por apuro.
- No introducir librerías sin wrapper cuando su API sea inestable o muy invasiva.
- No crear componentes monstruo.
- No crear estilos con selectores frágiles.
- No romper el sistema de temas por un caso puntual.

## 16.3 Reglas de commits y progresión

Cada cambio debe poder leerse como un paso humano y verificable.

Preferir commits estilo:
- `feat:`
- `fix:`
- `refactor:`
- `style:`
- `test:`
- `docs:`
- `chore:`

Cada iteración debe dejar:
- código funcional,
- evidencia de prueba,
- y contexto de continuidad.

---

## 17. Reglas de accesibilidad y usabilidad

### 17.1 Base obligatoria

Los agentes deben usar como referencia primaria:
- **WCAG 2.2**,
- **WAI-ARIA Authoring Practices Guide (APG)**.

Fuentes oficiales:
- https://www.w3.org/TR/WCAG22/
- https://www.w3.org/WAI/standards-guidelines/wcag/
- https://www.w3.org/WAI/ARIA/apg/

### 17.2 Qué significa en la práctica

- foco visible,
- contraste correcto,
- navegación por teclado,
- labels y mensajes de error claros,
- regiones semánticas,
- uso prudente de ARIA,
- y widgets complejos bien estructurados.

### 17.3 Regla de oro

No usar ARIA para maquillar mal HTML.

Primero semántica correcta. Luego ARIA solo cuando realmente haga falta.

---

## 18. Referencias de diseño y patrones UI

No existe una sola biblia universal de dimensiones y estilo para apps administrativas. Pero sí existen referencias muy valiosas.

### 18.1 Referencias recomendadas
- Material Design 3 — https://m3.material.io/
- USWDS — https://designsystem.digital.gov/
- Nielsen Heuristics — https://www.nngroup.com/articles/ten-usability-heuristics/
- Design Tokens Community Group — https://www.w3.org/community/design-tokens/
- Open UI Community Group — https://www.w3.org/community/open-ui/

### 18.2 Cómo deben usar estas referencias los agentes

No deben copiar estilos ciegamente.

Deben usarlas para:
- jerarquía,
- spacing,
- claridad,
- consistencia,
- patrones comunes,
- comportamiento de navegación,
- semántica de componentes,
- interoperabilidad de tokens.

### 18.3 Regla práctica

El resultado final debe sentirse propio del proyecto, no un collage entre Material, Bootstrap y cualquier cosa de moda.

---

## 19. Definición de listo antes de implementar

Antes de iniciar una tarea, el agente debe poder contestar “sí” a todo esto:

- ¿Sé en qué capa vive esto?
- ¿Sé si esto es reusable o específico del prototipo?
- ¿Sé qué librerías toca?
- ¿Ya revisé la documentación oficial relevante?
- ¿Sé qué estados debo cubrir?
- ¿Sé qué pasa en claro/oscuro?
- ¿Sé qué pasa en responsive?
- ¿Sé cómo voy a probarlo?
- ¿Sé qué historia o evidencia voy a dejar?
- ¿Sé qué no debo romper?

Si la respuesta es “no” en algo importante, la tarea aún no está lista.

---

## 20. Definición de hecho por bloque

Un bloque de trabajo solo puede cerrarse si cumple esto:

### 20.1 Funcional
- hace lo que debía hacer,
- resuelve el objetivo del bloque,
- no deja estados importantes sin cubrir.

### 20.2 Visual
- se ve profesional,
- es consistente con el foundation,
- responde bien al tema,
- responde razonablemente al viewport.

### 20.3 Técnica
- el código compila,
- pasa typecheck/lint relevantes,
- no introduce duplicación innecesaria,
- no acopla mal el proyecto.

### 20.4 Validación
- existe prueba o evidencia suficiente,
- existe historia o demo cuando aplica,
- y hay confirmación visual mínima.

### 20.5 Continuidad
- el siguiente agente puede entender el estado actual,
- los hallazgos y decisiones importantes quedaron documentados,
- y el bloque deja una base limpia para continuar.

---

## 21. Anti-patrones prohibidos

Los subagentes deben evitar expresamente:

- codificar grandes features sin partirlos,
- “resolver luego” pruebas o responsive,
- hardcodear colores y medidas finales en componentes,
- duplicar wrappers o utilidades,
- meter dependencias por comodidad,
- pegar código de docs sin adaptarlo al contexto,
- construir pantallas bonitas pero imposibles de reutilizar,
- usar el prototipo como excusa para saltarse calidad,
- documentar poco o nada,
- y tratar el theming como adorno en lugar de arquitectura.

---

## 22. Protocolo de consulta de fuentes

Cuando el agente necesite implementar o decidir algo, debe consultar primero fuentes oficiales o primarias.

### 22.1 Orden de prioridad
1. documentación oficial,
2. repositorio oficial,
3. estándar oficial,
4. ejemplos oficiales,
5. artículos secundarios solo si aportan contexto y no contradicen a la fuente primaria.

### 22.2 Regla especial

Si una librería o estándar cambió recientemente, la fuente de verdad es la documentación actual oficial, no memoria del modelo.

---

## 23. Fuentes oficiales recomendadas para este proyecto

## 23.1 Core del foundation
- Bootstrap: https://getbootstrap.com/
- Bootstrap customize overview: https://getbootstrap.com/docs/5.3/customize/overview/
- Bootstrap Sass: https://getbootstrap.com/docs/5.3/customize/sass/
- Bootstrap CSS variables: https://getbootstrap.com/docs/5.3/customize/css-variables/
- Bootstrap color modes: https://getbootstrap.com/docs/5.3/customize/color-modes/
- Bootstrap & Vite: https://getbootstrap.com/docs/5.2/getting-started/vite/
- Bootstrap Icons: https://icons.getbootstrap.com/

## 23.2 Prototipado y documentación visual
- Storybook: https://storybook.js.org/
- Storybook docs: https://storybook.js.org/docs
- Storybook tests: https://storybook.js.org/docs/writing-tests
- Storybook + Vitest addon: https://storybook.js.org/docs/writing-tests/integrations/vitest-addon
- Storybook Vite builder: https://storybook.js.org/docs/builders/vite
- MSW addon para Storybook: https://storybook.js.org/addons/msw-storybook-addon

## 23.3 Mocking y test
- MSW: https://mswjs.io/
- MSW docs: https://mswjs.io/docs/
- Vite: https://vite.dev/
- Vitest: https://vitest.dev/
- Vitest browser mode: https://vitest.dev/guide/browser/
- Playwright: https://playwright.dev/
- Playwright mocking: https://playwright.dev/docs/mock

## 23.4 Librerías UI complementarias
- SweetAlert2: https://sweetalert2.github.io/
- SweetAlert2 repo: https://github.com/sweetalert2/sweetalert2
- Floating UI: https://floating-ui.com/
- Floating UI getting started: https://floating-ui.com/docs/getting-started
- flatpickr: https://flatpickr.js.org/
- flatpickr repo: https://github.com/flatpickr/flatpickr
- IMask: https://imask.js.org/
- IMask repo: https://github.com/uNmAnNeR/imaskjs
- Choices.js: https://choices-js.github.io/Choices/
- Choices.js repo: https://github.com/Choices-js/Choices
- Apache ECharts: https://echarts.apache.org/
- ECharts API: https://echarts.apache.org/en/api.html
- TanStack Table: https://tanstack.com/table/
- Tabulator: https://tabulator.info/

## 23.5 Contratos y API
- OpenAPI Generator: https://openapi-generator.tech/
- typescript-fetch generator: https://openapi-generator.tech/docs/generators/typescript-fetch/
- typescript-angular generator: https://openapi-generator.tech/docs/generators/typescript-angular/
- OpenAPI Generator repo: https://github.com/OpenAPITools/openapi-generator

## 23.6 Accesibilidad y diseño
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- WCAG overview: https://www.w3.org/WAI/standards-guidelines/wcag/
- WAI-ARIA APG: https://www.w3.org/WAI/ARIA/apg/
- Material Design 3: https://m3.material.io/
- USWDS: https://designsystem.digital.gov/
- Nielsen Heuristics: https://www.nngroup.com/articles/ten-usability-heuristics/
- Design Tokens Community Group: https://www.w3.org/community/design-tokens/
- Open UI Community Group: https://www.w3.org/community/open-ui/

## 23.7 SDD y gentle-ai
- gentle-ai: https://github.com/Gentleman-Programming/gentle-ai
- gentle-ai intended usage: https://github.com/Gentleman-Programming/gentle-ai/blob/main/docs/intended-usage.md
- Gentleman-Skills: https://github.com/Gentleman-Programming/Gentleman-Skills
- spec-kit: https://github.com/github/spec-kit
- GitHub Spec-Driven Development article: https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/

---

## 24. Instrucción final para cualquier agente que trabaje aquí

No desarrolles este proyecto como si fuera una demo más.

Desarróllalo como una **base de producto profesional**, donde cada decisión:
- tenga intención,
- soporte escalabilidad,
- se vea muy bien,
- funcione muy bien,
- y pueda evolucionar sin que el proyecto se vuelva un cementerio de hacks.

La secuencia correcta siempre es:

**entender → investigar → diseñar → implementar pequeño → probar → ajustar → documentar → continuar**

Nunca al revés.

