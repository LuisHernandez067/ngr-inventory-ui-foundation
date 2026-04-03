import type { ReporteDefinicion } from '@ngr-inventory/api-contracts';

/** Definiciones de reportes disponibles en el sistema */
export const reporteDefinicionFixtures: ReporteDefinicion[] = [
  {
    id: 'rep-001',
    nombre: 'Stock Actual',
    tipo: 'stock_actual',
    descripcion: 'Listado completo del stock disponible por producto y almacén',
    formatos: ['pdf', 'xlsx', 'csv'],
  },
  {
    id: 'rep-002',
    nombre: 'Kardex de Movimientos',
    tipo: 'kardex',
    descripcion: 'Historial de entradas y salidas de un producto con saldo calculado',
    formatos: ['pdf', 'xlsx'],
  },
  {
    id: 'rep-003',
    nombre: 'Movimientos del Período',
    tipo: 'movimientos',
    descripcion: 'Todos los movimientos de inventario en un rango de fechas',
    formatos: ['pdf', 'xlsx', 'csv'],
  },
  {
    id: 'rep-004',
    nombre: 'Inventario Valorizado',
    tipo: 'valorizado',
    descripcion: 'Stock actual valorizado al precio unitario de cada producto',
    formatos: ['pdf', 'xlsx'],
  },
  {
    id: 'rep-005',
    nombre: 'Productos Bajo Mínimo',
    tipo: 'bajo_stock',
    descripcion: 'Productos cuyo stock actual está por debajo del mínimo configurado',
    formatos: ['pdf', 'xlsx', 'csv'],
  },
  {
    id: 'rep-006',
    nombre: 'Log de Auditoría',
    tipo: 'auditoria',
    descripcion: 'Registro de acciones de usuarios en el sistema',
    formatos: ['pdf', 'csv'],
  },
];
