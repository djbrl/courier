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
from ..errors.add_step_error import AddStepErrorBody, add_step_error_mapper
from ..errors.update_parcel_error import UpdateParcelErrorBody, update_parcel_error_mapper
from ..errors.update_return_error import UpdateReturnErrorBody, update_return_error_mapper
from ..models.ok import Ok
from ..models.parcel import Parcel, ParcelDict
from ..models.return_model import ReturnModel, ReturnModelDict
from ..models.step import Step, StepDict
from ..server.server import Server


class AfterSale:
    def __init__(self, client: RawClient, server: Server, auth: AuthSchemes) -> None:
        self._with_raw_response = AfterSaleWithRawResponse(client, server, auth)

    def add_step(self, body: Step | StepDict, *, request_options: RequestOptionsOrDict | None = None) -> Ok:
        """A line the person sees on their errand, such as a browse. Browse steps are kept to one per 10 minutes.

        Args:
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Added, or skipped.

        Raises:
            ApiError: Missing or wrong shop key. No such errand, connection, hold or ask. ``error`` is ``Error |
                RawError``."""
        return unwrap(self._with_raw_response.add_step(body, request_options=request_options))

    def update_parcel(self, body: Parcel | ParcelDict, *, request_options: RequestOptionsOrDict | None = None) -> Ok:
        """Each step of a delivery, in order. A step at or before the last one sent is skipped. Carries no personal
        data.

        Args:
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Told, or skipped.

        Raises:
            ApiError: Missing or wrong shop key. No such errand, connection, hold or ask. ``error`` is ``Error |
                RawError``."""
        return unwrap(self._with_raw_response.update_parcel(body, request_options=request_options))

    def update_return(
        self, body: ReturnModel | ReturnModelDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> Ok:
        """A refund in full or in part, or a decline. A repeat of the same decision is skipped. A refund doesn't raise
        what the errand may still spend.

        Args:
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Told, or skipped.

        Raises:
            ApiError: Missing or wrong shop key. No such errand, connection, hold or ask. ``error`` is ``Error |
                RawError``."""
        return unwrap(self._with_raw_response.update_return(body, request_options=request_options))

    @property
    def with_raw_response(self) -> AfterSaleWithRawResponse:
        return self._with_raw_response


class AsyncAfterSale:
    def __init__(self, client: AsyncRawClient, server: Server, auth: AsyncAuthSchemes) -> None:
        self._with_raw_response = AsyncAfterSaleWithRawResponse(client, server, auth)

    async def add_step(self, body: Step | StepDict, *, request_options: RequestOptionsOrDict | None = None) -> Ok:
        """A line the person sees on their errand, such as a browse. Browse steps are kept to one per 10 minutes.

        Args:
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Added, or skipped.

        Raises:
            ApiError: Missing or wrong shop key. No such errand, connection, hold or ask. ``error`` is ``Error |
                RawError``."""
        return unwrap(await self._with_raw_response.add_step(body, request_options=request_options))

    async def update_parcel(
        self, body: Parcel | ParcelDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> Ok:
        """Each step of a delivery, in order. A step at or before the last one sent is skipped. Carries no personal
        data.

        Args:
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Told, or skipped.

        Raises:
            ApiError: Missing or wrong shop key. No such errand, connection, hold or ask. ``error`` is ``Error |
                RawError``."""
        return unwrap(await self._with_raw_response.update_parcel(body, request_options=request_options))

    async def update_return(
        self, body: ReturnModel | ReturnModelDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> Ok:
        """A refund in full or in part, or a decline. A repeat of the same decision is skipped. A refund doesn't raise
        what the errand may still spend.

        Args:
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Told, or skipped.

        Raises:
            ApiError: Missing or wrong shop key. No such errand, connection, hold or ask. ``error`` is ``Error |
                RawError``."""
        return unwrap(await self._with_raw_response.update_return(body, request_options=request_options))

    @property
    def with_raw_response(self) -> AsyncAfterSaleWithRawResponse:
        return self._with_raw_response


class AfterSaleWithRawResponse(SecuredRawResponse[RawClient, Server, AuthSchemes]):
    def add_step(
        self, body: Step | StepDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[Ok, AddStepErrorBody]:
        """A line the person sees on their errand, such as a browse. Browse steps are kept to one per 10 minutes.

        Args:
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return self._client.execute(
            http_method="POST",
            url_template=self._server.default("/stamps"),
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[Step | StepDict](body),
            auth_scheme=self._auth.shop_key,
            decoder=json_decoder[Ok],
            error_mapper=add_step_error_mapper,
            request_options=request_options,
        )

    def update_parcel(
        self, body: Parcel | ParcelDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[Ok, UpdateParcelErrorBody]:
        """Each step of a delivery, in order. A step at or before the last one sent is skipped. Carries no personal
        data.

        Args:
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return self._client.execute(
            http_method="POST",
            url_template=self._server.default("/shipments"),
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[Parcel | ParcelDict](body),
            auth_scheme=self._auth.shop_key,
            decoder=json_decoder[Ok],
            error_mapper=update_parcel_error_mapper,
            request_options=request_options,
        )

    def update_return(
        self, body: ReturnModel | ReturnModelDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[Ok, UpdateReturnErrorBody]:
        """A refund in full or in part, or a decline. A repeat of the same decision is skipped. A refund doesn't raise
        what the errand may still spend.

        Args:
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return self._client.execute(
            http_method="POST",
            url_template=self._server.default("/returns"),
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[ReturnModel | ReturnModelDict](body),
            auth_scheme=self._auth.shop_key,
            decoder=json_decoder[Ok],
            error_mapper=update_return_error_mapper,
            request_options=request_options,
        )


class AsyncAfterSaleWithRawResponse(SecuredRawResponse[AsyncRawClient, Server, AsyncAuthSchemes]):
    async def add_step(
        self, body: Step | StepDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[Ok, AddStepErrorBody]:
        """A line the person sees on their errand, such as a browse. Browse steps are kept to one per 10 minutes.

        Args:
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return await self._client.execute(
            http_method="POST",
            url_template=self._server.default("/stamps"),
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[Step | StepDict](body),
            auth_scheme=self._auth.shop_key,
            decoder=async_json_decoder[Ok],
            error_mapper=add_step_error_mapper,
            request_options=request_options,
        )

    async def update_parcel(
        self, body: Parcel | ParcelDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[Ok, UpdateParcelErrorBody]:
        """Each step of a delivery, in order. A step at or before the last one sent is skipped. Carries no personal
        data.

        Args:
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return await self._client.execute(
            http_method="POST",
            url_template=self._server.default("/shipments"),
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[Parcel | ParcelDict](body),
            auth_scheme=self._auth.shop_key,
            decoder=async_json_decoder[Ok],
            error_mapper=update_parcel_error_mapper,
            request_options=request_options,
        )

    async def update_return(
        self, body: ReturnModel | ReturnModelDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[Ok, UpdateReturnErrorBody]:
        """A refund in full or in part, or a decline. A repeat of the same decision is skipped. A refund doesn't raise
        what the errand may still spend.

        Args:
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return await self._client.execute(
            http_method="POST",
            url_template=self._server.default("/returns"),
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[ReturnModel | ReturnModelDict](body),
            auth_scheme=self._auth.shop_key,
            decoder=async_json_decoder[Ok],
            error_mapper=update_return_error_mapper,
            request_options=request_options,
        )
