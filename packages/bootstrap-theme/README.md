# @ngr-inventory/bootstrap-theme

Bootstrap 5 theme con los design tokens de NGR Inventory. Provee un único entry point Sass que compila Bootstrap completo con los overrides visuales de NGR aplicados.

## Uso

### Tema completo (recomendado)

En el entry point Sass principal de tu app:

```scss
@import '@ngr-inventory/bootstrap-theme/src/ngr-theme';
```

O bien usando el alias de exports de `package.json`:

```scss
// En proyectos Vite con sass loadPaths configurado
@use '@ngr-inventory/bootstrap-theme';
```

### Solo variables (para compilación propia de Bootstrap)

Si querés compilar Bootstrap vos mismo con las variables NGR:

```scss
@import '@ngr-inventory/bootstrap-theme/src/variables';
@import 'bootstrap/scss/bootstrap';
```

### Sobreescribir variables del tema

Si necesitás cambiar algún valor puntual, importá tus overrides antes del tema:

```scss
// Tus overrides
$primary: #custom-color;

// Luego el tema NGR (que ya no pisará $primary porque ya está definido)
@import '@ngr-inventory/bootstrap-theme/src/ngr-theme';
```

## Requerimientos

- `sass` ^1.0.0 (peer dependency — tu proyecto lo provee)
- `bootstrap` ^5.3.0 (incluido como dependency del package)
- `@ngr-inventory/design-tokens` (debe estar disponible en el workspace)

## Clases personalizadas

Las siguientes clases se agregan sobre las clases de Bootstrap:

| Clase                 | Descripción                                                               |
| --------------------- | ------------------------------------------------------------------------- |
| `.table-compact`      | Variante de tabla densa para listas de inventario (padding 4px/8px)       |
| `.font-mono`          | Tipografía monoespaciada para SKUs, cantidades y datos numéricos          |
| `.text-truncate-cell` | Truncado con ellipsis para celdas de tabla (requiere `width` en el padre) |
| `.text-muted-ngr`     | Texto secundario usando Slate 500 del sistema de diseño                   |
| `.badge-compact`      | Badge compacto sin padding excesivo                                       |

## Estructura interna

```
src/
  _variables.scss       # Overrides de variables Bootstrap usando design tokens
  ngr-theme.scss        # Entry point principal — importa variables → Bootstrap → overrides
  overrides/
    _buttons.scss       # Densidad compacta + anillo de foco accesible
    _forms.scss         # Inputs compactos + estados de validación
    _tables.scss        # .table-compact + estilos de encabezado
    _utilities.scss     # Utilidades NGR adicionales
```

## Relación con design-tokens

Este package consume `@ngr-inventory/design-tokens` como `devDependency`. Los tokens se referencian via path relativo (`../../design-tokens/src/tokens`) durante la compilación. Si distribuís el CSS compilado, los consumidores no necesitan tener `design-tokens` instalado.
