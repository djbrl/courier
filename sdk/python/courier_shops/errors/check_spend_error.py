from __future__ import annotations

from dataclasses import dataclass
from typing import Final, TypeAlias

from ..core import ErrorMapper, RawError, decode_json
from ..models.error import Error

CheckSpendErrorBody: TypeAlias = Error | RawError


@dataclass(frozen=True, slots=True)
class _CheckSpendError:
    def map(self, status_code: int, content: bytes) -> CheckSpendErrorBody:
        match status_code:
            case 401:
                return decode_json[Error](content)
            case _:
                return RawError(status_code, content)


check_spend_error_mapper: Final[ErrorMapper[CheckSpendErrorBody]] = _CheckSpendError()
