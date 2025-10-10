export interface Member {
  id: number;
  projectId: number;
  userId: number;
  roleInProject: string;
  joinedAt: string; // ISO date string
  leftAt: string | null; // ISO date string or null
  active: boolean;
}
