
import { IRevision, IRevisionIssue } from '../interface/revision.model';

export class Revision implements IRevision {
  id: number
  documentId: number
  approved: boolean
  workflowStatusId: number
  reviewerId: number
  revisionIssues?: IRevisionIssue[]
  revisionDate: Date

  constructor(data: any) {
    if (data == null) {
      throw new Error('Revision: No data provided.');
    }
    if (data.id == null) {
      throw new Error('Revision: "id" is required.');
    }
    if (data.dokument == null || data.dokument.id == null) {
      throw new Error('Revision: "documentId" is required.');
    }
    if (data.odobreno == null) {
      throw new Error('Revision: "approved" is required.');
    }
    if (data.trenutniStatus == null || data.trenutniStatus.id == null) {
      throw new Error('Revision: "workflowStatusId" is required.');
    }
    if (data.izmene == null || !Array.isArray(data.izmene)) {
      throw new Error('Revision: "requestChanges" is required and must be an array.');
    }
    if (data.pregledac == null || data.pregledac.id == null) {
      throw new Error('Revision: "reviewerId" is required.');
    }
    if (data.datumRevizije == null) {
      throw new Error('Revision: "revisionDate" is required.');
    }
    this.id = data.id;
    this.documentId = data.dokument.id;
    this.approved = data.odobreno;
    this.workflowStatusId = data.trenutniStatus.id;
    this.reviewerId = data.pregledac.id;
    this.revisionIssues = data.izmene.map((change: any) => new RevisionIssue(change));
    this.revisionDate = new Date(data.datumRevizije);
  }
  getAllIssuesForActiveFile(activeFileId: number) {
    if (!this.revisionIssues) {
      return [];
    }
    return this.revisionIssues.filter(issue => issue.activeFileId === activeFileId);
  }
  getUnCorrectedIssuesForActiveFile(activeFileId: number): IRevisionIssue[] {
    if (!this.revisionIssues) {
      return [];
    }
    return this.revisionIssues.filter(issue => issue.activeFileId === activeFileId && !issue.isCorrected());
  }
  getUnApprovedIssuesForActiveFile(activeFileId: number): IRevisionIssue[] {
    if (!this.revisionIssues) {
      return [];
    }
    return this.revisionIssues.filter(issue => issue.activeFileId === activeFileId && issue.isUnApproved());
  }
  getUnResolvedIssuesForActiveFile(activeFileId: number): IRevisionIssue[] {
    if (!this.revisionIssues) {
      return [];
    }
    return this.revisionIssues.filter(issue => issue.activeFileId === activeFileId && !issue.isResolved());
  }
  isResolved(): boolean {
    return this.approved || this.revisionIssues!.every(issue => issue.isResolved());
  }
  getAllGlobalIssues(): IRevisionIssue[] {
    return this.revisionIssues?.filter(issue => issue.activeFileId === undefined) || [];
  }
  isReviewAfter(date: Date): boolean {
    return this.revisionDate > date;
  }
  hasApprovedRevisionForStatus(workflowStatusId: number): boolean {
    return this.approved && this.workflowStatusId === workflowStatusId;
  }
  hasUnApprovedIssues(): boolean {
    return this.revisionIssues !== undefined && this.revisionIssues.some(issue => !issue.isApproved());
  }
  getUnApprovedIssues(): IRevisionIssue[] {
    return this.revisionIssues?.filter(issue => !issue.isApproved()) || [];
  }
}

export class RevisionIssue implements IRevisionIssue {
  id: number
  revisionId: number
  issue: string
  correctionDate?: Date
  correctionApproved: boolean
  corrected: boolean
  fileId?: number
  activeFileId?: number

  constructor(data: any) {
    if (data == null) {
      throw new Error('RevisionChange: No data provided.');
    }
    if (data.id == null) {
      throw new Error('RevisionChange: "id" is required.');
    }
    if (data.dokumentRevizijaId == null) {
      throw new Error('RevisionChange: "revisionId" is required.');
    }
    if (!data.izmena) {
      throw new Error('RevisionChange: "change" is required.');
    }
    if (data.ispravljena == null) {
      throw new Error('RevisionChange: "ispravljena" is required.');
    }
    if(data.ispravkaOdobrena == null)
    {
      throw new Error('RevisionChange: "correctionApproved" is required.');
    }
    this.id = data.id;
    this.revisionId = data.dokumentRevizijaId;
    this.issue = data.izmena;
    this.correctionDate = data.datumIspravljanja ? new Date(data.datumIspravljanja) : undefined;
    this.correctionApproved = data.ispravkaOdobrena;
    this.corrected = data.ispravljena;
    this.fileId = data.fajl ? data.fajl.id : undefined;
    this.activeFileId = data.aktivniFajlId ? data.aktivniFajlId : undefined;
  }
  isCorrected(): boolean {
    return this.corrected;
  }
  isApproved(): boolean {
    return this.correctionApproved;
  }
  isResolved(): boolean {
    return this.correctionApproved && this.corrected;
  }
  isUnApproved(): boolean {
    return !this.correctionApproved && this.corrected;
  }
  CorrectIssue(): void {
    this.corrected = true;
    this.correctionDate = new Date();
  }
  UnCorrectIssue(): void {
    this.corrected = false;
    this.correctionDate = undefined!;
  }
}

export class RevisionUpdate {
  id?: number;
  odobreno: boolean;
  trenutniStatus: { id: number; };
  dokument:{
    id: number;
    projekat: { id: number; };
  };
  izmene: RevisionIssueUpdate[];
  datumRevizije: Date;
  constructor(projekatId: number, odobreno: boolean, trenutniStatusId: number, dokumentId: number, izmene?: RevisionIssueUpdate[], id?: number) {
    this.id = id  === undefined ? undefined : id;
    this.odobreno = odobreno;
    this.trenutniStatus = { id: trenutniStatusId };
    this.dokument = { id: dokumentId, projekat: { id:projekatId } };
    this.izmene = izmene === undefined ? [] : izmene;
    this.datumRevizije = new Date();
  }
}
export class RevisionIssueUpdate {
  id?: number;
  izmena: string;
  datumIspravljanja?: Date;
  ispravljena: boolean;
  dokumentRevizijaId?: number;
  fajlId?: number;
  aktivniFajlId?: number
  ispravkaOdobrena: boolean;
  constructor(izmena: string, ispravljena: boolean, ispravkaOdobrena: boolean, datumIspravljanja?: Date, id?: number, dokumentRevizijaId?: number, fajlId?: number, aktivniFajlId?: number) {
    this.id = id === undefined ? undefined : id;
    this.izmena = izmena;
    this.datumIspravljanja = datumIspravljanja === undefined ? new Date() : datumIspravljanja;
    this.ispravljena = ispravljena;
    this.dokumentRevizijaId = dokumentRevizijaId === undefined ? undefined : dokumentRevizijaId;
    this.fajlId = fajlId === undefined ? undefined : fajlId;
    this.aktivniFajlId = aktivniFajlId === undefined ? undefined : aktivniFajlId;
    this.ispravkaOdobrena = ispravkaOdobrena;
  }
}