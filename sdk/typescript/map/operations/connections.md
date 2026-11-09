<!-- Generated file — do not edit; regenerated with the SDK. -->

# Connections — operations

Accessor: `client.connections` · Source: `src/resources/connections.ts` · 2 operations · Request and error types: namespace `Connections`

**Type sources**: every type an operation names, with the file that declares it and the schema value exported beside it. Import every name from `courier-shops`; the `Source` path is where to **read** the shape, never what to import. `ApiError`, the runtime error family and the file vocabulary are excluded — see sdk-map.md.

### getConnection

- **Signature**: `getConnection(request: Connections.GetConnectionRequest, options?: RequestOptions): ApiPromise<Connection, Connections.GetConnectionError>`
- **Wire**: `GET /connections/{connectionId}`
- **Auth**: `shopKey`
- **Request body**: none — no `Content-Type` header is sent
- **Returns**: `Connection`
- **Error**: `CourierShopsError` with `kind: "api"`, an instance of `Connections.GetConnectionError` — **typed arms**, narrowed on `err.payload.kind`
- **Error arms**: `"error"` [401] `Error` · `"error2"` [404] `Error` · `"undeclared"` [any other] `rawBody: ArrayBuffer`

**Fields** — `Connections.GetConnectionRequest` (1):

| Field | Channel | Type | Req |
| --- | --- | --- | --- |
| `connectionId` | `path` | `string` | yes |

| Type | Schema value | Source |
| --- | --- | --- |
| `Connection` | `connectionSchema` | `src/models/connection.ts` |
| `Error` | `errorSchema` | `src/models/error.ts` |

### requestTicket

- **Signature**: `requestTicket(request: Connections.RequestTicketRequest, options?: RequestOptions): ApiPromise<TicketResult, Connections.RequestTicketError>`
- **Wire**: `POST /connections/{connectionId}/ticket`
- **Auth**: `shopKey`
- **Request body**: `application/json` — the `body` field
- **SDK-sent**: `header Idempotency-Key` (minted per call)
- **Returns**: `TicketResult`
- **Error**: `CourierShopsError` with `kind: "api"`, an instance of `Connections.RequestTicketError` — **typed arms**, narrowed on `err.payload.kind`
- **Error arms**: `"error"` [401] `Error` · `"error2"` [404] `Error` · `"undeclared"` [any other] `rawBody: ArrayBuffer`

**Fields** — `Connections.RequestTicketRequest` (2):

| Field | Channel | Type | Req |
| --- | --- | --- | --- |
| `connectionId` | `path` | `string` | yes |
| `body` | `body` | `TicketRequest` | yes |

| Type | Schema value | Source |
| --- | --- | --- |
| `TicketRequest` | `ticketRequestSchema` | `src/models/ticket-request.ts` |
| `TicketResult` | `ticketResultSchema` | `src/models/ticket-result.ts` |
| `Error` | `errorSchema` | `src/models/error.ts` |

