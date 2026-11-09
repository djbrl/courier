from enum import Enum
from typing import Annotated, TypeAlias

from ...core import open_enum_validator


class Decision2(str, Enum):
    FULL = "full"
    PARTIAL = "partial"
    DECLINE = "decline"

    __str__ = str.__str__


Decision2OrStr: TypeAlias = Annotated[Decision2 | str, open_enum_validator(Decision2)]
