from __future__ import annotations

from functools import cached_property
from types import TracebackType

from typing_extensions import Self

from .apis.after_sale import AsyncAfterSale
from .apis.approvals import AsyncApprovals
from .apis.connections import AsyncConnections
from .apis.errands import AsyncErrands
from .apis.reports import AsyncReports
from .apis.spending import AsyncSpending
from .auth import AsyncAuthSchemes
from .base_client import DEFAULT_TIMEOUT, BaseCourierShopsClient
from .core import (
    OPERATING_SYSTEM,
    PYTHON_RUNTIME,
    ApiKeyHeaderScheme,
    AsyncHttpClient,
    AsyncHttpx2Client,
    AsyncRawClient,
    LoggingOptionsOrDict,
    RetryOptionsOrDict,
    no_auth,
    param,
)


class AsyncCourierShopsClient(BaseCourierShopsClient[AsyncRawClient]):
    def __init__(
        self,
        *,
        base_url: str | None = None,
        timeout: float = DEFAULT_TIMEOUT,
        retry_options: int | RetryOptionsOrDict | None = None,
        logging_options: LoggingOptionsOrDict | None = None,
        custom_async_http_client: AsyncHttpClient | None = None,
        shop_key: str | None = None,
    ) -> None:
        super().__init__(
            base_url=base_url, timeout=timeout, retry_options=retry_options, logging_options=logging_options
        )
        self._raw_client = AsyncRawClient(
            http_client=(
                custom_async_http_client if custom_async_http_client is not None else AsyncHttpx2Client(timeout=timeout)
            ),
            retry_options=self._retry_options,
            logging_options=self._logging_options,
            global_headers=[
                param[str]("User-Agent", "CourierShopsClient/1.0.0 Python"),
                param[str]("X-APIMatic-Lang", "Python"),
                param[str]("X-APIMatic-Package-Version", "1.0.0"),
                param[str]("X-APIMatic-Gen-Version", "4.0.0"),
                param[str]("X-APIMatic-OS", OPERATING_SYSTEM),
                param[str]("X-APIMatic-Runtime", PYTHON_RUNTIME),
            ],
        )
        self._auth = AsyncAuthSchemes(
            shop_key=ApiKeyHeaderScheme("X-Internal-Secret", shop_key) if shop_key is not None else no_auth
        )

    @cached_property
    def after_sale(self) -> AsyncAfterSale:
        return AsyncAfterSale(self._raw_client, self._server, self._auth)

    @cached_property
    def approvals(self) -> AsyncApprovals:
        return AsyncApprovals(self._raw_client, self._server, self._auth)

    @cached_property
    def connections(self) -> AsyncConnections:
        return AsyncConnections(self._raw_client, self._server, self._auth)

    @cached_property
    def errands(self) -> AsyncErrands:
        return AsyncErrands(self._raw_client, self._server, self._auth)

    @cached_property
    def reports(self) -> AsyncReports:
        return AsyncReports(self._raw_client, self._server, self._auth)

    @cached_property
    def spending(self) -> AsyncSpending:
        return AsyncSpending(self._raw_client, self._server, self._auth)

    async def aclose(self) -> None:
        await self._raw_client.http_client.aclose()

    async def __aenter__(self) -> Self:
        return self

    async def __aexit__(
        self, exc_type: type[BaseException] | None, exc: BaseException | None, exc_tb: TracebackType | None
    ) -> None:
        await self.aclose()


AsyncClient = AsyncCourierShopsClient
