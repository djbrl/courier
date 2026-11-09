from __future__ import annotations

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, SdkBaseModel
from .charge_item import ChargeItem, ChargeItemDict


class Charge(SdkBaseModel):
    visa_id: str = Field(alias="visaId")
    hold_id: str = Field(alias="holdId")
    description: str
    brand_name: str = Field(alias="brandName")
    """The shop's name on the PayPal receipt."""

    items: Optional[list[ChargeItem]] = UNSET


class ChargeDict(TypedDict):
    visa_id: str
    hold_id: str
    description: str
    brand_name: str
    items: NotRequired[list[ChargeItemDict]]
