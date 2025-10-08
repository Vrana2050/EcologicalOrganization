import { IProject } from "./project.model";
import { IStatus, IWorkflow,IWorkflowStatus } from "./workflow.model";
import { IUserProject } from "./user-project.model";
import { IFile } from "./file.model";
import { IRevision,IRevisionIssue } from "./revision.model";

export interface IDocumentBase{
  id : number;
  projectId : number;
  name: string;
  description? : string;
  isDraft : boolean;
  dueDate ?: Date;
  dateCreated : Date;
  status : IWorkflowStatus;
  workflowId ?: number;
  priority ?: Priority;
  lastModified ?: Date;
  lastModifiedBy ?: IUserProject;
  completionPercentage: number;
  parentDocumentId? : number;
  mainFileId? : number;
  ownerId : number;
  isDone(): boolean;
  isInDraft(): boolean;

}

export enum Priority {
  Low = 'mali',
  Medium = 'srednji',
  High = 'visok',
}

export interface IDocumentBoard extends IDocumentExtended{
  mainFile?:IFile;
}
export interface IDocumentExtended extends IDocumentBase{
  isLocked(): boolean;
  isUserAssignee(userId: number): boolean;
  dependsOn?: IDocumentBase[];
  assignees?: IUserProject[];
  getActiveDependencies(): IDocumentBase[];
}
export interface IDocumentDetails extends IDocumentExtended{
getFileNameById(fileId: number): string | undefined;
 canCorrectIssue(userId: number): boolean;
  getUnApprovedIssues(): IRevisionIssue[];
  hasUnApprovedIssues(): boolean;
  canManageFile(userId: number): boolean;
  canReviewSubDocument(userId: number): boolean;
  canEditDocument(userId: number): boolean;
  canEditDependency(userId: number): boolean;
  getNextStatus(parentWorkflow: IWorkflow): IWorkflowStatus | undefined;
  hasPermissionForNextStatus(): boolean;
  doesActiveFileHaveUnCorrectedIssues(activeFileId: number): boolean;
  doesActiveFileHaveUnApprovedCorrections(activeFileId: number): boolean;
  canAddFile(userId: number): boolean;
  canMoveToNextStatus(userId: number): any;
  canAddSubDocument(userId: number): boolean;
  workflow?:IWorkflow;
  vlasnik:IUserProject;
  parentDocument?:IDocumentBase;
  revisions?: IRevision[];
  subDocuments?: IDocumentBoard[];
  activeFiles?: IDocumentActiveFile[];
  isUserOwner(userId: number): boolean;
  canEditInCurrentStatus(userId: number): boolean;
  isFileMain(fileId: number): boolean;
  getAllReviewIssuesForActiveFile(activeFileId: number): IRevisionIssue[];
  hasUnResolvedReview(): boolean;
  getGlobalReviewIssues(): IRevisionIssue[];
  isFileApproved(activeFileId:number): boolean;
  getUnApprovedIssuesForActiveFile(activeFileId:number): IRevisionIssue[];
  hasReviewAfter(date: Date): boolean;
  isUserSubAssignee(userId: number): boolean;
}

export interface IDocumentActiveFile{
  isFirstVersion(): boolean;
  id: number;
  file: IFile;
  documentId: number;
}
export interface IRevisionDocumentActiveFile{
  hasUnApprovedIssues(): boolean;
  unApprovedIssues?: IRevisionIssue[];
  activeFile: IDocumentActiveFile;
  isFileNew: boolean;
}