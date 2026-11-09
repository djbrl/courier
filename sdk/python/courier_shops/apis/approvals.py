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
from ..errors.get_approval_error import GetApprovalErrorBody, get_approval_error_mapper
from ..errors.record_approval_error import RecordApprovalErrorBody, record_approval_error_mapper
from ..models.approval_status import ApprovalStatus
from ..models.decide import Decide, DecideDict
from ..server.server import Server


class Approvals:
    def __init__(self, client: RawClient, server: Server, auth: AuthSchemes) -> None:
        self._with_raw_response = ApprovalsWithRawResponse(client, server, auth)

    def get_approval(self, approval_id: str, *, request_options: RequestOptionsOrDict | None = None) -> ApprovalStatus:
        """Where an ask stands while the person answers on Courier's page.

        Args:
            approval_id: From a spend decision that asked the person.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            The ask.

        Raises:
            ApiError: Missing or wrong shop key. No such errand, connection, hold or ask. ``error`` is ``Error |
                RawError``."""
        return unwrap(self._with_raw_response.get_approval(approval_id, request_options=request_options))

    def record_approval(
        self, approval_id: str, body: Decide | DecideDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApprovalStatus:
        """Only for an answer the person picked in a dialog their chat app showed them (the model can't answer it).
        Never pass on an agent's own answer.

        Args:
            approval_id: From a spend decision that asked the person.
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            The ask.

        Raises:
            ApiError: Missing or wrong shop key. No such errand, connection, hold or ask. ``error`` is ``Error |
                RawError``."""
        return unwrap(self._with_raw_response.record_approval(approval_id, body, request_options=request_options))

    @property
    def with_raw_response(self) -> ApprovalsWithRawResponse:
        return self._with_raw_response


class AsyncApprovals:
    def __init__(self, client: AsyncRawClient, server: Server, auth: AsyncAuthSchemes) -> None:
        self._with_raw_response = AsyncApprovalsWithRawResponse(client, server, auth)

    async def get_approval(
        self, approval_id: str, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApprovalStatus:
        """Where an ask stands while the person answers on Courier's page.

        Args:
            approval_id: From a spend decision that asked the person.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            The ask.

        Raises:
            ApiError: Missing or wrong shop key. No such errand, connection, hold or ask. ``error`` is ``Error |
                RawError``."""
        return unwrap(await self._with_raw_response.get_approval(approval_id, request_options=request_options))

    async def record_approval(
        self, approval_id: str, body: Decide | DecideDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApprovalStatus:
        """Only for an answer the person picked in a dialog their chat app showed them (the model can't answer it).
        Never pass on an agent's own answer.

        Args:
            approval_id: From a spend decision that asked the person.
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            The ask.

        Raises:
            ApiError: Missing or wrong shop key. No such errand, connection, hold or ask. ``error`` is ``Error |
                RawError``."""
        return unwrap(await self._with_raw_response.record_approval(approval_id, body, request_options=request_options))

    @property
    def with_raw_response(self) -> AsyncApprovalsWithRawResponse:
        return self._with_raw_response


class ApprovalsWithRawResponse(SecuredRawResponse[RawClient, Server, AuthSchemes]):
    def get_approval(
        self, approval_id: str, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[ApprovalStatus, GetApprovalErrorBody]:
        """Where an ask stands while the person answers on Courier's page.

        Args:
            approval_id: From a spend decision that asked the person.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return self._client.execute(
            http_method="GET",
            url_template=self._server.default("/approvals/{approvalId}"),
            path_params=[param[str]("approvalId", approval_id)],
            auth_scheme=self._auth.shop_key,
            decoder=json_decoder[ApprovalStatus],
            error_mapper=get_approval_error_mapper,
            request_options=request_options,
        )

    def record_approval(
        self, approval_id: str, body: Decide | DecideDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[ApprovalStatus, RecordApprovalErrorBody]:
        """Only for an answer the person picked in a dialog their chat app showed them (the model can't answer it).
        Never pass on an agent's own answer.

        Args:
            approval_id: From a spend decision that asked the person.
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return self._client.execute(
            http_method="POST",
            url_template=self._server.default("/approvals/{approvalId}/decide"),
            path_params=[param[str]("approvalId", approval_id)],
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[Decide | DecideDict](body),
            auth_scheme=self._auth.shop_key,
            decoder=json_decoder[ApprovalStatus],
            error_mapper=record_approval_error_mapper,
            request_options=request_options,
        )


class AsyncApprovalsWithRawResponse(SecuredRawResponse[AsyncRawClient, Server, AsyncAuthSchemes]):
    async def get_approval(
        self, approval_id: str, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[ApprovalStatus, GetApprovalErrorBody]:
        """Where an ask stands while the person answers on Courier's page.

        Args:
            approval_id: From a spend decision that asked the person.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return await self._client.execute(
            http_method="GET",
            url_template=self._server.default("/approvals/{approvalId}"),
            path_params=[param[str]("approvalId", approval_id)],
            auth_scheme=self._auth.shop_key,
            decoder=async_json_decoder[ApprovalStatus],
            error_mapper=get_approval_error_mapper,
            request_options=request_options,
        )

    async def record_approval(
        self, approval_id: str, body: Decide | DecideDict, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[ApprovalStatus, RecordApprovalErrorBody]:
        """Only for an answer the person picked in a dialog their chat app showed them (the model can't answer it).
        Never pass on an agent's own answer.

        Args:
            approval_id: From a spend decision that asked the person.
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return await self._client.execute(
            http_method="POST",
            url_template=self._server.default("/approvals/{approvalId}/decide"),
            path_params=[param[str]("approvalId", approval_id)],
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[Decide | DecideDict](body),
            auth_scheme=self._auth.shop_key,
            decoder=async_json_decoder[ApprovalStatus],
            error_mapper=record_approval_error_mapper,
            request_options=request_options,
        )
