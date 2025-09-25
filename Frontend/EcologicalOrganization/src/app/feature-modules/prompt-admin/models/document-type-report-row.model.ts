export interface DocumentTypeReportRow {
  document_type_id: number | null;
  document_type_name: string;

  num_executions: number;
  total_cost_usd: number;
  avg_cost_usd: number | null;
  avg_duration_ms: number | null;
  avg_input_tokens: number | null;
  avg_output_tokens: number | null;
  failed_execs: number;
  error_rate: number | null;

  rating_count: number;
  rating_avg: number | null;
  rating_median: number | null;
  rating_c1: number;
  rating_c2: number;
  rating_c3: number;
  rating_c4: number;
  rating_c5: number;
}
