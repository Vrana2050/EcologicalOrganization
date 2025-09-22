export interface IWorkflow {
  id: number;
  name: string;
  statuses: IWorkflowStatus[];
}

export interface IWorkflowStatus {
  id: number;
  workflowId: number;
  refId: number;
  currentStatus : IStatus
  nextWorkflowStatusId?: number;
  deniedWorkflowStatusId?: number;
}

export interface IStatus {
  id: number;
  name: string;
  needsPermissionForNext: boolean;
  ownerReadPermission: boolean;
  ownerWritePermission: boolean;
  ownerDeletePermission: boolean;
  ownerEditPermission: boolean;
  assigneeReadPermission: boolean;
  assigneeWritePermission: boolean;
  assigneeDeletePermission: boolean;
  assigneeEditPermission: boolean;
}
