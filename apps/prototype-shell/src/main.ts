// Punto de entrada principal de la aplicación prototipo
import './styles/main.scss';

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

  // Contenido inicial del prototipo
  app.innerHTML = `
    <div class="container py-4">
      <h1 class="display-4">NGR Inventory</h1>
      <p class="lead">Prototipo navegable — Bootstrap Theme cargado correctamente.</p>
    </div>
  `;
}

mount().catch(console.error);
