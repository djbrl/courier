from __future__ import annotations

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, SdkBaseModel


class TicketRequest(SdkBaseModel):
    purpose: Optional[str] = UNSET
    """What the agent says the errand is for."""

    max_per_item: Optional[float] = Field(default=UNSET, alias="maxPerItem")
    """Suggested per-purchase limit, in whole dollars."""

    max_total: Optional[float] = Field(default=UNSET, alias="maxTotal")
    """Suggested budget, in whole dollars."""

    price: Optional[float] = UNSET
    """What the agent wants to buy costs, in whole dollars."""

    budget_from_person: Optional[int] = Field(default=UNSET, alias="budgetFromPerson")
    """Only a budget the person picked in their chat app's dialog."""


class TicketRequestDict(TypedDict):
    purpose: NotRequired[str]
    max_per_item: NotRequired[float]
    max_total: NotRequired[float]
    price: NotRequired[float]
    budget_from_person: NotRequired[int]
