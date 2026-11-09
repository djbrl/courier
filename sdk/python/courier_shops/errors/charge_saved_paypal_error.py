from __future__ import annotations

from dataclasses import dataclass
from typing import Final, TypeAlias

from ..core import ErrorMapper, RawError, decode_json
from ..models.error import Error

ChargeSavedPaypalErrorBody: TypeAlias = Error | RawError


@dataclass(frozen=True, slots=True)
class _ChargeSavedPaypalError:
    def map(self, status_code: int, content: bytes) -> ChargeSavedPaypalErrorBody:
        match status_code:
            case 401 | 404 | 409 | 502:
                return decode_json[Error](content)
            case _:
                return RawError(status_code, content)


charge_saved_paypal_error_mapper: Final[ErrorMapper[ChargeSavedPaypalErrorBody]] = _ChargeSavedPaypalError()
