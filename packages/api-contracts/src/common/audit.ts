/** Campos de auditoría comunes a todas las entidades */
export type AuditFields = {
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdBy?: string;
  updatedBy?: string;
};
