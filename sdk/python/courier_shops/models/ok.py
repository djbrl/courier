from __future__ import annotations

from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, SdkBaseModel


class Ok(SdkBaseModel):
    ok: bool
    skipped: Optional[bool] = UNSET
    """Nothing changed: it was already recorded."""


class OkDict(TypedDict):
    ok: bool
    skipped: NotRequired[bool]
