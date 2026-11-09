from __future__ import annotations

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, OptionalNullable, SdkBaseModel
from .enums.status import StatusOrStr


class Bond(SdkBaseModel):
    """Money the person put down so the courier could act without asking."""

    amount_cents: int = Field(alias="amountCents")
    order_id: Optional[str] = Field(default=UNSET, alias="orderId")
    authorization_id: OptionalNullable[str] = Field(default=UNSET, alias="authorizationId")
    status: StatusOrStr


class BondDict(TypedDict):
    amount_cents: int
    order_id: NotRequired[str]
    authorization_id: NotRequired[str | None]
    status: StatusOrStr
