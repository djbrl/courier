<!-- Generated file — do not edit; regenerated with the SDK. -->

# Reports — operations

Accessor: `client.reports` · Source: `courier_shops/apis/reports.py` · 1 operation

Each `###` block is one operation and assumes `sdk-map.md` is loaded: blocks omit what its invariants table covers and are otherwise self-contained, so chunk at block level. Signatures are the sync parsed spelling; the async and raw spellings take the same parameters (see sdk-map.md). **Type sources** names the module declaring each type an operation mentions, so resolving a body, return or error payload is a lookup rather than a search; the runtime types `RawError` and `ApiResult` are excluded.

### client.reports.report_courier

- **Route**: `POST /report`
- **Auth**: `shop_key`
- **Signature**: `def report_courier(body: Report | ReportDict, *, request_options: RequestOptionsOrDict | None = None)`
  - required, positional: `body`
- **Params**: `body` — JSON body
- **Returns (parsed)**: `ReportResult`
- **Returns (raw)**: `ApiResult[ReportResult, ReportCourierErrorBody]`
- **Error**: `ReportCourierErrorBody` — **Case A (typed)**
- **Error arms**: `Error` [401, 404] · `RawError` [anything unmapped]

| Type | Source |
| --- | --- |
| `Report` | `courier_shops/models/report.py` |
| `ReportDict` | `courier_shops/models/report.py` |
| `ReportResult` | `courier_shops/models/report_result.py` |
| `ReportCourierErrorBody` | `courier_shops/errors/report_courier_error.py` |
| `Error` | `courier_shops/models/error.py` |

