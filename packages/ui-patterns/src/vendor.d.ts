// Declaraciones de módulos de terceros sin tipos propios o con rutas no resueltas

// sweetalert2 expone sus tipos desde la raíz del paquete (sweetalert2.d.ts),
// pero el import directo desde /dist/sweetalert2.js no tiene mapeado de tipos.
// Re-exportamos el tipo por defecto del entry principal para que ui-core compile aquí.
declare module 'sweetalert2/dist/sweetalert2.js' {
  export { default } from 'sweetalert2';
  export * from 'sweetalert2';
}

// Bootstrap no incluye un campo "types" en su package.json en esta versión instalada.
// Declaramos el módulo con los tipos mínimos usados en ui-patterns.
declare module 'bootstrap' {
  export class Tooltip {
    constructor(element: Element, options?: object);
    show(): void;
    hide(): void;
    dispose(): void;
  }

  export class Dropdown {
    constructor(element: Element, options?: object);
    show(): void;
    hide(): void;
    dispose(): void;
  }

  export class Modal {
    constructor(element: Element, options?: object);
    show(): void;
    hide(): void;
    dispose(): void;
    static getInstance(element: Element): Modal | null;
  }
}
