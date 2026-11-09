<!-- Generated file — do not edit; regenerated with the SDK. -->

# Reports — operations

Accessor: `client.reports` · Source: `src/resources/reports.ts` · 1 operation · Request and error types: namespace `Reports`

**Type sources**: every type an operation names, with the file that declares it and the schema value exported beside it. Import every name from `courier-shops`; the `Source` path is where to **read** the shape, never what to import. `ApiError`, the runtime error family and the file vocabulary are excluded — see sdk-map.md.

### reportCourier

- **Signature**: `reportCourier(request: Reports.ReportCourierRequest, options?: RequestOptions): ApiPromise<ReportResult, Reports.ReportCourierError>`
- **Wire**: `POST /report`
- **Auth**: `shopKey`
- **Request body**: `application/json` — the `body` field
- **SDK-sent**: `header Idempotency-Key` (minted per call)
- **Returns**: `ReportResult`
- **Error**: `CourierShopsError` with `kind: "api"`, an instance of `Reports.ReportCourierError` — **typed arms**, narrowed on `err.payload.kind`
- **Error arms**: `"error"` [401] `Error` · `"error2"` [404] `Error` · `"undeclared"` [any other] `rawBody: ArrayBuffer`

**Fields** — `Reports.ReportCourierRequest` (1):

| Field | Channel | Type | Req |
| --- | --- | --- | --- |
| `body` | `body` | `Report` | yes |

| Type | Schema value | Source |
| --- | --- | --- |
| `Report` | `reportSchema` | `src/models/report.ts` |
| `ReportResult` | `reportResultSchema` | `src/models/report-result.ts` |
| `Error` | `errorSchema` | `src/models/error.ts` |

