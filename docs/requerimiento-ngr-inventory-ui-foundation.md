# Requerimiento — NGR Inventory UI Foundation

## 1. Propósito

Construir **NGR Inventory UI Foundation** como un **workspace frontend propio del proyecto**, independiente del framework principal, orientado a servir como base visual, estructural y operativa para la familia de interfaces de NGR Inventory.

Este requerimiento define **qué debe ser** el UI Foundation, **qué responsabilidades tendrá**, **qué artefactos deberá entregar**, **qué librerías base podrá usar**, **qué estándares de diseño y accesibilidad deberá respetar** y **qué alcance funcional deberá cubrir** en su capa de prototipado.

Este documento **no contiene la planeación ni la secuencia de implementación**. Eso deberá quedar en `plan-ngr-inventory-ui-foundation.md`.

---

## 2. Objetivo general

El proyecto `ngr-inventory-ui-foundation` deberá proporcionar una base reutilizable y ejecutable para construir la UI del sistema de inventario sin depender desde el día uno del backend real ni de un framework específico como Angular o React.

Su objetivo será cubrir dos necesidades complementarias:

1. **Foundation Layer**
   - base visual y técnica reutilizable
   - sistema de diseño propio del proyecto
   - layout administrativo común
   - componentes y patrones de interfaz reutilizables
   - contratos y criterios de integración consistentes

2. **Prototype / Mockup Layer**
   - app ejecutable para representar mockups operativos
   - pantallas navegables del producto
   - estados de UI y escenarios de error
   - consumo de mocks de API sin backend real
   - validación temprana de UX, navegación, estructura y lenguaje visual

En otras palabras: el proyecto no deberá ser solo una librería de botones ni solo una colección de pantallas falsas. Deberá ser una **base reusable más un cascarón ejecutable de prototipado**.

---

## 3. Naturaleza del proyecto

`ngr-inventory-ui-foundation` deberá entenderse como un **workspace UI**, no como un frontend final de producción ni como un simple kit de componentes.

### 3.1 Sí deberá ser

- una base propia de UI del proyecto
- una fuente de verdad visual y estructural para futuras apps frontend
- un entorno ejecutable de mockups y prototipos operativos
- una plataforma agnóstica para preparar futura implementación en Angular, React u otro framework web
- un espacio donde se formalicen tokens, estilos, layouts, componentes, patrones y mocks de integración

### 3.2 No deberá ser

- una plantilla descargada y apenas maquillada
- una app productiva definitiva conectada a todos los servicios reales
- un “tema Bootstrap” sin reglas de uso
- una colección de HTML sueltos sin estructura reusable
- una pseudo app universal que pretenda compartir al 100% routing, estado y lógica entre frameworks

---

## 4. Relación entre Foundation y Mockups

### 4.1 Regla conceptual principal

Los **mockups no sustituyen al UI Foundation**, pero sí forman parte del mismo workspace.

Por tanto, el proyecto deberá separar explícitamente:

- **Foundation Layer** → base reusable
- **Prototype / Mockup Layer** → consumidor ejecutable de esa base

### 4.2 Interpretación correcta

- si un artefacto define tokens, layout, wrappers, componentes base o patrones reutilizables, pertenece al **Foundation Layer**
- si un artefacto representa pantallas, flujos, navegación o estados operativos del producto, pertenece al **Prototype / Mockup Layer**

Ambas capas pueden convivir en el mismo repositorio o workspace, pero no deberán confundirse como si fueran una sola cosa.

---

## 5. Objetivos específicos

El UI Foundation deberá permitir, como mínimo:

1. definir un sistema de diseño propio del proyecto
2. usar una base gratuita y abierta sustentada en Bootstrap y librerías compatibles
3. documentar y reutilizar tokens de diseño
4. encapsular componentes y patrones de interfaz independientes del framework cuando sea razonable
5. proveer una app ejecutable para mockups de NGR Inventory
6. representar el alcance funcional del frontend de inventario mediante pantallas navegables y escenarios simulados
7. soportar mocks de red reutilizables sin requerir backend real
8. facilitar la futura adopción en Angular como frontend principal y React como implementación paralela o laboratorio
9. extenderse más adelante hacia catálogo visual/e-commerce sin romper la base administrativa actual

---

## 6. Principios rectores

El proyecto deberá regirse por estos principios:

1. **Propiedad real del proyecto**
   - La base deberá ser del proyecto, no una identidad prestada de un template tercero.

2. **Agnosticismo razonable al framework**
   - Lo compartido deberá ser lo que realmente vale la pena compartir: tokens, tema, patrones, mocks, contratos, lineamientos y artefactos ejecutables neutrales.

3. **Separación entre base reusable y prototipo ejecutable**
   - La capa reusable no deberá quedar contaminada por hacks temporales del prototipo.

4. **Mobile-first y responsive**
   - La base deberá construirse con enfoque responsive real, al menos para escritorio y tablet, sin destruir la posibilidad de adaptación futura a móviles web.

5. **Accesibilidad como requisito, no como adorno**
   - Las decisiones de UI deberán perseguir conformidad mínima WCAG 2.2 AA.

6. **Diseño sistemático, no cosmético**
   - El foundation deberá definir reglas visuales y operativas estables: tipografía, espaciado, estados, patrones de formularios, tablas y feedback.

7. **Mocking por contrato y por red**
   - El prototipo deberá consumir mocks estructurados, preferiblemente a nivel de red o de contrato, no con lógica embebida arbitrariamente dentro de los componentes.

8. **Bajo acoplamiento con backend**
   - El workspace deberá responder a contratos HTTP y mocks equivalentes, no a tablas, drivers ni detalles de persistencia.

9. **Preparación para evolución**
   - La base deberá permitir crecimiento hacia e-commerce/catalogo visual sin sacrificar su claridad como sistema administrativo.

---

## 7. Alcance del proyecto

El proyecto cubrirá dos grandes áreas: **base reusable** y **prototipo ejecutable**.

### 7.1 Alcance del Foundation Layer

Deberá incluir, como mínimo:

- design tokens
- tema y personalización Bootstrap
- sistema tipográfico y de color
- utilidades visuales propias del proyecto
- layout administrativo común
- wrappers de librerías transversales
- componentes base
- patrones operativos de UI
- guías y criterios de uso
- contratos y mocks reutilizables

### 7.2 Alcance del Prototype / Mockup Layer

Deberá incluir, como mínimo:

- app ejecutable de prototipado
- navegación entre pantallas principales
- mockups operativos de los módulos del inventario
- estados de carga, vacío, éxito y error
- escenarios simulados por permisos y respuestas de API
- demostración de flujos principales sin backend real

---

## 8. Resultado esperado

El resultado esperado no será una única aplicación final, sino un **workspace frontend base** capaz de producir:

1. una **base reusable propia** del proyecto
2. una **app de mockups navegable y demostrable**
3. insumos listos para futuras apps en Angular y React
4. documentación suficiente para mantener consistencia visual y operativa

---

## 9. Arquitectura conceptual requerida

El proyecto deberá contemplar como mínimo las siguientes capas lógicas.

### 9.1 Foundation Layer

#### a. Design Tokens
Fuente de verdad para:
- colores
- tipografía
- espaciado
- radios
- sombras
- z-index
- tamaños de control
- breakpoints y dimensiones operativas si se formalizan como tokens

#### b. Theme / Bootstrap Customization
Capa encargada de:
- personalización vía Sass
- variables y mapas de Bootstrap
- CSS variables propias
- utilidades propias del proyecto
- overrides controlados

#### c. UI Core
Componentes base reutilizables, por ejemplo:
- botones
- inputs
- selects
- labels
- badges
- alerts
- loaders
- cards base
- wrappers de modal/confirmación

#### d. UI Patterns
Patrones de mayor nivel, por ejemplo:
- app shell
- sidebar
- topbar
- page header
- table shell
- filter bar
- form shell
- empty state
- error state
- confirm action pattern
- feedback pattern

#### e. API Contracts & Mocks
Capa dedicada a:
- tipos compartidos
- modelos de request/response
- escenarios de error
- mocks reutilizables
- fixtures de pantallas

### 9.2 Prototype / Mockup Layer

App ejecutable encargada de:
- representar las pantallas del dominio
- consumir mocks y fixtures
- validar estructura de navegación
- probar decisiones visuales
- demostrar estados, permisos y flujos operativos

---

## 10. Organización esperada del workspace

La implementación final podrá variar, pero conceptualmente el proyecto deberá soportar una estructura equivalente a esta:

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
    ui-assets/
  docs/
    requerimientos/
    lineamientos/
    referencias/
```

### Reglas de organización

- el workspace deberá poder crecer sin mezclar la capa reusable con la app demo
- los tokens no deberán quedar enterrados en archivos CSS sueltos
- los mocks no deberán vivir dispersos dentro de páginas sin control
- las pantallas demo no deberán convertirse en el único lugar donde exista la lógica visual reusable

---

## 11. Base tecnológica permitida y recomendada

El foundation deberá construirse con librerías gratuitas, abiertas y apropiadas para un workspace reusable.

### 11.1 Base principal obligatoria o preferente

#### Bootstrap 5
Deberá ser la base visual principal del foundation, aprovechando:
- layout responsive y mobile-first
- utilidades
- grid
- componentes base
- personalización mediante Sass y variables
- soporte maduro para sitios y paneles administrativos

### 11.2 Librerías recomendadas para complementar

#### Bootstrap Icons
Para iconografía base del sistema.

#### SweetAlert2
Para confirmaciones, errores, mensajes y feedback transaccional.

#### Floating UI
Para posicionamiento avanzado de overlays como tooltips, dropdowns, menús y popovers complejos.

#### flatpickr
Para selección de fecha/hora y rangos temporales.

#### IMask
Para máscaras de entrada en cantidades, moneda, documentos y formatos operativos.

#### Choices.js
Para selects enriquecidos, múltiples y buscables sin dependencia de jQuery.

#### TanStack Table o Tabulator
Deberá elegirse una estrategia de tabla principal.

- **TanStack Table** será preferible si se prioriza una base agnóstica y headless reutilizable entre frameworks.
- **Tabulator** será aceptable si se prioriza rapidez de prototipado con una tabla más resuelta desde el principio.

No deberá consolidarse una mezcla caótica de varias librerías de tabla principales a la vez.

#### Apache ECharts
Para dashboards y gráficos operativos.

#### MSW
Para mocking de red reutilizable entre browser, Node, herramientas y futuros frameworks.

#### Storybook
Para documentar componentes, estados, patrones y pantallas en aislamiento.

#### Vite
Como base de arranque rápida para el shell de prototipado y herramientas asociadas.

#### Vitest
Para pruebas unitarias y de integración ligera en el ecosistema del workspace.

#### Playwright
Para validación de flujos visibles al usuario a nivel de navegador.

#### OpenAPI Generator
Para futura generación de clientes compartidos, particularmente:
- `typescript-fetch` como base neutral
- `typescript-angular` para futura integración específica con Angular

### 11.3 Librerías opcionales para futura extensión e-commerce

Estas no son obligatorias en la primera versión, pero el foundation deberá poder admitirlas o equivalentes después:

- carrusel de producto
- galería/lightbox
- subida de imágenes
- reordenamiento drag-and-drop
- búsqueda difusa local para catálogos pequeños

---

## 12. Criterios de licenciamiento y adopción de librerías

Toda librería incorporada al foundation deberá cumplir, como mínimo, estos criterios:

1. licencia gratuita y compatible con uso del proyecto
2. documentación oficial suficiente
3. mantenimiento razonable
4. posibilidad de integración sin arrastrar dependencias innecesarias
5. capacidad de encapsulación desde la base del proyecto

### Restricciones

- no deberán introducirse librerías premium o restrictivas como fundamento del sistema
- no deberán introducirse plugins antiguos cuyo principal valor sea “se ven bonitos”
- no deberán introducirse dependencias jQuery-centrics si existen opciones modernas y más limpias
- cada librería deberá tener una responsabilidad clara dentro del workspace

---

## 13. Sistema de diseño requerido

El proyecto deberá definir un sistema de diseño propio, aunque inicialmente sea sobrio.

### 13.1 Deberá formalizar, como mínimo:

- paleta principal, secundaria y estados semánticos
- tipografía base
- escala de espaciado
- radios y bordes
- sombras
- tamaños de controles
- reglas de densidad visual
- jerarquías de títulos y textos
- iconografía base
- reglas para cards, tablas, formularios y shells de pantalla

### 13.2 Fuente de verdad

Los design tokens deberán convertirse en la fuente de verdad del estilo reusable del proyecto.

### 13.3 Formato esperado

Se recomienda que los tokens se estructuren con criterios compatibles con el ecosistema de design tokens interoperables, de forma que luego puedan exportarse a CSS variables, Sass, JSON u otras salidas.

---

## 14. Estándares y referencias de diseño que deberán orientar la UI

El proyecto deberá basarse en referencias reconocidas y documentadas, sin adoptar ciegamente un design system ajeno como si fuera la identidad del producto.

### 14.1 Accesibilidad

La base mínima obligatoria será **WCAG 2.2 nivel AA**.

### 14.2 Patrones accesibles

Cuando se creen widgets complejos, deberán considerarse los patrones del **WAI-ARIA Authoring Practices Guide (APG)** para:
- tabs
- dialogs
- comboboxes
- accordions
- menus
- grids y widgets similares

### 14.3 Referencias de diseño y gobierno visual

Como referencias de criterio, el proyecto podrá inspirarse en:
- Material Design 3
- USWDS
- principios heurísticos de usabilidad ampliamente aceptados

Estas referencias deberán servir como guía, no como obligación estética de copiar componentes o branding.

---

## 15. Requerimientos de UX y lenguaje visual

El foundation deberá priorizar una UI administrativa clara, consistente y operativa.

### 15.1 Regla general

La interfaz deberá favorecer:
- comprensión rápida
- baja fricción operativa
- consistencia entre módulos
- feedback explícito
- prevención de errores
- navegación reconocible

### 15.2 Deberá contemplar

- foco visible
- jerarquías claras
- estados de botón y formulario consistentes
- validaciones comprensibles
- feedback no ambiguo
- confirmaciones en acciones sensibles
- visibilidad del estado del sistema

### 15.3 No deberá convertirse en

- un dashboard recargado por vanidad visual
- una demo de componentes sin criterio operativo
- un e-commerce disfrazado antes de tiempo

---

## 16. Requerimientos funcionales del Prototype / Mockup Layer

El prototipo ejecutable deberá cubrir, como mínimo, el alcance funcional esperado del frontend administrativo de inventario.

### 16.1 Módulos mínimos de mockup

Deberán existir mockups navegables para:

1. autenticación
2. recuperación / restablecimiento de contraseña
3. dashboard operativo
4. productos
5. categorías
6. proveedores
7. almacenes
8. ubicaciones
9. movimientos de inventario
10. stock actual
11. kardex
12. conteos y ajustes
13. usuarios
14. roles y permisos
15. reportes y exportaciones
16. auditoría operativa

### 16.2 Para cada módulo, el prototipo deberá poder representar

- estado de carga
- estado vacío
- estado con datos
- estado de error recuperable
- estado de error no recuperable cuando aplique
- acciones visibles/invisibles o habilitadas/deshabilitadas por permiso

### 16.3 Escenarios de respuesta mínimos

El prototipo deberá estar preparado para representar respuestas equivalentes a:
- `200 OK`
- `201 Created`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `409 Conflict`
- `422 Unprocessable Content`
- `500 Internal Server Error`

---

## 17. Requerimientos de mocking y simulación

El proyecto deberá ofrecer una estrategia de mocking seria y reusable.

### 17.1 Reglas mínimas

- los mocks deberán estar desacoplados de componentes concretos
- deberán representar contratos y comportamientos, no solo objetos sueltos
- deberán poder reutilizarse en el prototipo, en stories y en pruebas
- deberán soportar escenarios por permiso, por error y por variación de datos

### 17.2 Casos mínimos

- login exitoso
- login fallido
- sesión expirada
- denegación por permisos
- listado con datos
- listado vacío
- validación fallida de formulario
- conflicto operativo
- error de servidor

### 17.3 Regla clave

El proyecto no deberá depender de un mock server externo obligatorio para empezar a construir mockups. La simulación deberá poder vivir dentro del workspace de forma sostenible.

---

## 18. Requerimientos de componentes y patrones mínimos

El foundation deberá ofrecer o permitir construir, como mínimo, estas piezas:

### 18.1 Layout
- app shell
- sidebar
- topbar
- breadcrumb o page context
- content container
- page header

### 18.2 Formularios
- input text
- number input
- textarea
- select
- multi-select
- date/datetime picker
- masked input
- validation message
- submit bar
- cancel/confirm action pattern

### 18.3 Feedback
- alert
- toast o feedback corto si aplica
- modal base
- confirm dialog
- loading indicator
- empty state
- inline error state
- blocked action state

### 18.4 Datos y operación
- data table shell
- filter bar
- badge de estado
- summary cards
- metric cards
- chart container
- detail panel o summary panel

---

## 19. Requerimientos de documentación interna

El proyecto deberá documentar, como mínimo:

1. librerías adoptadas y su rol
2. licencias y avisos requeridos
3. reglas del sistema de diseño
4. catálogo de componentes y patrones
5. criterios de accesibilidad
6. catálogo de pantallas mockup
7. mocks y escenarios disponibles
8. convenciones de nombres y organización

### 19.1 Artefactos recomendados

- guía de foundation
- guía de tokens
- catálogo de componentes
- catálogo de pantallas/estados
- inventario de dependencias UI
- documento de referencias y licencias

---

## 20. Requerimientos de testabilidad

El workspace deberá facilitar pruebas al menos en estos niveles:

### 20.1 Foundation Layer
- pruebas de componentes base críticos
- validación de render de estados
- validación de accesibilidad básica donde aplique

### 20.2 Prototype Layer
- recorridos principales de navegación
- login
- acceso a módulos mockup
- formularios relevantes
- tablas y filtros principales
- respuestas simuladas de error y permiso

### 20.3 Story-driven testing

Las stories o especificaciones visuales deberán poder servir como base de validación visual y funcional de estados importantes.

---

## 21. Compatibilidad futura con Angular y React

El proyecto deberá prepararse para futura adopción en apps concretas por framework.

### 21.1 Compartible

Deberán ser razonablemente compartibles:
- tokens
- tema
- assets
- lineamientos
- mocks
- contratos
- documentación de pantallas y estados
- patrones visuales de referencia

### 21.2 No necesariamente compartible al 100%

No se exigirá compartir idénticamente entre frameworks:
- routing real
- guards reales
- DI específica
- hooks específicos
- signals o stores específicos
- formularios reactivos específicos
- orquestación de estado productivo por framework

---

## 22. Compatibilidad futura con e-commerce / catálogo público

El foundation deberá diseñarse sin bloquear una futura extensión donde ciertos productos del stock puedan visualizarse en un e-commerce o catálogo navegable.

### 22.1 Esto implica que la base deberá poder admitir más adelante

- tarjetas de producto
- galerías de imagen
- carruseles
- filtros de catálogo
- fichas de producto
- búsqueda textual y visual
- patrones de subida y gestión de imágenes

### 22.2 Regla importante

Esa futura extensión no deberá desordenar el núcleo administrativo actual. El foundation deberá seguir priorizando el uso administrativo/operativo como caso primario en esta primera versión.

---

## 23. Requerimientos no funcionales

### 23.1 Mantenibilidad
- estructura modular
- separación entre capas
- baja contaminación entre foundation y prototype
- criterios claros para agregar o reemplazar librerías

### 23.2 Portabilidad
- posibilidad de reutilización entre futuras apps web
- independencia razonable del framework en los artefactos base

### 23.3 Rendimiento
- uso moderado de dependencias
- evitar plugins pesados sin justificación
- prototipo ejecutable fluido con mocks locales

### 23.4 Accesibilidad
- cumplimiento objetivo WCAG 2.2 AA
- patrones accesibles en widgets complejos

### 23.5 Coherencia visual
- reglas únicas de color, espaciado, tipografía y estados
- sin temas ad-hoc por módulo

---

## 24. Criterios de aceptación

Se considerará cumplido este requerimiento cuando:

1. Exista un workspace propio llamado `ngr-inventory-ui-foundation` o equivalente funcional.
2. El proyecto contenga una separación explícita entre Foundation Layer y Prototype / Mockup Layer.
3. La base use librerías gratuitas y compatibles con la intención del proyecto.
4. Exista una personalización propia del sistema visual sobre Bootstrap, y no solo una importación sin criterio.
5. Existan tokens, tema, layouts, componentes base y patrones documentados.
6. Exista una app ejecutable de mockups con navegación entre los módulos principales del inventario.
7. Existan mocks reutilizables para representar escenarios funcionales y de error sin backend real.
8. El proyecto esté alineado con WCAG 2.2 AA y considere APG para widgets complejos.
9. Exista documentación mínima sobre librerías, licencias, componentes, pantallas y lineamientos.
10. La base quede preparada para futura adopción en Angular y React sin forzar una falsa universalidad.
11. La base no cierre la puerta a una futura extensión hacia visualización tipo e-commerce de productos.

---

## 25. Fuera de alcance de este requerimiento

Este documento no exige todavía:

- implementación productiva completa conectada a backend real
- definición de roadmap o cronograma
- detalle de milestones o fases
- despliegue final a producción
- equivalencia funcional total entre Angular y React
- app móvil nativa
- e-commerce completo en esta primera versión
- motor de diseño privado complejo desde Figma obligatorio
- microfrontends

---

## 26. Referencias técnicas y documentales base

### Referencias internas del proyecto
- `requerimiento_frontend_inventario.md`
- `arquitectura_frontend_inventario.md`
- `seguridad_frontend_inventario.md`

### Referencias oficiales externas
- Bootstrap — introducción, personalización Sass, licencia, iconografía
- SweetAlert2 — accesibilidad, cero dependencias, licencia MIT
- Floating UI — posicionamiento de elementos flotantes, enfoque agnóstico y MIT
- flatpickr — datetime picker liviano, extensible y MIT
- IMask — input masks sin dependencias externas
- Choices.js — select/text input plugin sin jQuery
- TanStack Table — tabla headless y utilidades para flujos complejos
- Tabulator — tabla MIT para proyectos privados y comerciales
- Apache ECharts — visualización para dashboards
- MSW — mocks de red reutilizables en browser y Node
- Storybook — documentación y prueba de componentes/estados
- Vite — tooling para app shell y desarrollo rápido
- Vitest — pruebas en ecosistema Vite
- Playwright — pruebas de navegador para flujos UI
- OpenAPI Generator — `typescript-fetch` y `typescript-angular`
- WCAG 2.2 — estándar de accesibilidad web
- WAI-ARIA APG — patrones accesibles para widgets
- Material Design 3 — referencia de guidelines y componentes
- USWDS — referencia de design system y patrones inclusivos
- Design Tokens Community Group — base de interoperabilidad de tokens

---

## 27. Veredicto del requerimiento

`ngr-inventory-ui-foundation` deberá ser un **workspace UI propio del proyecto**, compuesto por una **base reusable** más un **prototipo ejecutable de mockups**.

Su misión no será “verse bonito” ni “simular el producto final” de manera improvisada. Su misión será construir una base visual, operativa y documental seria para que NGR Inventory pueda crecer con coherencia, testabilidad, accesibilidad y capacidad real de evolución hacia futuras apps y futuras superficies de producto.
