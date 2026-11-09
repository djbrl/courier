from __future__ import annotations

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, OptionalNullable, SdkBaseModel
from .enums.code import CodeOrStr
from .enums.decision import DecisionOrStr
from .intent_check import IntentCheck, IntentCheckDict


class SpendDecision(SdkBaseModel):
    decision: DecisionOrStr
    reason: str
    code: Optional[CodeOrStr] = UNSET
    """Why it was denied."""

    hold_id: OptionalNullable[str] = Field(default=UNSET, alias="holdId")
    """The budget held for this checkout, for 30 minutes."""

    approval_id: Optional[str] = Field(default=UNSET, alias="approvalId")
    approval_url: Optional[str] = Field(default=UNSET, alias="approvalUrl")
    """Where the person answers."""

    intent: Optional[IntentCheck] = UNSET
    """Who decided: the limits in code, a model checking fit, or the person."""

    remaining_cents: Optional[int] = Field(default=UNSET, alias="remainingCents")
    autopay: Optional[bool] = UNSET
    """The errand has saved PayPal: charge it with chargeSavedPaypal."""

    model: Optional[str] = UNSET
    model_called: Optional[bool] = Field(default=UNSET, alias="modelCalled")


class SpendDecisionDict(TypedDict):
    decision: DecisionOrStr
    reason: str
    code: NotRequired[CodeOrStr]
    hold_id: NotRequired[str | None]
    approval_id: NotRequired[str]
    approval_url: NotRequired[str]
    intent: NotRequired[IntentCheckDict]
    remaining_cents: NotRequired[int]
    autopay: NotRequired[bool]
    model: NotRequired[str]
    model_called: NotRequired[bool]
