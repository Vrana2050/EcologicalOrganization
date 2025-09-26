export interface Template {
  id: number;
  name: string;
  documentTypeId: number;
  documentTypeName?: string;
  updatedAt?: string;
}

export interface TemplatePageMeta {
  page: number;
  perPage: number;
  totalCount: number;
}

export interface TemplatePage {
  items: Template[];
  meta: TemplatePageMeta;
}
