# Reference

> Source: [CourierShopsClient](src/client.ts)

## Errands

> Source: [Errands](src/resources/errands.ts)

<details>
<summary><code>getErrand(request: Errands.GetErrandRequest, options?: RequestOptions): ApiPromise&lt;Errand, Errands.GetErrandError&gt;</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

The errand's status and what is left to spend. Call it when a courier knocks: a revoked or used-up errand is turned away within seconds.

</dd>
</dl>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.errands.getErrand({ visaId: "some example string" });
  // TODO: Handle 'response' of type Errand
} catch (err) {
  // TODO: Handle 'err' of type Errands.GetErrandError, discriminated with 'err.payload.kind'
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.errands.getErrand({ visaId: "some example string" }).asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type Errand
} else {
  // TODO: Handle 'result', discriminated with 'result.payload.kind'
}
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>visaId</code> | <code>string</code> | The errand's ID, from the courier's token (`visa.id`). |

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.errands.getErrand(request)`

- **OnSuccess**: <code>[Errand](src/models/errand.ts)</code>
- **OnError**: throws <code>[Errands.GetErrandError](src/resources/errands.ts)</code>, with `err.payload` discriminated on `kind`

**As ApiResult**: `await client.errands.getErrand(request).asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;Errand, Errands.GetErrandError&gt;</code>, with `result.value` of type <code>[Errand](src/models/errand.ts)</code>
- **OnError**: `result.payload` discriminated on `kind`, with `result.message`

**Thrown**: <code>[CourierShopsError](src/core/errors.ts)</code> on any operational failure — a caller abort and a programmer error stay outside the family and reach you raw

</dd>
</dl>

</dd>
</dl>

</details>

## Connections

> Source: [Connections](src/resources/connections.ts)

<details>
<summary><code>getConnection(request: Connections.GetConnectionRequest, options?: RequestOptions): ApiPromise&lt;Connection, Connections.GetConnectionError&gt;</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Whether a connected Claude is still allowed in, and its current errand as a short-lived signed token (verify it like any Courier token).

</dd>
</dl>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.connections.getConnection({ connectionId: "some example string" });
  // TODO: Handle 'response' of type Connection
} catch (err) {
  // TODO: Handle 'err' of type Connections.GetConnectionError, discriminated with 'err.payload.kind'
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.connections.getConnection({ connectionId: "some example string" }).asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type Connection
} else {
  // TODO: Handle 'result', discriminated with 'result.payload.kind'
}
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>connectionId</code> | <code>string</code> | From the courier's token (`connection.id`). |

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.connections.getConnection(request)`

- **OnSuccess**: <code>[Connection](src/models/connection.ts)</code>
- **OnError**: throws <code>[Connections.GetConnectionError](src/resources/connections.ts)</code>, with `err.payload` discriminated on `kind`

**As ApiResult**: `await client.connections.getConnection(request).asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;Connection, Connections.GetConnectionError&gt;</code>, with `result.value` of type <code>[Connection](src/models/connection.ts)</code>
- **OnError**: `result.payload` discriminated on `kind`, with `result.message`

**Thrown**: <code>[CourierShopsError](src/core/errors.ts)</code> on any operational failure — a caller abort and a programmer error stay outside the family and reach you raw

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>requestTicket(request: Connections.RequestTicketRequest, options?: RequestOptions): ApiPromise&lt;TicketResult, Connections.RequestTicketError&gt;</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

When a connected Claude wants to buy with no errand open. Returns a link for the person to set the budget, or, when the person already chose a budget in their chat app and has PayPal saved, opens the errand at once. The agent's numbers are only suggestions.

</dd>
</dl>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.connections.requestTicket({ connectionId: "some example string", body: {} });
  // TODO: Handle 'response' of type TicketResult
} catch (err) {
  // TODO: Handle 'err' of type Connections.RequestTicketError, discriminated with 'err.payload.kind'
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.connections.requestTicket({
  connectionId: "some example string",
  body: {},
}).asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type TicketResult
} else {
  // TODO: Handle 'result', discriminated with 'result.payload.kind'
}
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>connectionId</code> | <code>string</code> | From the courier's token (`connection.id`). |
| <code>body</code> | <code>[TicketRequest](src/models/ticket-request.ts)</code> | - |

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.connections.requestTicket(request)`

- **OnSuccess**: <code>[TicketResult](src/models/ticket-result.ts)</code>
- **OnError**: throws <code>[Connections.RequestTicketError](src/resources/connections.ts)</code>, with `err.payload` discriminated on `kind`

**As ApiResult**: `await client.connections.requestTicket(request).asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;TicketResult, Connections.RequestTicketError&gt;</code>, with `result.value` of type <code>[TicketResult](src/models/ticket-result.ts)</code>
- **OnError**: `result.payload` discriminated on `kind`, with `result.message`

**Thrown**: <code>[CourierShopsError](src/core/errors.ts)</code> on any operational failure — a caller abort and a programmer error stay outside the family and reach you raw

</dd>
</dl>

</dd>
</dl>

</details>

## Spending

> Source: [Spending](src/resources/spending.ts)

<details>
<summary><code>chargeSavedPaypal(request: Spending.ChargeSavedPaypalRequest, options?: RequestOptions): ApiPromise&lt;ChargeResult, Spending.ChargeSavedPaypalError&gt;</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Only when the decision said `autopay`. Charges exactly the held amount, once per hold.

</dd>
</dl>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.spending.chargeSavedPaypal({
    body: {
      visaId: "some example string",
      holdId: "some example string",
      description: "some example string",
      brandName: "some example string",
    },
  });
  // TODO: Handle 'response' of type ChargeResult
} catch (err) {
  // TODO: Handle 'err' of type Spending.ChargeSavedPaypalError, discriminated with 'err.payload.kind'
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.spending.chargeSavedPaypal({
  body: {
    visaId: "some example string",
    holdId: "some example string",
    description: "some example string",
    brandName: "some example string",
  },
}).asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type ChargeResult
} else {
  // TODO: Handle 'result', discriminated with 'result.payload.kind'
}
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>body</code> | <code>[Charge](src/models/charge.ts)</code> | - |

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.spending.chargeSavedPaypal(request)`

- **OnSuccess**: <code>[ChargeResult](src/models/charge-result.ts)</code>
- **OnError**: throws <code>[Spending.ChargeSavedPaypalError](src/resources/spending.ts)</code>, with `err.payload` discriminated on `kind`

**As ApiResult**: `await client.spending.chargeSavedPaypal(request).asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;ChargeResult, Spending.ChargeSavedPaypalError&gt;</code>, with `result.value` of type <code>[ChargeResult](src/models/charge-result.ts)</code>
- **OnError**: `result.payload` discriminated on `kind`, with `result.message`

**Thrown**: <code>[CourierShopsError](src/core/errors.ts)</code> on any operational failure — a caller abort and a programmer error stay outside the family and reach you raw

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>checkSpend(request: Spending.CheckSpendRequest, options?: RequestOptions): ApiPromise&lt;SpendDecision, Spending.CheckSpendError&gt;</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Courier checks the errand's limits in code, then whether the items fit what the person asked for. It approves (with a hold on the budget for a checkout), denies with a code, or asks the person first.

</dd>
</dl>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.spending.checkSpend({
    body: {
      visaId: "some example string",
      sub: "some example string",
      resource: "some example string",
      action: Action.Reserve,
      items: [{ title: "some example string", category: "some example string", priceCents: 1 }],
      totalCents: 1,
    },
  });
  // TODO: Handle 'response' of type SpendDecision
} catch (err) {
  // TODO: Handle 'err' of type Spending.CheckSpendError, discriminated with 'err.payload.kind'
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.spending.checkSpend({
  body: {
    visaId: "some example string",
    sub: "some example string",
    resource: "some example string",
    action: Action.Reserve,
    items: [{ title: "some example string", category: "some example string", priceCents: 1 }],
    totalCents: 1,
  },
}).asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type SpendDecision
} else {
  // TODO: Handle 'result', discriminated with 'result.payload.kind'
}
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>body</code> | <code>[SpendCheck](src/models/spend-check.ts)</code> | - |

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.spending.checkSpend(request)`

- **OnSuccess**: <code>[SpendDecision](src/models/spend-decision.ts)</code>
- **OnError**: throws <code>[Spending.CheckSpendError](src/resources/spending.ts)</code>, with `err.payload` discriminated on `kind`

**As ApiResult**: `await client.spending.checkSpend(request).asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;SpendDecision, Spending.CheckSpendError&gt;</code>, with `result.value` of type <code>[SpendDecision](src/models/spend-decision.ts)</code>
- **OnError**: `result.payload` discriminated on `kind`, with `result.message`

**Thrown**: <code>[CourierShopsError](src/core/errors.ts)</code> on any operational failure — a caller abort and a programmer error stay outside the family and reach you raw

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>commitSpend(request: Spending.CommitSpendRequest, options?: RequestOptions): ApiPromise&lt;CommitResult, Spending.CommitSpendError&gt;</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

After PayPal captured the payment. Idempotent per hold.

</dd>
</dl>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.spending.commitSpend({
    body: {
      visaId: "some example string",
      holdId: "some example string",
      orderId: "some example string",
      amountCents: 1,
      summary: "some example string",
    },
  });
  // TODO: Handle 'response' of type CommitResult
} catch (err) {
  // TODO: Handle 'err' of type Spending.CommitSpendError, discriminated with 'err.payload.kind'
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.spending.commitSpend({
  body: {
    visaId: "some example string",
    holdId: "some example string",
    orderId: "some example string",
    amountCents: 1,
    summary: "some example string",
  },
}).asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type CommitResult
} else {
  // TODO: Handle 'result', discriminated with 'result.payload.kind'
}
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>body</code> | <code>[Commit](src/models/commit.ts)</code> | - |

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.spending.commitSpend(request)`

- **OnSuccess**: <code>[CommitResult](src/models/commit-result.ts)</code>
- **OnError**: throws <code>[Spending.CommitSpendError](src/resources/spending.ts)</code>, with `err.payload` discriminated on `kind`

**As ApiResult**: `await client.spending.commitSpend(request).asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;CommitResult, Spending.CommitSpendError&gt;</code>, with `result.value` of type <code>[CommitResult](src/models/commit-result.ts)</code>
- **OnError**: `result.payload` discriminated on `kind`, with `result.message`

**Thrown**: <code>[CourierShopsError](src/core/errors.ts)</code> on any operational failure — a caller abort and a programmer error stay outside the family and reach you raw

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>releaseHold(request: Spending.ReleaseHoldRequest, options?: RequestOptions): ApiPromise&lt;Ok, Spending.ReleaseHoldError&gt;</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

When an order is cancelled before it is paid.

</dd>
</dl>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.spending.releaseHold({ body: { holdId: "some example string" } });
  // TODO: Handle 'response' of type Ok
} catch (err) {
  // TODO: Handle 'err' of type Spending.ReleaseHoldError, discriminated with 'err.payload.kind'
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.spending.releaseHold({ body: { holdId: "some example string" } }).asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type Ok
} else {
  // TODO: Handle 'result', discriminated with 'result.payload.kind'
}
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>body</code> | <code>[Release](src/models/release.ts)</code> | - |

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.spending.releaseHold(request)`

- **OnSuccess**: <code>[Ok](src/models/ok.ts)</code>
- **OnError**: throws <code>[Spending.ReleaseHoldError](src/resources/spending.ts)</code>, with `err.payload` discriminated on `kind`

**As ApiResult**: `await client.spending.releaseHold(request).asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;Ok, Spending.ReleaseHoldError&gt;</code>, with `result.value` of type <code>[Ok](src/models/ok.ts)</code>
- **OnError**: `result.payload` discriminated on `kind`, with `result.message`

**Thrown**: <code>[CourierShopsError](src/core/errors.ts)</code> on any operational failure — a caller abort and a programmer error stay outside the family and reach you raw

</dd>
</dl>

</dd>
</dl>

</details>

## Approvals

> Source: [Approvals](src/resources/approvals.ts)

<details>
<summary><code>getApproval(request: Approvals.GetApprovalRequest, options?: RequestOptions): ApiPromise&lt;ApprovalStatus, Approvals.GetApprovalError&gt;</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Where an ask stands while the person answers on Courier's page.

</dd>
</dl>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.approvals.getApproval({ approvalId: "some example string" });
  // TODO: Handle 'response' of type ApprovalStatus
} catch (err) {
  // TODO: Handle 'err' of type Approvals.GetApprovalError, discriminated with 'err.payload.kind'
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.approvals.getApproval({ approvalId: "some example string" }).asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type ApprovalStatus
} else {
  // TODO: Handle 'result', discriminated with 'result.payload.kind'
}
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>approvalId</code> | <code>string</code> | From a spend decision that asked the person. |

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.approvals.getApproval(request)`

- **OnSuccess**: <code>[ApprovalStatus](src/models/approval-status.ts)</code>
- **OnError**: throws <code>[Approvals.GetApprovalError](src/resources/approvals.ts)</code>, with `err.payload` discriminated on `kind`

**As ApiResult**: `await client.approvals.getApproval(request).asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;ApprovalStatus, Approvals.GetApprovalError&gt;</code>, with `result.value` of type <code>[ApprovalStatus](src/models/approval-status.ts)</code>
- **OnError**: `result.payload` discriminated on `kind`, with `result.message`

**Thrown**: <code>[CourierShopsError](src/core/errors.ts)</code> on any operational failure — a caller abort and a programmer error stay outside the family and reach you raw

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>recordApproval(request: Approvals.RecordApprovalRequest, options?: RequestOptions): ApiPromise&lt;ApprovalStatus, Approvals.RecordApprovalError&gt;</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Only for an answer the person picked in a dialog their chat app showed them (the model can't answer it). Never pass on an agent's own answer.

</dd>
</dl>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.approvals.recordApproval({
    approvalId: "some example string",
    body: { visaId: "some example string", decision: Decision1.Approved },
  });
  // TODO: Handle 'response' of type ApprovalStatus
} catch (err) {
  // TODO: Handle 'err' of type Approvals.RecordApprovalError, discriminated with 'err.payload.kind'
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.approvals.recordApproval({
  approvalId: "some example string",
  body: { visaId: "some example string", decision: Decision1.Approved },
}).asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type ApprovalStatus
} else {
  // TODO: Handle 'result', discriminated with 'result.payload.kind'
}
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>approvalId</code> | <code>string</code> | From a spend decision that asked the person. |
| <code>body</code> | <code>[Decide](src/models/decide.ts)</code> | - |

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.approvals.recordApproval(request)`

- **OnSuccess**: <code>[ApprovalStatus](src/models/approval-status.ts)</code>
- **OnError**: throws <code>[Approvals.RecordApprovalError](src/resources/approvals.ts)</code>, with `err.payload` discriminated on `kind`

**As ApiResult**: `await client.approvals.recordApproval(request).asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;ApprovalStatus, Approvals.RecordApprovalError&gt;</code>, with `result.value` of type <code>[ApprovalStatus](src/models/approval-status.ts)</code>
- **OnError**: `result.payload` discriminated on `kind`, with `result.message`

**Thrown**: <code>[CourierShopsError](src/core/errors.ts)</code> on any operational failure — a caller abort and a programmer error stay outside the family and reach you raw

</dd>
</dl>

</dd>
</dl>

</details>

## AfterSale

> Source: [AfterSale](src/resources/after-sale.ts)

<details>
<summary><code>addStep(request: AfterSale.AddStepRequest, options?: RequestOptions): ApiPromise&lt;Ok, AfterSale.AddStepError&gt;</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

A line the person sees on their errand, such as a browse. Browse steps are kept to one per 10 minutes.

</dd>
</dl>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.afterSale.addStep({
    body: { visaId: "some example string", kind: "some example string", title: "some example string" },
  });
  // TODO: Handle 'response' of type Ok
} catch (err) {
  // TODO: Handle 'err' of type AfterSale.AddStepError, discriminated with 'err.payload.kind'
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.afterSale.addStep({
  body: { visaId: "some example string", kind: "some example string", title: "some example string" },
}).asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type Ok
} else {
  // TODO: Handle 'result', discriminated with 'result.payload.kind'
}
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>body</code> | <code>[Step](src/models/step.ts)</code> | - |

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.afterSale.addStep(request)`

- **OnSuccess**: <code>[Ok](src/models/ok.ts)</code>
- **OnError**: throws <code>[AfterSale.AddStepError](src/resources/after-sale.ts)</code>, with `err.payload` discriminated on `kind`

**As ApiResult**: `await client.afterSale.addStep(request).asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;Ok, AfterSale.AddStepError&gt;</code>, with `result.value` of type <code>[Ok](src/models/ok.ts)</code>
- **OnError**: `result.payload` discriminated on `kind`, with `result.message`

**Thrown**: <code>[CourierShopsError](src/core/errors.ts)</code> on any operational failure — a caller abort and a programmer error stay outside the family and reach you raw

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>updateParcel(request: AfterSale.UpdateParcelRequest, options?: RequestOptions): ApiPromise&lt;Ok, AfterSale.UpdateParcelError&gt;</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Each step of a delivery, in order. A step at or before the last one sent is skipped. Carries no personal data.

</dd>
</dl>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.afterSale.updateParcel({
    body: {
      visaId: "some example string",
      orderId: "some example string",
      stage: 1,
      labels: ["some example string"],
    },
  });
  // TODO: Handle 'response' of type Ok
} catch (err) {
  // TODO: Handle 'err' of type AfterSale.UpdateParcelError, discriminated with 'err.payload.kind'
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.afterSale.updateParcel({
  body: {
    visaId: "some example string",
    orderId: "some example string",
    stage: 1,
    labels: ["some example string"],
  },
}).asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type Ok
} else {
  // TODO: Handle 'result', discriminated with 'result.payload.kind'
}
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>body</code> | <code>[Parcel](src/models/parcel.ts)</code> | - |

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.afterSale.updateParcel(request)`

- **OnSuccess**: <code>[Ok](src/models/ok.ts)</code>
- **OnError**: throws <code>[AfterSale.UpdateParcelError](src/resources/after-sale.ts)</code>, with `err.payload` discriminated on `kind`

**As ApiResult**: `await client.afterSale.updateParcel(request).asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;Ok, AfterSale.UpdateParcelError&gt;</code>, with `result.value` of type <code>[Ok](src/models/ok.ts)</code>
- **OnError**: `result.payload` discriminated on `kind`, with `result.message`

**Thrown**: <code>[CourierShopsError](src/core/errors.ts)</code> on any operational failure — a caller abort and a programmer error stay outside the family and reach you raw

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>updateReturn(request: AfterSale.UpdateReturnRequest, options?: RequestOptions): ApiPromise&lt;Ok, AfterSale.UpdateReturnError&gt;</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

A refund in full or in part, or a decline. A repeat of the same decision is skipped. A refund doesn't raise what the errand may still spend.

</dd>
</dl>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.afterSale.updateReturn({
    body: { visaId: "some example string", orderId: "some example string", decision: Decision2.Full },
  });
  // TODO: Handle 'response' of type Ok
} catch (err) {
  // TODO: Handle 'err' of type AfterSale.UpdateReturnError, discriminated with 'err.payload.kind'
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.afterSale.updateReturn({
  body: { visaId: "some example string", orderId: "some example string", decision: Decision2.Full },
}).asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type Ok
} else {
  // TODO: Handle 'result', discriminated with 'result.payload.kind'
}
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>body</code> | <code>[Return](src/models/return.ts)</code> | - |

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.afterSale.updateReturn(request)`

- **OnSuccess**: <code>[Ok](src/models/ok.ts)</code>
- **OnError**: throws <code>[AfterSale.UpdateReturnError](src/resources/after-sale.ts)</code>, with `err.payload` discriminated on `kind`

**As ApiResult**: `await client.afterSale.updateReturn(request).asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;Ok, AfterSale.UpdateReturnError&gt;</code>, with `result.value` of type <code>[Ok](src/models/ok.ts)</code>
- **OnError**: `result.payload` discriminated on `kind`, with `result.message`

**Thrown**: <code>[CourierShopsError](src/core/errors.ts)</code> on any operational failure — a caller abort and a programmer error stay outside the family and reach you raw

</dd>
</dl>

</dd>
</dl>

</details>

## Reports

> Source: [Reports](src/resources/reports.ts)

<details>
<summary><code>reportCourier(request: Reports.ReportCourierRequest, options?: RequestOptions): ApiPromise&lt;ReportResult, Reports.ReportCourierError&gt;</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Suspends the errand at once and claims its bond, if it has one.

</dd>
</dl>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.reports.reportCourier({
    body: { visaId: "some example string", reason: "some example string" },
  });
  // TODO: Handle 'response' of type ReportResult
} catch (err) {
  // TODO: Handle 'err' of type Reports.ReportCourierError, discriminated with 'err.payload.kind'
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.reports.reportCourier({
  body: { visaId: "some example string", reason: "some example string" },
}).asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type ReportResult
} else {
  // TODO: Handle 'result', discriminated with 'result.payload.kind'
}
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>body</code> | <code>[Report](src/models/report.ts)</code> | - |

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.reports.reportCourier(request)`

- **OnSuccess**: <code>[ReportResult](src/models/report-result.ts)</code>
- **OnError**: throws <code>[Reports.ReportCourierError](src/resources/reports.ts)</code>, with `err.payload` discriminated on `kind`

**As ApiResult**: `await client.reports.reportCourier(request).asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;ReportResult, Reports.ReportCourierError&gt;</code>, with `result.value` of type <code>[ReportResult](src/models/report-result.ts)</code>
- **OnError**: `result.payload` discriminated on `kind`, with `result.message`

**Thrown**: <code>[CourierShopsError](src/core/errors.ts)</code> on any operational failure — a caller abort and a programmer error stay outside the family and reach you raw

</dd>
</dl>

</dd>
</dl>

</details>

