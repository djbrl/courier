from __future__ import annotations

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, SdkBaseModel


class ChargeItem(SdkBaseModel):
    name: str
    unit_cents: int = Field(alias="unitCents")
    quantity: int
    sku: Optional[str] = UNSET


class ChargeItemDict(TypedDict):
    name: str
    unit_cents: int
    quantity: int
    sku: NotRequired[str]
