from __future__ import annotations

from functools import cached_property
from types import TracebackType

from typing_extensions import Self

from .apis.after_sale import AfterSale
from .apis.approvals import Approvals
from .apis.connections import Connections
from .apis.errands import Errands
from .apis.reports import Reports
from .apis.spending import Spending
from .auth import AuthSchemes
from .base_client import DEFAULT_TIMEOUT, BaseCourierShopsClient
from .core import (
    OPERATING_SYSTEM,
    PYTHON_RUNTIME,
    ApiKeyHeaderScheme,
    HttpClient,
    Httpx2Client,
    LoggingOptionsOrDict,
    RawClient,
    RetryOptionsOrDict,
    no_auth,
    param,
)


class CourierShopsClient(BaseCourierShopsClient[RawClient]):
    def __init__(
        self,
        *,
        base_url: str | None = None,
        timeout: float = DEFAULT_TIMEOUT,
        retry_options: int | RetryOptionsOrDict | None = None,
        logging_options: LoggingOptionsOrDict | None = None,
        custom_http_client: HttpClient | None = None,
        shop_key: str | None = None,
    ) -> None:
        super().__init__(
            base_url=base_url, timeout=timeout, retry_options=retry_options, logging_options=logging_options
        )
        self._raw_client = RawClient(
            http_client=custom_http_client if custom_http_client is not None else Httpx2Client(timeout=timeout),
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
        self._auth = AuthSchemes(
            shop_key=ApiKeyHeaderScheme("X-Internal-Secret", shop_key) if shop_key is not None else no_auth
        )

    @cached_property
    def after_sale(self) -> AfterSale:
        return AfterSale(self._raw_client, self._server, self._auth)

    @cached_property
    def approvals(self) -> Approvals:
        return Approvals(self._raw_client, self._server, self._auth)

    @cached_property
    def connections(self) -> Connections:
        return Connections(self._raw_client, self._server, self._auth)

    @cached_property
    def errands(self) -> Errands:
        return Errands(self._raw_client, self._server, self._auth)

    @cached_property
    def reports(self) -> Reports:
        return Reports(self._raw_client, self._server, self._auth)

    @cached_property
    def spending(self) -> Spending:
        return Spending(self._raw_client, self._server, self._auth)

    def close(self) -> None:
        self._raw_client.http_client.close()

    def __enter__(self) -> Self:
        return self

    def __exit__(
        self, exc_type: type[BaseException] | None, exc: BaseException | None, exc_tb: TracebackType | None
    ) -> None:
        self.close()


Client = CourierShopsClient
