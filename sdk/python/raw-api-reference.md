# Raw Reference

**Raw** endpoints, reached through `with_raw_response`, return `ApiResult[T, E]` and never raise for an API error. For the parsed endpoints, see [API Reference](api-reference.md).

> Source: [CourierShopsClient](courier_shops/client.py)

## AfterSale

> Source: [AfterSale](courier_shops/apis/after_sale.py)

<details>
<summary><code>def add_step(body: Step | StepDict, *, request_options: RequestOptionsOrDict | None = None) -> ApiResult[Ok, AddStepErrorBody]</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

A line the person sees on their errand, such as a browse. Browse steps are kept to one per 10 minutes.

</dd>
</dl>

### Usage

<dl>
<dd>

**Sync**

```python
result = client.after_sale.with_raw_response.add_step(
    Step(visa_id="some example string", kind="some example string", title="some example string")
)
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type Ok
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type AddStepErrorBody
```

**Async**

```python
result = await async_client.after_sale.with_raw_response.add_step(
    Step(visa_id="some example string", kind="some example string", title="some example string")
)
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type Ok
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type AddStepErrorBody
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>body</code> | <code>[Step](courier_shops/models/step.py) \| [StepDict](courier_shops/models/step.py)</code> | The request body. |
| <code>request_options</code> | <code>[RequestOptionsOrDict](courier_shops/core/request_options.py) \| None</code> | Per-call overrides for this one request, such as a timeout, extra headers, or its retry count and statuses. |

</dd>
</dl>

### Response

<dl>
<dd>

**Returns**: <code>[ApiResult](courier_shops/core/results.py)&#91;[Ok](courier_shops/models/ok.py), [AddStepErrorBody](courier_shops/errors/add_step_error.py)&#93;</code>

**On `Success`**: `payload` is <code>[Ok](courier_shops/models/ok.py)</code> -- Added, or skipped.

**On `Failure`**: `error` is <code>[AddStepErrorBody](courier_shops/errors/add_step_error.py)</code>

Mapped in first-match order -- an earlier row wins over a later range that also covers the status:

| Status | `error` is |
| --- | --- |
| 401, 404 | <code>[Error](courier_shops/models/error.py)</code> |
| anything unmapped | <code>[RawError](courier_shops/core/results.py)</code> |

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>def update_parcel(body: Parcel | ParcelDict, *, request_options: RequestOptionsOrDict | None = None) -> ApiResult[Ok, UpdateParcelErrorBody]</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Each step of a delivery, in order. A step at or before the last one sent is skipped. Carries no personal data.

</dd>
</dl>

### Usage

<dl>
<dd>

**Sync**

```python
result = client.after_sale.with_raw_response.update_parcel(
    Parcel(visa_id="some example string", order_id="some example string", stage=1, labels=["some example string"])
)
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type Ok
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type UpdateParcelErrorBody
```

**Async**

```python
result = await async_client.after_sale.with_raw_response.update_parcel(
    Parcel(visa_id="some example string", order_id="some example string", stage=1, labels=["some example string"])
)
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type Ok
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type UpdateParcelErrorBody
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>body</code> | <code>[Parcel](courier_shops/models/parcel.py) \| [ParcelDict](courier_shops/models/parcel.py)</code> | The request body. |
| <code>request_options</code> | <code>[RequestOptionsOrDict](courier_shops/core/request_options.py) \| None</code> | Per-call overrides for this one request, such as a timeout, extra headers, or its retry count and statuses. |

</dd>
</dl>

### Response

<dl>
<dd>

**Returns**: <code>[ApiResult](courier_shops/core/results.py)&#91;[Ok](courier_shops/models/ok.py), [UpdateParcelErrorBody](courier_shops/errors/update_parcel_error.py)&#93;</code>

**On `Success`**: `payload` is <code>[Ok](courier_shops/models/ok.py)</code> -- Told, or skipped.

**On `Failure`**: `error` is <code>[UpdateParcelErrorBody](courier_shops/errors/update_parcel_error.py)</code>

Mapped in first-match order -- an earlier row wins over a later range that also covers the status:

| Status | `error` is |
| --- | --- |
| 401, 404 | <code>[Error](courier_shops/models/error.py)</code> |
| anything unmapped | <code>[RawError](courier_shops/core/results.py)</code> |

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>def update_return(body: ReturnModel | ReturnModelDict, *, request_options: RequestOptionsOrDict | None = None) -> ApiResult[Ok, UpdateReturnErrorBody]</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

A refund in full or in part, or a decline. A repeat of the same decision is skipped. A refund doesn't raise what the errand may still spend.

</dd>
</dl>

### Usage

<dl>
<dd>

**Sync**

```python
result = client.after_sale.with_raw_response.update_return(
    ReturnModel(visa_id="some example string", order_id="some example string", decision=Decision2.FULL)
)
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type Ok
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type UpdateReturnErrorBody
```

**Async**

```python
result = await async_client.after_sale.with_raw_response.update_return(
    ReturnModel(visa_id="some example string", order_id="some example string", decision=Decision2.FULL)
)
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type Ok
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type UpdateReturnErrorBody
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>body</code> | <code>[ReturnModel](courier_shops/models/return_model.py) \| [ReturnModelDict](courier_shops/models/return_model.py)</code> | The request body. |
| <code>request_options</code> | <code>[RequestOptionsOrDict](courier_shops/core/request_options.py) \| None</code> | Per-call overrides for this one request, such as a timeout, extra headers, or its retry count and statuses. |

</dd>
</dl>

### Response

<dl>
<dd>

**Returns**: <code>[ApiResult](courier_shops/core/results.py)&#91;[Ok](courier_shops/models/ok.py), [UpdateReturnErrorBody](courier_shops/errors/update_return_error.py)&#93;</code>

**On `Success`**: `payload` is <code>[Ok](courier_shops/models/ok.py)</code> -- Told, or skipped.

**On `Failure`**: `error` is <code>[UpdateReturnErrorBody](courier_shops/errors/update_return_error.py)</code>

Mapped in first-match order -- an earlier row wins over a later range that also covers the status:

| Status | `error` is |
| --- | --- |
| 401, 404 | <code>[Error](courier_shops/models/error.py)</code> |
| anything unmapped | <code>[RawError](courier_shops/core/results.py)</code> |

</dd>
</dl>

</dd>
</dl>

</details>

## Approvals

> Source: [Approvals](courier_shops/apis/approvals.py)

<details>
<summary><code>def get_approval(approval_id: str, *, request_options: RequestOptionsOrDict | None = None) -> ApiResult[ApprovalStatus, GetApprovalErrorBody]</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Where an ask stands while the person answers on Courier's page.

</dd>
</dl>

### Usage

<dl>
<dd>

**Sync**

```python
result = client.approvals.with_raw_response.get_approval("some example string")
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type ApprovalStatus
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type GetApprovalErrorBody
```

**Async**

```python
result = await async_client.approvals.with_raw_response.get_approval("some example string")
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type ApprovalStatus
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type GetApprovalErrorBody
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>approval_id</code> | <code>str</code> | From a spend decision that asked the person. |
| <code>request_options</code> | <code>[RequestOptionsOrDict](courier_shops/core/request_options.py) \| None</code> | Per-call overrides for this one request, such as a timeout, extra headers, or its retry count and statuses. |

</dd>
</dl>

### Response

<dl>
<dd>

**Returns**: <code>[ApiResult](courier_shops/core/results.py)&#91;[ApprovalStatus](courier_shops/models/approval_status.py), [GetApprovalErrorBody](courier_shops/errors/get_approval_error.py)&#93;</code>

**On `Success`**: `payload` is <code>[ApprovalStatus](courier_shops/models/approval_status.py)</code> -- The ask.

**On `Failure`**: `error` is <code>[GetApprovalErrorBody](courier_shops/errors/get_approval_error.py)</code>

Mapped in first-match order -- an earlier row wins over a later range that also covers the status:

| Status | `error` is |
| --- | --- |
| 401, 404 | <code>[Error](courier_shops/models/error.py)</code> |
| anything unmapped | <code>[RawError](courier_shops/core/results.py)</code> |

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>def record_approval(approval_id: str, body: Decide | DecideDict, *, request_options: RequestOptionsOrDict | None = None) -> ApiResult[ApprovalStatus, RecordApprovalErrorBody]</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Only for an answer the person picked in a dialog their chat app showed them (the model can't answer it). Never pass on an agent's own answer.

</dd>
</dl>

### Usage

<dl>
<dd>

**Sync**

```python
result = client.approvals.with_raw_response.record_approval(
    "some example string", Decide(visa_id="some example string", decision=Decision1.APPROVED)
)
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type ApprovalStatus
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type RecordApprovalErrorBody
```

**Async**

```python
result = await async_client.approvals.with_raw_response.record_approval(
    "some example string", Decide(visa_id="some example string", decision=Decision1.APPROVED)
)
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type ApprovalStatus
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type RecordApprovalErrorBody
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>approval_id</code> | <code>str</code> | From a spend decision that asked the person. |
| <code>body</code> | <code>[Decide](courier_shops/models/decide.py) \| [DecideDict](courier_shops/models/decide.py)</code> | The request body. |
| <code>request_options</code> | <code>[RequestOptionsOrDict](courier_shops/core/request_options.py) \| None</code> | Per-call overrides for this one request, such as a timeout, extra headers, or its retry count and statuses. |

</dd>
</dl>

### Response

<dl>
<dd>

**Returns**: <code>[ApiResult](courier_shops/core/results.py)&#91;[ApprovalStatus](courier_shops/models/approval_status.py), [RecordApprovalErrorBody](courier_shops/errors/record_approval_error.py)&#93;</code>

**On `Success`**: `payload` is <code>[ApprovalStatus](courier_shops/models/approval_status.py)</code> -- The ask.

**On `Failure`**: `error` is <code>[RecordApprovalErrorBody](courier_shops/errors/record_approval_error.py)</code>

Mapped in first-match order -- an earlier row wins over a later range that also covers the status:

| Status | `error` is |
| --- | --- |
| 401, 404 | <code>[Error](courier_shops/models/error.py)</code> |
| anything unmapped | <code>[RawError](courier_shops/core/results.py)</code> |

</dd>
</dl>

</dd>
</dl>

</details>

## Connections

> Source: [Connections](courier_shops/apis/connections.py)

<details>
<summary><code>def get_connection(connection_id: str, *, request_options: RequestOptionsOrDict | None = None) -> ApiResult[Connection, GetConnectionErrorBody]</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Whether a connected Claude is still allowed in, and its current errand as a short-lived signed token (verify it like any Courier token).

</dd>
</dl>

### Usage

<dl>
<dd>

**Sync**

```python
result = client.connections.with_raw_response.get_connection("some example string")
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type Connection
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type GetConnectionErrorBody
```

**Async**

```python
result = await async_client.connections.with_raw_response.get_connection("some example string")
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type Connection
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type GetConnectionErrorBody
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>connection_id</code> | <code>str</code> | From the courier's token (`connection.id`). |
| <code>request_options</code> | <code>[RequestOptionsOrDict](courier_shops/core/request_options.py) \| None</code> | Per-call overrides for this one request, such as a timeout, extra headers, or its retry count and statuses. |

</dd>
</dl>

### Response

<dl>
<dd>

**Returns**: <code>[ApiResult](courier_shops/core/results.py)&#91;[Connection](courier_shops/models/connection.py), [GetConnectionErrorBody](courier_shops/errors/get_connection_error.py)&#93;</code>

**On `Success`**: `payload` is <code>[Connection](courier_shops/models/connection.py)</code> -- The connection.

**On `Failure`**: `error` is <code>[GetConnectionErrorBody](courier_shops/errors/get_connection_error.py)</code>

Mapped in first-match order -- an earlier row wins over a later range that also covers the status:

| Status | `error` is |
| --- | --- |
| 401, 404 | <code>[Error](courier_shops/models/error.py)</code> |
| anything unmapped | <code>[RawError](courier_shops/core/results.py)</code> |

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>def request_ticket(connection_id: str, body: TicketRequest | TicketRequestDict, *, request_options: RequestOptionsOrDict | None = None) -> ApiResult[TicketResult, RequestTicketErrorBody]</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

When a connected Claude wants to buy with no errand open. Returns a link for the person to set the budget, or, when the person already chose a budget in their chat app and has PayPal saved, opens the errand at once. The agent's numbers are only suggestions.

</dd>
</dl>

### Usage

<dl>
<dd>

**Sync**

```python
result = client.connections.with_raw_response.request_ticket("some example string", TicketRequest())
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type TicketResult
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type RequestTicketErrorBody
```

**Async**

```python
result = await async_client.connections.with_raw_response.request_ticket("some example string", TicketRequest())
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type TicketResult
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type RequestTicketErrorBody
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>connection_id</code> | <code>str</code> | From the courier's token (`connection.id`). |
| <code>body</code> | <code>[TicketRequest](courier_shops/models/ticket_request.py) \| [TicketRequestDict](courier_shops/models/ticket_request.py)</code> | The request body. |
| <code>request_options</code> | <code>[RequestOptionsOrDict](courier_shops/core/request_options.py) \| None</code> | Per-call overrides for this one request, such as a timeout, extra headers, or its retry count and statuses. |

</dd>
</dl>

### Response

<dl>
<dd>

**Returns**: <code>[ApiResult](courier_shops/core/results.py)&#91;[TicketResult](courier_shops/models/ticket_result.py), [RequestTicketErrorBody](courier_shops/errors/request_ticket_error.py)&#93;</code>

**On `Success`**: `payload` is <code>[TicketResult](courier_shops/models/ticket_result.py)</code> -- A link or a new errand.

**On `Failure`**: `error` is <code>[RequestTicketErrorBody](courier_shops/errors/request_ticket_error.py)</code>

Mapped in first-match order -- an earlier row wins over a later range that also covers the status:

| Status | `error` is |
| --- | --- |
| 401, 404 | <code>[Error](courier_shops/models/error.py)</code> |
| anything unmapped | <code>[RawError](courier_shops/core/results.py)</code> |

</dd>
</dl>

</dd>
</dl>

</details>

## Errands

> Source: [Errands](courier_shops/apis/errands.py)

<details>
<summary><code>def get_errand(visa_id: str, *, request_options: RequestOptionsOrDict | None = None) -> ApiResult[Errand, GetErrandErrorBody]</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

The errand's status and what is left to spend. Call it when a courier knocks: a revoked or used-up errand is turned away within seconds.

</dd>
</dl>

### Usage

<dl>
<dd>

**Sync**

```python
result = client.errands.with_raw_response.get_errand("some example string")
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type Errand
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type GetErrandErrorBody
```

**Async**

```python
result = await async_client.errands.with_raw_response.get_errand("some example string")
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type Errand
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type GetErrandErrorBody
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>visa_id</code> | <code>str</code> | The errand's ID, from the courier's token (`visa.id`). |
| <code>request_options</code> | <code>[RequestOptionsOrDict](courier_shops/core/request_options.py) \| None</code> | Per-call overrides for this one request, such as a timeout, extra headers, or its retry count and statuses. |

</dd>
</dl>

### Response

<dl>
<dd>

**Returns**: <code>[ApiResult](courier_shops/core/results.py)&#91;[Errand](courier_shops/models/errand.py), [GetErrandErrorBody](courier_shops/errors/get_errand_error.py)&#93;</code>

**On `Success`**: `payload` is <code>[Errand](courier_shops/models/errand.py)</code> -- The errand.

**On `Failure`**: `error` is <code>[GetErrandErrorBody](courier_shops/errors/get_errand_error.py)</code>

Mapped in first-match order -- an earlier row wins over a later range that also covers the status:

| Status | `error` is |
| --- | --- |
| 401, 404 | <code>[Error](courier_shops/models/error.py)</code> |
| anything unmapped | <code>[RawError](courier_shops/core/results.py)</code> |

</dd>
</dl>

</dd>
</dl>

</details>

## Reports

> Source: [Reports](courier_shops/apis/reports.py)

<details>
<summary><code>def report_courier(body: Report | ReportDict, *, request_options: RequestOptionsOrDict | None = None) -> ApiResult[ReportResult, ReportCourierErrorBody]</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Suspends the errand at once and claims its bond, if it has one.

</dd>
</dl>

### Usage

<dl>
<dd>

**Sync**

```python
result = client.reports.with_raw_response.report_courier(
    Report(visa_id="some example string", reason="some example string")
)
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type ReportResult
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type ReportCourierErrorBody
```

**Async**

```python
result = await async_client.reports.with_raw_response.report_courier(
    Report(visa_id="some example string", reason="some example string")
)
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type ReportResult
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type ReportCourierErrorBody
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>body</code> | <code>[Report](courier_shops/models/report.py) \| [ReportDict](courier_shops/models/report.py)</code> | The request body. |
| <code>request_options</code> | <code>[RequestOptionsOrDict](courier_shops/core/request_options.py) \| None</code> | Per-call overrides for this one request, such as a timeout, extra headers, or its retry count and statuses. |

</dd>
</dl>

### Response

<dl>
<dd>

**Returns**: <code>[ApiResult](courier_shops/core/results.py)&#91;[ReportResult](courier_shops/models/report_result.py), [ReportCourierErrorBody](courier_shops/errors/report_courier_error.py)&#93;</code>

**On `Success`**: `payload` is <code>[ReportResult](courier_shops/models/report_result.py)</code> -- Suspended.

**On `Failure`**: `error` is <code>[ReportCourierErrorBody](courier_shops/errors/report_courier_error.py)</code>

Mapped in first-match order -- an earlier row wins over a later range that also covers the status:

| Status | `error` is |
| --- | --- |
| 401, 404 | <code>[Error](courier_shops/models/error.py)</code> |
| anything unmapped | <code>[RawError](courier_shops/core/results.py)</code> |

</dd>
</dl>

</dd>
</dl>

</details>

## Spending

> Source: [Spending](courier_shops/apis/spending.py)

<details>
<summary><code>def charge_saved_paypal(body: Charge | ChargeDict, *, request_options: RequestOptionsOrDict | None = None) -> ApiResult[ChargeResult, ChargeSavedPaypalErrorBody]</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Only when the decision said `autopay`. Charges exactly the held amount, once per hold.

</dd>
</dl>

### Usage

<dl>
<dd>

**Sync**

```python
result = client.spending.with_raw_response.charge_saved_paypal(
    Charge(
        visa_id="some example string",
        hold_id="some example string",
        description="some example string",
        brand_name="some example string",
    ),
)
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type ChargeResult
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type ChargeSavedPaypalErrorBody
```

**Async**

```python
result = await async_client.spending.with_raw_response.charge_saved_paypal(
    Charge(
        visa_id="some example string",
        hold_id="some example string",
        description="some example string",
        brand_name="some example string",
    ),
)
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type ChargeResult
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type ChargeSavedPaypalErrorBody
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>body</code> | <code>[Charge](courier_shops/models/charge.py) \| [ChargeDict](courier_shops/models/charge.py)</code> | The request body. |
| <code>request_options</code> | <code>[RequestOptionsOrDict](courier_shops/core/request_options.py) \| None</code> | Per-call overrides for this one request, such as a timeout, extra headers, or its retry count and statuses. |

</dd>
</dl>

### Response

<dl>
<dd>

**Returns**: <code>[ApiResult](courier_shops/core/results.py)&#91;[ChargeResult](courier_shops/models/charge_result.py), [ChargeSavedPaypalErrorBody](courier_shops/errors/charge_saved_paypal_error.py)&#93;</code>

**On `Success`**: `payload` is <code>[ChargeResult](courier_shops/models/charge_result.py)</code> -- The PayPal order.

**On `Failure`**: `error` is <code>[ChargeSavedPaypalErrorBody](courier_shops/errors/charge_saved_paypal_error.py)</code>

Mapped in first-match order -- an earlier row wins over a later range that also covers the status:

| Status | `error` is |
| --- | --- |
| 401, 404, 409, 502 | <code>[Error](courier_shops/models/error.py)</code> |
| anything unmapped | <code>[RawError](courier_shops/core/results.py)</code> |

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>def check_spend(body: SpendCheck | SpendCheckDict, *, request_options: RequestOptionsOrDict | None = None) -> ApiResult[SpendDecision, CheckSpendErrorBody]</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Courier checks the errand's limits in code, then whether the items fit what the person asked for. It approves (with a hold on the budget for a checkout), denies with a code, or asks the person first.

</dd>
</dl>

### Usage

<dl>
<dd>

**Sync**

```python
result = client.spending.with_raw_response.check_spend(
    SpendCheck(
        visa_id="some example string",
        sub="some example string",
        resource="some example string",
        action=Action.RESERVE,
        items=[SpendItem(title="some example string", category="some example string", price_cents=1)],
        total_cents=1,
    ),
)
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type SpendDecision
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type CheckSpendErrorBody
```

**Async**

```python
result = await async_client.spending.with_raw_response.check_spend(
    SpendCheck(
        visa_id="some example string",
        sub="some example string",
        resource="some example string",
        action=Action.RESERVE,
        items=[SpendItem(title="some example string", category="some example string", price_cents=1)],
        total_cents=1,
    ),
)
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type SpendDecision
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type CheckSpendErrorBody
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>body</code> | <code>[SpendCheck](courier_shops/models/spend_check.py) \| [SpendCheckDict](courier_shops/models/spend_check.py)</code> | The request body. |
| <code>request_options</code> | <code>[RequestOptionsOrDict](courier_shops/core/request_options.py) \| None</code> | Per-call overrides for this one request, such as a timeout, extra headers, or its retry count and statuses. |

</dd>
</dl>

### Response

<dl>
<dd>

**Returns**: <code>[ApiResult](courier_shops/core/results.py)&#91;[SpendDecision](courier_shops/models/spend_decision.py), [CheckSpendErrorBody](courier_shops/errors/check_spend_error.py)&#93;</code>

**On `Success`**: `payload` is <code>[SpendDecision](courier_shops/models/spend_decision.py)</code> -- Courier's decision.

**On `Failure`**: `error` is <code>[CheckSpendErrorBody](courier_shops/errors/check_spend_error.py)</code>

Mapped in first-match order -- an earlier row wins over a later range that also covers the status:

| Status | `error` is |
| --- | --- |
| 401 | <code>[Error](courier_shops/models/error.py)</code> |
| anything unmapped | <code>[RawError](courier_shops/core/results.py)</code> |

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>def commit_spend(body: Commit | CommitDict, *, request_options: RequestOptionsOrDict | None = None) -> ApiResult[CommitResult, CommitSpendErrorBody]</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

After PayPal captured the payment. Idempotent per hold.

</dd>
</dl>

### Usage

<dl>
<dd>

**Sync**

```python
result = client.spending.with_raw_response.commit_spend(
    Commit(
        visa_id="some example string",
        hold_id="some example string",
        order_id="some example string",
        amount_cents=1,
        summary="some example string",
    ),
)
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type CommitResult
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type CommitSpendErrorBody
```

**Async**

```python
result = await async_client.spending.with_raw_response.commit_spend(
    Commit(
        visa_id="some example string",
        hold_id="some example string",
        order_id="some example string",
        amount_cents=1,
        summary="some example string",
    ),
)
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type CommitResult
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type CommitSpendErrorBody
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>body</code> | <code>[Commit](courier_shops/models/commit.py) \| [CommitDict](courier_shops/models/commit.py)</code> | The request body. |
| <code>request_options</code> | <code>[RequestOptionsOrDict](courier_shops/core/request_options.py) \| None</code> | Per-call overrides for this one request, such as a timeout, extra headers, or its retry count and statuses. |

</dd>
</dl>

### Response

<dl>
<dd>

**Returns**: <code>[ApiResult](courier_shops/core/results.py)&#91;[CommitResult](courier_shops/models/commit_result.py), [CommitSpendErrorBody](courier_shops/errors/commit_spend_error.py)&#93;</code>

**On `Success`**: `payload` is <code>[CommitResult](courier_shops/models/commit_result.py)</code> -- What the errand has spent.

**On `Failure`**: `error` is <code>[CommitSpendErrorBody](courier_shops/errors/commit_spend_error.py)</code>

Mapped in first-match order -- an earlier row wins over a later range that also covers the status:

| Status | `error` is |
| --- | --- |
| 401, 404 | <code>[Error](courier_shops/models/error.py)</code> |
| anything unmapped | <code>[RawError](courier_shops/core/results.py)</code> |

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>def release_hold(body: Release | ReleaseDict, *, request_options: RequestOptionsOrDict | None = None) -> ApiResult[Ok, ReleaseHoldErrorBody]</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

When an order is cancelled before it is paid.

</dd>
</dl>

### Usage

<dl>
<dd>

**Sync**

```python
result = client.spending.with_raw_response.release_hold(Release(hold_id="some example string"))
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type Ok
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type ReleaseHoldErrorBody
```

**Async**

```python
result = await async_client.spending.with_raw_response.release_hold(Release(hold_id="some example string"))
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type Ok
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type ReleaseHoldErrorBody
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>body</code> | <code>[Release](courier_shops/models/release.py) \| [ReleaseDict](courier_shops/models/release.py)</code> | The request body. |
| <code>request_options</code> | <code>[RequestOptionsOrDict](courier_shops/core/request_options.py) \| None</code> | Per-call overrides for this one request, such as a timeout, extra headers, or its retry count and statuses. |

</dd>
</dl>

### Response

<dl>
<dd>

**Returns**: <code>[ApiResult](courier_shops/core/results.py)&#91;[Ok](courier_shops/models/ok.py), [ReleaseHoldErrorBody](courier_shops/errors/release_hold_error.py)&#93;</code>

**On `Success`**: `payload` is <code>[Ok](courier_shops/models/ok.py)</code> -- Released.

**On `Failure`**: `error` is <code>[ReleaseHoldErrorBody](courier_shops/errors/release_hold_error.py)</code>

Mapped in first-match order -- an earlier row wins over a later range that also covers the status:

| Status | `error` is |
| --- | --- |
| 401 | <code>[Error](courier_shops/models/error.py)</code> |
| anything unmapped | <code>[RawError](courier_shops/core/results.py)</code> |

</dd>
</dl>

</dd>
</dl>

</details>

