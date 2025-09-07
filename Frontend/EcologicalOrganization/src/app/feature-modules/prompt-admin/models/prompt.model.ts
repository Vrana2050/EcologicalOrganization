import { PromptVersion } from './prompt-version.model';

export interface Prompt {
  id: number;
  title: string;
  documentTypeId: number;
  isActive: boolean;
  activeVersion?: PromptVersion | null;
  updatedAt?: string | null;
}

export interface PromptPage {
  items: Prompt[];
  meta: { page: number; perPage: number; totalCount: number };
}
