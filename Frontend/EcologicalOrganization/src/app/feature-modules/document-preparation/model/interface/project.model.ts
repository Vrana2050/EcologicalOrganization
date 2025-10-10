import { IUserProject } from "src/app/feature-modules/document-preparation/model/interface/user-project.model";
import { IWorkflow } from "./workflow.model";
export interface IProject extends IBaseProject{
  dueDate: Date;
  workflow: IWorkflow;
}
export interface IProjectHome extends IBaseProject {
  getNumberOfMembers(): number;
}
export enum ProjectStatus {
  Completed = 'zavrsen',
  Abandoned = 'obustavljen',
  InProgress = 'u_toku',
}
export interface IBaseProject{
  id: number;
  name: string;
  status: ProjectStatus;
  completionPercentage: number;
  members: IUserProject[];

  canEdit(userId: number): boolean;
  getStatusLabel(): string;
  isCompleted(): boolean;
  isAbandoned(): boolean;
  isInProgress(): boolean;
  isUserOwner(userId: number): boolean;
  isUserAssignee(userId: number): boolean;
  canAbandon(userId: number): boolean;
}
export interface IProjectBoard extends IProject {

}

