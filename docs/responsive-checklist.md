# Checklist Responsive — ngr-inventory-ui-foundation

Guía de referencia para implementar y verificar el comportamiento responsive en todas las vistas del sistema. Aplica a todos los desarrolladores que trabajen en el proyecto.

---

## 1. Breakpoints usados

Este proyecto usa los breakpoints estándar de Bootstrap 5 sin modificaciones:

| Breakpoint | Ancho mínimo | Descripción                                   |
| ---------- | ------------ | --------------------------------------------- |
| `xs`       | < 576px      | Mobile portrait                               |
| `sm`       | ≥ 576px      | Mobile landscape                              |
| `md`       | ≥ 768px      | Tablet                                        |
| `lg`       | ≥ 992px      | Desktop — el sidebar pasa de offcanvas a fijo |
| `xl`       | ≥ 1200px     | Desktop wide                                  |
| `xxl`      | ≥ 1400px     | Desktop extra wide                            |

**Punto de quiebre crítico:** `lg` (992px) es donde el sidebar cambia de comportamiento. Por debajo de ese valor se muestra como offcanvas (panel lateral que se abre sobre el contenido); por encima se renderiza como sidebar fijo visible siempre.

---

## 2. Reglas de collapse de filtros

### Estructura base

Las barras de filtros usan la combinación `d-flex flex-wrap gap-3` para que los elementos se acomoden automáticamente sin necesidad de media queries explícitas:

```html
<div class="d-flex flex-wrap gap-3 align-items-end mb-3">
  <div class="flex-fill" style="min-width: 200px">
    <label class="form-label">Categoría</label>
    <select class="form-select">
      ...
    </select>
  </div>
  <!-- más filtros -->
</div>
```

### Reglas obligatorias

- **NO usar `min-width` inline en `<select>`** — el contenedor flex se encarga del sizing. El `min-width` va en el wrapper del filtro, no en el control.
- **Tablet (≥ 768px):** todos los filtros deben estar visibles. No se permiten filtros ocultos con `d-none d-md-flex` o similares que escondan opciones de filtrado en tablet.
- **Mobile (< 576px):** los filtros pueden apilarse verticalmente. Es el comportamiento natural de `flex-wrap`.

### Anti-patrones a evitar

```html
<!-- MAL: min-width en el select -->
<select class="form-select" style="min-width: 180px">
  ...
</select>

<!-- BIEN: min-width en el wrapper -->
<div class="flex-fill" style="min-width: 180px">
  <select class="form-select">
    ...
  </select>
</div>
```

---

## 3. Requisitos de touch targets (WCAG 2.2)

### Tamaño mínimo

Todo elemento interactivo debe tener un área de toque de al menos **44×44px** en dispositivos touch. Esto es un requisito del criterio de éxito 2.5.8 de WCAG 2.2.

### Clase modificadora `.btn-touch-target`

Para botones pequeños (`btn-sm`) en áreas de acción crítica, usar la clase `.btn-touch-target`:

```html
<!-- Botones de acción en columna de tabla -->
<button class="btn btn-sm btn-outline-primary btn-touch-target">
  <i class="bi bi-pencil"></i>
</button>
<button class="btn btn-sm btn-outline-danger btn-touch-target">
  <i class="bi bi-trash"></i>
</button>
```

### Comportamiento de la clase

- **Dispositivos touch (`pointer: coarse`):** amplía el área de toque al mínimo de 44×44px usando `min-width`, `min-height`, y `padding` aumentado.
- **Desktop (`pointer: fine`):** no produce ningún cambio visual. El botón se ve exactamente igual que sin la clase.

### Dónde es obligatoria

La clase `.btn-touch-target` es **obligatoria** en los botones de la columna de acciones (editar/eliminar) de todas las tablas de datos. En otras áreas de la UI se aplica según criterio del desarrollador.

---

## 4. Estrategia de tablas

### Wrapper con scroll horizontal

Todas las tablas de datos deben estar envueltas en `.ngr-datatable-wrapper`, que aplica `overflow-x: auto` para permitir scroll horizontal en viewports pequeños:

```html
<div class="ngr-datatable-wrapper">
  <table class="table table-hover">
    ...
  </table>
</div>
```

### Reglas para `<th>`

- **NO usar estilos de ancho inline en `<th>`** — dejar que el navegador distribuya los anchos automáticamente según el contenido.
- **Columna de acciones:** usar la clase `.col-actions` en lugar de `style="width: Npx"`.

```html
<!-- MAL: ancho inline -->
<th style="width: 120px">Acciones</th>

<!-- BIEN: clase semántica -->
<th class="col-actions">Acciones</th>
```

### Restricciones

- **NO usar `overflow: hidden`** en el wrapper de tabla. Esto corta el scroll horizontal y es el error más común al depurar tablas en mobile.
- Si una tabla tiene columnas fijas (`position: sticky`), el wrapper debe tener `overflow-x: auto`, no `overflow: hidden`.

---

## 5. Padding del contenido principal

El área de contenido principal (`<main>`) usa padding responsivo definido en el archivo de estilos de layout:

| Viewport          | Padding | Valor CSS |
| ----------------- | ------- | --------- |
| Desktop (≥ 768px) | 24px    | `1.5rem`  |
| Mobile (< 768px)  | 16px    | `1rem`    |

**Archivo de definición:** `apps/prototype-shell/src/styles/layout/_main.scss`

No replicar este padding en componentes individuales. Si una vista necesita más espacio, usar clases de utilidad de Bootstrap (`px-3`, `py-4`, etc.) de forma explícita y justificada.

---

## 6. Contenedor de formularios

### Clase `.page-form-container`

Para páginas de formulario o detalle, usar la clase `.page-form-container` como wrapper del contenido principal:

```html
<div class="page-form-container">
  <form>
    <!-- campos del formulario -->
  </form>
</div>
```

### Comportamiento

La clase aplica:

```css
.page-form-container {
  width: 100%;
  max-width: var(--ngr-form-max-width, 720px);
}
```

El token `--ngr-form-max-width` tiene como valor por defecto `720px`.

### Sobrescribir el ancho máximo por página

Si una página específica necesita un ancho diferente, sobrescribir el token CSS en el elemento, no usar `style` con `max-width` directamente:

```html
<!-- BIEN: sobrescribir el token -->
<div class="page-form-container" style="--ngr-form-max-width: 900px">...</div>

<!-- MAL: max-width inline directo -->
<div class="page-form-container" style="max-width: 900px">...</div>
```

Esto mantiene la semántica clara: el token comunica la intención, el valor inline directo no.

---

## 7. Testing con Playwright

### Proyectos disponibles

Los tests responsive se ejecutan contra proyectos de Playwright configurados para tablet y mobile.

### Comandos

```bash
# Correr tests en tablet
npx playwright test --project=tablet

# Correr tests en mobile
npx playwright test --project=mobile

# Correr solo la suite responsive
npx playwright test responsive --project=tablet
npx playwright test responsive --project=mobile
```

### Qué verifica la suite responsive

- Visibilidad de filtros en tablet
- Scroll horizontal en tablas en mobile
- Tamaño de touch targets en columna de acciones
- Comportamiento del sidebar (offcanvas vs fijo)
- Padding del contenido principal en cada breakpoint

### Cuándo correr estos tests

- Antes de cualquier PR que modifique estilos de layout, tablas o filtros
- Al agregar una nueva vista con tabla o formulario
- Al modificar el componente de sidebar o shell

---

_Última actualización: fase 19 — Responsive_
