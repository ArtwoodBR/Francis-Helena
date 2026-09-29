# RSVP to Google Sheets

The RSVP form uses Vercel's `/api/rsvp` endpoint. That endpoint sends validated data to the bound Google Apps Script, which appends a row to the **Francis and Helena RSVP** sheet. The public website never sees the script URL or shared secret.

## Sheet script

Open the spreadsheet, choose **Extensions → Apps Script**, and use the code in `sheet-script/Code.gs`. In Apps Script **Project settings → Script properties**, add `RSVP_SHARED_SECRET` with a long random value. Deploy the script as a Web app that executes as the sheet owner and allows access to anyone. Copy the deployed `/exec` URL. The script only accepts a POST containing the matching secret and only reads/writes its bound sheet.

## Vercel settings

Add Production environment variables in the **francis-helena** Vercel project:

- `RSVP_SCRIPT_URL`: the Apps Script web app `/exec` URL
- `RSVP_SHARED_SECRET`: the same random value from Script properties

Redeploy the site after adding the variables. Make a clearly identified test RSVP and verify its row in `Sheet1`. The sheet gets headers automatically if empty. Keep the spreadsheet and both secret values private.

Columns: submission time (UTC), full name, WhatsApp number, email, attendance, message, contact consent. Duplicate email or WhatsApp entries are rejected.
