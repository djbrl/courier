from enum import Enum
from typing import Annotated, TypeAlias

from ...core import open_enum_validator


class PaidWith(str, Enum):
    PAYPAL_PAGE = "paypal_page"
    SAVED_PAYPAL = "saved_paypal"

    __str__ = str.__str__


PaidWithOrStr: TypeAlias = Annotated[PaidWith | str, open_enum_validator(PaidWith)]
