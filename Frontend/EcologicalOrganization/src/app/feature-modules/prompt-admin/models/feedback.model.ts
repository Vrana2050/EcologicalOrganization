export interface FeedbackDetails {
  final_prompt?: string | null;
  generated_text?: string | null;
}

export interface OutputFeedbackItem {
  id: number;
  rating_value: number | null;
  comment_text: string | null;
  created_at: string | null;

  created_by: number;
  created_by_email?: string | null;

  details?: FeedbackDetails | null;

  _expanded?: boolean;
  _loadingDetails?: boolean;
}

export interface OutputFeedbackPage {
  items: OutputFeedbackItem[];
  meta: { page: number; per_page: number; total_count: number };
}
