from __future__ import annotations

from pydantic import Field
from typing_extensions import TypedDict

from ..core import SdkBaseModel
from .enums.errand_status import ErrandStatusOrStr


class ReportResult(SdkBaseModel):
    ok: bool
    status: ErrandStatusOrStr
    bond_outcome: str = Field(alias="bondOutcome")


class ReportResultDict(TypedDict):
    ok: bool
    status: ErrandStatusOrStr
    bond_outcome: str
