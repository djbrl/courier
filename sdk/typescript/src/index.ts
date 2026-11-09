export { CourierShopsClient } from "./client.js";
export type { ClientOptions } from "./client-options.js";

export type { TokenProvider } from "./core/auth/credentials.js";

export { Errands } from "./resources/errands.js";
export { Connections } from "./resources/connections.js";
export { Spending } from "./resources/spending.js";
export { Approvals } from "./resources/approvals.js";
export { AfterSale } from "./resources/after-sale.js";
export { Reports } from "./resources/reports.js";

export { Action, actionSchema } from "./models/action.js";
export { approvalStatusSchema, type ApprovalStatus } from "./models/approval-status.js";
export { bondSchema, type Bond } from "./models/bond.js";
export { By, bySchema } from "./models/by.js";
export { chargeSchema, type Charge } from "./models/charge.js";
export { chargeItemSchema, type ChargeItem } from "./models/charge-item.js";
export { chargeResultSchema, type ChargeResult } from "./models/charge-result.js";
export { Code, codeSchema } from "./models/code.js";
export { commitSchema, type Commit } from "./models/commit.js";
export { commitResultSchema, type CommitResult } from "./models/commit-result.js";
export { connectionSchema, type Connection } from "./models/connection.js";
export { decideSchema, type Decide } from "./models/decide.js";
export { Decision, decisionSchema } from "./models/decision.js";
export { Decision1, decision1Schema } from "./models/decision1.js";
export { Decision2, decision2Schema } from "./models/decision2.js";
export { errandSchema, type Errand } from "./models/errand.js";
export { ErrandStatus, errandStatusSchema } from "./models/errand-status.js";
export { errorSchema, type Error } from "./models/error.js";
export { errorErrorSchema, type ErrorError } from "./models/error-error.js";
export { intentCheckSchema, type IntentCheck } from "./models/intent-check.js";
export { okSchema, type Ok } from "./models/ok.js";
export { PaidWith, paidWithSchema } from "./models/paid-with.js";
export { parcelSchema, type Parcel } from "./models/parcel.js";
export { releaseSchema, type Release } from "./models/release.js";
export { reportSchema, type Report } from "./models/report.js";
export { reportResultSchema, type ReportResult } from "./models/report-result.js";
export { returnSchema, type Return } from "./models/return.js";
export { spendCheckSchema, type SpendCheck } from "./models/spend-check.js";
export { spendDecisionSchema, type SpendDecision } from "./models/spend-decision.js";
export { spendItemSchema, type SpendItem } from "./models/spend-item.js";
export { Status, statusSchema } from "./models/status.js";
export { Status1, status1Schema } from "./models/status1.js";
export { Status2, status2Schema } from "./models/status2.js";
export { stepSchema, type Step } from "./models/step.js";
export { ticketRequestSchema, type TicketRequest } from "./models/ticket-request.js";
export { ticketResultSchema, type TicketResult } from "./models/ticket-result.js";

export {
  CoreError as CourierShopsError,
  ResponseError,
  DecodeError,
  EncodeError,
  ConnectionError,
  TimeoutError,
  AuthError,
  PaginationError,
  ConfigurationError,
} from "./core/errors.js";
export { ApiError } from "./core/api-error.js";
export { SchemaError } from "./core/validation/schema-error.js";
export {
  defaultLoggingOptions,
  type LoggingOptions,
  type RequestLoggingOptions,
  type Logger,
  type LogDetails,
  type HttpRequestDetails,
  type RequestHeadersDetails,
  type RequestBodyDetails,
  type HttpResponseDetails,
  type ResponseHeadersDetails,
  type HttpRetryingDetails,
  type HttpFailedDetails,
  type LogLevel,
} from "./core/logging.js";
export type { ApiPromise, ApiResult } from "./core/api-promise.js";
export type { Pageable, PageableApiResult } from "./core/pagination/pageable.js";
export type { HttpMethod, RequestOptions } from "./core/api-request.js";
export type { RetryOptions, RequestRetryOptions, RetryAttempt, RetryReason } from "./core/retry.js";
export type { BinaryContent, BinaryData, BinaryErrorContent, FileData, FileInput } from "./core/binary.js";
export type { ErrorKind } from "./core/errors.js";
export type { Declared, Undeclared } from "./core/api-error.js";
export type { Schema, EnumSchema, Encoded } from "./core/validation/schema.js";
