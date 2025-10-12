export interface PathItem {
  id: number;
  name: string;
}

export interface CustomMetadata {
  id: number;
  name: string;
  metadata_type: string; // "String" | "Boolean" | "Date" | "Datetime" | "Time" | "Integer" | "Decimal"
  description?: string | null;
}

export interface CustomMetadataValue {
  id: number;
  value: any | null;
  is_missing_value: boolean;
  custom_metadata: CustomMetadata;
}

export interface DocumentFile {
  version: number;
  uploaded_at: string; // ISO date string
  uploader: string; // email
  file_size: number;
  file_type: string;
  file_name: string;
  file_path: string;
  summary: string | null;
}

export interface PermissionValue {
  id: number;
  access_type: string; // "EDITOR" | "VIEWER" | "PREVIEW" | ...
  expires_at?: string | null;
}

export interface Permission {
  id: number;
  principal_type: string; // "OWNER" | "USER" | "GROUP"
  user_id?: number | null;
  user_email?: string | null;
  group_id?: number | null;
  group_name?: string | null;
  permission_value: PermissionValue;
}

export interface Tag {
  id: number;
  name: string;
  description?: string | null;
}

export interface DocumentDTO {
  id: number;
  name: string;
  created_at: string; // ISO date string
  last_modified: string; // ISO date string
  parent_directory_id?: number | null;
  active_version: number;
  creator: string; // email
  access_type: string;

  path?: PathItem[];

  custom_metadata_values: CustomMetadataValue[];
  document_files: DocumentFile[];
  permissions: Permission[];
  tags: Tag[];
}

export interface UpdateDocumentDTO {
  document_id: number;
  document_name: string;
  metadata: {
    metadata_id: number;
    value: any; // frontend šalje prirodni tip (boolean, number, string, date)
  }[];
  tags: string[];
}
