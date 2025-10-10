import { IUserProject, ProjectRole } from '../interface/user-project.model';
import { IStatus, IWorkflow } from '../interface/workflow.model';
import { IWorkflowStatus } from '../interface/workflow.model';
import { IDocumentActiveFile, IDocumentDetails, IRevisionDocumentActiveFile, Priority } from '../interface/document.model';
import { IDocumentBase } from '../interface/document.model';
import { WorkflowStatus } from './workflow-impl.model';
import { UserProject } from './user-project-impl.model';
import { IFile } from '../interface/file.model';
import { File } from './file-impl.model';
import { IDocumentBoard } from '../interface/document.model';
import { IDocumentExtended } from '../interface/document.model';
import { Workflow } from './workflow-impl.model';
import { IRevision, IRevisionIssue } from '../interface/revision.model';
import { Revision, RevisionIssue } from './revision-impl.model';

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
  dateCreated: Date;

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
    if(data.datumKreiranja == null)
    {
      throw new Error('DocumentBase: "dateCreated" is required.');
    }
    this.dateCreated = new Date(data.datumKreiranja);
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
  isDone(): boolean {
    return this.status.isLast();
  }
  isInDraft(): boolean {
    return this.isDraft;
  }
  canReview(): boolean {
    return this.status.isReview();
  }
  isSubDocument(): boolean {
    return this.parentDocumentId !== undefined;
  }
}
export class DocumentExtended extends DocumentBase {
    dependsOn?: IDocumentBase[];
    assignees?: IUserProject[];
    constructor(data: any) {
      super(data);
      this.dependsOn = data.zavisiOd ? data.zavisiOd.map((doc: any) => new DocumentBase(doc)) : [];
      this.assignees = data.dodeljeniKorisnici ? data.dodeljeniKorisnici.map((user: any) => new UserProject(user)) : [];
    }
    isLocked() {
      return this.dependsOn != undefined && this.dependsOn.some(doc => !doc.isDone());
    }
    isUserAssignee(userId: number): boolean {
      return this.assignees ? this.assignees.some(assignee => assignee.userId === userId) : false;
    }
    getActiveDependencies(): IDocumentBase[] {
      return this.dependsOn ? this.dependsOn.filter(doc => !doc.isDone()) : [];
    }
}
  export class DocumentBoard extends DocumentExtended implements IDocumentBoard {
    mainFile?: IFile;
    constructor(data: any) {
      super(data);
      this.mainFile = data.glavniFajl ? new File(data.glavniFajl) : undefined;
    }

  }
  export class DocumentDetails extends DocumentExtended implements IDocumentDetails {
    workflow?: IWorkflow;
    vlasnik: IUserProject
    parentDocument?: IDocumentBase;
    revisions?: IRevision[];
    subDocuments?: IDocumentBoard[];
    activeFiles?: IDocumentActiveFile[];
    constructor(data: any) {
      super(data);
      this.workflow = data.tokIzradeDokumenta ? new Workflow(data.tokIzradeDokumenta) : undefined;
      this.vlasnik = new UserProject(data.vlasnik);
      this.parentDocument = data.roditeljDokument ? new DocumentBase(data.roditeljDokument) : undefined;
      this.revisions = data.revizije ? data.revizije.map((rev: any) => new Revision(rev)) : undefined;
    }
    getNextStatus(parentWorkflow: IWorkflow): IWorkflowStatus | undefined {
      if(parentWorkflow.id !== this.status.workflowId) {
      throw new Error('DocumentDetails: Provided workflow does not match document workflow.');
      }
       if(this.status.needsPermissionForNext()) {
          if(this.hasPermissionForNextStatus()) {
            return parentWorkflow!.getNextStatus(this.status);
          }
          else
          {
            return parentWorkflow!.getDeniedStatus(this.status);
          }
      }
      return parentWorkflow!.getNextStatus(this.status);
    }
    getAllReviewIssuesForActiveFile(activeFileId: number): IRevisionIssue[] {
      return this.revisions?.flatMap(revision => revision.getAllIssuesForActiveFile(activeFileId)) || [];
    }
    isUserOwner(userId: number): boolean {
      return this.vlasnik.userId === userId;
    }
    canAddSubDocument(userId: number): boolean {
      if(this.isDraft)
      {
        return false;
      }
      if(this.canEditInCurrentStatus(userId))
      {
        return this.isUserAssignee(userId)
      }
      return false;
    }
    canAddFile(userId: number): boolean {
      if(this.isDraft)
      {
        return false;
      }
      if(this.canEditInCurrentStatus(userId))
      {
        return true;
      }
      return false;
    }
    canEditInCurrentStatus(userId: number): boolean {
      if(this.isUserOwner(userId) && this.status.canOwnerEdit())
      {
        return true;
      }
      if(this.isUserAssignee(userId) && this.status.canAssigneeEdit())
      {
        return true;
      }
      return false;
    }
    isFileMain(fileId: number): boolean {
      return this.mainFileId === fileId;
    }
    doesActiveFileHaveUnCorrectedIssues(activeFileId: number): boolean {
      const issuesForFile = this.getUnCorrectedIssuesForFile(activeFileId);
      return issuesForFile.length > 0;
    }
    doesActiveFileHaveUnApprovedCorrections(activeFileId: number): boolean {
      const issuesForFile = this.getUnApprovedCorrectionsForFile(activeFileId);
      return issuesForFile.length > 0;
    }
    getUnApprovedCorrectionsForFile(activeFileId: number) {
      return this.revisions?.flatMap(revision => revision.getUnApprovedIssuesForActiveFile(activeFileId)) || [];
    }
    getUnCorrectedIssuesForFile(activeFileId: number): IRevisionIssue[] {
      return this.revisions?.flatMap(revision => revision.getUnCorrectedIssuesForActiveFile(activeFileId)) || [];
    }
    hasUnResolvedReview(): boolean {
      return this.revisions !== undefined && this.revisions.some(revision => !revision.isResolved());
    }
    getGlobalReviewIssues(): IRevisionIssue[] {
      return this.revisions?.flatMap(revision => revision.getAllGlobalIssues()) || [];
    }
    hasReviewAfter(date: Date): boolean {
      return this.revisions !== undefined && this.revisions.length > 0 && this.revisions.some(revision => revision.isReviewAfter(date));
    }
    isFileApproved(activeFileId:number): boolean {
      const issuesForFile = this.getAllReviewIssuesForActiveFile(activeFileId);
      return issuesForFile.length === 0 || issuesForFile.every(issue => issue.isApproved());
    }
    getUnApprovedIssuesForActiveFile(activeFileId:number): IRevisionIssue[] {
      return this.revisions?.flatMap(revision => revision.getUnApprovedIssuesForActiveFile(activeFileId)) || [];
    }
    hasPermissionForNextStatus(): boolean {
      return this.revisions!.every(revision => revision.isResolved()) && this.revisions!.some(revision => revision.hasApprovedRevisionForStatus(this.status.id));
    }
    canSubAssigneeAddDocument(): boolean {
      return this.workflow?.canAssigneeAddDocument() || false;
    }
    isUserSubAssignee(userId: number): boolean {
      if(!this.subDocuments || this.subDocuments.length === 0) {
        return false;
      }
      return this.subDocuments!.some(subDoc => subDoc.isUserAssignee(userId));
    }
    canEditDocument(userId: number): boolean {
      return this.isUserOwner(userId) && this.canEditInCurrentStatus(userId);
    }
    canReviewSubDocument(userId: number): boolean {
      return this.isUserAssignee(userId) && this.canEditInCurrentStatus(userId);
    }
    canMoveToNextStatus(userId: number): any {
     return this.canEditInCurrentStatus(userId);
    }
    canManageFile(userId: number): boolean {
      return this.canEditInCurrentStatus(userId) && !this.isInReview();
    }
    canEditDependency(userId: number): boolean {
      return this.canEditInCurrentStatus(userId) && !this.isInReview();
    }
    isInReview(): boolean {
      return this.status.isReview();
    }
    hasUnApprovedIssues(): boolean {
      return this.revisions !== undefined && this.revisions.some(revision => revision.hasUnApprovedIssues());
    }
    getUnApprovedIssues(): IRevisionIssue[] {
      return this.revisions?.flatMap(revision => revision.getUnApprovedIssues()) || [];
    }
    canCorrectIssue(userId: number): boolean {
      return this.isUserAssignee(userId) && this.canManageFile(userId);
    }
    getFileNameById(activeFileId: number): string | undefined {
      const activeFile = this.activeFiles?.find(af => af.id === activeFileId);
      return activeFile ? activeFile.file.name : undefined;
    }
    canDeleteDocument(userId: number): boolean {
      return this.isUserOwner(userId);
    }
  }
  export class DocumentActiveFile implements IDocumentActiveFile {
    id: number;
    file: IFile;
    documentId: number;
    constructor(data: any) {
      if (data == null) {
        throw new Error('DocumentActiveFile: No data provided.');
      }
      if (data.id == null) {
        throw new Error('DocumentActiveFile: "id" is required.');
      }
      if (data.fajl == null || data.fajl.id == null) {
        throw new Error('DocumentActiveFile: "file" is required.');
      }
      if (data.dokumentId == null) {
        throw new Error('DocumentActiveFile: "documentId" is required.');
      }
      this.id = data.id;
      this.file = new File(data.fajl);
      this.documentId = data.dokumentId;
    }
    isFirstVersion(): boolean {
      return this.file.isFirstVersion();
    }
  }
  export class RevisionDocumentActiveFile implements IRevisionDocumentActiveFile {
    unApprovedIssues?: IRevisionIssue[];
    activeFile: IDocumentActiveFile;
    isFileNew: boolean;
    constructor(issues: IRevisionIssue[], activeFile: IDocumentActiveFile,isFileNew:boolean) {
      this.isFileNew=isFileNew;
      if (activeFile == null) {
        throw new Error('RevisionDocumentActiveFile: "activeFile" is required.');
      }
      if (issues){
      this.unApprovedIssues = issues.filter(issue => !issue.isApproved());
      }
      else{
        this.unApprovedIssues = [];
      }
      this.activeFile = activeFile;
    }
    hasUnApprovedIssues(): boolean {
      return this.unApprovedIssues !== undefined && this.unApprovedIssues.length > 0;
    }
  }
  export class DocumentCreate{
    id?: number;
    naziv: string;
    projekat?:{id:number};
    opis?: string
    rokZavrsetka?: Date;
    status?: {id:number};
    prioritet?: Priority;
    roditeljDokument?: {id:number};
    zavisiOd?: {id:number}[];
    dodeljeniKorisnici?: {id:number}[]
    vlasnik?: {id:number, korisnikId:number, ulogaUProjektu:ProjectRole};
    tokIzradeDokumenta?: {id:number};
    constructor(data: any) {
      this.id = data.id;
      this.naziv = data.name;
      this.projekat = data.projectId ? {id: data.projectId} : undefined;
      this.opis = data.description;
      this.rokZavrsetka = data.dueDate ? new Date(data.dueDate) : undefined;
      this.status = data.statusId ? {id: data.statusId} : undefined;
      this.prioritet = data.priority || undefined;
      this.roditeljDokument = data.parentDocumentId ? {id: data.parentDocumentId} : undefined;
      this.zavisiOd = data.dependencies ? data.dependencies.map((doc: IDocumentBase) => ({id: doc.id})) : [];
      this.dodeljeniKorisnici = data.assignees ? data.assignees.map((user: IUserProject) => ({id: user.id})) : [];
    }
  }
  export class DocumentWorkflowCreate{
    id?: number;
    tokIzradeDokumenta?: {id:number}
    constructor(data: IDocumentDetails) {
      this.id = data.id;
      this.tokIzradeDokumenta = data.workflow ? {id: data.workflow.id} : undefined;

    }
  }
    export class DocumentStatusUpdate{
    id?: number;
    status?: {id:number}
    constructor(data: IDocumentDetails) {
      this.id = data.id;
      this.status = data.status ? {id: data.status.id} : undefined;

    }
  }
    export class DocumentMainFileUpdate{
    id?: number;
    glavniFajl?: {id:number}
    constructor(data: IDocumentDetails) {
      this.id = data.id;
      this.glavniFajl = {id: data.mainFileId!};

    }
  }
  export class DocumentActiveFileUpdate{
    id?: number;
    fajl?: {id:number}
    dokumentId?: number
  }
  export class DocumentDependencyUpdate{
    id: number;
    zavisiOd?: {id:number}[]
    constructor(data: IDocumentDetails) {
      this.id = data.id;
      this.zavisiOd = data.dependsOn ? data.dependsOn.map(doc => ({id: doc.id})) : [];
    }
  }