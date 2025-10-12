export interface TagDTO {
  id: number;
  name: string;
  description?: string;
}

export interface CreateTagDTO {
  name: string;
  description?: string;
}
