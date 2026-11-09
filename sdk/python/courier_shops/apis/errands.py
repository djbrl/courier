from __future__ import annotations

from ..auth import AsyncAuthSchemes, AuthSchemes
from ..core import (
    ApiResult,
    AsyncRawClient,
    RawClient,
    RequestOptionsOrDict,
    SecuredRawResponse,
    async_json_decoder,
    json_decoder,
    param,
    unwrap,
)
from ..errors.get_errand_error import GetErrandErrorBody, get_errand_error_mapper
from ..models.errand import Errand
from ..server.server import Server


class Errands:
    def __init__(self, client: RawClient, server: Server, auth: AuthSchemes) -> None:
        self._with_raw_response = ErrandsWithRawResponse(client, server, auth)

    def get_errand(self, visa_id: str, *, request_options: RequestOptionsOrDict | None = None) -> Errand:
        """The errand's status and what is left to spend. Call it when a courier knocks: a revoked or used-up errand is
        turned away within seconds.

        Args:
            visa_id: The errand's ID, from the courier's token (``visa.id``).
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            The errand.

        Raises:
            ApiError: Missing or wrong shop key. No such errand, connection, hold or ask. ``error`` is ``Error |
                RawError``."""
        return unwrap(self._with_raw_response.get_errand(visa_id, request_options=request_options))

    @property
    def with_raw_response(self) -> ErrandsWithRawResponse:
        return self._with_raw_response


class AsyncErrands:
    def __init__(self, client: AsyncRawClient, server: Server, auth: AsyncAuthSchemes) -> None:
        self._with_raw_response = AsyncErrandsWithRawResponse(client, server, auth)

    async def get_errand(self, visa_id: str, *, request_options: RequestOptionsOrDict | None = None) -> Errand:
        """The errand's status and what is left to spend. Call it when a courier knocks: a revoked or used-up errand is
        turned away within seconds.

        Args:
            visa_id: The errand's ID, from the courier's token (``visa.id``).
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            The errand.

        Raises:
            ApiError: Missing or wrong shop key. No such errand, connection, hold or ask. ``error`` is ``Error |
                RawError``."""
        return unwrap(await self._with_raw_response.get_errand(visa_id, request_options=request_options))

    @property
    def with_raw_response(self) -> AsyncErrandsWithRawResponse:
        return self._with_raw_response


class ErrandsWithRawResponse(SecuredRawResponse[RawClient, Server, AuthSchemes]):
    def get_errand(
        self, visa_id: str, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[Errand, GetErrandErrorBody]:
        """The errand's status and what is left to spend. Call it when a courier knocks: a revoked or used-up errand is
        turned away within seconds.

        Args:
            visa_id: The errand's ID, from the courier's token (``visa.id``).
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return self._client.execute(
            http_method="GET",
            url_template=self._server.default("/visas/{visaId}"),
            path_params=[param[str]("visaId", visa_id)],
            auth_scheme=self._auth.shop_key,
            decoder=json_decoder[Errand],
            error_mapper=get_errand_error_mapper,
            request_options=request_options,
        )


class AsyncErrandsWithRawResponse(SecuredRawResponse[AsyncRawClient, Server, AsyncAuthSchemes]):
    async def get_errand(
        self, visa_id: str, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[Errand, GetErrandErrorBody]:
        """The errand's status and what is left to spend. Call it when a courier knocks: a revoked or used-up errand is
        turned away within seconds.

        Args:
            visa_id: The errand's ID, from the courier's token (``visa.id``).
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return await self._client.execute(
            http_method="GET",
            url_template=self._server.default("/visas/{visaId}"),
            path_params=[param[str]("visaId", visa_id)],
            auth_scheme=self._auth.shop_key,
            decoder=async_json_decoder[Errand],
            error_mapper=get_errand_error_mapper,
            request_options=request_options,
        )
