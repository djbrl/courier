from __future__ import annotations

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, OptionalNullable, SdkBaseModel
from .enums.status1 import Status1OrStr


class Connection(SdkBaseModel):
    status: Status1OrStr
    agent: str
    """The courier's name."""

    ticket_token: OptionalNullable[str] = Field(default=UNSET, alias="ticketToken")
    """The current errand as a signed token valid for 60 seconds, or null between errands."""


class ConnectionDict(TypedDict):
    status: Status1OrStr
    agent: str
    ticket_token: NotRequired[str | None]
