/// <reference types="vite/client" />

// Declaraciones de módulos para react-dom — reemplazadas al instalar @types/react-dom
declare module 'react-dom/client' {
  import type React from 'react';

  export interface Root {
    render(children: React.ReactNode): void;
    unmount(): void;
  }

  export function createRoot(container: Element | DocumentFragment): Root;
  export function hydrateRoot(
    container: Element | Document,
    initialChildren: React.ReactNode
  ): Root;
}
