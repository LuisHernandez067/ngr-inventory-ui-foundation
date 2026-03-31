# Pasos de validación manual — Phase 0 Governance

Luego de hacer checkout de los archivos de Phase 0, ejecutar los siguientes pasos en orden.

## 1. Instalar dependencias

```bash
npm install
```

Esto instala todas las devDependencies declaradas en el `package.json` raíz.

## 2. Inicializar Husky (git hooks)

```bash
npm run prepare
```

Esto ejecuta `husky` que instala los hooks en `.git/hooks/`. Solo es necesario la primera vez (o luego de un `npm install` limpio).

## 3. Verificar que los hooks funcionan

```bash
# Intentar un commit con formato incorrecto (debe rechazarse)
git commit --allow-empty -m "bad commit message"
# Esperado: Error de commitlint

# Intentar un commit correcto
git commit --allow-empty -m "chore: test commitlint hook"
# Esperado: Commit aceptado
```

## 4. Verificar ESLint

```bash
npm run lint
# Esperado: Sin errores (workspace vacío)
```

## 5. Verificar Prettier

```bash
npm run format:check
# Esperado: Sin diferencias
```

## 6. Verificar TypeScript

```bash
npm run typecheck
# Esperado: Sin errores de tipo
```

## 7. Verificar Stylelint

```bash
npm run stylelint
# Esperado: Sin errores (sin archivos .scss aún — --allow-empty-input)
```

## Notas

- Los archivos `.husky/pre-commit` y `.husky/commit-msg` deben tener permisos de ejecución (`chmod +x`). Esto se configura automáticamente con `npm run prepare` en sistemas Unix. En Windows con Git Bash también funciona correctamente.
- El workflow de CI (`.github/workflows/ci.yml`) requiere un repositorio en GitHub con Actions habilitado para ejecutarse.
