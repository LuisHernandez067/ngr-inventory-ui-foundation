# Dashboard — Reglas de Arquitectura y Decisiones de Diseño

> Registro de decisiones arquitectónicas (ADR) para el Dashboard Operativo.
> Versión inicial: Fase 12 — `ngr-inventory-ui-foundation`.

---

## 1. Patrón de registro de widgets (`WIDGET_REGISTRY`)

**Decisión**: El orquestador itera un array `WIDGET_REGISTRY` declarativo en lugar de llamar a cada widget directamente.

**Fundamento**: Con llamadas directas, agregar o quitar un widget requiere modificar la lógica de montaje. Con el registro, el orquestador es agnóstico al contenido — solo necesita saber `id`, `containerId`, `render` y `roles`. Agregar un widget nuevo es una línea en el array; quitarlo no toca el motor de montaje.

**Consecuencias**:

- El orden de montaje es el orden del array — predecible y documentado.
- Los tests del orquestador verifican el registro, no las implementaciones de widgets.
- El registro es la fuente de verdad para "¿qué widgets existen en el dashboard?".

---

## 2. Visibilidad por rol — dos capas de defensa

**Decisión**: El filtrado de widgets por rol ocurre en **dos lugares**:

1. **Orquestador** (`dashboard.ts`): filtra el registro antes de montar. Si el rol no está en `widget.roles`, el widget nunca se instancia ni fetchea.
2. **Widget** (`alertsPanel.ts`): internamente verifica el rol y se oculta si es `consulta`.

**Fundamento**: La primera capa es la principal — evita mount, fetch y renders innecesarios. La segunda es defensa en profundidad: si el widget se usa fuera del orquestador (tests de integración, composición futura) no revelará datos a roles no autorizados. La redundancia es intencional en controles de acceso.

**Regla práctica**: El orquestador controla qué widgets se montan. El widget controla qué renderiza si es montado. Nunca solo uno de los dos.

---

## 3. Rol `consulta` — ocultamiento total de Alertas

**Decisión**: El widget `alertsPanel` no se monta ni se fetchea para el rol `consulta`.

**Fundamento**: Todos los tipos de alerta actuales (`bajo-stock`, `orden-pendiente`, `conteo-vencido`) son accionables: implican una acción correctiva que `consulta` no puede ejecutar. Mostrar alertas sin poder actuar genera ruido y confusión operacional. No existe un subconjunto "solo lectura" de alertas que tenga utilidad para este perfil.

**Si en el futuro** se agregan alertas informativas sin acción requerida, la decisión debe revisarse. El punto de extensión es agregar un tipo de alerta con `accionable: false` y filtrar en el widget antes de renderizar.

**Nota de implementación**: La restricción está en el registro (`roles: ['admin', 'operador']`) y reforzada en el widget (`profile === 'consulta' → display: none`). Ambas capas son necesarias (ver § 2).

---

## 4. Ciclo de vida del `AbortController` — uno por montaje

**Decisión**: Se crea un único `AbortController` por llamada a `mount()`. La señal se pasa a todos los widgets. `destroy()` llama a `controller.abort()` una sola vez.

**Fundamento**: Un controlador por widget sería más granular pero requeriría guardar referencias a N controladores. La granularidad no aporta valor aquí: el dashboard se destruye como unidad (navegación a otra página). Abortar individualmente sería necesario solo si los widgets pudieran destruirse de forma independiente, lo cual no está en el alcance.

**Contratos**:

- Cada widget recibe `signal` del orquestador — no crea su propio `AbortController`.
- Los widgets capturan `AbortError` en su `catch` y retornan silenciosamente.
- `destroy()` es idempotente: si `currentCleanup` es `null`, no hace nada.

---

## 5. Configuración curada de `quickAccess` — no dinámica

**Decisión**: `QUICK_ACCESS_CONFIG` es un array estático en el código fuente, no generado desde backend ni desde `getAllowedModules()` directamente.

**Fundamento**: `getAllowedModules()` devuelve una lista de claves de módulos habilitados, pero no incluye metadatos de presentación (etiqueta, ícono, ruta). Derivar atajos directamente de esa lista produciría botones sin orden definido y potencialmente con módulos poco relevantes como acceso rápido. La lista curada permite decidir qué módulos merecen un acceso directo desde el dashboard y en qué orden.

**Filtrado**: Los atajos curados se filtran por `getAllowedModules()` — si el perfil no tiene acceso al módulo, el botón no aparece. La config define el universo posible; el perfil determina el subconjunto visible.

**Mantenimiento**: Agregar un módulo nuevo al sistema no lo incluye automáticamente en quickAccess. Esto es intencional — el dashboard no debe crecer sin revisión.

---

## 6. Límite de monorepo — tipos locales en `prototype-shell`

**Decisión**: Los tipos `KpiMetric`, `DashboardAlert` y `MovementRow` se definen en `apps/prototype-shell/src/pages/dashboard/types.ts`, no en el paquete `api-contracts`.

**Fundamento**: El paquete `api-contracts` es la fuente de verdad para contratos compartidos entre múltiples apps. Modificarlo requiere coordinación entre equipos y aumenta el impacto del cambio. La Fase 12 es un prototipo funcional — los tipos son específicos de esta app y están sujetos a iteración. Mover los tipos a `api-contracts` es trabajo explícito de una fase futura, cuando los contratos estén estabilizados.

**Costo aceptado**: Los handlers de MSW en `packages/api-mocks` replican los mismos tipos localmente en lugar de importarlos de `prototype-shell` (que crearía una dependencia app → package, inversión incorrecta del grafo).

**Criterio de migración**: Cuando otra app necesite los mismos tipos, se migran a `api-contracts`. Hasta entonces, permanecen locales.

---

## Referencias

- Spec: `sdd/phase-12-dashboard/spec` (Engram)
- Diseño: `sdd/phase-12-dashboard/design` (Engram)
- Tareas: `sdd/phase-12-dashboard/tasks` (Engram)
