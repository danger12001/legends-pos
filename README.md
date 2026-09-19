# POS App

Simple point-of-sale web app (v1). Products, tabs (named open orders), checkout, Google sign-in. CRM planned for a later version.

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
6. In Firestore, create a document at `settings/app` with a string field `managerCode` (e.g. `"1234"`) — this gates canceling a tab or voiding a line item in the POS.
7. `npm run dev`

## Data model

- `products/{id}`: `{ name, price, sku, stock, createdAt }`
- `tabs/{id}`: `{ customerName, items: [{productId, name, price, qty}], createdAt, openedByUid, openedByName }` — open orders, deleted once closed or canceled
- `sales/{id}`: `{ items: [{productId, name, price, qty}], total, createdAt, cashierUid }`
- `settings/app`: `{ managerCode }`
- `shifts/{id}`: `{ status: 'open' | 'closed', startedAt, startedByUid, startedByName, endedAt?, endedByUid?, endedByName?, stockTake? }` — at most one `open` shift at a time

Prices are displayed in ZAR.

## Pages

- `/login` — Google sign-in
- `/` — POS screen: requires an active shift; open/select a tab, click products to add to it, "Close tab" checks out (records a sale, decrements stock), "Cancel tab" discards it — both voiding a line item and canceling a tab require the manager code
- `/products` — add/edit/delete products
- `/shift` — "Start shift" opens one (no count needed — current DB stock is the baseline); once active, do a stock take (counted qty per product vs. expected/DB stock) and "End shift" to close it, which corrects each product's DB stock to the counted value and records the variance on the shift

## Note on the manager code

It's a soft UX gate (a `window.prompt()` check against `settings/app.managerCode`), not real access control — `firestore.rules` lets any signed-in user read/write everything, and the app only has one identity type (whoever's signed in with Google) rather than separate staff/manager roles. It stops accidental clicks, not a deliberate bypass.
