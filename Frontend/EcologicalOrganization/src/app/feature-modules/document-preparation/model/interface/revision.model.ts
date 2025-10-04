export interface IRevision{
  hasApprovedRevisionForStatus(workflowStatusId: number): boolean;
  isReviewAfter(date: Date): boolean;
  isResolved(): boolean;
  id: number;
  documentId: number;
  approved: boolean;
  workflowStatusId: number;
  reviewerId: number;
  revisionIssues: IRevisionIssue[];
  revisionDate: Date;
  getUnResolvedIssuesForActiveFile(activeFileId: number): IRevisionIssue[];
  getUnApprovedIssuesForActiveFile(activeFileId: number): IRevisionIssue[];
  getUnCorrectedIssuesForActiveFile(activeFileId: number): IRevisionIssue[];
  getAllIssuesForActiveFile(activeFileId: number): any;
  getAllGlobalIssues(): IRevisionIssue[];

}
export interface IRevisionIssue{
  id: number;
  revisionId: number;
  issue: string;
  correctionDate: Date;
  correctionApproved: boolean;
  fileId?: number;
  activeFileId?: number;
  isResolved(): boolean;
  isApproved(): boolean;
  isCorrected(): boolean;
  isUnApproved(): boolean;
}