export interface Task {
  id: number;
  projectId: number;
  statusId: number;
  assignedMemberId?: number;
  name: string;
  description: string;
  deadline?: string; // ISO 8601 date string (yyyy-mm-dd)
  createdAt: string; // ISO 8601 date-time string
  finishedAt?: string; // ISO 8601 date-time string
}
