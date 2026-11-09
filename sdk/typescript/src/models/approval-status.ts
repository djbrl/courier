import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { status2Schema, type Status2 } from "./status2.js";

export type ApprovalStatus = {
  status: Status2;
};

export const approvalStatusSchema: Schema<ApprovalStatus> = s.object<ApprovalStatus>({
  status: status2Schema,
});
