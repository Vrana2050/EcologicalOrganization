export interface PromptVersion {
  id: number;
  promptId: number;
  name: string | null;
  description: string | null;
  promptText: string | null;
  isActive?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  isNew?: boolean;
}
