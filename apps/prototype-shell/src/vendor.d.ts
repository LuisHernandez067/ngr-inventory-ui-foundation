// Declaraciones de módulos de terceros sin tipos propios para la compilación del prototipo
declare module 'sweetalert2/dist/sweetalert2.js';
declare module 'bootstrap';

// Shim de tipos para @axe-core/playwright hasta que el paquete esté instalado en el entorno
declare module '@axe-core/playwright' {
  import type { Page } from '@playwright/test';

  interface AxeResults {
    violations: AxeViolation[];
    passes: AxeViolation[];
    incomplete: AxeViolation[];
    inapplicable: AxeViolation[];
  }

  interface AxeViolation {
    id: string;
    description: string;
    help: string;
    helpUrl: string;
    impact: string | null;
    nodes: unknown[];
  }

  class AxeBuilder {
    constructor(options: { page: Page });
    withTags(tags: string[]): AxeBuilder;
    exclude(selector: string): AxeBuilder;
    include(selector: string): AxeBuilder;
    analyze(): Promise<AxeResults>;
  }

  export default AxeBuilder;
}
