import { IDocumentBoard } from '../interface/document.model';
import { IStatus, IWorkflowStatus, IWorkflow, IBoardWorkflowStatus, IBoardWorkflow } from '../interface/workflow.model';
import { DocumentBoard } from './document-impl.model';
export class Status implements IStatus {
  id: number;
  name: string
  needsPermissionForNext: boolean;
  ownerReadPermission: boolean
  ownerAddPermission: boolean;
  ownerDeletePermission: boolean
  ownerEditPermission: boolean
  assigneeReadPermission: boolean
  assigneeAddPermission: boolean
  assigneeDeletePermission: boolean
  assigneeEditPermission: boolean
  constructor(data:any) {
    if (data == null) {
      throw new Error('Status: No data provided.');
    }
    if (data.id == null) {
      throw new Error('Status: "id" is required.');
    }
    if (!data.naziv) {
      throw new Error('Status: "name" is required.');
    }
    if (data.potrebnoOdobrenjeZaPrelazak == null || data.dozvolaMenjanjaZaVlasnika == null || data.dozvolaDodavanjaZaVlasnika == null ||
        data.dozvolaBrisanjaZaVlasnika == null || data.dozvolaCitanjaZaVlasnika == null || data.dozvolaMenjanjaZaZaduzenog == null ||
        data.dozvolaDodavanjaZaZaduzenog == null || data.dozvolaBrisanjaZaZaduzenog == null || data.dozvolaCitanjaZaZaduzenog == null) {
      throw new Error('Status: "permissions" is required.');
    }
    this.id = data.id;
    this.name = data.naziv;
    this.needsPermissionForNext = data.potrebnoOdobrenjeZaPrelazak;
    this.ownerReadPermission = data.dozvolaCitanjaZaVlasnika;
    this.ownerEditPermission = data.dozvolaMenjanjaZaVlasnika;
    this.ownerDeletePermission = data.dozvolaBrisanjaZaVlasnika;
    this.ownerAddPermission = data.dozvolaDodavanjaZaVlasnika;
    this.assigneeReadPermission = data.dozvolaCitanjaZaZaduzenog;
    this.assigneeEditPermission = data.dozvolaMenjanjaZaZaduzenog;
    this.assigneeDeletePermission = data.dozvolaBrisanjaZaZaduzenog;
    this.assigneeAddPermission = data.dozvolaDodavanjaZaZaduzenog;

  }
}

export class WorkflowStatus implements IWorkflowStatus {
  id: number;
  workflowId: number
  refId: number;
  currentStatus : IStatus
  nextWorkflowStatusId?: number;
  deniedWorkflowStatusId?: number;
  constructor(data:any) {
    if (data == null) {
      throw new Error('WorkflowStatus: No data provided.');
    }
    if (data.id == null) {
      throw new Error('WorkflowStatus: "id" is required.');
    }
    if (data.tokId == null) {
      throw new Error('WorkflowStatus: "workflowId" is required.');
    }
    if(data.trenutnoStanje == null) {
      throw new Error('WorkflowStatus: "currentStatus" is required.');
    }
    this.id = data.id;
    this.workflowId = data.tokId;
    this.currentStatus = new Status(data.trenutnoStanje);
    this.nextWorkflowStatusId = data.sledeceStanje ? data.sledeceStanje.id : null;
    this.deniedWorkflowStatusId = data.statusNakonOdbijanja ? data.statusNakonOdbijanja.id : null;
  }
  isLast(): boolean {
    return !this.nextWorkflowStatusId;
  }
  isReview(): boolean {
    return this.currentStatus.needsPermissionForNext;
  }
  canOwnerEdit(): boolean {
    return this.currentStatus.ownerEditPermission;
  }
  canAssigneeEdit(): boolean {
    return this.currentStatus.assigneeEditPermission;
  }
  canAdd(): boolean {
    return this.currentStatus.ownerAddPermission || this.currentStatus.assigneeAddPermission;
  }
  needsPermissionForNext(): boolean {
    return this.currentStatus.needsPermissionForNext;
  }
  canOwnerAdd(): boolean {
    return this.currentStatus.ownerAddPermission;
  }
  canAssigneeAdd(): boolean {
    return this.currentStatus.assigneeAddPermission;
  }
}

export class Workflow implements IWorkflow {
  id: number;
  name: string;
  statuses: IWorkflowStatus[];

  constructor(data?: any) {
    if (!data || !data.id || !data.naziv) {
      throw new Error('Workflow: "id" and "name" are required.');
    }
    if (!data.statusi || !Array.isArray(data.statusi)) {
      throw new Error('Workflow: "statuses" must be a valid array.');
    }
    this.id = data.id;
    this.name = data.naziv;
    this.statuses = data.statusi.map((status: any) => new WorkflowStatus(status));
  }
  getNextStatus(currentStatus: IWorkflowStatus): IWorkflowStatus | undefined {
    if(!currentStatus.nextWorkflowStatusId){
      return undefined;
    }
    return this.statuses.find(s => s.id === currentStatus.nextWorkflowStatusId) || undefined;
  }
  getDeniedStatus(currentStatus: IWorkflowStatus): IWorkflowStatus | undefined {
    if(!currentStatus.deniedWorkflowStatusId){
      return undefined;
    }
    return this.statuses.find(s => s.id === currentStatus.deniedWorkflowStatusId) || undefined;
  }
  getBeginningStatus(): IWorkflowStatus {
    const beginningStatus = this.statuses.find(status => {
      return !this.statuses.some(s => s.nextWorkflowStatusId === status.id || s.deniedWorkflowStatusId === status.id);
    });
    if (!beginningStatus) {
      throw new Error('Workflow: No beginning status found.');
    }
    return beginningStatus;
  }
  canAssigneeAddDocument(): boolean {
    return this.statuses.some(status => status.canAssigneeAdd());
  }
  sortStatuses(): void {
  let startStatus = this.getBeginningStatus();
  let sortedWorkflow = { ...this, statuses: [] };
  sortedWorkflow.statuses.push(startStatus);
  while(true){
    var nextStatus =  this.statuses.find(s => s.id === startStatus.nextWorkflowStatusId);
    var deniedStatus = this.statuses.find(s => s.id === startStatus.deniedWorkflowStatusId);
    if(deniedStatus != null && !sortedWorkflow.statuses.includes(deniedStatus)){
      sortedWorkflow.statuses.push(deniedStatus);
    }
    if(nextStatus != null){
      sortedWorkflow.statuses.push(nextStatus);
      startStatus = nextStatus;
    }
    else{
      break;
    }
  }
  this.statuses = sortedWorkflow.statuses;
}
}