from __future__ import annotations

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, SdkBaseModel
from .enums.action import ActionOrStr
from .spend_item import SpendItem, SpendItemDict


class SpendCheck(SdkBaseModel):
    visa_id: str = Field(alias="visaId")
    sub: str
    """The token's subject: the person's pseudonym at this shop."""

    resource: str
    """This shop's resource URL (the token's audience)."""

    action: ActionOrStr
    items: list[SpendItem]
    total_cents: int = Field(alias="totalCents")
    agent_note: Optional[str] = Field(default=UNSET, alias="agentNote")
    """The agent's own words. Untrusted: Courier only weighs it."""

    approval_id: Optional[str] = Field(default=UNSET, alias="approvalId")
    """From an earlier decision that asked the person."""


class SpendCheckDict(TypedDict):
    visa_id: str
    sub: str
    resource: str
    action: ActionOrStr
    items: list[SpendItemDict]
    total_cents: int
    agent_note: NotRequired[str]
    approval_id: NotRequired[str]
