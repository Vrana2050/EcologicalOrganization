export interface ModelOutput {
  id: number;
  generatedText?: string | null;
}

export interface SectionInstruction {
  id: number;
  text: string;
  createdAt?: string | null;
}

export interface SectionIteration {
  id: number;
  seqNo: number;
  sessionSectionId: number;
  sectionInstruction?: SectionInstruction | null;
  modelOutput?: ModelOutput | null;
}

export interface SessionSectionWithLatest {
  id: number;
  sessionId: number;
  name?: string | null;
  position?: number | null;
  latestIteration?: SectionIteration | null;
  maxSeqNo?: number | null;
}

export interface SessionOverview {
  documentTypeId: number;
  title: string;
  latestGlobalInstructionText: string;
  sections: SessionSectionWithLatest[];
}

export interface CreateSessionSectionIn {
  sessionId: number;
  name: string;
  position: number;
  templateSectionId?: number | null;
}

export interface SessionSectionOut {
  id: number;
  sessionId: number;
  templateSectionId?: number | null;
  name: string;
  position: number;
}

export type TempEditable = {
  _isNew?: boolean;
  _key?: string;
};

export interface PatchSessionSectionTitleIn {
  name: string;
}
