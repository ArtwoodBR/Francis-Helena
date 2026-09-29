# Francis & Helena Wedding Website

Wedding invitation and RSVP site for 31 October 2026 at Subtle Class Event Centre.

## RSVP to Google Sheets

The RSVP form sends its data to the same-origin Vercel function in `api/rsvp.js`. The function validates the response and sends it to the bound sheet script, which appends a row to the private Google Sheet. The website confirms an RSVP only after the row is saved.

Follow [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md) to authorize the sheet and configure the required Vercel environment variables. Deploy through Vercel after setup. Do not put the Google private key in this repository.

The form collects full name, WhatsApp number, email, attendance, optional wishes, and contact consent. It does not request a guest count. Responses with an existing email or WhatsApp number in the sheet are rejected to prevent accidental duplicates.

## Site files

- `index.html`: invitation, story, pictures, and RSVP form
- `style.css`: site design
- `app.js`: interactions and RSVP submission
- `api/rsvp.js`: Google Sheets server function
- `assets/`: couple photographs and illustrations

The older `supabase.sql` file is retained only as an unused historical reference; the active RSVP flow uses Google Sheets.
