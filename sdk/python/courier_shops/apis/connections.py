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
from ..errors.get_connection_error import GetConnectionErrorBody, get_connection_error_mapper
from ..errors.request_ticket_error import RequestTicketErrorBody, request_ticket_error_mapper
from ..models.connection import Connection
from ..models.ticket_request import TicketRequest, TicketRequestDict
from ..models.ticket_result import TicketResult
from ..server.server import Server


class Connections:
    def __init__(self, client: RawClient, server: Server, auth: AuthSchemes) -> None:
        self._with_raw_response = ConnectionsWithRawResponse(client, server, auth)

    def get_connection(self, connection_id: str, *, request_options: RequestOptionsOrDict | None = None) -> Connection:
        """Whether a connected Claude is still allowed in, and its current errand as a short-lived signed token (verify
        it like any Courier token).

        Args:
            connection_id: From the courier's token (``connection.id``).
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            The connection.

        Raises:
            ApiError: Missing or wrong shop key. No such errand, connection, hold or ask. ``error`` is ``Error |
                RawError``."""
        return unwrap(self._with_raw_response.get_connection(connection_id, request_options=request_options))

    def request_ticket(
        self,
        connection_id: str,
        body: TicketRequest | TicketRequestDict,
        *,
        request_options: RequestOptionsOrDict | None = None,
    ) -> TicketResult:
        """When a connected Claude wants to buy with no errand open. Returns a link for the person to set the budget,
        or, when the person already chose a budget in their chat app and has PayPal saved, opens the errand at once. The
        agent's numbers are only suggestions.

        Args:
            connection_id: From the courier's token (``connection.id``).
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            A link or a new errand.

        Raises:
            ApiError: Missing or wrong shop key. No such errand, connection, hold or ask. ``error`` is ``Error |
                RawError``."""
        return unwrap(self._with_raw_response.request_ticket(connection_id, body, request_options=request_options))

    @property
    def with_raw_response(self) -> ConnectionsWithRawResponse:
        return self._with_raw_response


class AsyncConnections:
    def __init__(self, client: AsyncRawClient, server: Server, auth: AsyncAuthSchemes) -> None:
        self._with_raw_response = AsyncConnectionsWithRawResponse(client, server, auth)

    async def get_connection(
        self, connection_id: str, *, request_options: RequestOptionsOrDict | None = None
    ) -> Connection:
        """Whether a connected Claude is still allowed in, and its current errand as a short-lived signed token (verify
        it like any Courier token).

        Args:
            connection_id: From the courier's token (``connection.id``).
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            The connection.

        Raises:
            ApiError: Missing or wrong shop key. No such errand, connection, hold or ask. ``error`` is ``Error |
                RawError``."""
        return unwrap(await self._with_raw_response.get_connection(connection_id, request_options=request_options))

    async def request_ticket(
        self,
        connection_id: str,
        body: TicketRequest | TicketRequestDict,
        *,
        request_options: RequestOptionsOrDict | None = None,
    ) -> TicketResult:
        """When a connected Claude wants to buy with no errand open. Returns a link for the person to set the budget,
        or, when the person already chose a budget in their chat app and has PayPal saved, opens the errand at once. The
        agent's numbers are only suggestions.

        Args:
            connection_id: From the courier's token (``connection.id``).
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            A link or a new errand.

        Raises:
            ApiError: Missing or wrong shop key. No such errand, connection, hold or ask. ``error`` is ``Error |
                RawError``."""
        return unwrap(
            await self._with_raw_response.request_ticket(connection_id, body, request_options=request_options)
        )

    @property
    def with_raw_response(self) -> AsyncConnectionsWithRawResponse:
        return self._with_raw_response


class ConnectionsWithRawResponse(SecuredRawResponse[RawClient, Server, AuthSchemes]):
    def get_connection(
        self, connection_id: str, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[Connection, GetConnectionErrorBody]:
        """Whether a connected Claude is still allowed in, and its current errand as a short-lived signed token (verify
        it like any Courier token).

        Args:
            connection_id: From the courier's token (``connection.id``).
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return self._client.execute(
            http_method="GET",
            url_template=self._server.default("/connections/{connectionId}"),
            path_params=[param[str]("connectionId", connection_id)],
            auth_scheme=self._auth.shop_key,
            decoder=json_decoder[Connection],
            error_mapper=get_connection_error_mapper,
            request_options=request_options,
        )

    def request_ticket(
        self,
        connection_id: str,
        body: TicketRequest | TicketRequestDict,
        *,
        request_options: RequestOptionsOrDict | None = None,
    ) -> ApiResult[TicketResult, RequestTicketErrorBody]:
        """When a connected Claude wants to buy with no errand open. Returns a link for the person to set the budget,
        or, when the person already chose a budget in their chat app and has PayPal saved, opens the errand at once. The
        agent's numbers are only suggestions.

        Args:
            connection_id: From the courier's token (``connection.id``).
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return self._client.execute(
            http_method="POST",
            url_template=self._server.default("/connections/{connectionId}/ticket"),
            path_params=[param[str]("connectionId", connection_id)],
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[TicketRequest | TicketRequestDict](body),
            auth_scheme=self._auth.shop_key,
            decoder=json_decoder[TicketResult],
            error_mapper=request_ticket_error_mapper,
            request_options=request_options,
        )


class AsyncConnectionsWithRawResponse(SecuredRawResponse[AsyncRawClient, Server, AsyncAuthSchemes]):
    async def get_connection(
        self, connection_id: str, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[Connection, GetConnectionErrorBody]:
        """Whether a connected Claude is still allowed in, and its current errand as a short-lived signed token (verify
        it like any Courier token).

        Args:
            connection_id: From the courier's token (``connection.id``).
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return await self._client.execute(
            http_method="GET",
            url_template=self._server.default("/connections/{connectionId}"),
            path_params=[param[str]("connectionId", connection_id)],
            auth_scheme=self._auth.shop_key,
            decoder=async_json_decoder[Connection],
            error_mapper=get_connection_error_mapper,
            request_options=request_options,
        )

    async def request_ticket(
        self,
        connection_id: str,
        body: TicketRequest | TicketRequestDict,
        *,
        request_options: RequestOptionsOrDict | None = None,
    ) -> ApiResult[TicketResult, RequestTicketErrorBody]:
        """When a connected Claude wants to buy with no errand open. Returns a link for the person to set the budget,
        or, when the person already chose a budget in their chat app and has PayPal saved, opens the errand at once. The
        agent's numbers are only suggestions.

        Args:
            connection_id: From the courier's token (``connection.id``).
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return await self._client.execute(
            http_method="POST",
            url_template=self._server.default("/connections/{connectionId}/ticket"),
            path_params=[param[str]("connectionId", connection_id)],
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[TicketRequest | TicketRequestDict](body),
            auth_scheme=self._auth.shop_key,
            decoder=async_json_decoder[TicketResult],
            error_mapper=request_ticket_error_mapper,
            request_options=request_options,
        )
