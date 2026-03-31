# ADR-0002 — TypeScript en Modo Strict Completo

| Campo      | Valor                         |
| ---------- | ----------------------------- |
| **Estado** | Aceptado                      |
| **Fecha**  | 2026-03-31                    |
| **Autor**  | Equipo NGR Inventory UI       |
| **Área**   | TypeScript, Calidad de código |

---

## Contexto

Un design system y workspace de UI con múltiples consumers (Angular, React, Vite) necesita contratos de tipos robustos. Los tipos laxos o el uso de `any` introducen bugs silenciosos que son difíciles de detectar en runtime, especialmente en accesos a índices de arrays y propiedades opcionales.

---

## Decisión

Habilitamos TypeScript con **strict mode completo** + opciones adicionales más allá de `strict: true`:

```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "noImplicitOverride": true,
  "exactOptionalPropertyTypes": true,
  "noPropertyAccessFromIndexSignature": true
}
```

### Justificación por opción

| Opción                               | Por qué                                                                                                                                       |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `strict: true`                       | Activa: strictNullChecks, strictFunctionTypes, strictBindCallApply, strictPropertyInitialization, noImplicitAny, noImplicitThis, alwaysStrict |
| `noUncheckedIndexedAccess`           | `array[0]` devuelve `T \| undefined` — fuerza verificar antes de usar. Previene runtime crashes.                                              |
| `noImplicitOverride`                 | Obliga usar `override` en métodos que sobreescriben — hace intencional la herencia.                                                           |
| `exactOptionalPropertyTypes`         | `{ prop?: string }` no acepta `undefined` como valor explícito — diferencia "no presente" de "presente y undefined".                          |
| `noPropertyAccessFromIndexSignature` | Fuerza notación de corchetes para index signatures — hace visible que el acceso puede ser undefined.                                          |

### Módulos con NodeNext

```json
{
  "module": "NodeNext",
  "moduleResolution": "NodeNext",
  "verbatimModuleSyntax": true,
  "isolatedModules": true
}
```

**Justificación**: `NodeNext` resuelve módulos con el algoritmo de Node.js (ESM + CJS). `verbatimModuleSyntax` + `isolatedModules` garantizan que los imports de tipo (`import type`) se eliminen en compilación y que cada archivo sea compilable de forma aislada (prerrequisito para herramientas como Vite, Esbuild, Babel).

---

## Consecuencias

### Positivas

- Cero accesos inseguros a arrays sin verificación.
- Contratos de API tipados estrictamente — los consumers saben exactamente qué reciben.
- Errores de tipo en compilación, no en runtime.
- Facilita refactoring — el compilador detecta todos los puntos de uso.

### Negativas / Trade-offs

- Mayor verbosidad inicial al escribir código (más verificaciones necesarias).
- Algunas librerías externas tienen tipos incompletos → `skipLibCheck: true` mitiga esto sin comprometer nuestro código.
- Migrar código legacy a strict es costoso (no aplica aquí — empezamos desde cero).

---

## Reglas de equipo

- ❌ Nunca usar `as SomeType` sin comentario explicativo.
- ❌ Nunca usar `// @ts-ignore` sin un issue asociado.
- ✅ Preferir `satisfies` sobre `as` para narrowing de literales.
- ✅ Usar `unknown` + narrowing en lugar de `any`.

---

## Referencias

- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict)
- [noUncheckedIndexedAccess](https://www.typescriptlang.org/tsconfig#noUncheckedIndexedAccess)
- [verbatimModuleSyntax](https://www.typescriptlang.org/tsconfig#verbatimModuleSyntax)
- [TypeScript 5.7 Release Notes](https://devblogs.microsoft.com/typescript/announcing-typescript-5-7/)
