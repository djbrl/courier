<!-- Generated file — do not edit; regenerated with the SDK. -->

# Connections — operations

Accessor: `client.connections` · Source: `courier_shops/apis/connections.py` · 2 operations

Each `###` block is one operation and assumes `sdk-map.md` is loaded: blocks omit what its invariants table covers and are otherwise self-contained, so chunk at block level. Signatures are the sync parsed spelling; the async and raw spellings take the same parameters (see sdk-map.md). **Type sources** names the module declaring each type an operation mentions, so resolving a body, return or error payload is a lookup rather than a search; the runtime types `RawError` and `ApiResult` are excluded.

### client.connections.get_connection

- **Route**: `GET /connections/{connectionId}`
- **Auth**: `shop_key`
- **Signature**: `def get_connection(connection_id: str, *, request_options: RequestOptionsOrDict | None = None)`
  - required, positional: `connection_id`
- **Params**: `connection_id` — path `connectionId`
- **Returns (parsed)**: `Connection`
- **Returns (raw)**: `ApiResult[Connection, GetConnectionErrorBody]`
- **Error**: `GetConnectionErrorBody` — **Case A (typed)**
- **Error arms**: `Error` [401, 404] · `RawError` [anything unmapped]

| Type | Source |
| --- | --- |
| `Connection` | `courier_shops/models/connection.py` |
| `GetConnectionErrorBody` | `courier_shops/errors/get_connection_error.py` |
| `Error` | `courier_shops/models/error.py` |

### client.connections.request_ticket

- **Route**: `POST /connections/{connectionId}/ticket`
- **Auth**: `shop_key`
- **Signature**: `def request_ticket(connection_id: str, body: TicketRequest | TicketRequestDict, *, request_options: RequestOptionsOrDict | None = None)`
  - required, positional: `connection_id`, `body`
- **Params**: `connection_id` — path `connectionId` · `body` — JSON body
- **Returns (parsed)**: `TicketResult`
- **Returns (raw)**: `ApiResult[TicketResult, RequestTicketErrorBody]`
- **Error**: `RequestTicketErrorBody` — **Case A (typed)**
- **Error arms**: `Error` [401, 404] · `RawError` [anything unmapped]

| Type | Source |
| --- | --- |
| `TicketRequest` | `courier_shops/models/ticket_request.py` |
| `TicketRequestDict` | `courier_shops/models/ticket_request.py` |
| `TicketResult` | `courier_shops/models/ticket_result.py` |
| `RequestTicketErrorBody` | `courier_shops/errors/request_ticket_error.py` |
| `Error` | `courier_shops/models/error.py` |

