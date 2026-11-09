<!-- Generated file — do not edit; regenerated with the SDK. -->

# Errands — operations

Accessor: `client.errands` · Source: `courier_shops/apis/errands.py` · 1 operation

Each `###` block is one operation and assumes `sdk-map.md` is loaded: blocks omit what its invariants table covers and are otherwise self-contained, so chunk at block level. Signatures are the sync parsed spelling; the async and raw spellings take the same parameters (see sdk-map.md). **Type sources** names the module declaring each type an operation mentions, so resolving a body, return or error payload is a lookup rather than a search; the runtime types `RawError` and `ApiResult` are excluded.

### client.errands.get_errand

- **Route**: `GET /visas/{visaId}`
- **Auth**: `shop_key`
- **Signature**: `def get_errand(visa_id: str, *, request_options: RequestOptionsOrDict | None = None)`
  - required, positional: `visa_id`
- **Params**: `visa_id` — path `visaId`
- **Returns (parsed)**: `Errand`
- **Returns (raw)**: `ApiResult[Errand, GetErrandErrorBody]`
- **Error**: `GetErrandErrorBody` — **Case A (typed)**
- **Error arms**: `Error` [401, 404] · `RawError` [anything unmapped]

| Type | Source |
| --- | --- |
| `Errand` | `courier_shops/models/errand.py` |
| `GetErrandErrorBody` | `courier_shops/errors/get_errand_error.py` |
| `Error` | `courier_shops/models/error.py` |

