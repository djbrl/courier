from enum import Enum
from typing import Annotated, TypeAlias

from ...core import open_enum_validator


class Code(str, Enum):
    """Why it was denied."""

    UNKNOWN_VISA = "unknown_visa"
    VISA_INACTIVE = "visa_inactive"
    WRONG_MERCHANT = "wrong_merchant"
    SUBJECT_MISMATCH = "subject_mismatch"
    INSUFFICIENT_SCOPE = "insufficient_scope"
    BAD_REQUEST = "bad_request"
    PER_PURCHASE_LIMIT = "per_purchase_limit"
    SPEND_LIMIT = "spend_limit"
    HUMAN_DENIED = "human_denied"
    INTENT_DENIED = "intent_denied"

    __str__ = str.__str__


CodeOrStr: TypeAlias = Annotated[Code | str, open_enum_validator(Code)]
