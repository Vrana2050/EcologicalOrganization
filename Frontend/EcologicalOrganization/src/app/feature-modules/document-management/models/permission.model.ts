export interface PermissionCreateDTO {
  email?: string;
  group_name?: string;
  access_type: string;
  expires_at?: string | null;
  directory_id?: number;
  document_id?: number;
}
