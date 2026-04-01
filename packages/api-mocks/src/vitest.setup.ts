// Setup para Vitest en entorno Node.js
// MSW v2 resuelve rutas relativas contra location.href — en Node no existe,
// por eso definimos una URL base para que los handlers con path relativo funcionen.
Object.defineProperty(globalThis, 'location', {
  value: { href: 'http://localhost' },
  writable: true,
});
