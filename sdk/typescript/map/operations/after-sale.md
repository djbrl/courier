<!-- Generated file — do not edit; regenerated with the SDK. -->

# AfterSale — operations

Accessor: `client.afterSale` · Source: `src/resources/after-sale.ts` · 3 operations · Request and error types: namespace `AfterSale`

**Type sources**: every type an operation names, with the file that declares it and the schema value exported beside it. Import every name from `courier-shops`; the `Source` path is where to **read** the shape, never what to import. `ApiError`, the runtime error family and the file vocabulary are excluded — see sdk-map.md.

### addStep

- **Signature**: `addStep(request: AfterSale.AddStepRequest, options?: RequestOptions): ApiPromise<Ok, AfterSale.AddStepError>`
- **Wire**: `POST /stamps`
- **Auth**: `shopKey`
- **Request body**: `application/json` — the `body` field
- **SDK-sent**: `header Idempotency-Key` (minted per call)
- **Returns**: `Ok`
- **Error**: `CourierShopsError` with `kind: "api"`, an instance of `AfterSale.AddStepError` — **typed arms**, narrowed on `err.payload.kind`
- **Error arms**: `"error"` [401] `Error` · `"error2"` [404] `Error` · `"undeclared"` [any other] `rawBody: ArrayBuffer`

**Fields** — `AfterSale.AddStepRequest` (1):

| Field | Channel | Type | Req |
| --- | --- | --- | --- |
| `body` | `body` | `Step` | yes |

| Type | Schema value | Source |
| --- | --- | --- |
| `Step` | `stepSchema` | `src/models/step.ts` |
| `Ok` | `okSchema` | `src/models/ok.ts` |
| `Error` | `errorSchema` | `src/models/error.ts` |

### updateParcel

- **Signature**: `updateParcel(request: AfterSale.UpdateParcelRequest, options?: RequestOptions): ApiPromise<Ok, AfterSale.UpdateParcelError>`
- **Wire**: `POST /shipments`
- **Auth**: `shopKey`
- **Request body**: `application/json` — the `body` field
- **SDK-sent**: `header Idempotency-Key` (minted per call)
- **Returns**: `Ok`
- **Error**: `CourierShopsError` with `kind: "api"`, an instance of `AfterSale.UpdateParcelError` — **typed arms**, narrowed on `err.payload.kind`
- **Error arms**: `"error"` [401] `Error` · `"error2"` [404] `Error` · `"undeclared"` [any other] `rawBody: ArrayBuffer`

**Fields** — `AfterSale.UpdateParcelRequest` (1):

| Field | Channel | Type | Req |
| --- | --- | --- | --- |
| `body` | `body` | `Parcel` | yes |

| Type | Schema value | Source |
| --- | --- | --- |
| `Parcel` | `parcelSchema` | `src/models/parcel.ts` |
| `Ok` | `okSchema` | `src/models/ok.ts` |
| `Error` | `errorSchema` | `src/models/error.ts` |

### updateReturn

- **Signature**: `updateReturn(request: AfterSale.UpdateReturnRequest, options?: RequestOptions): ApiPromise<Ok, AfterSale.UpdateReturnError>`
- **Wire**: `POST /returns`
- **Auth**: `shopKey`
- **Request body**: `application/json` — the `body` field
- **SDK-sent**: `header Idempotency-Key` (minted per call)
- **Returns**: `Ok`
- **Error**: `CourierShopsError` with `kind: "api"`, an instance of `AfterSale.UpdateReturnError` — **typed arms**, narrowed on `err.payload.kind`
- **Error arms**: `"error"` [401] `Error` · `"error2"` [404] `Error` · `"undeclared"` [any other] `rawBody: ArrayBuffer`

**Fields** — `AfterSale.UpdateReturnRequest` (1):

| Field | Channel | Type | Req |
| --- | --- | --- | --- |
| `body` | `body` | `Return` | yes |

| Type | Schema value | Source |
| --- | --- | --- |
| `Return` | `returnSchema` | `src/models/return.ts` |
| `Ok` | `okSchema` | `src/models/ok.ts` |
| `Error` | `errorSchema` | `src/models/error.ts` |

