<!-- Generated file — do not edit; regenerated with the SDK. -->

# AfterSale — operations

Accessor: `client.after_sale` · Source: `courier_shops/apis/after_sale.py` · 3 operations

Each `###` block is one operation and assumes `sdk-map.md` is loaded: blocks omit what its invariants table covers and are otherwise self-contained, so chunk at block level. Signatures are the sync parsed spelling; the async and raw spellings take the same parameters (see sdk-map.md). **Type sources** names the module declaring each type an operation mentions, so resolving a body, return or error payload is a lookup rather than a search; the runtime types `RawError` and `ApiResult` are excluded.

### client.after_sale.add_step

- **Route**: `POST /stamps`
- **Auth**: `shop_key`
- **Signature**: `def add_step(body: Step | StepDict, *, request_options: RequestOptionsOrDict | None = None)`
  - required, positional: `body`
- **Params**: `body` — JSON body
- **Returns (parsed)**: `Ok`
- **Returns (raw)**: `ApiResult[Ok, AddStepErrorBody]`
- **Error**: `AddStepErrorBody` — **Case A (typed)**
- **Error arms**: `Error` [401, 404] · `RawError` [anything unmapped]

| Type | Source |
| --- | --- |
| `Step` | `courier_shops/models/step.py` |
| `StepDict` | `courier_shops/models/step.py` |
| `Ok` | `courier_shops/models/ok.py` |
| `AddStepErrorBody` | `courier_shops/errors/add_step_error.py` |
| `Error` | `courier_shops/models/error.py` |

### client.after_sale.update_parcel

- **Route**: `POST /shipments`
- **Auth**: `shop_key`
- **Signature**: `def update_parcel(body: Parcel | ParcelDict, *, request_options: RequestOptionsOrDict | None = None)`
  - required, positional: `body`
- **Params**: `body` — JSON body
- **Returns (parsed)**: `Ok`
- **Returns (raw)**: `ApiResult[Ok, UpdateParcelErrorBody]`
- **Error**: `UpdateParcelErrorBody` — **Case A (typed)**
- **Error arms**: `Error` [401, 404] · `RawError` [anything unmapped]

| Type | Source |
| --- | --- |
| `Parcel` | `courier_shops/models/parcel.py` |
| `ParcelDict` | `courier_shops/models/parcel.py` |
| `Ok` | `courier_shops/models/ok.py` |
| `UpdateParcelErrorBody` | `courier_shops/errors/update_parcel_error.py` |
| `Error` | `courier_shops/models/error.py` |

### client.after_sale.update_return

- **Route**: `POST /returns`
- **Auth**: `shop_key`
- **Signature**: `def update_return(body: ReturnModel | ReturnModelDict, *, request_options: RequestOptionsOrDict | None = None)`
  - required, positional: `body`
- **Params**: `body` — JSON body
- **Returns (parsed)**: `Ok`
- **Returns (raw)**: `ApiResult[Ok, UpdateReturnErrorBody]`
- **Error**: `UpdateReturnErrorBody` — **Case A (typed)**
- **Error arms**: `Error` [401, 404] · `RawError` [anything unmapped]

| Type | Source |
| --- | --- |
| `ReturnModel` | `courier_shops/models/return_model.py` |
| `ReturnModelDict` | `courier_shops/models/return_model.py` |
| `Ok` | `courier_shops/models/ok.py` |
| `UpdateReturnErrorBody` | `courier_shops/errors/update_return_error.py` |
| `Error` | `courier_shops/models/error.py` |

