from __future__ import annotations

from dataclasses import dataclass
from typing import Final, TypeAlias

from ..core import ErrorMapper, RawError, decode_json
from ..models.error import Error

UpdateReturnErrorBody: TypeAlias = Error | RawError


@dataclass(frozen=True, slots=True)
class _UpdateReturnError:
    def map(self, status_code: int, content: bytes) -> UpdateReturnErrorBody:
        match status_code:
            case 401 | 404:
                return decode_json[Error](content)
            case _:
                return RawError(status_code, content)


update_return_error_mapper: Final[ErrorMapper[UpdateReturnErrorBody]] = _UpdateReturnError()
