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
}
