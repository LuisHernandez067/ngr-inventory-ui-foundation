// Router hash-based principal — orquesta el ciclo de vida de las páginas
import { update as updateBreadcrumb } from '../layout/breadcrumb';
import { setActive } from '../layout/sidebar';
import { authService } from '../services/authService';

/**
 * Interfaz que todos los módulos de página deben implementar.
 * render() es síncrono — escribe HTML inicial y dispara fetch internamente.
 * destroy() limpia listeners y cancela requests en vuelo.
 */
export interface PageModule {
  render(container: HTMLElement, params?: Record<string, string>): void;
  destroy(): void;
}

/**
 * Configuración de una ruta individual.
 * guarded = true por defecto — requiere autenticación.
 */
interface RouteConfig {
  /** Factory que devuelve el módulo de página (puede ser async para lazy loading) */
  factory: () => Promise<PageModule> | PageModule;
  /** Etiqueta legible para el breadcrumb */
  breadcrumb: string;
  /** Si la ruta requiere autenticación. Por defecto: true */
  guarded?: boolean;
}

/**
 * Router principal basado en hash.
 * Propietario único del listener hashchange — layout/index.ts NO debe registrar
 * su propio listener para evitar condiciones de carrera.
 */
export class Router {
  private routes = new Map<string, RouteConfig>();
  private currentPage: PageModule | null = null;
  private container: HTMLElement;
  /** Monotonically increasing counter to detect stale navigations */
  private navigationId = 0;

  constructor(container: HTMLElement) {
    this.container = container;
    // El router es el único dueño de hashchange
    window.addEventListener('hashchange', () => {
      void this.navigate();
    });
  }

  /**
   * Registra una ruta en el mapa de rutas.
   * Los patrones con parámetros se expresan como '/segmento/:param'.
   */
  register(path: string, config: RouteConfig): void {
    this.routes.set(path, config);
  }

  /**
   * Resuelve la ruta actual y monta la página correspondiente.
   * Aplica el auth guard antes de montar cualquier ruta protegida.
   */
  async navigate(): Promise<void> {
    const hash = window.location.hash.replace('#', '') || '/';

    // Separar el path de los query params del hash (ej: /stock?productoId=xxx → /stock)
    // Los query params se leen directamente desde window.location.hash en cada página
    const hashPath = hash.split('?')[0] ?? hash;
    // Normalizar '/' a '/dashboard' para la ruta raíz
    const resolvedHash = hashPath === '/' ? '/dashboard' : hashPath;

    // Incrementar navigationId para invalidar navegaciones previas en vuelo
    const navId = ++this.navigationId;

    // Auth guard — delegar la verificación al servicio de autenticación
    const isAuthenticated = authService.isAuthenticated();

    // Determinar si la ruta destino está marcada como no protegida
    const targetConfig = this.routes.get(resolvedHash);
    const isGuarded = targetConfig ? (targetConfig.guarded ?? true) : true;

    if (!isAuthenticated && isGuarded) {
      window.location.hash = '#/auth';
      return;
    }

    // Si el usuario ya está autenticado y va a una ruta de auth, redirigir al dashboard
    if (isAuthenticated && resolvedHash === '/auth') {
      window.location.hash = '#/dashboard';
      return;
    }

    // Destruir la página actual antes de montar la nueva
    if (this.currentPage) {
      this.currentPage.destroy();
      this.currentPage = null;
    }

    // Buscar la ruta (exact match primero, luego pattern match)
    const matchResult = this.matchRoute(resolvedHash);

    if (!matchResult) {
      // Sin coincidencia — renderizar página 404 directamente (sin redirect)
      const { page404 } = await import('../pages/errors/page404');
      // Abortar si una navegación más nueva ya se inició
      if (navId !== this.navigationId) return;
      this.currentPage = page404;
      this.container.innerHTML = '';
      page404.render(this.container);
      this.syncLayout('#/404');
      return;
    }

    const { config, params } = matchResult;

    // Limpiar el contenedor antes del import dinámico para evitar contenido stale
    this.container.innerHTML = '';

    const module = await Promise.resolve(config.factory());

    // Abortar si una navegación más nueva ya se inició mientras esperábamos el import
    if (navId !== this.navigationId) return;

    this.currentPage = module;
    module.render(this.container, params);

    // Sincronizar breadcrumb y sidebar con la ruta actual
    this.syncLayout(window.location.hash || '#/');
  }

  /**
   * Sincroniza el breadcrumb y el estado activo del sidebar.
   * Se llama después de cada navegación exitosa.
   * Normaliza '#/dashboard' a '#/' para que coincida con el ítem de sidebar.
   */
  private syncLayout(hash: string): void {
    // '#/dashboard' es la ruta interna del dashboard, pero el sidebar usa '#/'
    const normalizedHash = hash === '#/dashboard' ? '#/' : hash;
    updateBreadcrumb(normalizedHash);
    setActive(normalizedHash);
  }

  /**
   * Busca la ruta correspondiente al hash dado.
   * Primero busca exact match, luego intenta pattern matching con parámetros.
   * Retorna null si no encuentra ninguna coincidencia.
   */
  private matchRoute(hash: string): { config: RouteConfig; params: Record<string, string> } | null {
    // Exact match — más rápido y evita colisiones con patrones
    if (this.routes.has(hash)) {
      const config = this.routes.get(hash);
      if (!config) return null;
      return { config, params: {} };
    }

    // Pattern match — para rutas con parámetros como '/productos/:id'
    for (const [pattern, config] of this.routes) {
      const params = this.matchPattern(pattern, hash);
      if (params !== null) {
        return { config, params };
      }
    }

    return null;
  }

  /**
   * Compara un patrón de ruta contra un hash concreto.
   * Los segmentos que comienzan con ':' se tratan como parámetros capturados.
   * Retorna el mapa de parámetros o null si no hay coincidencia.
   */
  private matchPattern(pattern: string, hash: string): Record<string, string> | null {
    const patternParts = pattern.split('/');
    const hashParts = hash.split('/');

    if (patternParts.length !== hashParts.length) return null;

    const params: Record<string, string> = {};
    for (let i = 0; i < patternParts.length; i++) {
      const patternSegment = patternParts[i] ?? '';
      const hashSegment = hashParts[i] ?? '';
      if (patternSegment.startsWith(':')) {
        // Segmento de parámetro — capturar valor
        params[patternSegment.slice(1)] = hashSegment;
      } else if (patternSegment !== hashSegment) {
        // Segmento literal que no coincide
        return null;
      }
    }
    return params;
  }

  /**
   * Inicia el router evaluando la ruta actual al cargar la aplicación.
   */
  start(): void {
    void this.navigate();
  }
}
