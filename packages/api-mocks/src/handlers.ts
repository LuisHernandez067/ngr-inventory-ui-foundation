import { http, HttpResponse } from 'msw';
import { authHandlers } from './handlers/auth.handlers';
import { dashboardHandlers } from './handlers/dashboard.handlers';
import { productosHandlers } from './handlers/productos.handlers';
import { categoriasHandlers } from './handlers/categorias.handlers';
import { proveedoresHandlers } from './handlers/proveedores.handlers';
import { almacenesHandlers } from './handlers/almacenes.handlers';
import { ubicacionesHandlers } from './handlers/ubicaciones.handlers';
import { movimientosHandlers } from './handlers/movimientos.handlers';
import { stockHandlers } from './handlers/stock.handlers';
import { kardexHandlers } from './handlers/kardex.handlers';
import { conteosHandlers } from './handlers/conteos.handlers';
import { usuariosHandlers } from './handlers/usuarios.handlers';
import { rolesHandlers } from './handlers/roles.handlers';
import { reportesHandlers } from './handlers/reportes.handlers';
import { auditoriaHandlers } from './handlers/auditoria.handlers';

// Handlers de MSW v2 para NGR Inventory API — todos los módulos
// GET /api/health — verifica disponibilidad de la API
export const handlers = [
  http.get('/api/health', () =>
    HttpResponse.json({
      status: 'ok',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    })
  ),
  ...authHandlers,
  ...dashboardHandlers,
  ...productosHandlers,
  ...categoriasHandlers,
  ...proveedoresHandlers,
  ...almacenesHandlers,
  ...ubicacionesHandlers,
  ...movimientosHandlers,
  ...stockHandlers,
  ...kardexHandlers,
  ...conteosHandlers,
  ...usuariosHandlers,
  ...rolesHandlers,
  ...reportesHandlers,
  ...auditoriaHandlers,
];
