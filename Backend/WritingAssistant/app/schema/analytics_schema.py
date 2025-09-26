from pydantic import BaseModel
from typing import Optional

class AnalyticsOut(BaseModel):
    scope: str  
    promptId: Optional[int] = None
    promptVersionId: Optional[int] = None

    numExecutions: int
    avgDurationMs: Optional[float]
    avgInputTokens: Optional[float]
    avgOutputTokens: Optional[float]
    avgTokens: Optional[float]
    totalTokens: int
    costPerExecution: Optional[float]
    totalCostUsd: float
    errorRate: Optional[float]

    ratingCount: int
    ratingAvg: Optional[float]
    ratingMedian: Optional[float]
    ratingC1: int
    ratingC2: int
    ratingC3: int
    ratingC4: int
    ratingC5: int

    failedExecCount: Optional[int] = None
    bayesScore: Optional[float] = None
