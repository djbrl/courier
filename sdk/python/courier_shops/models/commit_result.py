from __future__ import annotations

from pydantic import Field
from typing_extensions import TypedDict

from ..core import SdkBaseModel


class CommitResult(SdkBaseModel):
    ok: bool
    spent_cents: int = Field(alias="spentCents")
    remaining_cents: int = Field(alias="remainingCents")


class CommitResultDict(TypedDict):
    ok: bool
    spent_cents: int
    remaining_cents: int
