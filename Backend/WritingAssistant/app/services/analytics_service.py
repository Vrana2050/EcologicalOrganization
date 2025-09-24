from app.schema.analytics_schema import AnalyticsOut
from app.repository.analytics_repository import AnalyticsRepository
from app.repository.prompt_version_repository import PromptVersionRepository
from app.repository.prompt_active_history_repository import PromptActiveHistoryRepository
from app.core.exceptions import NotFoundError

from app.model.prompt_version import PromptVersion


class AnalyticsService:
    def __init__(
        self,
        analytics_repo: AnalyticsRepository,
        prompt_version_repository: PromptVersionRepository,
        prompt_active_history_repository: PromptActiveHistoryRepository,
    ):
        self.repo = analytics_repo
        self.pv_repo = prompt_version_repository
        self.pah_repo = prompt_active_history_repository

    def _map_frozen_pv_to_payload(self, pv) -> dict:
        num = int(pv.num_executions or 0)
        avg_in = pv.avg_input_tokens
        avg_out = pv.avg_output_tokens
        avg_tokens = (avg_in + avg_out) if (avg_in is not None and avg_out is not None) else None
        total_tokens = int(round((avg_tokens or 0) * num)) if avg_tokens is not None else 0

        return {
            "numExecutions": num,
            "avgDurationMs": pv.avg_duration_ms,
            "avgInputTokens": avg_in,
            "avgOutputTokens": avg_out,
            "avgTokens": avg_tokens,
            "totalTokens": total_tokens,
            "costPerExecution": pv.avg_cost,
            "totalCostUsd": float(pv.total_cost_usd or 0),
            "errorRate": pv.error_rate,
            "ratingCount": int(pv.rating_count or 0),
            "ratingAvg": pv.rating_avg,
            "ratingMedian": pv.rating_median,
            "ratingC1": int(pv.rating_c1 or 0),
            "ratingC2": int(pv.rating_c2 or 0),
            "ratingC3": int(pv.rating_c3 or 0),
            "ratingC4": int(pv.rating_c4 or 0),
            "ratingC5": int(pv.rating_c5 or 0),
            "failedExecCount": int(pv.failed_exec_count or 0),
        }

    def get_version_analytics(self, version_id: int, bayes_c: int = 10) -> AnalyticsOut:
        pv = self.pv_repo.read_by_id(version_id, eagers=[PromptVersion.prompt]) 
        if pv is None:
            raise NotFoundError(f"PromptVersion {version_id} not found")

        if pv.prompt is None or pv.prompt.document_type_id is None:
            raise NotFoundError(f"PromptVersion {version_id} has no prompt/document_type")

        active_pv = self.pah_repo.get_active_prompt_version(pv.prompt.document_type_id)

        if active_pv and int(active_pv.id) == int(pv.id):
            data = self.repo.get_version_metrics_live(version_id)
        else:
            data = self._map_frozen_pv_to_payload(pv)

        bayes = self.repo.get_bayes_for_version(version_id, bayes_c)

        return AnalyticsOut(
            scope="version",
            promptVersionId=version_id,
            **data,
            bayesScore=bayes,
        )

    def get_prompt_analytics(self, prompt_id: int, bayes_c: int = 10) -> AnalyticsOut:
        data = self.repo.get_prompt_analytics(prompt_id)
        bayes = self.repo.get_bayes_for_prompt(prompt_id, bayes_c)
        return AnalyticsOut(
            scope="prompt",
            promptId=prompt_id,
            **data,
            bayesScore=bayes,
        )
