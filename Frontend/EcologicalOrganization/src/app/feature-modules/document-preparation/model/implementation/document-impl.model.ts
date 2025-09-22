import { IUserProject } from '../interface/user-project.model';
import { IWorkflow } from '../interface/workflow.model';
import { IWorkflowStatus } from '../interface/workflow.model';
import { Priority } from '../interface/document.model';
import { IDocumentBase } from '../interface/document.model';
import { WorkflowStatus } from './worflow-impl.model';
import { UserProject } from './user-project-impl.model';
import { IFile } from '../interface/file.model';
import { File } from './file-impl.model';
import { IDocumentBoard } from '../interface/document.model';

export class DocumentBase implements IDocumentBase {
  id: number;
  name: string;
  description?: string;
  dueDate?: Date;
  status: IWorkflowStatus;
  priority?: Priority;
  lastModified?: Date;
  lastModifiedBy?: IUserProject;
  completionPercentage: number;
  projectId: number;
  isDraft: boolean;
  workflowId?: number;
  parentDocumentId?: number;
  mainFileId?: number;
  ownerId: number;

  constructor(data: any) {
    if (data == null) {
      throw new Error('DocumentBase: No data provided.');
    }
    if (data.id == null) {
      throw new Error('DocumentBase: "id" is required.');
    }
    if (!data.naziv) {
      throw new Error('DocumentBase: "name" is required.');
    }
    if (data.status == null) {
      throw new Error('DocumentBase: "status" is required.');
    }
    if (data.procenatZavrsenosti == null) {
      throw new Error('DocumentBase: "completionPercentage" is required.');
    }
    if (data.projekat == null || data.projekat.id == null) {
      throw new Error('DocumentBase: "projekat" is required.');
    }
    if (data.pripremna_verzija == null) {
      throw new Error('DocumentBase: "isDraft" is required.');
    }
    if (data.vlasnik == null || data.vlasnik.id == null) {
      throw new Error('DocumentBase: "vlasnik" is required.');
    }
    if(data.poslednjaIzmena ==null)
    {
      throw new Error('DocumentBase: "lastModified" is required.');
    }
    if(data.izmenaOd ==null || data.izmenaOd.id == null)
    {
      throw new Error('DocumentBase: "lastModifiedBy" is required.');
    }
    this.id = data.id;
    this.name = data.naziv;
    this.description = data.opis;
    this.dueDate = data.rokZavrsetka ? new Date(data.rokZavrsetka) : undefined;
    this.status = new WorkflowStatus(data.status);
    this.priority = data.prioritet;
    this.lastModified = data.poslednjaIzmena ? new Date(data.poslednjaIzmena) : undefined;
    this.lastModifiedBy = data.izmenaOd ? new UserProject(data.izmenaOd) : undefined;
    this.completionPercentage = data.procenatZavrsenosti;
    this.projectId = data.projekat.id;
    this.isDraft = data.pripremna_verzija;
    this.workflowId = data.tokIzradeDokumenta ? data.tokIzradeDokumenta.id : undefined;
    this.parentDocumentId = data.roditeljDokument ? data.roditeljDokument.id : undefined;
    this.mainFileId = data.glavniFajl ? data.glavniFajl.id : undefined;
    this.ownerId = data.vlasnik.id;
  }
}
  export class DocumentBoard extends DocumentBase implements IDocumentBoard {
    mainFile?: IFile;
    dependsOn?: IDocumentBase[];
    constructor(data: any) {
      super(data);
      this.mainFile = data.glavniFajl ? new File(data.glavniFajl) : undefined;
      this.dependsOn = data.zavisiOd ? data.zavisiOd.map((doc: any) => new DocumentBase(doc)) : [];
    }

  }