from __future__ import annotations

from typing_extensions import TypedDict

from ..core import SdkBaseModel
from .enums.status2 import Status2OrStr


class ApprovalStatus(SdkBaseModel):
    status: Status2OrStr


class ApprovalStatusDict(TypedDict):
    status: Status2OrStr
