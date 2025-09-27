import { PageMeta } from './repo-folder.model';

export interface StorageObject {
  id: number;
  originalName: string;
  mimeType: string | null;
  sizeBytes: number;
  repoFolderId: number | null;
  path: string | null;
  createdBy: number | null;
  createdAt: string | null;
}

export interface StorageObjectPage {
  items: StorageObject[];
  meta: PageMeta;
}
