import { IStatus, IWorkflowStatus, IWorkflow } from '../interface/workflow.model';
export class Status implements IStatus {
  id: number;
  name: string
  needsPermissionForNext: boolean;
  ownerReadPermission: boolean
  ownerWritePermission: boolean;
  ownerDeletePermission: boolean
  ownerEditPermission: boolean
  assigneeReadPermission: boolean
  assigneeWritePermission: boolean
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
    this.ownerWritePermission = data.dozvolaMenjanjaZaVlasnika;
    this.ownerDeletePermission = data.dozvolaBrisanjaZaVlasnika;
    this.ownerEditPermission = data.dozvolaDodavanjaZaVlasnika;
    this.assigneeReadPermission = data.dozvolaCitanjaZaZaduzenog;
    this.assigneeWritePermission = data.dozvolaMenjanjaZaZaduzenog;
    this.assigneeDeletePermission = data.dozvolaBrisanjaZaZaduzenog;
    this.assigneeEditPermission = data.dozvolaDodavanjaZaZaduzenog;

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
}

export class Workflow implements IWorkflow {
  id: number;
  name: string;
  statuses: IWorkflowStatus[];

  constructor(data: any) {
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
}