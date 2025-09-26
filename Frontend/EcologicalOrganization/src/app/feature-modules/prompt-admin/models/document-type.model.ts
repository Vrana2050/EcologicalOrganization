export interface DocumentType {
  id: number;
  name: string;
  description?: string | null;
  deleted: number;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface DocumentTypePage {
  items: DocumentType[];
  meta: {
    page: number;
    perPage: number;
    totalCount: number;
  };
}
