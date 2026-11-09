from enum import Enum
from typing import Annotated, TypeAlias

from ...core import open_enum_validator


class Decision(str, Enum):
    APPROVE = "approve"
    ASK_HUMAN = "ask_human"
    DENY = "deny"

    __str__ = str.__str__


DecisionOrStr: TypeAlias = Annotated[Decision | str, open_enum_validator(Decision)]
