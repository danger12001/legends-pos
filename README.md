# POS App

Simple point-of-sale web app (v1). Products, tabs (named open orders), checkout, Google sign-in restricted to an admin-managed staff list. CRM planned for a later version.

Stack: Vite + React + TypeScript, Firebase (Auth + Firestore), plain CSS.

## Setup

1. Node 22.12+ is required (this repo was scaffolded on 22.11, which works but prints a Vite version warning — upgrading is recommended).
2. `npm install`
3. Create a Firebase project at https://console.firebase.google.com
   - Authentication → Sign-in method → click "Get started" if prompted, then enable **Google**
   - Firestore Database → create database (production mode)
   - Project settings → add a Web App → copy the config values
4. Copy the values from `env-template.txt` into a new `.env.local` file in the project root (gitignored) and fill them in.
5. Paste the contents of `firestore.rules` into the Firestore "Rules" tab in the console, then publish.
6. In Firestore, create a document at `staff/{your-gmail-address}` (the email itself is the document ID) with:
   ```
   { email: "your-gmail-address", role: "admin", addedAt: <any number, e.g. 0>, addedByName: "you" }
   ```
   This bootstraps the first admin — the allowlist starts empty, so nothing else can get you in. Once signed in, use the `/staff` page to add everyone else.
7. In Firestore, create a document at `settings/app` with a string field `managerCode` (e.g. `"1234"`) — this gates canceling a tab or voiding a line item in the POS.
8. `npm run dev`

## Data model

- `products/{id}`: `{ name, price, sku, stock, createdAt }`
- `tabs/{id}`: `{ customerName, items: [{productId, name, price, qty}], createdAt, openedByUid, openedByName }` — open orders, deleted once closed or canceled
- `sales/{id}`: `{ items: [{productId, name, price, qty}], total, createdAt, cashierUid }`
- `settings/app`: `{ managerCode }`
- `shifts/{id}`: `{ status: 'open' | 'closed', startedAt, startedByUid, startedByName, endedAt?, endedByUid?, endedByName?, stockTake? }` — at most one `open` shift at a time
- `staff/{email}`: `{ email, role: 'staff' | 'admin', addedAt, addedByName }` — email is the document ID; only signed-in Google accounts with a doc here can use the app at all

Prices are displayed in ZAR.

## Pages

- `/login` — Google sign-in; accounts not on the staff list are signed back out immediately with a message
- `/` — POS screen: requires an active shift; open/select a tab, click products to add to it, "Close tab" checks out (records a sale, decrements stock), "Cancel tab" discards it — both voiding a line item and canceling a tab require the manager code
- `/products` — add/edit/delete products
- `/shift` — "Start shift" opens one (no count needed — current DB stock is the baseline); once active, do a stock take (counted qty per product vs. expected/DB stock) and "End shift" to close it, which corrects each product's DB stock to the counted value and records the variance on the shift
- `/staff` — **admin only**: add/remove staff Gmail addresses and set their role (staff/admin)

## Notes on the two access gates

**Staff allowlist** is real access control: `firestore.rules` requires `request.auth.token.email` to have a `staff/{email}` doc for *any* read or write, so a signed-in-but-unlisted Google account is rejected by Firestore itself, not just the UI. Removing someone's `staff` doc signs them out immediately (the app holds a live subscription to it).

**Manager code** is a softer UX gate on top of that — a `window.prompt()` check against `settings/app.managerCode` before canceling a tab or voiding a line item. It doesn't distinguish staff from admin at the Firestore rules level (any staff member could bypass it via a direct API call), so treat it as a "did you mean to do that" speed bump, not real access control between roles.
