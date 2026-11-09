from __future__ import annotations

from pydantic import Field
from typing_extensions import TypedDict

from ..core import SdkBaseModel
from .enums.decision1 import Decision1OrStr


class Decide(SdkBaseModel):
    visa_id: str = Field(alias="visaId")
    decision: Decision1OrStr


class DecideDict(TypedDict):
    visa_id: str
    decision: Decision1OrStr
