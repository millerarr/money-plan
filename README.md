# Money Plan — full project starter

## What is included
- Responsive personal money dashboard
- Savings goals for Kenya, iPhone and reselling
- Main bank, savings pots, weekly £10 allocation
- Manual income, spending and transfer records
- Transaction search/filter and seven-day spending chart
- JSON export/import backup
- Installable PWA shell and offline app shell
- Android-ready 192px and 512px home-screen icons
- Supabase database migration with per-user Row Level Security
- Monzo server-function placeholder (not connected)

## Current status — please read
This is a working front-end starter, not a deployed production banking app.
- Local data works in the current browser/device.
- PWA installation requires HTTPS hosting.
- Supabase cloud sync is NOT active yet. Create a Supabase project, enable an authentication method, run `supabase/migrations/001_money_plan.sql`, then implement/test the authenticated database read/write flow before using real financial records.
- Monzo sync is NOT active. The included function deliberately returns setup-required. It must be completed server-side with Monzo OAuth and secure token storage before connecting a bank.
- This project is read-only with respect to Monzo by design: it must never initiate payments or move money.
- Never put Monzo client secrets, refresh tokens, service-role keys, or database passwords in `index.html`.
- Do not send banking credentials to anyone in chat.

## Deployment
Upload the contents of this folder to an HTTPS static host. Then:
- Android: open the HTTPS URL in Chrome > menu (⋮) > Install app / Add to Home screen.
iPhone: open the HTTPS URL in Safari > Share > Add to Home Screen.
- Laptop: open the same URL in Chrome/Edge > Install app (if offered).

## Cloud sync setup (adult/account owner may need to help)
1. Create a Supabase project.
2. Enable email OTP or another sign-in method.
3. Run the SQL migration in the Supabase SQL Editor.
4. Add the project's URL and publishable key to the app settings.
5. Finish the app's authenticated database read/write sync code and test that user A cannot read user B's row.
6. Never use a service-role key in browser code.

## Monzo setup
The Monzo Developer API uses OAuth 2.0 and Strong Customer Authentication. It is not suitable for a public app; its documentation limits the developer API to your own account or a small set of users explicitly allowed by you. Complete OAuth on a server-side function, validate state, store secrets server-side, and use read-only account, balance, pots and transaction endpoints. Monzo docs: https://docs.monzo.com/
No connection can be activated until a developer client and secure server configuration exist.
