export interface AnalyticsOut {
  scope: 'version' | 'prompt';
  promptId?: number | null;
  promptVersionId?: number | null;

  numExecutions: number;
  avgDurationMs: number | null;
  avgInputTokens: number | null;
  avgOutputTokens: number | null;
  avgTokens: number | null;
  totalTokens: number;
  costPerExecution: number | null;
  totalCostUsd: number;
  errorRate: number | null;

  ratingCount: number;
  ratingAvg: number | null;
  ratingMedian: number | null;
  ratingC1: number;
  ratingC2: number;
  ratingC3: number;
  ratingC4: number;
  ratingC5: number;

  failedExecCount?: number | null;
  bayesScore?: number | null;
}
