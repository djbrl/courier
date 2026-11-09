from __future__ import annotations

from typing import Any

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, SdkBaseModel


class Report(SdkBaseModel):
    visa_id: str = Field(alias="visaId")
    reason: str
    evidence: Optional[Any] = UNSET


class ReportDict(TypedDict):
    visa_id: str
    reason: str
    evidence: NotRequired[Any]
