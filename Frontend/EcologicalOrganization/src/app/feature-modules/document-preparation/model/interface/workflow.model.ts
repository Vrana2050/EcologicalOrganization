import { IDocumentBoard } from "./document.model";

export interface IWorkflow {
  getNextStatus(status: IWorkflowStatus): IWorkflowStatus | undefined;
  getDeniedStatus(status: IWorkflowStatus): IWorkflowStatus | undefined;
  getBeginningStatus(): IWorkflowStatus;
  id: number;
  name: string;
  statuses: IWorkflowStatus[];
  canAssigneeAddDocument(): boolean;
  sortStatuses(): void;
}

export interface IWorkflowStatus {
  id: number;
  workflowId: number;
  refId: number;
  currentStatus : IStatus
  nextWorkflowStatusId?: number;
  deniedWorkflowStatusId?: number;
  isReview(): boolean;
  isLast(): boolean;
  canOwnerEdit(): boolean;
  canAssigneeEdit(): boolean;
  canAdd(): boolean;
  canOwnerAdd(): boolean;
  canAssigneeAdd(): boolean
  needsPermissionForNext(): boolean;

}

export interface IStatus {
  id: number;
  name: string;
  needsPermissionForNext: boolean;
  ownerReadPermission: boolean;
  ownerAddPermission: boolean;
  ownerDeletePermission: boolean;
  ownerEditPermission: boolean;
  assigneeReadPermission: boolean;
  assigneeAddPermission: boolean;
  assigneeDeletePermission: boolean;
  assigneeEditPermission: boolean;
}

export interface IBoardWorkflow {
  id: number;
  name: string;
  statuses: IBoardWorkflowStatus[];
}

export interface IBoardWorkflowStatus {
  status:IWorkflowStatus;
  documents?: IDocumentBoard[];
}
