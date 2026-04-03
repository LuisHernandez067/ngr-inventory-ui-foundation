/* eslint-disable @typescript-eslint/no-unsafe-call -- Los decoradores @Component y signal() son de @angular/core, no instalado aún */
/* eslint-disable @typescript-eslint/no-unsafe-assignment -- signal<T>() no puede resolverse sin @angular/core instalado */
/* eslint-disable @typescript-eslint/no-unsafe-member-access -- .set() en Signal no puede resolverse sin @angular/core instalado */
import { NgFor, NgIf } from '@angular/common';
import { Component, type OnInit, signal } from '@angular/core';
import type { PaginatedResponse, Producto } from '@ngr-inventory/api-contracts';

// Componente que muestra la lista de productos obtenida desde la API
@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [NgIf, NgFor],
  template: `
    <p *ngIf="loading()">Cargando productos...</p>
    <p *ngIf="!loading() && productos().length === 0" class="text-muted">
      No se encontraron productos.
    </p>
    <table
      *ngIf="!loading() && productos().length > 0"
      class="table table-striped"
      aria-label="Lista de productos"
    >
      <thead>
        <tr>
          <th scope="col">Código</th>
          <th scope="col">Nombre</th>
          <th scope="col">Categoría</th>
          <th scope="col">Stock mínimo</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let p of productos()">
          <td>{{ p.codigo }}</td>
          <td>{{ p.nombre }}</td>
          <td>{{ p.categoriaNombre }}</td>
          <td>{{ p.stockMinimo }}</td>
        </tr>
      </tbody>
    </table>
  `,
})
export class ProductListComponent implements OnInit {
  // Señales para estado reactivo
  readonly productos = signal<Producto[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    // Carga productos desde la API (interceptada por MSW en desarrollo)
    void fetch('/api/productos')
      .then((r) => r.json() as Promise<PaginatedResponse<Producto>>)
      .then((data) => {
        this.productos.set(data.data);
      })
      .catch(console.error)
      .finally(() => {
        this.loading.set(false);
      });
  }
}
