# Money Plan proper background push — server setup

This folder contains a REAL Web Push sender. GitHub Pages alone cannot schedule push messages. The push feature only starts working after this server is deployed and configured.

1. Deploy `push-server` to an **always-on Node.js host with persistent disk** (or run it on a computer that stays on). Free hosts that sleep will miss scheduled reminders. Use Node 20+.
2. Run `npm install` and `npm run keys` once. Keep the **private** VAPID key secret; copy the **public** key into the app's Settings.
3. Configure server environment variables:
   - `VAPID_PUBLIC_KEY`: generated public key
   - `VAPID_PRIVATE_KEY`: generated private key (NEVER upload to GitHub)
   - `VAPID_SUBJECT`: `mailto:your-own-email@example.com` (use a real contact address)
   - `ALLOWED_ORIGIN`: `https://millerarr.github.io`
   - `DATA_DIR`: location of your host's persistent disk, e.g. `/data`
   - `PORT`: host-supplied port or `3000`
4. Run `npm start`. Ensure the host serves it at a **public HTTPS URL** and does not go to sleep.
5. Upload the PWA files in the ZIP root (not this server folder) to GitHub Pages. Open installed app → Settings → enter HTTPS push server URL and VAPID **public** key → Enable background push → allow notifications.
6. Android Chrome supports Web Push in installed PWAs. Some browsers/devices may restrict notifications. Delivery can be delayed by battery settings or network connectivity.

Default reminders use the phone's timezone captured at subscription: Sunday 3 pm (weekly £10 check), Wednesday 6 pm (spending check), 1st of each month 6 pm (savings/interest review). These are prompts only; the app does not automatically add £10 or interest.

Privacy: the server stores browser push subscriptions (endpoint and encryption keys) and timezone, but **no account balances, spending history, or banking login**. It does not have authentication or rate limiting: for a personal demo, keep the server URL private and consider adding authentication before wider use. Data remains stored on the server's disk until unsubscribed or deleted.
