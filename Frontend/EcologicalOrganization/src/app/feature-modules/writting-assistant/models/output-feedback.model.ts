export interface OutputFeedback {
  id: number;
  modelOutputId: number;
  ratingValue: number;
  commentText?: string | null;
  createdBy: number;
  createdAt: string; 
}

export interface CreateOutputFeedback {
  modelOutputId: number;
  ratingValue: number;
  commentText?: string | null;
}