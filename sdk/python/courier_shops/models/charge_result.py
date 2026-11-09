from __future__ import annotations

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, OptionalNullable, SdkBaseModel


class ChargeResult(SdkBaseModel):
    order_id: str = Field(alias="orderId")
    """The PayPal order."""

    status: str
    capture_id: OptionalNullable[str] = Field(default=UNSET, alias="captureId")


class ChargeResultDict(TypedDict):
    order_id: str
    status: str
    capture_id: NotRequired[str | None]
