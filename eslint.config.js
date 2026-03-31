// @ts-check
import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';

/**
 * Configuración ESLint v9 — flat config
 * Aplica a todo el workspace: apps/* y packages/*
 */
export default tseslint.config(
  // --- Archivos ignorados globalmente ---
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.cache/**',
      '**/*.tsbuildinfo',
      'storybook-static/**',
    ],
  },

  // --- Reglas base de JS ---
  js.configs.recommended,

  // --- TypeScript con strict type-checked ---
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // --- Configuración de lenguaje para TS ---
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // --- Plugin de imports ---
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      // Importaciones ordenadas
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-duplicates': 'error',
      'import/no-cycle': 'error',

      // TypeScript — reglas ajustadas para el proyecto
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'error',

      // Calidad general
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // --- Archivos de configuración en raíz (sin type-checking) ---
  {
    files: ['*.config.js', '*.config.ts', 'commitlint.config.js'],
    ...tseslint.configs.disableTypeChecked,
  }
);
