from __future__ import annotations

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, SdkBaseModel
from .enums.by import ByOrStr
from .enums.decision2 import Decision2OrStr


class ReturnModel(SdkBaseModel):
    visa_id: str = Field(alias="visaId")
    order_id: str = Field(alias="orderId")
    merchant_name: Optional[str] = Field(default=UNSET, alias="merchantName")
    decision: Decision2OrStr
    amount_cents: Optional[int] = Field(default=UNSET, alias="amountCents")
    note: Optional[str] = UNSET
    by: Optional[ByOrStr] = UNSET
    paypal: Optional[str] = UNSET
    """Which PayPal refunded it (Sandbox or Simulated)."""


class ReturnModelDict(TypedDict):
    visa_id: str
    order_id: str
    merchant_name: NotRequired[str]
    decision: Decision2OrStr
    amount_cents: NotRequired[int]
    note: NotRequired[str]
    by: NotRequired[ByOrStr]
    paypal: NotRequired[str]
