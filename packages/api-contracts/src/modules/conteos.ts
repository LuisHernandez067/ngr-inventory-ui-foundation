import type { AuditFields } from '../common/audit';

/** Estado del conteo físico de inventario */
export type EstadoConteo = 'planificado' | 'en_curso' | 'pausado' | 'completado' | 'anulado';

/** Ítem individual dentro de un conteo físico */
export type ConteoItem = {
  id: string;
  productoId: string;
  productoCodigo: string;
  productoNombre: string;
  ubicacionId?: string;
  cantidadSistema: number;
  cantidadContada?: number;
  diferencia?: number;
  ajustado: boolean;
};

/** Conteo físico de inventario */
export type Conteo = AuditFields & {
  id: string;
  numero: string;
  descripcion: string;
  almacenId: string;
  almacenNombre: string;
  estado: EstadoConteo;
  items: ConteoItem[];
  fechaInicio?: string; // ISO 8601
  fechaFin?: string; // ISO 8601
};

/** DTO para crear un conteo */
export type CreateConteoDto = Omit<Conteo, 'id' | 'numero' | keyof AuditFields>;

/** DTO para actualizar un conteo */
export type UpdateConteoDto = Partial<CreateConteoDto>;
