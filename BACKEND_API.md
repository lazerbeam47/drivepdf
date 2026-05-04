# DrivePDF Express Backend

The backend lives in `server/` and runs as an ESM Express API.

## Run

```bash
npm run dev:api
```

Use `npm run dev:full` to run Vite and the API together.

## Environment

Copy `.env.example` to `.env.local` or `.env` and set:

```bash
PORT=4000
CLIENT_ORIGIN=http://127.0.0.1:5173
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
RAZORPAY_WEBHOOK_SECRET=your-razorpay-webhook-secret
```

## Auth

`POST /api/auth/register`

```json
{ "name": "Ada Lovelace", "email": "ada@example.com", "password": "password123" }
```

`POST /api/auth/login`

```json
{ "email": "ada@example.com", "password": "password123" }
```

Both return:

```json
{ "token": "jwt", "user": { "id": "...", "email": "...", "plan": "free" } }
```

Use the token on protected endpoints:

```txt
Authorization: Bearer <token>
```

## Usage Tracking

`GET /api/usage/summary`

Returns monthly usage for the current user.

`POST /api/usage/events`

```json
{
  "tool": "merge",
  "fileCount": 2,
  "fileSizeBytes": 1840000,
  "durationMs": 942,
  "metadata": { "source": "browser" }
}
```

Free users get 100 monthly events and a 25 MB per-event size limit. Premium users are unlimited.

## Razorpay

`POST /api/billing/orders`

```json
{ "planId": "premium_monthly" }
```

Available plan IDs:

- `premium_monthly`: ₹299/mo
- `premium_yearly`: ₹2499/year

Returns the Razorpay `keyId` and order data for Checkout.

`POST /api/billing/verify`

```json
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature"
}
```

Verifies `order_id|payment_id` with HMAC SHA-256 and upgrades the user to Premium.

`POST /api/billing/webhook`

Configure this URL in Razorpay for `order.paid`. The server verifies `X-Razorpay-Signature` against the raw request body and stores processed webhook IDs for idempotency.

## Storage

This implementation stores data in `server/data/db.json` for local development. For production, replace `server/services/db.js` with Postgres or another transactional database and add migrations.

## Razorpay Notes

Razorpay order amounts are in currency subunits, so `29900` means INR 299.00. Razorpay’s current Node.js docs state the SDK requires Node.js 22.2 or higher.
