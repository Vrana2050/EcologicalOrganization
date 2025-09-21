from __future__ import annotations
from datetime import datetime, timezone
from typing import Optional

from app.services.base_service import BaseService
from app.repository.model_pricing_repository import ModelPricingRepository
from app.model.model_pricing import ModelPricing


class ModelPricingService(BaseService):
    def __init__(self, repository: ModelPricingRepository):
        super().__init__(repository)
        self._repo = repository

    def get_active(
        self,
        provider: str,
        model: str,
        when: Optional[datetime] = None,
    ) -> Optional[ModelPricing]:
        return self._repo.get_active(provider, model, when or datetime.now(timezone.utc))
