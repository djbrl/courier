<!-- Generated file — do not edit; regenerated with the SDK. -->

# Errands — operations

Accessor: `client.errands` · Source: `src/resources/errands.ts` · 1 operation · Request and error types: namespace `Errands`

**Type sources**: every type an operation names, with the file that declares it and the schema value exported beside it. Import every name from `courier-shops`; the `Source` path is where to **read** the shape, never what to import. `ApiError`, the runtime error family and the file vocabulary are excluded — see sdk-map.md.

### getErrand

- **Signature**: `getErrand(request: Errands.GetErrandRequest, options?: RequestOptions): ApiPromise<Errand, Errands.GetErrandError>`
- **Wire**: `GET /visas/{visaId}`
- **Auth**: `shopKey`
- **Request body**: none — no `Content-Type` header is sent
- **Returns**: `Errand`
- **Error**: `CourierShopsError` with `kind: "api"`, an instance of `Errands.GetErrandError` — **typed arms**, narrowed on `err.payload.kind`
- **Error arms**: `"error"` [401] `Error` · `"error2"` [404] `Error` · `"undeclared"` [any other] `rawBody: ArrayBuffer`

**Fields** — `Errands.GetErrandRequest` (1):

| Field | Channel | Type | Req |
| --- | --- | --- | --- |
| `visaId` | `path` | `string` | yes |

| Type | Schema value | Source |
| --- | --- | --- |
| `Errand` | `errandSchema` | `src/models/errand.ts` |
| `Error` | `errorSchema` | `src/models/error.ts` |

