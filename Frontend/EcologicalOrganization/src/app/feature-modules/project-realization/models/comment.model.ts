export interface Comment {
  id: number;
  projectId: number;
  taskId: number;
  memberId: number;
  text: string;
  createdAt: string; // ISO date string
}
