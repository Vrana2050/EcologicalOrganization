from contextlib import AbstractContextManager
from typing import Callable, Optional, Dict, Any
from datetime import datetime

from sqlalchemy.orm import Session
from sqlalchemy import text

class AnalyticsRepository:
    def __init__(self, session_factory: Callable[..., AbstractContextManager[Session]]):
        self.session_factory = session_factory

    def _call_refcursor_func(self, s: Session, func_qualified_name: str, *args):
        dbapi = s.bind.dialect.dbapi
        raw_conn = s.connection().connection  
        cur = raw_conn.cursor()
        cursor_type = getattr(dbapi, "CURSOR", dbapi.Cursor)
        out_cur = cur.callfunc(func_qualified_name, cursor_type, list(args))
        return out_cur

    def get_version_metrics_live(self, version_id: int) -> Dict[str, Any]:
        with self.session_factory() as s:
            out_cur = self._call_refcursor_func(s, "prompt_metrics_pkg.get_pv_metrics", version_id)
            row = out_cur.fetchone()
            (num_execs, avg_dur, avg_in, avg_out, avg_cost,
             total_cost, failed_execs, error_rate, rating_cnt, rating_avg,
             rating_med, c1, c2, c3, c4, c5, _stats_finalized_at) = row

            num = int(num_execs or 0)
            avg_tokens = (avg_in + avg_out) if (avg_in is not None and avg_out is not None) else None
            total_tokens = int(round((avg_tokens or 0) * num)) if avg_tokens is not None else 0

            return {
                "numExecutions": num,
                "avgDurationMs": avg_dur,
                "avgInputTokens": avg_in,
                "avgOutputTokens": avg_out,
                "avgTokens": avg_tokens,
                "totalTokens": total_tokens,
                "costPerExecution": avg_cost,
                "totalCostUsd": float(total_cost or 0),
                "errorRate": error_rate,
                "ratingCount": int(rating_cnt or 0),
                "ratingAvg": rating_avg,
                "ratingMedian": rating_med,
                "ratingC1": int(c1 or 0),
                "ratingC2": int(c2 or 0),
                "ratingC3": int(c3 or 0),
                "ratingC4": int(c4 or 0),
                "ratingC5": int(c5 or 0),
                "failedExecCount": int(failed_execs or 0),
            }

    def get_prompt_analytics(self, prompt_id: int) -> Dict[str, Any]:
        with self.session_factory() as s:
            out_cur = self._call_refcursor_func(s, "prompt_metrics_pkg.get_prompt_metrics", prompt_id)
            row = out_cur.fetchone()
            (num_execs, avg_dur, avg_in, avg_out, avg_cost,
             total_cost, failed_execs, error_rate, rating_cnt, rating_avg,
             rating_med, c1, c2, c3, c4, c5) = row

            num = int(num_execs or 0)
            avg_tokens = (avg_in + avg_out) if (avg_in is not None and avg_out is not None) else None
            total_tokens = int(round((avg_tokens or 0) * num)) if avg_tokens is not None else 0

            return {
                "numExecutions": num,
                "avgDurationMs": avg_dur,
                "avgInputTokens": avg_in,
                "avgOutputTokens": avg_out,
                "avgTokens": avg_tokens,
                "totalTokens": total_tokens,
                "costPerExecution": avg_cost,
                "totalCostUsd": float(total_cost or 0),
                "errorRate": error_rate,
                "ratingCount": int(rating_cnt or 0),
                "ratingAvg": rating_avg,
                "ratingMedian": rating_med,
                "ratingC1": int(c1 or 0),
                "ratingC2": int(c2 or 0),
                "ratingC3": int(c3 or 0),
                "ratingC4": int(c4 or 0),
                "ratingC5": int(c5 or 0),
                "failedExecCount": int(failed_execs or 0),
            }

    def get_bayes_for_version(self, version_id: int, c: int = 10) -> Optional[float]:
        with self.session_factory() as s:
            val = s.execute(text("SELECT calc_bayes_score(:id, :c) FROM dual"),
                            {"id": version_id, "c": c}).scalar()
            return float(val) if val is not None else None

    def get_bayes_for_prompt(self, prompt_id: int, c: int = 10) -> Optional[float]:
        with self.session_factory() as s:
            val = s.execute(text("SELECT calc_bayes_score_for_prompt(:pid, :c) FROM dual"),
                            {"pid": prompt_id, "c": c}).scalar()
            return float(val) if val is not None else None


    def get_doc_type_report(self, from_ts, to_ts, doc_type_id, include_total=True):
        sql = text("""
            SELECT *
            FROM TABLE(
            report_pkg.get_doc_type_report(
                :from_ts, :to_ts, :doc_type_id, :include_total
            )
            )
        """)
        with self.session_factory() as s:
            res = s.execute(sql, {
                "from_ts": from_ts,
                "to_ts": to_ts,
                "doc_type_id": doc_type_id,
                "include_total": 1 if include_total else 0
            })
            return [dict(r) for r in res.mappings().all()]