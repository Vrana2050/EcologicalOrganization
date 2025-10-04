export interface IUserProject{
  id: number;
  userId: number;
  projectId: number;
  projectRole: ProjectRole;
  name?:string;
}

export enum ProjectRole {
  Manager = 'menadzer',
  Leader = 'vodja',
  Member = 'clan',
}
