export interface IAnalysis {
  entityOfAnalysis: IEntity;
  documentAnalyses: IDocumentAnalysis[];
  slowestStatus: ISlowestStatus;
  mostProblematicDocument: IMostProblematicDocument;
  largestDelay: ILargestDelay;
  entityDurationByStatus: IStatusDuration[];
  entityDeadlinePercentage: number;
}

export interface IEntity {
  id: number;
  name: string;
}

export interface IDocumentAnalysis {
  document: IEntity;
  deadlinePercentage: number;
  returnCount: number;
  dependentDocuments: IEntity[];
  durationByStatus: IStatusDuration[];
}

export interface IStatusDuration {
  status: number;
  name: string;
  durationDays: number;
}

export interface ISlowestStatus {
  statusId: number;
  name: string;
  duration: number;
}

export interface IMostProblematicDocument {
  document: IEntity;
  returnCount: number;
}

export interface ILargestDelay {
  document: IEntity;
  delayDays: number;
}
