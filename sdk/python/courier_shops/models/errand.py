from __future__ import annotations

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, OptionalNullable, RFC3339DateTime, SdkBaseModel
from .bond import Bond, BondDict
from .enums.errand_status import ErrandStatusOrStr


class Errand(SdkBaseModel):
    id: str
    status: ErrandStatusOrStr
    resource: str
    """The shop the errand is for."""

    spent_cents: int = Field(alias="spentCents")
    spend_limit_cents: int = Field(alias="spendLimitCents")
    per_purchase_limit_cents: int = Field(alias="perPurchaseLimitCents")
    remaining_cents: int = Field(alias="remainingCents")
    expires_at: RFC3339DateTime = Field(alias="expiresAt")
    bond: OptionalNullable[Bond] = UNSET


class ErrandDict(TypedDict):
    id: str
    status: ErrandStatusOrStr
    resource: str
    spent_cents: int
    spend_limit_cents: int
    per_purchase_limit_cents: int
    remaining_cents: int
    expires_at: RFC3339DateTime
    bond: NotRequired[BondDict | None]
