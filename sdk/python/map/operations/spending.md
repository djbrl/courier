<!-- Generated file — do not edit; regenerated with the SDK. -->

# Spending — operations

Accessor: `client.spending` · Source: `courier_shops/apis/spending.py` · 4 operations

Each `###` block is one operation and assumes `sdk-map.md` is loaded: blocks omit what its invariants table covers and are otherwise self-contained, so chunk at block level. Signatures are the sync parsed spelling; the async and raw spellings take the same parameters (see sdk-map.md). **Type sources** names the module declaring each type an operation mentions, so resolving a body, return or error payload is a lookup rather than a search; the runtime types `RawError` and `ApiResult` are excluded.

### client.spending.charge_saved_paypal

- **Route**: `POST /spend/charge`
- **Auth**: `shop_key`
- **Signature**: `def charge_saved_paypal(body: Charge | ChargeDict, *, request_options: RequestOptionsOrDict | None = None)`
  - required, positional: `body`
- **Params**: `body` — JSON body
- **Returns (parsed)**: `ChargeResult`
- **Returns (raw)**: `ApiResult[ChargeResult, ChargeSavedPaypalErrorBody]`
- **Error**: `ChargeSavedPaypalErrorBody` — **Case A (typed)**
- **Error arms**: `Error` [401, 404, 409, 502] · `RawError` [anything unmapped]

| Type | Source |
| --- | --- |
| `Charge` | `courier_shops/models/charge.py` |
| `ChargeDict` | `courier_shops/models/charge.py` |
| `ChargeResult` | `courier_shops/models/charge_result.py` |
| `ChargeSavedPaypalErrorBody` | `courier_shops/errors/charge_saved_paypal_error.py` |
| `Error` | `courier_shops/models/error.py` |

### client.spending.check_spend

- **Route**: `POST /spend/check`
- **Auth**: `shop_key`
- **Signature**: `def check_spend(body: SpendCheck | SpendCheckDict, *, request_options: RequestOptionsOrDict | None = None)`
  - required, positional: `body`
- **Params**: `body` — JSON body
- **Returns (parsed)**: `SpendDecision`
- **Returns (raw)**: `ApiResult[SpendDecision, CheckSpendErrorBody]`
- **Error**: `CheckSpendErrorBody` — **Case A (typed)**
- **Error arms**: `Error` [401] · `RawError` [anything unmapped]

| Type | Source |
| --- | --- |
| `SpendCheck` | `courier_shops/models/spend_check.py` |
| `SpendCheckDict` | `courier_shops/models/spend_check.py` |
| `SpendDecision` | `courier_shops/models/spend_decision.py` |
| `CheckSpendErrorBody` | `courier_shops/errors/check_spend_error.py` |
| `Error` | `courier_shops/models/error.py` |

### client.spending.commit_spend

- **Route**: `POST /spend/commit`
- **Auth**: `shop_key`
- **Signature**: `def commit_spend(body: Commit | CommitDict, *, request_options: RequestOptionsOrDict | None = None)`
  - required, positional: `body`
- **Params**: `body` — JSON body
- **Returns (parsed)**: `CommitResult`
- **Returns (raw)**: `ApiResult[CommitResult, CommitSpendErrorBody]`
- **Error**: `CommitSpendErrorBody` — **Case A (typed)**
- **Error arms**: `Error` [401, 404] · `RawError` [anything unmapped]

| Type | Source |
| --- | --- |
| `Commit` | `courier_shops/models/commit.py` |
| `CommitDict` | `courier_shops/models/commit.py` |
| `CommitResult` | `courier_shops/models/commit_result.py` |
| `CommitSpendErrorBody` | `courier_shops/errors/commit_spend_error.py` |
| `Error` | `courier_shops/models/error.py` |

### client.spending.release_hold

- **Route**: `POST /spend/release`
- **Auth**: `shop_key`
- **Signature**: `def release_hold(body: Release | ReleaseDict, *, request_options: RequestOptionsOrDict | None = None)`
  - required, positional: `body`
- **Params**: `body` — JSON body
- **Returns (parsed)**: `Ok`
- **Returns (raw)**: `ApiResult[Ok, ReleaseHoldErrorBody]`
- **Error**: `ReleaseHoldErrorBody` — **Case A (typed)**
- **Error arms**: `Error` [401] · `RawError` [anything unmapped]

| Type | Source |
| --- | --- |
| `Release` | `courier_shops/models/release.py` |
| `ReleaseDict` | `courier_shops/models/release.py` |
| `Ok` | `courier_shops/models/ok.py` |
| `ReleaseHoldErrorBody` | `courier_shops/errors/release_hold_error.py` |
| `Error` | `courier_shops/models/error.py` |

