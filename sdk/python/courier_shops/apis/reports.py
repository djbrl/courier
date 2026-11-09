from __future__ import annotations

from uuid import UUID, uuid4

from ..auth import AsyncAuthSchemes, AuthSchemes
from ..core import (
    ApiResult,
    AsyncRawClient,
    RawClient,
    RequestOptionsOrDict,
    SecuredRawResponse,
    async_json_decoder,
    json_body,
    json_decoder,
    param,
    unwrap,
)
from ..errors.report_courier_error import ReportCourierErrorBody, report_courier_error_mapper
from ..models.report import Report, ReportDict
from ..models.report_result import ReportResult
from ..server.server import Server


class Reports:
    def __init__(self, client: RawClient, server: Server, auth: AuthSchemes) -> None:
        self._with_raw_response = ReportsWithRawResponse(client, server, auth)

    def report_courier(
        self, body: Report | ReportDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> ReportResult:
        """Suspends the errand at once and claims its bond, if it has one.

        Args:
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Suspended.

        Raises:
            ApiError: Missing or wrong shop key. No such errand, connection, hold or ask. ``error`` is ``Error |
                RawError``."""
        return unwrap(self._with_raw_response.report_courier(body, request_options=request_options))

    @property
    def with_raw_response(self) -> ReportsWithRawResponse:
        return self._with_raw_response


class AsyncReports:
    def __init__(self, client: AsyncRawClient, server: Server, auth: AsyncAuthSchemes) -> None:
        self._with_raw_response = AsyncReportsWithRawResponse(client, server, auth)

    async def report_courier(
        self, body: Report | ReportDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> ReportResult:
        """Suspends the errand at once and claims its bond, if it has one.

        Args:
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Suspended.

        Raises:
            ApiError: Missing or wrong shop key. No such errand, connection, hold or ask. ``error`` is ``Error |
                RawError``."""
        return unwrap(await self._with_raw_response.report_courier(body, request_options=request_options))

    @property
    def with_raw_response(self) -> AsyncReportsWithRawResponse:
        return self._with_raw_response


class ReportsWithRawResponse(SecuredRawResponse[RawClient, Server, AuthSchemes]):
    def report_courier(
        self, body: Report | ReportDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[ReportResult, ReportCourierErrorBody]:
        """Suspends the errand at once and claims its bond, if it has one.

        Args:
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return self._client.execute(
            http_method="POST",
            url_template=self._server.default("/report"),
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[Report | ReportDict](body),
            auth_scheme=self._auth.shop_key,
            decoder=json_decoder[ReportResult],
            error_mapper=report_courier_error_mapper,
            request_options=request_options,
        )


class AsyncReportsWithRawResponse(SecuredRawResponse[AsyncRawClient, Server, AsyncAuthSchemes]):
    async def report_courier(
        self, body: Report | ReportDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[ReportResult, ReportCourierErrorBody]:
        """Suspends the errand at once and claims its bond, if it has one.

        Args:
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return await self._client.execute(
            http_method="POST",
            url_template=self._server.default("/report"),
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[Report | ReportDict](body),
            auth_scheme=self._auth.shop_key,
            decoder=async_json_decoder[ReportResult],
            error_mapper=report_courier_error_mapper,
            request_options=request_options,
        )
