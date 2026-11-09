from enum import Enum
from typing import Annotated, TypeAlias

from ...core import open_enum_validator


class Decision1(str, Enum):
    APPROVED = "approved"
    DENIED = "denied"

    __str__ = str.__str__


Decision1OrStr: TypeAlias = Annotated[Decision1 | str, open_enum_validator(Decision1)]
