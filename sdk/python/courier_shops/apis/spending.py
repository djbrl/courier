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
from ..errors.charge_saved_paypal_error import ChargeSavedPaypalErrorBody, charge_saved_paypal_error_mapper
from ..errors.check_spend_error import CheckSpendErrorBody, check_spend_error_mapper
from ..errors.commit_spend_error import CommitSpendErrorBody, commit_spend_error_mapper
from ..errors.release_hold_error import ReleaseHoldErrorBody, release_hold_error_mapper
from ..models.charge import Charge, ChargeDict
from ..models.charge_result import ChargeResult
from ..models.commit import Commit, CommitDict
from ..models.commit_result import CommitResult
from ..models.ok import Ok
from ..models.release import Release, ReleaseDict
from ..models.spend_check import SpendCheck, SpendCheckDict
from ..models.spend_decision import SpendDecision
from ..server.server import Server


class Spending:
    def __init__(self, client: RawClient, server: Server, auth: AuthSchemes) -> None:
        self._with_raw_response = SpendingWithRawResponse(client, server, auth)

    def charge_saved_paypal(
        self, body: Charge | ChargeDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> ChargeResult:
        """Only when the decision said ``autopay``. Charges exactly the held amount, once per hold.

        Args:
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            The PayPal order.

        Raises:
            ApiError: Missing or wrong shop key. No such errand, connection, hold or ask. Not possible in the current
                state. PayPal didn't take the payment. ``error`` is ``Error | RawError``."""
        return unwrap(self._with_raw_response.charge_saved_paypal(body, request_options=request_options))

    def check_spend(
        self, body: SpendCheck | SpendCheckDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> SpendDecision:
        """Courier checks the errand's limits in code, then whether the items fit what the person asked for. It approves
        (with a hold on the budget for a checkout), denies with a code, or asks the person first.

        Args:
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Courier's decision.

        Raises:
            ApiError: Missing or wrong shop key. ``error`` is ``Error | RawError``."""
        return unwrap(self._with_raw_response.check_spend(body, request_options=request_options))

    def commit_spend(
        self, body: Commit | CommitDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> CommitResult:
        """After PayPal captured the payment. Idempotent per hold.

        Args:
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            What the errand has spent.

        Raises:
            ApiError: Missing or wrong shop key. No such errand, connection, hold or ask. ``error`` is ``Error |
                RawError``."""
        return unwrap(self._with_raw_response.commit_spend(body, request_options=request_options))

    def release_hold(self, body: Release | ReleaseDict, *, request_options: RequestOptionsOrDict | None = None) -> Ok:
        """When an order is cancelled before it is paid.

        Args:
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Released.

        Raises:
            ApiError: Missing or wrong shop key. ``error`` is ``Error | RawError``."""
        return unwrap(self._with_raw_response.release_hold(body, request_options=request_options))

    @property
    def with_raw_response(self) -> SpendingWithRawResponse:
        return self._with_raw_response


class AsyncSpending:
    def __init__(self, client: AsyncRawClient, server: Server, auth: AsyncAuthSchemes) -> None:
        self._with_raw_response = AsyncSpendingWithRawResponse(client, server, auth)

    async def charge_saved_paypal(
        self, body: Charge | ChargeDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> ChargeResult:
        """Only when the decision said ``autopay``. Charges exactly the held amount, once per hold.

        Args:
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            The PayPal order.

        Raises:
            ApiError: Missing or wrong shop key. No such errand, connection, hold or ask. Not possible in the current
                state. PayPal didn't take the payment. ``error`` is ``Error | RawError``."""
        return unwrap(await self._with_raw_response.charge_saved_paypal(body, request_options=request_options))

    async def check_spend(
        self, body: SpendCheck | SpendCheckDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> SpendDecision:
        """Courier checks the errand's limits in code, then whether the items fit what the person asked for. It approves
        (with a hold on the budget for a checkout), denies with a code, or asks the person first.

        Args:
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Courier's decision.

        Raises:
            ApiError: Missing or wrong shop key. ``error`` is ``Error | RawError``."""
        return unwrap(await self._with_raw_response.check_spend(body, request_options=request_options))

    async def commit_spend(
        self, body: Commit | CommitDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> CommitResult:
        """After PayPal captured the payment. Idempotent per hold.

        Args:
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            What the errand has spent.

        Raises:
            ApiError: Missing or wrong shop key. No such errand, connection, hold or ask. ``error`` is ``Error |
                RawError``."""
        return unwrap(await self._with_raw_response.commit_spend(body, request_options=request_options))

    async def release_hold(
        self, body: Release | ReleaseDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> Ok:
        """When an order is cancelled before it is paid.

        Args:
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Released.

        Raises:
            ApiError: Missing or wrong shop key. ``error`` is ``Error | RawError``."""
        return unwrap(await self._with_raw_response.release_hold(body, request_options=request_options))

    @property
    def with_raw_response(self) -> AsyncSpendingWithRawResponse:
        return self._with_raw_response


class SpendingWithRawResponse(SecuredRawResponse[RawClient, Server, AuthSchemes]):
    def charge_saved_paypal(
        self, body: Charge | ChargeDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[ChargeResult, ChargeSavedPaypalErrorBody]:
        """Only when the decision said ``autopay``. Charges exactly the held amount, once per hold.

        Args:
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return self._client.execute(
            http_method="POST",
            url_template=self._server.default("/spend/charge"),
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[Charge | ChargeDict](body),
            auth_scheme=self._auth.shop_key,
            decoder=json_decoder[ChargeResult],
            error_mapper=charge_saved_paypal_error_mapper,
            request_options=request_options,
        )

    def check_spend(
        self, body: SpendCheck | SpendCheckDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[SpendDecision, CheckSpendErrorBody]:
        """Courier checks the errand's limits in code, then whether the items fit what the person asked for. It approves
        (with a hold on the budget for a checkout), denies with a code, or asks the person first.

        Args:
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return self._client.execute(
            http_method="POST",
            url_template=self._server.default("/spend/check"),
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[SpendCheck | SpendCheckDict](body),
            auth_scheme=self._auth.shop_key,
            decoder=json_decoder[SpendDecision],
            error_mapper=check_spend_error_mapper,
            request_options=request_options,
        )

    def commit_spend(
        self, body: Commit | CommitDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[CommitResult, CommitSpendErrorBody]:
        """After PayPal captured the payment. Idempotent per hold.

        Args:
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return self._client.execute(
            http_method="POST",
            url_template=self._server.default("/spend/commit"),
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[Commit | CommitDict](body),
            auth_scheme=self._auth.shop_key,
            decoder=json_decoder[CommitResult],
            error_mapper=commit_spend_error_mapper,
            request_options=request_options,
        )

    def release_hold(
        self, body: Release | ReleaseDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[Ok, ReleaseHoldErrorBody]:
        """When an order is cancelled before it is paid.

        Args:
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return self._client.execute(
            http_method="POST",
            url_template=self._server.default("/spend/release"),
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[Release | ReleaseDict](body),
            auth_scheme=self._auth.shop_key,
            decoder=json_decoder[Ok],
            error_mapper=release_hold_error_mapper,
            request_options=request_options,
        )


class AsyncSpendingWithRawResponse(SecuredRawResponse[AsyncRawClient, Server, AsyncAuthSchemes]):
    async def charge_saved_paypal(
        self, body: Charge | ChargeDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[ChargeResult, ChargeSavedPaypalErrorBody]:
        """Only when the decision said ``autopay``. Charges exactly the held amount, once per hold.

        Args:
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return await self._client.execute(
            http_method="POST",
            url_template=self._server.default("/spend/charge"),
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[Charge | ChargeDict](body),
            auth_scheme=self._auth.shop_key,
            decoder=async_json_decoder[ChargeResult],
            error_mapper=charge_saved_paypal_error_mapper,
            request_options=request_options,
        )

    async def check_spend(
        self, body: SpendCheck | SpendCheckDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[SpendDecision, CheckSpendErrorBody]:
        """Courier checks the errand's limits in code, then whether the items fit what the person asked for. It approves
        (with a hold on the budget for a checkout), denies with a code, or asks the person first.

        Args:
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return await self._client.execute(
            http_method="POST",
            url_template=self._server.default("/spend/check"),
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[SpendCheck | SpendCheckDict](body),
            auth_scheme=self._auth.shop_key,
            decoder=async_json_decoder[SpendDecision],
            error_mapper=check_spend_error_mapper,
            request_options=request_options,
        )

    async def commit_spend(
        self, body: Commit | CommitDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[CommitResult, CommitSpendErrorBody]:
        """After PayPal captured the payment. Idempotent per hold.

        Args:
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return await self._client.execute(
            http_method="POST",
            url_template=self._server.default("/spend/commit"),
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[Commit | CommitDict](body),
            auth_scheme=self._auth.shop_key,
            decoder=async_json_decoder[CommitResult],
            error_mapper=commit_spend_error_mapper,
            request_options=request_options,
        )

    async def release_hold(
        self, body: Release | ReleaseDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[Ok, ReleaseHoldErrorBody]:
        """When an order is cancelled before it is paid.

        Args:
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return await self._client.execute(
            http_method="POST",
            url_template=self._server.default("/spend/release"),
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[Release | ReleaseDict](body),
            auth_scheme=self._auth.shop_key,
            decoder=async_json_decoder[Ok],
            error_mapper=release_hold_error_mapper,
            request_options=request_options,
        )
