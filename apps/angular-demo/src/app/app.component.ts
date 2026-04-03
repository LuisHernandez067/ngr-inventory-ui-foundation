/* eslint-disable @typescript-eslint/no-unsafe-call -- El decorador @Component es de @angular/core, no instalado aún */
import { Component } from '@angular/core';

import { ProductListComponent } from './pages/product-list/product-list.component';

// Componente raíz de la aplicación Angular Demo
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ProductListComponent],
  template: `
    <div class="container py-4">
      <h1 class="mb-4">NGR Inventory — Angular Demo</h1>
      <app-product-list />
    </div>
  `,
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- requerido por Angular: las clases de componente pueden estar vacías
export class AppComponent {}
