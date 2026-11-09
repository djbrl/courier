from __future__ import annotations

from dataclasses import dataclass
from typing import Final, TypeAlias

from ..core import ErrorMapper, RawError, decode_json
from ..models.error import Error

ReportCourierErrorBody: TypeAlias = Error | RawError


@dataclass(frozen=True, slots=True)
class _ReportCourierError:
    def map(self, status_code: int, content: bytes) -> ReportCourierErrorBody:
        match status_code:
            case 401 | 404:
                return decode_json[Error](content)
            case _:
                return RawError(status_code, content)


report_courier_error_mapper: Final[ErrorMapper[ReportCourierErrorBody]] = _ReportCourierError()
