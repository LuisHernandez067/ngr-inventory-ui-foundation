import type { PaginatedResponse, Producto } from '@ngr-inventory/api-contracts';
import React, { useState, useEffect } from 'react';

import styles from './ProductList.module.scss';

// Componente que muestra la lista de productos obtenida desde la API
export default function ProductList(): React.JSX.Element {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carga productos desde la API (interceptada por MSW en desarrollo)
    fetch('/api/productos')
      .then((r) => r.json())
      .then((data: PaginatedResponse<Producto>) => {
        setProductos(data.data);
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="text-muted">Cargando productos...</p>;
  }

  if (productos.length === 0) {
    return <p className="text-muted">No se encontraron productos.</p>;
  }

  return (
    <div className={styles['container']}>
      <table className="table table-striped" aria-label="Lista de productos">
        <thead>
          <tr>
            <th scope="col">Código</th>
            <th scope="col">Nombre</th>
            <th scope="col">Categoría</th>
            <th scope="col">Stock mínimo</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.id}>
              <td>{p.codigo}</td>
              <td>{p.nombre}</td>
              <td>{p.categoriaNombre}</td>
              <td>{p.stockMinimo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
