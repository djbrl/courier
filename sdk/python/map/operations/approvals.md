<!-- Generated file — do not edit; regenerated with the SDK. -->

# Approvals — operations

Accessor: `client.approvals` · Source: `courier_shops/apis/approvals.py` · 2 operations

Each `###` block is one operation and assumes `sdk-map.md` is loaded: blocks omit what its invariants table covers and are otherwise self-contained, so chunk at block level. Signatures are the sync parsed spelling; the async and raw spellings take the same parameters (see sdk-map.md). **Type sources** names the module declaring each type an operation mentions, so resolving a body, return or error payload is a lookup rather than a search; the runtime types `RawError` and `ApiResult` are excluded.

### client.approvals.get_approval

- **Route**: `GET /approvals/{approvalId}`
- **Auth**: `shop_key`
- **Signature**: `def get_approval(approval_id: str, *, request_options: RequestOptionsOrDict | None = None)`
  - required, positional: `approval_id`
- **Params**: `approval_id` — path `approvalId`
- **Returns (parsed)**: `ApprovalStatus`
- **Returns (raw)**: `ApiResult[ApprovalStatus, GetApprovalErrorBody]`
- **Error**: `GetApprovalErrorBody` — **Case A (typed)**
- **Error arms**: `Error` [401, 404] · `RawError` [anything unmapped]

| Type | Source |
| --- | --- |
| `ApprovalStatus` | `courier_shops/models/approval_status.py` |
| `GetApprovalErrorBody` | `courier_shops/errors/get_approval_error.py` |
| `Error` | `courier_shops/models/error.py` |

### client.approvals.record_approval

- **Route**: `POST /approvals/{approvalId}/decide`
- **Auth**: `shop_key`
- **Signature**: `def record_approval(approval_id: str, body: Decide | DecideDict, *, request_options: RequestOptionsOrDict | None = None)`
  - required, positional: `approval_id`, `body`
- **Params**: `approval_id` — path `approvalId` · `body` — JSON body
- **Returns (parsed)**: `ApprovalStatus`
- **Returns (raw)**: `ApiResult[ApprovalStatus, RecordApprovalErrorBody]`
- **Error**: `RecordApprovalErrorBody` — **Case A (typed)**
- **Error arms**: `Error` [401, 404] · `RawError` [anything unmapped]

| Type | Source |
| --- | --- |
| `Decide` | `courier_shops/models/decide.py` |
| `DecideDict` | `courier_shops/models/decide.py` |
| `ApprovalStatus` | `courier_shops/models/approval_status.py` |
| `RecordApprovalErrorBody` | `courier_shops/errors/record_approval_error.py` |
| `Error` | `courier_shops/models/error.py` |

