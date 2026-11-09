from __future__ import annotations

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, SdkBaseModel


class Step(SdkBaseModel):
    visa_id: str = Field(alias="visaId")
    kind: str
    """e.g. browse, reserve, shipping."""

    title: str
    detail: Optional[str] = UNSET
    merchant_name: Optional[str] = Field(default=UNSET, alias="merchantName")


class StepDict(TypedDict):
    visa_id: str
    kind: str
    title: str
    detail: NotRequired[str]
    merchant_name: NotRequired[str]
