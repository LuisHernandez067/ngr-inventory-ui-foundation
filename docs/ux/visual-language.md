# NGR Inventory — Lenguaje Visual

> Documento de verdad visual para NGR Inventory UI Foundation. Define los principios de diseño, sistema de colores, tipografía, espaciado y estética de componentes que sirven como fuente de verdad para todas las fases subsiguientes.

---

## Tabla de Contenidos

1. [Principios de Diseño](#principios-de-diseño)
2. [Paleta de Colores](#paleta-de-colores)
   - [Color Primario — NGR Blue](#color-primario--ngr-blue)
   - [Colores Semánticos](#colores-semánticos)
   - [Paleta Neutral — Slate](#paleta-neutral--slate)
3. [Sistema de Temas](#sistema-de-temas)
   - [Matriz de Temas](#matriz-de-temas)
   - [Cómo Aplicar Temas](#cómo-aplicar-temas)
4. [Tipografía](#tipografía)
   - [Familias Tipográficas](#familias-tipográficas)
   - [Escala Tipográfica](#escala-tipográfica)
   - [Pesos y Alturas de Línea](#pesos-y-alturas-de-línea)
5. [Sistema de Espaciado](#sistema-de-espaciado)
6. [Estética de Componentes](#estética-de-componentes)
   - [Radio de Borde](#radio-de-borde)
   - [Sombras](#sombras)
   - [Anillo de Foco](#anillo-de-foco)
   - [Anchos de Borde](#anchos-de-borde)
7. [Iconografía](#iconografía)
8. [Mapeo a Bootstrap 5](#mapeo-a-bootstrap-5)
9. [Accesibilidad](#accesibilidad)
   - [Tabla de Contraste](#tabla-de-contraste)
   - [Consideraciones para Daltonismo](#consideraciones-para-daltonismo)
   - [Herramientas Recomendadas](#herramientas-recomendadas)

---

## Principios de Diseño

Estos cinco principios rigen cada decisión visual de NGR Inventory. Antes de agregar cualquier estilo, preguntá: ¿este cambio respeta los cinco principios?

---

### 1. Claridad sobre Decoración

**Descripción:** Cada elemento visual sirve a la comprensión. Si un elemento no ayuda al usuario a entender o a actuar, no tiene lugar en la interfaz. Gradientes decorativos, sombras ornamentales y animaciones sin propósito están prohibidos.

| ✅ Hacer                                                   | ❌ No hacer                                                  |
| ---------------------------------------------------------- | ------------------------------------------------------------ |
| Usar color para señalar estado (éxito, error, advertencia) | Usar gradientes en fondos de tarjetas "para que se vea bien" |
| Usar sombras para indicar elevación y jerarquía            | Agregar sombras a elementos planos como badges de texto      |
| Usar bordes para separar contenido relacionado             | Decorar títulos con íconos puramente estéticos               |

---

### 2. Densidad con Aire

**Descripción:** NGR Inventory es una herramienta de datos densos — tablas de inventario, formularios de movimiento, reportes. La densidad es una ventaja operativa, no un defecto. El espaciado consistente previene la sobrecarga cognitiva sin sacrificar la compacidad.

| ✅ Hacer                                               | ❌ No hacer                                              |
| ------------------------------------------------------ | -------------------------------------------------------- |
| Usar padding compacto (8px–12px) en filas de tabla     | Forzar filas de tabla de 64px de alto "para que respire" |
| Mantener jerarquía visual clara entre secciones        | Eliminar todo el espacio blanco en nombre de la densidad |
| Usar tipografía pequeña (12–14px) en datos secundarios | Usar el mismo tamaño tipográfico para todo               |

---

### 3. Confianza a través de la Contención

**Descripción:** Los azules/teals profesionales para acciones primarias. Superficies neutrales. El color se usa semánticamente, nunca decorativamente. Un sistema cromático predecible genera confianza operacional — el usuario sabe qué es accionable y qué es información.

| ✅ Hacer                                                           | ❌ No hacer                                          |
| ------------------------------------------------------------------ | ---------------------------------------------------- |
| Reservar el color primario (NGR Blue) para CTAs y estados activos  | Usar el color primario en títulos decorativos        |
| Usar colores semánticos (verde, ámbar, rojo) para estados de stock | Inventar nuevos colores fuera de la paleta definida  |
| Usar neutrales para fondos, superficies y texto no interactivo     | Colorear elementos de navegación con tonos de acento |

---

### 4. Accesible por Defecto

**Descripción:** El contraste AA (4.5:1 para texto normal, 3:1 para texto grande y UI) es el piso, no el techo. El color nunca es el único portador de significado — siempre se complementa con forma, etiqueta o ícono. El sistema debe funcionar para personas con daltonismo.

| ✅ Hacer                                                                    | ❌ No hacer                                                      |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Validar todos los pares texto/fondo contra WCAG 2.2 AA antes de usarlos     | Asumir que "se ve bien" equivale a contraste suficiente          |
| Usar ícono + color para indicar estados (ej. ícono de alerta + color ámbar) | Usar solo rojo/verde para indicar error/éxito sin otro indicador |
| Proveer `aria-label` en íconos no textuales                                 | Dejar íconos decorativos sin `aria-hidden="true"`                |

---

### 5. Coherencia de Temas

**Descripción:** Los cuatro temas (light, dark, warm, cold) se sienten como LA MISMA aplicación, no cuatro skins distintos. Solo cambian valores de color (superficies, texto, bordes, sombras). La tipografía, el espaciado y el radio de borde son constantes en todos los temas.

| ✅ Hacer                                                      | ❌ No hacer                                                   |
| ------------------------------------------------------------- | ------------------------------------------------------------- |
| Cambiar temas únicamente a través de variables CSS en la raíz | Usar clases condicionales para estilar diferente en dark mode |
| Mantener la escala tipográfica idéntica en todos los temas    | Cambiar tamaños de fuente o espaciado según el tema           |
| Definir todos los valores de tema en la matriz de tokens      | Hardcodear colores sin pasar por variables de tema            |

---

## Paleta de Colores

### Color Primario — NGR Blue

Paleta teal-azul profesional basada en `hsl(201, 70%, %)`. El paso 600 es el color de marca principal — contrasta texto blanco a 4.5:1 o más.

| Paso | HEX       | HSL                  | Uso                                                                   |
| ---- | --------- | -------------------- | --------------------------------------------------------------------- |
| 50   | `#eef7fb` | `hsl(201, 60%, 96%)` | Fondos de estado informativo, hover muy sutil                         |
| 100  | `#d5ecf5` | `hsl(201, 65%, 89%)` | Fondos de badge info, highlight de fila seleccionada                  |
| 200  | `#aad8ec` | `hsl(201, 67%, 79%)` | Bordes en estado focus de input (tema light)                          |
| 300  | `#73bedd` | `hsl(201, 63%, 66%)` | Íconos en estado disabled, decoración secundaria                      |
| 400  | `#3ea3ce` | `hsl(201, 60%, 52%)` | Estado hover de botón primario en tema dark                           |
| 500  | `#1d8ab4` | `hsl(201, 72%, 41%)` | Color primario en tema dark (contrasta sobre dark-surface)            |
| 600  | `#1471a0` | `hsl(201, 76%, 35%)` | **Color de marca principal** — botones primarios, links activos, foco |
| 700  | `#0f5a82` | `hsl(201, 78%, 28%)` | Estado pressed/active de botón primario                               |
| 800  | `#0a3f5e` | `hsl(201, 75%, 20%)` | Texto sobre fondos claros (acento fuerte)                             |
| 900  | `#062638` | `hsl(201, 73%, 13%)` | Texto sobre fondos muy claros (énfasis máximo)                        |
| 950  | `#031520` | `hsl(201, 73%, 7%)`  | Fondo de header en tema dark ultra                                    |

> **Override Bootstrap**: `$primary: #1471a0` (`--bs-primary: #1471a0`)

---

### Colores Semánticos

Cada color semántico tiene tres variantes: **light** (para fondos y superficies), **default** (para íconos y bordes), **dark** (para texto sobre fondo claro).

#### Éxito — Verde (Stock OK / Operación exitosa)

| Variante | HEX       | HSL                  | Uso                                               |
| -------- | --------- | -------------------- | ------------------------------------------------- |
| light    | `#dcfce7` | `hsl(142, 76%, 93%)` | Fondo de badge "stock ok", fondo de alert success |
| default  | `#16a34a` | `hsl(142, 71%, 36%)` | Ícono de éxito, borde de input válido             |
| dark     | `#14532d` | `hsl(142, 72%, 20%)` | Texto de label "stock ok" sobre fondo claro       |

> **Override Bootstrap**: `$success: #16a34a`

#### Advertencia — Ámbar (Stock bajo / Acción requerida)

| Variante | HEX       | HSL                 | Uso                                                    |
| -------- | --------- | ------------------- | ------------------------------------------------------ |
| light    | `#fef9c3` | `hsl(55, 92%, 88%)` | Fondo de alert "stock bajo", highlight de fila critica |
| default  | `#ca8a04` | `hsl(45, 93%, 40%)` | Ícono de advertencia, borde de campo con warning       |
| dark     | `#713f12` | `hsl(35, 75%, 26%)` | Texto de estado "bajo stock" sobre fondo claro         |

> **Override Bootstrap**: `$warning: #ca8a04`

#### Peligro — Rojo (Sin stock / Error / Destructivo)

| Variante | HEX       | HSL                | Uso                                                        |
| -------- | --------- | ------------------ | ---------------------------------------------------------- |
| light    | `#fee2e2` | `hsl(0, 86%, 93%)` | Fondo de alert error, fondo de badge "sin stock"           |
| default  | `#dc2626` | `hsl(0, 72%, 51%)` | Ícono de error, borde de input inválido, botón destructivo |
| dark     | `#7f1d1d` | `hsl(0, 63%, 31%)` | Texto de estado "sin stock" sobre fondo claro              |

> **Override Bootstrap**: `$danger: #dc2626`

#### Información — Azul claro (Movimiento / Datos informativos)

| Variante | HEX       | HSL                  | Uso                                                 |
| -------- | --------- | -------------------- | --------------------------------------------------- |
| light    | `#e0f2fe` | `hsl(204, 94%, 94%)` | Fondo de panel informativo, highlight de movimiento |
| default  | `#0284c7` | `hsl(200, 98%, 39%)` | Ícono informativo, borde de tooltip                 |
| dark     | `#0c4a6e` | `hsl(204, 80%, 24%)` | Texto informativo sobre fondo claro                 |

> **Override Bootstrap**: `$info: #0284c7`

---

### Paleta Neutral — Slate

Grises con base azul. Más cálidos que grises puros, más fríos que grises cálidos. Ideales para superficies, bordes y texto de una interfaz operativa.

| Paso | HEX       | HSL                  | Uso                                                         |
| ---- | --------- | -------------------- | ----------------------------------------------------------- |
| 50   | `#f8fafc` | `hsl(210, 40%, 98%)` | Fondo de página en tema light                               |
| 100  | `#f1f5f9` | `hsl(210, 40%, 96%)` | Fondo de tabla alternada (striped), fondo de sidebar        |
| 200  | `#e2e8f0` | `hsl(214, 32%, 91%)` | Bordes de separador, divisores de tabla                     |
| 300  | `#cbd5e1` | `hsl(213, 27%, 84%)` | Bordes de input en estado normal                            |
| 400  | `#94a3b8` | `hsl(215, 20%, 65%)` | Placeholder de input, texto deshabilitado, ícono decorativo |
| 500  | `#64748b` | `hsl(215, 16%, 47%)` | Texto muted, metadatos secundarios                          |
| 600  | `#475569` | `hsl(215, 19%, 35%)` | Texto secundario, etiquetas de campo                        |
| 700  | `#334155` | `hsl(215, 25%, 27%)` | Texto de encabezado de columna en tabla                     |
| 800  | `#1e293b` | `hsl(217, 33%, 17%)` | Texto principal en tema light                               |
| 900  | `#0f172a` | `hsl(222, 47%, 11%)` | Fondo de sidebar en tema dark, texto de máximo contraste    |
| 950  | `#020617` | `hsl(224, 71%, 4%)`  | Fondo de página en tema dark ultra                          |

> **Override Bootstrap**: Escala `$gray-X` personalizada con valores Slate

---

## Sistema de Temas

### Matriz de Temas

Cada variable define una propiedad visual. Solo los valores de color cambian entre temas; el espaciado, la tipografía y el radio de borde son invariantes.

| Variable                    | light     | dark      | warm         | cold          |
| --------------------------- | --------- | --------- | ------------ | ------------- |
| `--color-bg-page`           | `#f8fafc` | `#0f172a` | `#faf8f5`    | `#f0f4f8`     |
| `--color-bg-surface`        | `#ffffff` | `#1e293b` | `#fffdf7`    | `#f5f8fd`     |
| `--color-bg-surface-raised` | `#f1f5f9` | `#334155` | `#f5f0e8`    | `#eaf0f9`     |
| `--color-border-default`    | `#e2e8f0` | `#475569` | `#e8e0d4`    | `#d4dff0`     |
| `--color-border-strong`     | `#cbd5e1` | `#64748b` | `#d4c8b8`    | `#b8ceea`     |
| `--color-text-primary`      | `#1e293b` | `#f1f5f9` | `#1c1917`    | `#1e2e3b`     |
| `--color-text-secondary`    | `#475569` | `#94a3b8` | `#57534e`    | `#4a6178`     |
| `--color-text-muted`        | `#94a3b8` | `#64748b` | `#a8a29e`    | `#7d9ab8`     |
| `--color-brand-600`         | `#1471a0` | `#3ea3ce` | `#1471a0`    | `#1471a0`     |
| `--color-shadow-color`      | `0 0% 0%` | `0 0% 0%` | `30 10% 20%` | `210 30% 20%` |

> **Nota:** En tema `dark`, el color de marca se sube a 400 para mantener contraste AA sobre superficies oscuras.

---

### Cómo Aplicar Temas

Los temas se activan mediante el atributo `data-bs-theme` en el elemento `<html>`. Bootstrap 5.3+ soporta `light` y `dark` de forma nativa; `warm` y `cold` son extensiones propias.

```html
<!-- Tema claro (por defecto) -->
<html data-bs-theme="light">
  <!-- Tema oscuro -->
  <html data-bs-theme="dark">
    <!-- Tema cálido (extensión NGR) -->
    <html data-bs-theme="warm">
      <!-- Tema frío (extensión NGR) -->
      <html data-bs-theme="cold"></html>
    </html>
  </html>
</html>
```

Las variables CSS se definen en el selector `[data-bs-theme]` correspondiente:

```css
/* Variables del tema light (por defecto) */
:root,
[data-bs-theme='light'] {
  --color-bg-page: #f8fafc;
  --color-bg-surface: #ffffff;
  --color-text-primary: #1e293b;
  /* ... resto de variables */
}

[data-bs-theme='dark'] {
  --color-bg-page: #0f172a;
  --color-bg-surface: #1e293b;
  --color-text-primary: #f1f5f9;
  /* ... resto de variables */
}

[data-bs-theme='warm'] {
  --color-bg-page: #faf8f5;
  --color-bg-surface: #fffdf7;
  --color-text-primary: #1c1917;
  /* ... resto de variables */
}

[data-bs-theme='cold'] {
  --color-bg-page: #f0f4f8;
  --color-bg-surface: #f5f8fd;
  --color-text-primary: #1e2e3b;
  /* ... resto de variables */
}
```

---

## Tipografía

### Familias Tipográficas

#### Inter — Fuente Primaria (Cuerpo y Encabezados)

Inter es una fuente diseñada específicamente para interfaces de usuario. Su alta legibilidad a tamaños pequeños la hace ideal para tablas de datos y formularios densos.

```css
/* Importar desde Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* Stack tipográfico completo */
--font-sans:
  Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
  'Helvetica Neue', sans-serif;
```

> **Override Bootstrap**: `$font-family-sans-serif: var(--font-sans)`

#### JetBrains Mono — Fuente Monoespaciada (Datos y Código)

Para SKUs, cantidades, precios, códigos de barras y cualquier dato tabular que requiera alineación de caracteres.

```css
/* Importar desde Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');

/* Stack monoespaciado completo */
--font-mono: 'JetBrains Mono', 'Cascadia Code', 'Fira Code', 'Cascadia Mono', 'Consolas', monospace;
```

> **Override Bootstrap**: `$font-family-monospace: var(--font-mono)`

---

### Escala Tipográfica

Base: `1rem = 16px`. Escala modular con razón aproximada de 1.25.

| Token         | rem        | px     | Uso                                                    |
| ------------- | ---------- | ------ | ------------------------------------------------------ |
| `--text-xs`   | `0.75rem`  | `12px` | Metadatos, timestamps, etiquetas de estado compactas   |
| `--text-sm`   | `0.875rem` | `14px` | Texto de formularios, filas de tabla, texto secundario |
| `--text-base` | `1rem`     | `16px` | Cuerpo de texto, descripciones, párrafos de ayuda      |
| `--text-lg`   | `1.125rem` | `18px` | Subtítulos de sección, encabezados de card             |
| `--text-xl`   | `1.25rem`  | `20px` | Título de página de detalle, nombre de producto        |
| `--text-2xl`  | `1.5rem`   | `24px` | Encabezados de sección principal, totales de dashboard |
| `--text-3xl`  | `2rem`     | `32px` | Título de módulo, hero de reporte                      |

> **Override Bootstrap**: `$font-size-base: 1rem`, escalas de encabezados vía `$h1-font-size` a `$h6-font-size`

---

### Pesos y Alturas de Línea

#### Pesos Tipográficos

| Token             | Valor | Uso                                                    |
| ----------------- | ----- | ------------------------------------------------------ |
| `--font-normal`   | `400` | Cuerpo de texto, valores de formulario, texto de tabla |
| `--font-medium`   | `500` | Texto de énfasis suave, labels de campo activo         |
| `--font-semibold` | `600` | Encabezados de sección, títulos de card, botones       |
| `--font-bold`     | `700` | Títulos principales, totales críticos, alertas         |

> **Override Bootstrap**: `$font-weight-normal: 400`, `$font-weight-bold: 700`, `$font-weight-semibold: 600`

#### Alturas de Línea

| Token               | Valor  | Uso                                                 |
| ------------------- | ------ | --------------------------------------------------- |
| `--leading-tight`   | `1.25` | Encabezados, títulos cortos, badges de estado       |
| `--leading-normal`  | `1.5`  | Cuerpo de texto, párrafos, textos de ayuda          |
| `--leading-relaxed` | `1.75` | Texto de onboarding, instrucciones largas, tooltips |

> **Override Bootstrap**: `$line-height-base: 1.5`, `$headings-line-height: 1.25`

---

## Sistema de Espaciado

Base: **4px**. Todos los valores son múltiplos estrictos de 4px. Nunca usar valores intermedios (ej. 5px, 7px, 10px). El espaciado no cambia entre temas.

| Token        | px     | Uso común                                                   |
| ------------ | ------ | ----------------------------------------------------------- |
| `--space-1`  | `4px`  | Gap entre ícono y texto inline, padding de badge compacto   |
| `--space-2`  | `8px`  | Padding horizontal de badge, gap entre elementos inline     |
| `--space-3`  | `12px` | Padding de celda de tabla, gap en grupos de botones         |
| `--space-4`  | `16px` | Padding de input, padding de card body compacto             |
| `--space-5`  | `20px` | Gap en formularios, padding de dropdown item                |
| `--space-6`  | `24px` | Padding de card standard, margen entre secciones menores    |
| `--space-8`  | `32px` | Padding de sección, margen entre bloques de contenido       |
| `--space-10` | `40px` | Margen entre secciones mayores, padding de header de módulo |
| `--space-12` | `48px` | Padding de página en mobile, espacio antes de footer        |
| `--space-16` | `64px` | Margen entre módulos de dashboard                           |
| `--space-20` | `80px` | Separación de secciones de landing                          |
| `--space-24` | `96px` | Padding de hero section                                     |

> **Override Bootstrap**: `$spacer: 1rem` (16px base), `$spacers` map con valores correspondientes

---

## Estética de Componentes

### Radio de Borde

| Token           | Valor    | Uso                                                      |
| --------------- | -------- | -------------------------------------------------------- |
| `--radius-none` | `0px`    | Tablas de datos, separadores duros, elementos de sistema |
| `--radius-sm`   | `4px`    | Badges, chips, inputs, botones pequeños                  |
| `--radius-md`   | `6px`    | Botones standard, dropdowns, popovers                    |
| `--radius-lg`   | `8px`    | Cards, modales, paneles laterales                        |
| `--radius-xl`   | `12px`   | Cards de dashboard hero, modales grandes                 |
| `--radius-full` | `9999px` | Avatares, progress pills, tags de estado circular        |

> **Override Bootstrap**: `$border-radius: 6px`, `$border-radius-sm: 4px`, `$border-radius-lg: 8px`, `$border-radius-pill: 9999px`

---

### Sombras

Las sombras definen jerarquía de elevación. En tema dark se usan sombras más sutiles ya que el contraste de superficie ya proporciona jerarquía.

#### Tema Light

| Token         | CSS Value                                                               | Uso                                              |
| ------------- | ----------------------------------------------------------------------- | ------------------------------------------------ |
| `--shadow-xs` | `0 1px 2px 0 rgb(0 0 0 / 0.05)`                                         | Inputs en focus suave, elementos inline elevados |
| `--shadow-sm` | `0 1px 3px 0 rgb(0 0 0 / 0.10), 0 1px 2px -1px rgb(0 0 0 / 0.10)`       | Cards de formulario, dropdowns simples           |
| `--shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.10), 0 2px 4px -2px rgb(0 0 0 / 0.10)`    | Cards de contenido, popovers                     |
| `--shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.10), 0 4px 6px -4px rgb(0 0 0 / 0.10)`  | Modales, drawers laterales                       |
| `--shadow-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.10), 0 8px 10px -6px rgb(0 0 0 / 0.10)` | Overlays flotantes, command palettes             |

#### Tema Dark

| Token         | CSS Value                                                               | Uso                          |
| ------------- | ----------------------------------------------------------------------- | ---------------------------- |
| `--shadow-xs` | `0 1px 2px 0 rgb(0 0 0 / 0.40)`                                         | Inputs en focus suave (dark) |
| `--shadow-sm` | `0 1px 3px 0 rgb(0 0 0 / 0.50), 0 1px 2px -1px rgb(0 0 0 / 0.50)`       | Cards en tema dark           |
| `--shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.50), 0 2px 4px -2px rgb(0 0 0 / 0.50)`    | Popovers en tema dark        |
| `--shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.60), 0 4px 6px -4px rgb(0 0 0 / 0.60)`  | Modales en tema dark         |
| `--shadow-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.60), 0 8px 10px -6px rgb(0 0 0 / 0.60)` | Overlays en tema dark        |

> **Override Bootstrap**: `$box-shadow: var(--shadow-md)`, `$box-shadow-sm: var(--shadow-sm)`, `$box-shadow-lg: var(--shadow-lg)`

---

### Anillo de Foco

El anillo de foco es el indicador de accesibilidad crítico para navegación por teclado. Debe ser visible en TODOS los temas sin excepción.

```css
/* Especificación del anillo de foco */
:focus-visible {
  outline: 2px solid var(--color-brand-600);
  outline-offset: 2px;
}

/* En tema dark, el color de marca ya es más claro (--color-brand-600 apunta a 400) */
[data-bs-theme='dark'] :focus-visible {
  outline-color: var(--color-brand-600); /* Resuelve a #3ea3ce en dark */
}
```

**Reglas del anillo de foco:**

- Grosor: siempre `2px`
- Color: siempre `var(--color-brand-600)` (que adapta su valor por tema)
- Offset: siempre `2px` (espacio entre el elemento y el anillo)
- Selector: siempre `:focus-visible` (no `:focus`, para evitar anillo en clicks de mouse)
- Nunca `outline: none` sin reemplazo accesible equivalente

> **Override Bootstrap**: `$focus-ring-width: 2px`, `$focus-ring-color: var(--color-brand-600)`, `$focus-ring-opacity: 1`

---

### Anchos de Borde

| Variante | Valor | Uso                                                    |
| -------- | ----- | ------------------------------------------------------ |
| Default  | `1px` | Bordes de input, card, tabla, dropdown — estado normal |
| Focus    | `2px` | Bordes de input en estado focus (además del outline)   |

> **Override Bootstrap**: `$border-width: 1px`

---

## Iconografía

### Bootstrap Icons

NGR Inventory usa **Bootstrap Icons** como librería exclusiva de íconos. No mezclar con otras librerías (no Font Awesome, no Material Icons) para mantener coherencia visual.

#### Variantes de Tamaño

| Tamaño           | Uso                                                           |
| ---------------- | ------------------------------------------------------------- |
| `16px` (1rem)    | Íconos inline en texto, íconos de acción en tabla compacta    |
| `20px` (1.25rem) | Íconos en botones standard, íconos de label de formulario     |
| `24px` (1.5rem)  | Íconos de navegación, íconos de card header, íconos de estado |

#### Reglas de Alineación

- Los íconos deben alinearse ópticamente con el texto adyacente usando `vertical-align: middle` o alineación flexbox.
- En grupos `display: flex`, usar `align-items: center` y gap de `--space-2` (8px) entre ícono y texto.
- No escalar íconos con `transform: scale()` — usar los tamaños predefinidos.

```html
<!-- Ícono decorativo (no comunica info extra) — ocultar de lectores de pantalla -->
<i class="bi bi-box-seam" aria-hidden="true"></i>
<span>Inventario</span>

<!-- Ícono que comunica significado solo (sin texto) — etiquetar para lectores de pantalla -->
<button aria-label="Editar producto">
  <i class="bi bi-pencil" aria-hidden="true"></i>
</button>

<!-- Ícono de estado (siempre acompañar con texto o visualmente equivalente) -->
<span class="text-success" aria-label="Stock disponible">
  <i class="bi bi-check-circle-fill" aria-hidden="true"></i>
  <span class="visually-hidden">Stock disponible</span>
</span>
```

#### Íconos de Uso Frecuente en NGR Inventory

| Concepto              | Bootstrap Icon                 |
| --------------------- | ------------------------------ |
| Producto / Item       | `bi-box-seam`                  |
| Stock ok              | `bi-check-circle-fill`         |
| Stock bajo            | `bi-exclamation-triangle-fill` |
| Sin stock             | `bi-x-circle-fill`             |
| Movimiento de entrada | `bi-arrow-down-circle`         |
| Movimiento de salida  | `bi-arrow-up-circle`           |
| Reporte / Exportar    | `bi-file-earmark-spreadsheet`  |
| Filtrar               | `bi-funnel`                    |
| Buscar                | `bi-search`                    |
| Editar                | `bi-pencil`                    |
| Eliminar              | `bi-trash3`                    |
| Agregar               | `bi-plus-lg`                   |
| Configuración         | `bi-gear`                      |

---

## Mapeo a Bootstrap 5

Referencia de cómo cada decisión de diseño se implementa en Bootstrap 5.3 vía variables SCSS. Todos los valores son **overrides** (reemplazan valores Bootstrap), no extensiones, salvo indicación.

| Decisión                    | Variable SCSS Bootstrap   | Valor                                                                      |
| --------------------------- | ------------------------- | -------------------------------------------------------------------------- |
| Color primario de marca     | `$primary`                | `#1471a0`                                                                  |
| Color de éxito              | `$success`                | `#16a34a`                                                                  |
| Color de advertencia        | `$warning`                | `#ca8a04`                                                                  |
| Color de peligro            | `$danger`                 | `#dc2626`                                                                  |
| Color informativo           | `$info`                   | `#0284c7`                                                                  |
| Fuente sans-serif           | `$font-family-sans-serif` | `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` |
| Fuente monoespaciada        | `$font-family-monospace`  | `'JetBrains Mono', 'Cascadia Code', 'Fira Code', monospace`                |
| Tamaño base de fuente       | `$font-size-base`         | `1rem`                                                                     |
| Alto de línea base          | `$line-height-base`       | `1.5`                                                                      |
| Alto de línea encabezados   | `$headings-line-height`   | `1.25`                                                                     |
| Peso normal                 | `$font-weight-normal`     | `400`                                                                      |
| Peso bold                   | `$font-weight-bold`       | `700`                                                                      |
| Peso semibold               | `$font-weight-semibold`   | `600`                                                                      |
| Radio de borde base         | `$border-radius`          | `6px`                                                                      |
| Radio de borde pequeño      | `$border-radius-sm`       | `4px`                                                                      |
| Radio de borde grande       | `$border-radius-lg`       | `8px`                                                                      |
| Radio de borde pill         | `$border-radius-pill`     | `9999px`                                                                   |
| Unidad base de espaciado    | `$spacer`                 | `1rem` (16px)                                                              |
| Ancho de borde              | `$border-width`           | `1px`                                                                      |
| Sombra base                 | `$box-shadow`             | `0 4px 6px -1px rgb(0 0 0 / 0.10), 0 2px 4px -2px rgb(0 0 0 / 0.10)`       |
| Sombra pequeña              | `$box-shadow-sm`          | `0 1px 3px 0 rgb(0 0 0 / 0.10), 0 1px 2px -1px rgb(0 0 0 / 0.10)`          |
| Sombra grande               | `$box-shadow-lg`          | `0 10px 15px -3px rgb(0 0 0 / 0.10), 0 4px 6px -4px rgb(0 0 0 / 0.10)`     |
| Ancho del anillo de foco    | `$focus-ring-width`       | `2px`                                                                      |
| Color del anillo de foco    | `$focus-ring-color`       | `rgba($primary, 1)`                                                        |
| Opacidad del anillo de foco | `$focus-ring-opacity`     | `1`                                                                        |
| Escala gray-50              | `$gray-100`               | `#f8fafc` (Slate 50)                                                       |
| Escala gray-100             | `$gray-200`               | `#f1f5f9` (Slate 100)                                                      |
| Escala gray-800             | `$gray-800`               | `#1e293b` (Slate 800)                                                      |
| Escala gray-900             | `$gray-900`               | `#0f172a` (Slate 900)                                                      |

> **Nota sobre extensiones:** Los temas `warm` y `cold` son extensiones propias (no Bootstrap nativo). Se implementan como selectores `[data-bs-theme="warm"]` y `[data-bs-theme="cold"]` en la capa de tokens (Fase 2).

---

## Accesibilidad

### Tabla de Contraste

Todas las combinaciones de texto/fondo válidas del sistema. Ratios calculados según WCAG 2.2. **Mínimo requerido: AA (4.5:1 normal, 3:1 grande).**

| Texto                    | Fondo                 | Tema  | Ratio      | Normal                           | Grande / UI |
| ------------------------ | --------------------- | ----- | ---------- | -------------------------------- | ----------- |
| `#1e293b` (Slate 800)    | `#ffffff` (white)     | light | **14.7:1** | ✅ AAA                           | ✅ AAA      |
| `#1e293b` (Slate 800)    | `#f8fafc` (Slate 50)  | light | **13.9:1** | ✅ AAA                           | ✅ AAA      |
| `#1e293b` (Slate 800)    | `#f1f5f9` (Slate 100) | light | **12.8:1** | ✅ AAA                           | ✅ AAA      |
| `#475569` (Slate 600)    | `#ffffff` (white)     | light | **6.6:1**  | ✅ AA                            | ✅ AAA      |
| `#475569` (Slate 600)    | `#f8fafc` (Slate 50)  | light | **6.2:1**  | ✅ AA                            | ✅ AAA      |
| `#94a3b8` (Slate 400)    | `#ffffff` (white)     | light | **2.9:1**  | ❌ — solo uso decorativo         | ✅ AA       |
| `#1471a0` (Brand 600)    | `#ffffff` (white)     | light | **5.1:1**  | ✅ AA                            | ✅ AAA      |
| `#1471a0` (Brand 600)    | `#f8fafc` (Slate 50)  | light | **4.8:1**  | ✅ AA                            | ✅ AAA      |
| `#ffffff` (white)        | `#1471a0` (Brand 600) | light | **5.1:1**  | ✅ AA                            | ✅ AAA      |
| `#ffffff` (white)        | `#0f5a82` (Brand 700) | light | **8.1:1**  | ✅ AAA                           | ✅ AAA      |
| `#16a34a` (Success)      | `#ffffff` (white)     | light | **4.5:1**  | ✅ AA                            | ✅ AAA      |
| `#dc2626` (Danger)       | `#ffffff` (white)     | light | **4.5:1**  | ✅ AA                            | ✅ AAA      |
| `#ca8a04` (Warning)      | `#ffffff` (white)     | light | **3.2:1**  | ❌ — usar Warning Dark           | ✅ AA       |
| `#713f12` (Warning Dark) | `#ffffff` (white)     | light | **9.4:1**  | ✅ AAA                           | ✅ AAA      |
| `#f1f5f9` (Slate 100)    | `#0f172a` (Slate 900) | dark  | **13.2:1** | ✅ AAA                           | ✅ AAA      |
| `#94a3b8` (Slate 400)    | `#0f172a` (Slate 900) | dark  | **5.4:1**  | ✅ AA                            | ✅ AAA      |
| `#64748b` (Slate 500)    | `#0f172a` (Slate 900) | dark  | **3.5:1**  | ❌ — solo uso decorativo en dark | ✅ AA       |
| `#3ea3ce` (Brand 400)    | `#0f172a` (Slate 900) | dark  | **6.2:1**  | ✅ AA                            | ✅ AAA      |
| `#3ea3ce` (Brand 400)    | `#1e293b` (Slate 800) | dark  | **5.1:1**  | ✅ AA                            | ✅ AAA      |

> **Regla crítica para Warning:** El color `#ca8a04` (warning default) NO pasa contraste 4.5:1 sobre blanco. Para texto, siempre usar `#713f12` (warning dark) sobre fondos claros. El color warning default es solo para íconos y bordes (elementos UI, ratio 3:1).

---

### Consideraciones para Daltonismo

NGR Inventory usa estados de stock que podrían basarse solo en color (verde/ámbar/rojo). Esto es insuficiente. Reglas obligatorias:

1. **Nunca color solo.** Cada estado de stock DEBE tener:
   - Color semántico (verde/ámbar/rojo)
   - Ícono diferenciador (`bi-check-circle-fill` / `bi-exclamation-triangle-fill` / `bi-x-circle-fill`)
   - Texto legible (`"Disponible"` / `"Stock bajo"` / `"Sin stock"`)

2. **Deuteranopia y Protanopia** (confusión rojo-verde): La diferencia entre "Disponible" y "Sin stock" debe ser perceptible por forma e ícono, no solo por tono. Los íconos utilizados tienen formas completamente distintas (círculo con check vs círculo con X).

3. **Tritanopia** (confusión azul-amarillo): El color informativo (azul) no puede ser el único diferenciador de estados. Siempre acompañar con ícono.

4. **Contraste mínimo de luminancia** entre estados semánticos:
   - El verde (`#16a34a`) y el rojo (`#dc2626`) tienen luminancias suficientemente distintas para ser diferenciables en escalas de grises.
   - El ámbar (`#ca8a04`) tiene luminancia intermedia — el ícono es crítico.

---

### Herramientas Recomendadas

| Herramienta                         | URL                                                               | Uso                                                                 |
| ----------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------- |
| WebAIM Contrast Checker             | https://webaim.org/resources/contrastchecker/                     | Verificar ratios de contraste WCAG antes de usar un par color/fondo |
| Colour Contrast Analyser (app)      | https://www.tpgi.com/color-contrast-checker/                      | Eyedropper para verificar contraste en pantalla directamente        |
| Coblis Color Blindness Simulator    | https://www.color-blindness.com/coblis-color-blindness-simulator/ | Simular todos los tipos de daltonismo en capturas de pantalla       |
| Polypane Browser                    | https://polypane.app/                                             | Previsualizar todos los temas y accesibilidad simultáneamente       |
| Accessible Palette                  | https://accessiblepalette.com/                                    | Construir paletas con contraste AA garantizado desde el inicio      |
| Bootstrap 5.3 CSS Custom Properties | https://getbootstrap.com/docs/5.3/customize/css-variables/        | Referencia oficial de variables Bootstrap sobrescribibles           |

---

_Documento generado como parte de NGR Inventory UI Foundation — Fase 1: Visual Discovery._
_Versión inicial — toda revisión debe mantener los ratios de contraste AA y los principios de diseño._
