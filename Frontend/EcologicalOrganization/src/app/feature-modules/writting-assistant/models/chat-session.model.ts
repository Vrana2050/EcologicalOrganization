export interface ChatSession {
  id: number;
  templateId: number;
  documentTypeId: number;
  createdBy: number;
  title?: string;
  updatedAt?: string;
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  totalCount: number;
}

export interface ChatSessionPage {
  items: ChatSession[];
  meta: PaginationMeta;
}

export interface ChatSessionCreate {
  templateId: number;
  title?: string;
}

export interface ChatSessionUpdateTitle {
  title: string;
  updatedAt: string;
}
