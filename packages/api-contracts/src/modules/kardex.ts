import type { ListQueryParams } from '../common/pagination';

/** Tipo de movimiento registrado en el kardex */
export type TipoMovimientoKardex = 'entrada' | 'salida' | 'ajuste' | 'saldo_inicial';

/** Entrada del kardex de un producto */
export interface KardexEntry {
  id: string;
  fecha: string; // ISO 8601
  productoId: string;
  productoCodigo: string;
  productoNombre: string;
  almacenId: string;
  almacenNombre: string;
  tipo: TipoMovimientoKardex;
  movimientoId?: string;
  movimientoNumero?: string;
  cantidadEntrada: number;
  cantidadSalida: number;
  saldoAnterior: number;
  saldoActual: number;
  precioUnitario: number;
  costoMovimiento: number;
}

/** Parámetros de consulta para el kardex */
export type KardexQueryParams = ListQueryParams & {
  productoId: string; // requerido
  almacenId?: string;
  fechaDesde?: string; // ISO 8601
  fechaHasta?: string; // ISO 8601
};
