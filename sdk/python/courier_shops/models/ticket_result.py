from __future__ import annotations

from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, SdkBaseModel


class TicketResult(SdkBaseModel):
    url: Optional[str] = UNSET
    """Send the person here to set the budget."""

    issued: Optional[bool] = UNSET
    """The errand is already open."""


class TicketResultDict(TypedDict):
    url: NotRequired[str]
    issued: NotRequired[bool]
