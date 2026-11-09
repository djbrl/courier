<!-- Generated file — do not edit; regenerated with the SDK. -->

# Approvals — operations

Accessor: `client.approvals` · Source: `src/resources/approvals.ts` · 2 operations · Request and error types: namespace `Approvals`

**Type sources**: every type an operation names, with the file that declares it and the schema value exported beside it. Import every name from `courier-shops`; the `Source` path is where to **read** the shape, never what to import. `ApiError`, the runtime error family and the file vocabulary are excluded — see sdk-map.md.

### getApproval

- **Signature**: `getApproval(request: Approvals.GetApprovalRequest, options?: RequestOptions): ApiPromise<ApprovalStatus, Approvals.GetApprovalError>`
- **Wire**: `GET /approvals/{approvalId}`
- **Auth**: `shopKey`
- **Request body**: none — no `Content-Type` header is sent
- **Returns**: `ApprovalStatus`
- **Error**: `CourierShopsError` with `kind: "api"`, an instance of `Approvals.GetApprovalError` — **typed arms**, narrowed on `err.payload.kind`
- **Error arms**: `"error"` [401] `Error` · `"error2"` [404] `Error` · `"undeclared"` [any other] `rawBody: ArrayBuffer`

**Fields** — `Approvals.GetApprovalRequest` (1):

| Field | Channel | Type | Req |
| --- | --- | --- | --- |
| `approvalId` | `path` | `string` | yes |

| Type | Schema value | Source |
| --- | --- | --- |
| `ApprovalStatus` | `approvalStatusSchema` | `src/models/approval-status.ts` |
| `Error` | `errorSchema` | `src/models/error.ts` |

### recordApproval

- **Signature**: `recordApproval(request: Approvals.RecordApprovalRequest, options?: RequestOptions): ApiPromise<ApprovalStatus, Approvals.RecordApprovalError>`
- **Wire**: `POST /approvals/{approvalId}/decide`
- **Auth**: `shopKey`
- **Request body**: `application/json` — the `body` field
- **SDK-sent**: `header Idempotency-Key` (minted per call)
- **Returns**: `ApprovalStatus`
- **Error**: `CourierShopsError` with `kind: "api"`, an instance of `Approvals.RecordApprovalError` — **typed arms**, narrowed on `err.payload.kind`
- **Error arms**: `"error"` [401] `Error` · `"error2"` [404] `Error` · `"undeclared"` [any other] `rawBody: ArrayBuffer`

**Fields** — `Approvals.RecordApprovalRequest` (2):

| Field | Channel | Type | Req |
| --- | --- | --- | --- |
| `approvalId` | `path` | `string` | yes |
| `body` | `body` | `Decide` | yes |

| Type | Schema value | Source |
| --- | --- | --- |
| `Decide` | `decideSchema` | `src/models/decide.ts` |
| `ApprovalStatus` | `approvalStatusSchema` | `src/models/approval-status.ts` |
| `Error` | `errorSchema` | `src/models/error.ts` |

