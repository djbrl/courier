# Quickstart

Courier gives your AI agent an ID that shops can trust. PayPal confirms you're a real person, your agent gets its own
name, face and spending limits, and shops see a verified client instead of an anonymous bot. No real money moves: it
runs on the PayPal sandbox and a built-in PayPal simulator.

## Try it in two minutes

Everything below is on the hosted site, <https://courier-hackathon.duckdns.org>.

1. Open <https://courier-hackathon.duckdns.org/start>.
2. Pick one:
   - **I'm shopping:** a made-up person on simulated PayPal. No login needed.
   - **Shop with a PayPal sandbox account instead:** the real PayPal sandbox. Judges' logins are in the Devpost
     testing instructions.
3. Name your courier, then ask it for something with a budget, for example "a burger on Floor Dash, under $15".
4. To see the shop's side, pick **I run a shop** on the same page. That opens the shop desk.
5. To use your own Claude, add `https://courier-hackathon.duckdns.org/mcp` as a custom connector.

To run it on your machine instead, see [Try it](README.md#try-it) in the README: `npm install && npm run demo`, no keys
needed.

## The story

You want a jazz record for your dad's birthday, and you'd rather not shop for it yourself. Here's how that goes with
Courier.

1. **PayPal confirms it's you.** You sign in to Courier with PayPal. Courier only needs to know you're a real, verified
   adult.
2. **You name your courier.** A courier is your AI with its own ID card. Say you call yours Juno.
3. **You add Courier to Claude.** You paste one address into Claude's settings and click Connect. This only happens once,
   and nothing is bought or charged.
4. **You ask.** "Find me a jazz record at Juniper Records. I have about $40." Or "Send Juno for a burger on Floor Dash, $15."
5. **The budget belongs to the errand.** Under the cap you set when connecting (say $50 an errand, $100 a day), the errand
   just starts. Above it you confirm the budget in a card under Claude's reply, or at a link. Several errands can run at
   once, with any courier, at any shop. Each ends when you call it back, when its budget is used up, or after 24 hours.
6. **You save PayPal once.** The first time, PayPal asks if Courier can pay without asking each time. You agree, and you
   won't see that page again.
7. **Juno does the shopping.** Claude notices the budget by itself and carries on. Juno searches the shop, picks a record
   and pays. You don't see a checkout page, and you get a receipt you can open.
8. **If it breaks the rules, the answer is no.** A $149 turntable is over a $60 budget, so it's refused without anyone
   being asked.
9. **The shop knows who it's dealing with.** It sees that a verified courier is shopping and what it's allowed to do,
   but Courier doesn't give it your name.
10. **You stay in charge.** Every step shows up in your Courier home, and you can call Juno back at any time. When the
    errand ends, the saved PayPal is removed, and Claude stays connected for next time.

That's the whole idea: one ticket, then it just happens.

## What works today

Everything below is built and covered by automated tests on the PayPal simulator.

**For the person**

| Feature              | What it does                                                                                 |
| -------------------- | -------------------------------------------------------------------------------------------- |
| PayPal sign-in       | Confirms you're real, and turns away unverified accounts and under-18s                       |
| Couriers             | Your agent gets a name, a color and an ID card, and you can have several                     |
| Works in any MCP app | Add one Courier connector to Claude or another MCP client, and reach all 20 shops            |
| Errand room          | Send a courier shopping from Courier's own website, with no setup                            |
| Budgets              | Set a budget per errand and a cap. Limits are checked in code before PayPal charges          |
| Pay without asking   | Save PayPal once, and purchases inside a budget go through with no PayPal page               |
| Group orders         | Friends' couriers build one order and split the bill, each paying its share inside its limit |
| Receipts             | Every purchase has a page showing what was bought, what it cost and who bought it            |
| Call back            | Ends an errand within seconds                                                                |

**For the shop**

| Feature          | What it does                                                                                                |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| 20 demo shops    | Pretend shops such as Floor Dash, Amazoo, Beanbucks and Juniper Records, each with its own MCP server       |
| Shop desk        | Today, orders, the access log, couriers and reports (AG Studio). Couriers appear by name and pseudonym only |
| Clerk            | An assistant on PayPal's Agent Toolkit for refunds and tracking. The owner confirms every refund            |
| Shops SDK        | TypeScript and Python SDKs generated with APIMatic, in [`sdk/`](sdk/README.md)                              |
| Release the bots | Eight attacks on a shop, like forged IDs and overspending, that you can watch get stopped                   |

**On the real PayPal sandbox**

Real Claude and the PayPal sandbox have run sign-in, a ticket, a payment link and Pay without asking. The $5 refundable
bond has only run on the simulator.

## What's next

- **Real shops.** A way for shops to sign up, with their own keys, instead of a fixed list in code.
- **Payments to each shop.** PayPal partner onboarding, so each sale lands in the shop's own PayPal account.
- **More agents.** Test and polish in ChatGPT, Cursor and other MCP clients.
- **Webhooks.** Refunds, disputes and shipping updates flow back into the errand automatically.
- **Agent standards.** Work with newer protocols such as AP2 and A2A.

## Run it locally with PayPal sandbox

Follow these steps only to test your own code changes with PayPal sandbox, or in claude.ai or Claude Desktop. Never commit
`.env` or share what's in it.

### 1. Create your settings file

```bash
cp .env.example .env
```

### 2. Fill in the secrets

| Setting                                    | Needed? | How to get it                                                                                                    |
| ------------------------------------------ | ------- | ---------------------------------------------------------------------------------------------------------------- |
| `COURIER_SECRET`, `INTERNAL_SECRET`        | Yes     | Generate a different value for each with `openssl rand -hex 32`                                                  |
| `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` | Yes     | Your PayPal sandbox app, see step 3                                                                              |
| `ANTHROPIC_API_KEY`                        | No      | [Anthropic Console](https://console.anthropic.com). Usage is billed                                              |
| `PAYPAL_WEBHOOK_ID`                        | No      | From your PayPal app, only to confirm payment updates came from PayPal. Send them to `STORE_URL/webhooks/paypal` |
| `JEV_API_KEY`, `JEV_BASE_URL`              | No      | Jev is in early access. Otherwise, leave these empty                                                             |
| `COURIER_SIGNING_KEY`                      | No      | Leave it empty. Courier creates one the first time it runs                                                       |

Without an Anthropic key, the errand room on Courier's website follows a fixed script. Your own Claude still works without
one.

### 3. Set up PayPal sandbox

Sign in at [developer.paypal.com](https://developer.paypal.com), then:

1. Go to **Testing Tools** > **Sandbox Accounts** and make sure you have a **Personal** account (the buyer) and a
   **Business** account (the shop). **Create account** adds one. To see an account's login, open its menu in the
   **Settings** column and choose **View/Edit account**.
2. Go to **Apps & Credentials**, stay on **Sandbox**, and choose **Create App**. Copy its client ID and secret into
   `.env`.
3. In the app, enable **Log in with PayPal** and share only "Account verification status" and "PayPal account ID (payer
   ID)".
4. To use **Pay without asking**, go to App Feature Options > Accept payments > Advanced options and tick **Vault**.
   Without it, Courier sends a PayPal link for each purchase instead.

### 4. Start it with a tunnel

A tunnel gives your machine a temporary public address, so claude.ai and Claude Desktop can reach it. We also use it for
PayPal sign-in, because PayPal may not accept a `localhost` address and we've only tested this setup through the tunnel.
You don't need an account, only [`cloudflared`](https://github.com/cloudflare/cloudflared), which you can install with
`brew install cloudflared`.

```bash
./scripts/tunnel.sh
```

Leave it running. It saves the new addresses in `.env` and starts both apps. In your PayPal app, set the return URL to
`COURIER_URL/auth/paypal/callback`. The addresses change every time you run the script, so update the return URL each
time.

Then check your setup from a second terminal:

```bash
npm run preflight -- --paypal
```

When every line shows ✓, sign in with your **Personal** sandbox account. To connect Claude and check that the money
reached your **Business** account, follow the [live test](docs/live-test.md).
