import type { ListQueryParams } from '../common/pagination';

/** Stock de un producto en una ubicación específica */
export type StockItem = {
  productoId: string;
  productoCodigo: string;
  productoNombre: string;
  almacenId: string;
  almacenNombre: string;
  ubicacionId?: string;
  ubicacionNombre?: string;
  cantidadDisponible: number;
  cantidadReservada: number;
  cantidadTotal: number;
  lote?: string;
  vencimiento?: string; // ISO 8601
};

/** Stock consolidado de un producto en todos los almacenes */
export type StockConsolidado = {
  productoId: string;
  productoCodigo: string;
  productoNombre: string;
  cantidadTotal: number;
  stockMinimo: number;
  stockMaximo?: number;
  bajoMinimo: boolean;
  items: StockItem[];
};

/** Parámetros de consulta específicos para stock */
export type StockQueryParams = ListQueryParams & {
  almacenId?: string;
  productoId?: string;
  soloActivos?: boolean;
  bajominimo?: boolean;
};
