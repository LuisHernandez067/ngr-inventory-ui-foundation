// Punto de entrada principal de la aplicación prototipo
import './styles/main.scss';
import { initLayout } from './layout/index';
import { Router } from './router/router';
import { registerRoutes } from './router/routes';
import { authService } from './services/authService';

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

  // 1. Inicializar el layout del admin shell (navbar, sidebar, breadcrumb, footer)
  initLayout(app);

  // 2. Obtener el contenedor de contenido donde el router montará las páginas
  const pageContent = document.getElementById('page-content');
  if (!pageContent) {
    throw new Error('No se encontró el elemento #page-content en el DOM');
  }

  // 3. Crear el router y registrar todas las rutas
  const router = new Router(pageContent);
  registerRoutes(router);

  // 4. Iniciar la navegación evaluando la ruta actual
  router.start();

  // 5. Iniciar el temporizador de sesión (30 minutos de inactividad)
  authService.startSessionTimer(30);

  // 6. Escuchar el evento de sesión expirada y mostrar el modal de aviso
  window.addEventListener('ngr:session-expired', async () => {
    const { sessionExpiredModal } = await import('./components/session-expired-modal');
    sessionExpiredModal.show();
  });
}

mount().catch(console.error);
