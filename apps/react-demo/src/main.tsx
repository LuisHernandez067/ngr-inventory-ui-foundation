import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import '@ngr-inventory/design-tokens/css';

// Inicializa MSW en desarrollo antes de montar React
async function startApp(): Promise<void> {
  if (import.meta.env.DEV) {
    const { worker } = await import('@ngr-inventory/api-mocks/browser');
    await worker.start({ onUnhandledRequest: 'bypass' });
  }
  const container = document.getElementById('root');
  if (container === null) throw new Error('No se encontró el elemento root');
  createRoot(container).render(<App />);
}

void startApp();
