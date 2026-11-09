from __future__ import annotations

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import SdkBaseModel


class SpendItem(SdkBaseModel):
    title: str
    category: str
    price_cents: int = Field(alias="priceCents")
    quantity: int = 1


class SpendItemDict(TypedDict):
    title: str
    category: str
    price_cents: int
    quantity: NotRequired[int]
