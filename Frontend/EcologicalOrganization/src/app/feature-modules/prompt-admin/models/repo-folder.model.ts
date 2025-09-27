export interface RepoFolder {
  id: number;
  name: string;
  parentId: number | null;
  createdBy: number | null;
  createdAt: string | null;
}

export interface PageMeta {
  page: number;
  perPage: number;
  totalCount: number;
}

export interface RepoFolderPage {
  items: RepoFolder[];
  meta: PageMeta;
}
