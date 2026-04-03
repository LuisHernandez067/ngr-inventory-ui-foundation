import React from 'react';

import './styles/main.scss';
import ProductList from './pages/ProductList/ProductList';

// Componente raíz de la aplicación React Demo
export default function App(): React.JSX.Element {
  return (
    <div className="container py-4">
      <h1 className="mb-4">NGR Inventory — React Demo</h1>
      <ProductList />
    </div>
  );
}
