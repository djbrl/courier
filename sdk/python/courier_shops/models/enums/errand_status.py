from enum import Enum
from typing import Annotated, TypeAlias

from ...core import open_enum_validator


class ErrandStatus(str, Enum):
    PENDING_PAYPAL = "pending_paypal"
    PENDING_BOND = "pending_bond"
    ACTIVE = "active"
    REVOKED = "revoked"
    EXPIRED = "expired"
    SUSPENDED = "suspended"

    __str__ = str.__str__


ErrandStatusOrStr: TypeAlias = Annotated[ErrandStatus | str, open_enum_validator(ErrandStatus)]
