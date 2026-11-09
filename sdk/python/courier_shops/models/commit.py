from __future__ import annotations

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, SdkBaseModel
from .enums.paid_with import PaidWithOrStr


class Commit(SdkBaseModel):
    visa_id: str = Field(alias="visaId")
    hold_id: str = Field(alias="holdId")
    order_id: str = Field(alias="orderId")
    amount_cents: int = Field(alias="amountCents")
    summary: str
    """One line for the errand, e.g. "Bought a slipmat"."""

    paid_with: Optional[PaidWithOrStr] = Field(default=UNSET, alias="paidWith")
    merchant_name: Optional[str] = Field(default=UNSET, alias="merchantName")


class CommitDict(TypedDict):
    visa_id: str
    hold_id: str
    order_id: str
    amount_cents: int
    summary: str
    paid_with: NotRequired[PaidWithOrStr]
    merchant_name: NotRequired[str]
