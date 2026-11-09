from __future__ import annotations

from pydantic import Field
from typing_extensions import TypedDict

from ..core import SdkBaseModel


class Release(SdkBaseModel):
    hold_id: str = Field(alias="holdId")


class ReleaseDict(TypedDict):
    hold_id: str
