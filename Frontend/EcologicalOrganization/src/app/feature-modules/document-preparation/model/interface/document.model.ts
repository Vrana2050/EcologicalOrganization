import { IProject } from "./project.model";
import { IWorkflow,IWorkflowStatus } from "./workflow.model";
import { IUserProject } from "./user-project.model";
import { IFile } from "./file.model";
export interface IDocumentBase{
  id : number;
  projectId : number;
  name: string;
  description? : string;
  isDraft : boolean;
  dueDate ?: Date;
  status : IWorkflowStatus;
  workflowId ?: number;
  priority ?: Priority;
  lastModified ?: Date;
  lastModifiedBy ?: IUserProject;
  completionPercentage: number;
  parentDocumentId? : number;
  mainFileId? : number;
  ownerId : number;
}

export enum Priority {
  Low = 'mali',
  Medium = 'srednji',
  High = 'visok',
}

export interface IDocumentBoard extends IDocumentBase{
  mainFile?:IFile;
  dependsOn?: IDocumentBase[];
}
