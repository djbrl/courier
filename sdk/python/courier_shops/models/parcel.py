from __future__ import annotations

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, OptionalNullable, SdkBaseModel


class Parcel(SdkBaseModel):
    visa_id: str = Field(alias="visaId")
    order_id: str = Field(alias="orderId")
    merchant_name: Optional[str] = Field(default=UNSET, alias="merchantName")
    carrier_name: Optional[str] = Field(default=UNSET, alias="carrierName")
    tracking_number: Optional[str] = Field(default=UNSET, alias="trackingNumber")
    stage: int
    """Index into labels."""

    labels: list[str]
    """Every step of this delivery, e.g. Shipped, Out for delivery, Delivered."""

    expected_at: Optional[str] = Field(default=UNSET, alias="expectedAt")
    paypal: OptionalNullable[str] = UNSET
    """Which PayPal took the tracking number (Sandbox or Simulated), if any."""

    simulated: Optional[bool] = UNSET


class ParcelDict(TypedDict):
    visa_id: str
    order_id: str
    merchant_name: NotRequired[str]
    carrier_name: NotRequired[str]
    tracking_number: NotRequired[str]
    stage: int
    labels: list[str]
    expected_at: NotRequired[str]
    paypal: NotRequired[str | None]
    simulated: NotRequired[bool]
