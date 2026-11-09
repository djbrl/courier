from enum import Enum
from typing import Annotated, TypeAlias

from ...core import open_enum_validator


class By(str, Enum):
    CLERK = "clerk"
    OWNER = "owner"

    __str__ = str.__str__


ByOrStr: TypeAlias = Annotated[By | str, open_enum_validator(By)]
