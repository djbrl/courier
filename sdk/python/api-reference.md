# Reference

**Parsed** endpoints return the typed payload and raise `ApiError` on a documented non-2xx. For the raw endpoints, see [Raw API Reference](raw-api-reference.md).

> Source: [CourierShopsClient](courier_shops/client.py)

## AfterSale

> Source: [AfterSale](courier_shops/apis/after_sale.py)

<details>
<summary><code>def add_step(body: Step | StepDict, *, request_options: RequestOptionsOrDict | None = None) -> Ok</code></summary>

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
try:
    response = client.after_sale.add_step(
        Step(visa_id="some example string", kind="some example string", title="some example string")
    )
    # TODO: Handle 'response' of type Ok
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type AddStepErrorBody
```

**Async**

```python
try:
    response = await async_client.after_sale.add_step(
        Step(visa_id="some example string", kind="some example string", title="some example string")
    )
    # TODO: Handle 'response' of type Ok
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type AddStepErrorBody
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

**OnSuccess**: <code>[Ok](courier_shops/models/ok.py)</code> -- Added, or skipped.

**OnError**: <code>[ApiError](courier_shops/core/exceptions.py)&#91;[AddStepErrorBody](courier_shops/errors/add_step_error.py)&#93;</code>

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
<summary><code>def update_parcel(body: Parcel | ParcelDict, *, request_options: RequestOptionsOrDict | None = None) -> Ok</code></summary>

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
try:
    response = client.after_sale.update_parcel(
        Parcel(visa_id="some example string", order_id="some example string", stage=1, labels=["some example string"])
    )
    # TODO: Handle 'response' of type Ok
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type UpdateParcelErrorBody
```

**Async**

```python
try:
    response = await async_client.after_sale.update_parcel(
        Parcel(visa_id="some example string", order_id="some example string", stage=1, labels=["some example string"])
    )
    # TODO: Handle 'response' of type Ok
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type UpdateParcelErrorBody
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

**OnSuccess**: <code>[Ok](courier_shops/models/ok.py)</code> -- Told, or skipped.

**OnError**: <code>[ApiError](courier_shops/core/exceptions.py)&#91;[UpdateParcelErrorBody](courier_shops/errors/update_parcel_error.py)&#93;</code>

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
<summary><code>def update_return(body: ReturnModel | ReturnModelDict, *, request_options: RequestOptionsOrDict | None = None) -> Ok</code></summary>

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
try:
    response = client.after_sale.update_return(
        ReturnModel(visa_id="some example string", order_id="some example string", decision=Decision2.FULL)
    )
    # TODO: Handle 'response' of type Ok
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type UpdateReturnErrorBody
```

**Async**

```python
try:
    response = await async_client.after_sale.update_return(
        ReturnModel(visa_id="some example string", order_id="some example string", decision=Decision2.FULL)
    )
    # TODO: Handle 'response' of type Ok
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type UpdateReturnErrorBody
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

**OnSuccess**: <code>[Ok](courier_shops/models/ok.py)</code> -- Told, or skipped.

**OnError**: <code>[ApiError](courier_shops/core/exceptions.py)&#91;[UpdateReturnErrorBody](courier_shops/errors/update_return_error.py)&#93;</code>

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
<summary><code>def get_approval(approval_id: str, *, request_options: RequestOptionsOrDict | None = None) -> ApprovalStatus</code></summary>

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
try:
    response = client.approvals.get_approval("some example string")
    # TODO: Handle 'response' of type ApprovalStatus
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type GetApprovalErrorBody
```

**Async**

```python
try:
    response = await async_client.approvals.get_approval("some example string")
    # TODO: Handle 'response' of type ApprovalStatus
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type GetApprovalErrorBody
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

**OnSuccess**: <code>[ApprovalStatus](courier_shops/models/approval_status.py)</code> -- The ask.

**OnError**: <code>[ApiError](courier_shops/core/exceptions.py)&#91;[GetApprovalErrorBody](courier_shops/errors/get_approval_error.py)&#93;</code>

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
<summary><code>def record_approval(approval_id: str, body: Decide | DecideDict, *, request_options: RequestOptionsOrDict | None = None) -> ApprovalStatus</code></summary>

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
try:
    response = client.approvals.record_approval(
        "some example string", Decide(visa_id="some example string", decision=Decision1.APPROVED)
    )
    # TODO: Handle 'response' of type ApprovalStatus
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type RecordApprovalErrorBody
```

**Async**

```python
try:
    response = await async_client.approvals.record_approval(
        "some example string", Decide(visa_id="some example string", decision=Decision1.APPROVED)
    )
    # TODO: Handle 'response' of type ApprovalStatus
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type RecordApprovalErrorBody
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

**OnSuccess**: <code>[ApprovalStatus](courier_shops/models/approval_status.py)</code> -- The ask.

**OnError**: <code>[ApiError](courier_shops/core/exceptions.py)&#91;[RecordApprovalErrorBody](courier_shops/errors/record_approval_error.py)&#93;</code>

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
<summary><code>def get_connection(connection_id: str, *, request_options: RequestOptionsOrDict | None = None) -> Connection</code></summary>

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
try:
    response = client.connections.get_connection("some example string")
    # TODO: Handle 'response' of type Connection
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type GetConnectionErrorBody
```

**Async**

```python
try:
    response = await async_client.connections.get_connection("some example string")
    # TODO: Handle 'response' of type Connection
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type GetConnectionErrorBody
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

**OnSuccess**: <code>[Connection](courier_shops/models/connection.py)</code> -- The connection.

**OnError**: <code>[ApiError](courier_shops/core/exceptions.py)&#91;[GetConnectionErrorBody](courier_shops/errors/get_connection_error.py)&#93;</code>

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
<summary><code>def request_ticket(connection_id: str, body: TicketRequest | TicketRequestDict, *, request_options: RequestOptionsOrDict | None = None) -> TicketResult</code></summary>

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
try:
    response = client.connections.request_ticket("some example string", TicketRequest())
    # TODO: Handle 'response' of type TicketResult
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type RequestTicketErrorBody
```

**Async**

```python
try:
    response = await async_client.connections.request_ticket("some example string", TicketRequest())
    # TODO: Handle 'response' of type TicketResult
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type RequestTicketErrorBody
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

**OnSuccess**: <code>[TicketResult](courier_shops/models/ticket_result.py)</code> -- A link or a new errand.

**OnError**: <code>[ApiError](courier_shops/core/exceptions.py)&#91;[RequestTicketErrorBody](courier_shops/errors/request_ticket_error.py)&#93;</code>

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
<summary><code>def get_errand(visa_id: str, *, request_options: RequestOptionsOrDict | None = None) -> Errand</code></summary>

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
try:
    response = client.errands.get_errand("some example string")
    # TODO: Handle 'response' of type Errand
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type GetErrandErrorBody
```

**Async**

```python
try:
    response = await async_client.errands.get_errand("some example string")
    # TODO: Handle 'response' of type Errand
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type GetErrandErrorBody
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

**OnSuccess**: <code>[Errand](courier_shops/models/errand.py)</code> -- The errand.

**OnError**: <code>[ApiError](courier_shops/core/exceptions.py)&#91;[GetErrandErrorBody](courier_shops/errors/get_errand_error.py)&#93;</code>

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
<summary><code>def report_courier(body: Report | ReportDict, *, request_options: RequestOptionsOrDict | None = None) -> ReportResult</code></summary>

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
try:
    response = client.reports.report_courier(Report(visa_id="some example string", reason="some example string"))
    # TODO: Handle 'response' of type ReportResult
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type ReportCourierErrorBody
```

**Async**

```python
try:
    response = await async_client.reports.report_courier(
        Report(visa_id="some example string", reason="some example string")
    )
    # TODO: Handle 'response' of type ReportResult
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type ReportCourierErrorBody
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

**OnSuccess**: <code>[ReportResult](courier_shops/models/report_result.py)</code> -- Suspended.

**OnError**: <code>[ApiError](courier_shops/core/exceptions.py)&#91;[ReportCourierErrorBody](courier_shops/errors/report_courier_error.py)&#93;</code>

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
<summary><code>def charge_saved_paypal(body: Charge | ChargeDict, *, request_options: RequestOptionsOrDict | None = None) -> ChargeResult</code></summary>

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
try:
    response = client.spending.charge_saved_paypal(
        Charge(
            visa_id="some example string",
            hold_id="some example string",
            description="some example string",
            brand_name="some example string",
        ),
    )
    # TODO: Handle 'response' of type ChargeResult
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type ChargeSavedPaypalErrorBody
```

**Async**

```python
try:
    response = await async_client.spending.charge_saved_paypal(
        Charge(
            visa_id="some example string",
            hold_id="some example string",
            description="some example string",
            brand_name="some example string",
        ),
    )
    # TODO: Handle 'response' of type ChargeResult
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type ChargeSavedPaypalErrorBody
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

**OnSuccess**: <code>[ChargeResult](courier_shops/models/charge_result.py)</code> -- The PayPal order.

**OnError**: <code>[ApiError](courier_shops/core/exceptions.py)&#91;[ChargeSavedPaypalErrorBody](courier_shops/errors/charge_saved_paypal_error.py)&#93;</code>

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
<summary><code>def check_spend(body: SpendCheck | SpendCheckDict, *, request_options: RequestOptionsOrDict | None = None) -> SpendDecision</code></summary>

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
try:
    response = client.spending.check_spend(
        SpendCheck(
            visa_id="some example string",
            sub="some example string",
            resource="some example string",
            action=Action.RESERVE,
            items=[SpendItem(title="some example string", category="some example string", price_cents=1)],
            total_cents=1,
        ),
    )
    # TODO: Handle 'response' of type SpendDecision
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type CheckSpendErrorBody
```

**Async**

```python
try:
    response = await async_client.spending.check_spend(
        SpendCheck(
            visa_id="some example string",
            sub="some example string",
            resource="some example string",
            action=Action.RESERVE,
            items=[SpendItem(title="some example string", category="some example string", price_cents=1)],
            total_cents=1,
        ),
    )
    # TODO: Handle 'response' of type SpendDecision
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type CheckSpendErrorBody
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

**OnSuccess**: <code>[SpendDecision](courier_shops/models/spend_decision.py)</code> -- Courier's decision.

**OnError**: <code>[ApiError](courier_shops/core/exceptions.py)&#91;[CheckSpendErrorBody](courier_shops/errors/check_spend_error.py)&#93;</code>

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
<summary><code>def commit_spend(body: Commit | CommitDict, *, request_options: RequestOptionsOrDict | None = None) -> CommitResult</code></summary>

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
try:
    response = client.spending.commit_spend(
        Commit(
            visa_id="some example string",
            hold_id="some example string",
            order_id="some example string",
            amount_cents=1,
            summary="some example string",
        ),
    )
    # TODO: Handle 'response' of type CommitResult
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type CommitSpendErrorBody
```

**Async**

```python
try:
    response = await async_client.spending.commit_spend(
        Commit(
            visa_id="some example string",
            hold_id="some example string",
            order_id="some example string",
            amount_cents=1,
            summary="some example string",
        ),
    )
    # TODO: Handle 'response' of type CommitResult
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type CommitSpendErrorBody
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

**OnSuccess**: <code>[CommitResult](courier_shops/models/commit_result.py)</code> -- What the errand has spent.

**OnError**: <code>[ApiError](courier_shops/core/exceptions.py)&#91;[CommitSpendErrorBody](courier_shops/errors/commit_spend_error.py)&#93;</code>

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
<summary><code>def release_hold(body: Release | ReleaseDict, *, request_options: RequestOptionsOrDict | None = None) -> Ok</code></summary>

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
try:
    response = client.spending.release_hold(Release(hold_id="some example string"))
    # TODO: Handle 'response' of type Ok
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type ReleaseHoldErrorBody
```

**Async**

```python
try:
    response = await async_client.spending.release_hold(Release(hold_id="some example string"))
    # TODO: Handle 'response' of type Ok
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type ReleaseHoldErrorBody
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

**OnSuccess**: <code>[Ok](courier_shops/models/ok.py)</code> -- Released.

**OnError**: <code>[ApiError](courier_shops/core/exceptions.py)&#91;[ReleaseHoldErrorBody](courier_shops/errors/release_hold_error.py)&#93;</code>

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

