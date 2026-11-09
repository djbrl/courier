from __future__ import annotations

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, SdkBaseModel


class IntentCheck(SdkBaseModel):
    """Who decided: the limits in code, a model checking fit, or the person."""

    model: str
    reason: str
    probability: Optional[float] = UNSET
    latency_ms: Optional[int] = Field(default=UNSET, alias="latencyMs")
    decision: Optional[str] = UNSET


class IntentCheckDict(TypedDict):
    model: str
    reason: str
    probability: NotRequired[float]
    latency_ms: NotRequired[int]
    decision: NotRequired[str]
