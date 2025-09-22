export interface IUserProject{
  id: number;
  userId: number;
  projectId: number;
  projectRole: ProjectRole;
}

export enum ProjectRole {
  Manager = 'menadzer',
  Leader = 'vodja',
  Member = 'clan',
}
