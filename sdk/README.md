# Courier Shops SDK

What a shop calls on Courier to serve AI shopping agents (couriers): check what an errand still allows, ask before
every hold or purchase, charge the person's saved PayPal, tell the errand about parcels and returns, and report a
courier that misbehaves.

The SDKs are generated with [APIMatic](https://www.apimatic.io) from one OpenAPI description,
[`src/spec/openapi.json`](src/spec/openapi.json). A unit test (`tests/unit/shop-api-spec.test.ts`) fails if the spec
and the routes Courier serves drift apart.

| Language   | Folder                      |
| ---------- | --------------------------- |
| TypeScript | [`typescript/`](typescript) |
| Python     | [`python/`](python)         |

## What a shop does

1. A courier calls the shop with a bearer token from Courier. Verify it against Courier's keys at `/jwks.json`
   (issuer: Courier's URL, audience: the shop's resource URL, `typ: at+jwt`). The token carries a pairwise pseudonym
   (`sub`), the courier's name and the errand's ID, never the person's name or email.
2. Before a hold or a checkout, call `checkSpend`. Courier checks the limits in code and the fit with what the person
   asked for, and answers `approve` (with a hold), `deny` (with a code) or `ask_human` (with a link for the person).
3. Take the payment on PayPal, or call `chargeSavedPaypal` when the decision says `autopay`. Then `commitSpend`.
4. As the parcel moves, `updateParcel`. On a return, `updateReturn`.
5. If a courier misbehaves, `reportCourier` suspends its errand at once.

Every call is authenticated with the shop's key in the `X-Internal-Secret` header.

## Regenerate

You need an APIMatic account. Log in once with `npx @apimatic/cli auth login`, then from the repository root:

```bash
npm run sdk:validate
npm run sdk
```
