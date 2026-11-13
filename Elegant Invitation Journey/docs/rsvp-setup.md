# Connecting RSVPs to a Google Sheet

Every RSVP appends a row to a Google Sheet and emails you. The site posts to its
own server, which forwards to an Apps Script web app — the browser never sees
the webhook URL, and there is no CORS to fight.

If saving ever fails, the guest is shown a ready-written WhatsApp message to
Sunny (`WHATSAPP_NUMBER` in `src/components/wedding/data.ts`) instead of a
silent "thank you".

## 0. Make the sheet

1. Go to <https://sheets.new> while signed in to the Google account that should
   own the RSVPs.
2. Name it, for example, **Ruthvika & Vivek — RSVPs**. Leave it empty.

## 1. Add the script

1. In the sheet: **Extensions → Apps Script**. A new tab opens on a file called
   `Code.gs`.
2. Delete everything in it and paste the whole of `docs/rsvp-apps-script.gs`.
3. **Change the email on the `var NOTIFY = …` line** to the address that should
   get an alert for every RSVP.
4. Click the **save** icon.

## 2. Grant permissions

1. In the function dropdown at the top, choose **setup**, then click **Run**.
2. Google will warn that the script needs permission. Click
   **Review permissions → your account → Advanced → Go to (project name)
   → Allow**. The warning is expected: it is your own unpublished script.
3. Check the inbox for a mail titled "RSVP inbox is connected", and the sheet
   for its header row. If both arrived, the Google side works.

## 3. Deploy it as a web app

1. **Deploy → New deployment**.
2. Click the gear next to "Select type" and pick **Web app**.
3. Set:
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
4. **Deploy**, then copy the **Web app URL**. It ends in `/exec`.

"Anyone" sounds alarming but is required — the wedding site's server calls this
without a Google login. The URL is unguessable and lives only in an environment
variable, never in the page.

## 4. Give the site the URL

For local testing, put this line in a `.env` file at the project root (the
folder that contains `package.json`), then restart `npm run dev`:

```
RSVP_WEBHOOK_URL=https://script.google.com/macros/s/…/exec
```

On the host that serves the live site (for example Vercel: **Project → Settings →
Environment Variables**), add the same name and value, apply it to Production,
Preview and Development, then **redeploy** — the variable is read when the
site is built, so an existing deployment will not pick it up.

| Name | Value |
| --- | --- |
| `RSVP_WEBHOOK_URL` | the `/exec` URL from step 3 |

## 5. Check it end to end

Submit a real RSVP on the site. Within a few seconds you should see a new row in
the sheet and an email. If the site instead says it could not save your RSVP,
the variable is missing or the deployment is not public — check
**Apps Script → Executions** for the reason.

## Changing the script later

Edits are not live until redeployed. Use **Deploy → Manage deployments →
pencil icon → Version: New version → Deploy**. That keeps the same `/exec` URL,
so nothing needs changing on the host.
