// Punto de entrada principal de la aplicación prototipo
import './styles/main.scss';
import { initLayout } from './layout/index';

// Inicialización del Service Worker de MSW solo en desarrollo
async function initMocks(): Promise<void> {
  if (import.meta.env.DEV) {
    const { startWorker } = await import('@ngr-inventory/api-mocks');
    await startWorker();
  }
}

// Montar la app en el contenedor raíz
async function mount(): Promise<void> {
  await initMocks();

  const app = document.getElementById('app');
  if (!app) {
    throw new Error('No se encontró el elemento #app en el DOM');
  }

  // Inicializar el layout del admin shell
  initLayout(app);
}

mount().catch(console.error);
