export interface Project {
  id: number;
  name: string;
  description: string | null;
  location: string | null;
  startDate: string; // LocalDateTime kao ISO string bez 'Z'
  endDate: string | null;
  archived: boolean;
  createdId: number;
  templateId: number | null;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // current page (0-based)
  size: number; // page size
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}
