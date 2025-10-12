import { CustomMetadataValue, Tag } from './document.model';
import { TagDTO } from './tag.model';

export interface CreateDirectoryDTO {
  name: string;
  parent_directory_id?: number;
}

export interface Subdirectory {
  id: number;
  directory_id: number;
  access_type: string;
  name: string;
  created_at: string; // ili Date ako parsiraš
  last_modified: string;
  creator_id: number;
  tags: string[];
}

export interface Subdocument {
  id: number;
  document_id: number;
  access_type: string;
  name: string;
  created_at: string;
  last_modified: string;
  creator_id: number;
  tags: string[];
}

export interface CurrentPermission {
  directory_id: number;
  name: string;
  access_type: string;
}

export interface PathItem {
  id: number;
  name: string;
}

export interface DirectoryOpenResponse {
  current_permission: CurrentPermission | null;
  subdirectories: Subdirectory[];
  subdocuments: Subdocument[];
  path: PathItem[];
}

export interface UpdateDirectoryDTO {
  directory_id: number;
  directory_name: string;
  metadata: {
    metadata_id: number;
    value: any; // frontend šalje prirodni tip (boolean, number, string, date)
  }[];
  tags: string[];
}

export interface DirectoryReadDTO {
  directory_id: number;
  directory_name: string;
  parent_directory_id: number;
  created_at: string;
  last_modified: string;
  creator: string;
  custom_metadata_values: CustomMetadataValue[];
  tags: TagDTO[];
  path: PathItem[];
}
