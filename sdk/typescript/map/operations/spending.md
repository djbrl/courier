<!-- Generated file — do not edit; regenerated with the SDK. -->

# Spending — operations

Accessor: `client.spending` · Source: `src/resources/spending.ts` · 4 operations · Request and error types: namespace `Spending`

**Type sources**: every type an operation names, with the file that declares it and the schema value exported beside it. Import every name from `courier-shops`; the `Source` path is where to **read** the shape, never what to import. `ApiError`, the runtime error family and the file vocabulary are excluded — see sdk-map.md.

### chargeSavedPaypal

- **Signature**: `chargeSavedPaypal(request: Spending.ChargeSavedPaypalRequest, options?: RequestOptions): ApiPromise<ChargeResult, Spending.ChargeSavedPaypalError>`
- **Wire**: `POST /spend/charge`
- **Auth**: `shopKey`
- **Request body**: `application/json` — the `body` field
- **SDK-sent**: `header Idempotency-Key` (minted per call)
- **Returns**: `ChargeResult`
- **Error**: `CourierShopsError` with `kind: "api"`, an instance of `Spending.ChargeSavedPaypalError` — **typed arms**, narrowed on `err.payload.kind`
- **Error arms**: `"error"` [401] `Error` · `"error2"` [404] `Error` · `"error3"` [409] `Error` · `"error4"` [502] `Error` · `"undeclared"` [any other] `rawBody: ArrayBuffer`

**Fields** — `Spending.ChargeSavedPaypalRequest` (1):

| Field | Channel | Type | Req |
| --- | --- | --- | --- |
| `body` | `body` | `Charge` | yes |

| Type | Schema value | Source |
| --- | --- | --- |
| `Charge` | `chargeSchema` | `src/models/charge.ts` |
| `ChargeResult` | `chargeResultSchema` | `src/models/charge-result.ts` |
| `Error` | `errorSchema` | `src/models/error.ts` |

### checkSpend

- **Signature**: `checkSpend(request: Spending.CheckSpendRequest, options?: RequestOptions): ApiPromise<SpendDecision, Spending.CheckSpendError>`
- **Wire**: `POST /spend/check`
- **Auth**: `shopKey`
- **Request body**: `application/json` — the `body` field
- **SDK-sent**: `header Idempotency-Key` (minted per call)
- **Returns**: `SpendDecision`
- **Error**: `CourierShopsError` with `kind: "api"`, an instance of `Spending.CheckSpendError` — **typed arms**, narrowed on `err.payload.kind`
- **Error arms**: `"error"` [401] `Error` · `"undeclared"` [any other] `rawBody: ArrayBuffer`

**Fields** — `Spending.CheckSpendRequest` (1):

| Field | Channel | Type | Req |
| --- | --- | --- | --- |
| `body` | `body` | `SpendCheck` | yes |

| Type | Schema value | Source |
| --- | --- | --- |
| `SpendCheck` | `spendCheckSchema` | `src/models/spend-check.ts` |
| `SpendDecision` | `spendDecisionSchema` | `src/models/spend-decision.ts` |
| `Error` | `errorSchema` | `src/models/error.ts` |

### commitSpend

- **Signature**: `commitSpend(request: Spending.CommitSpendRequest, options?: RequestOptions): ApiPromise<CommitResult, Spending.CommitSpendError>`
- **Wire**: `POST /spend/commit`
- **Auth**: `shopKey`
- **Request body**: `application/json` — the `body` field
- **SDK-sent**: `header Idempotency-Key` (minted per call)
- **Returns**: `CommitResult`
- **Error**: `CourierShopsError` with `kind: "api"`, an instance of `Spending.CommitSpendError` — **typed arms**, narrowed on `err.payload.kind`
- **Error arms**: `"error"` [401] `Error` · `"error2"` [404] `Error` · `"undeclared"` [any other] `rawBody: ArrayBuffer`

**Fields** — `Spending.CommitSpendRequest` (1):

| Field | Channel | Type | Req |
| --- | --- | --- | --- |
| `body` | `body` | `Commit` | yes |

| Type | Schema value | Source |
| --- | --- | --- |
| `Commit` | `commitSchema` | `src/models/commit.ts` |
| `CommitResult` | `commitResultSchema` | `src/models/commit-result.ts` |
| `Error` | `errorSchema` | `src/models/error.ts` |

### releaseHold

- **Signature**: `releaseHold(request: Spending.ReleaseHoldRequest, options?: RequestOptions): ApiPromise<Ok, Spending.ReleaseHoldError>`
- **Wire**: `POST /spend/release`
- **Auth**: `shopKey`
- **Request body**: `application/json` — the `body` field
- **SDK-sent**: `header Idempotency-Key` (minted per call)
- **Returns**: `Ok`
- **Error**: `CourierShopsError` with `kind: "api"`, an instance of `Spending.ReleaseHoldError` — **typed arms**, narrowed on `err.payload.kind`
- **Error arms**: `"error"` [401] `Error` · `"undeclared"` [any other] `rawBody: ArrayBuffer`

**Fields** — `Spending.ReleaseHoldRequest` (1):

| Field | Channel | Type | Req |
| --- | --- | --- | --- |
| `body` | `body` | `Release` | yes |

| Type | Schema value | Source |
| --- | --- | --- |
| `Release` | `releaseSchema` | `src/models/release.ts` |
| `Ok` | `okSchema` | `src/models/ok.ts` |
| `Error` | `errorSchema` | `src/models/error.ts` |

