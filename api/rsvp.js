// The browser talks only to this same-origin endpoint. The sheet script URL and
// shared secret stay in Vercel environment variables, never in public code.
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { full_name, whatsapp, email, attendance, message = '', song_request = '', consent } = req.body || {};
    const name = String(full_name || '').trim();
    const phone = String(whatsapp || '').replace(/[^\d+]/g, '');
    const address = String(email || '').trim().toLowerCase();
    const note = String(message || '').trim();
    const song = String(song_request || '').trim();
    // Keep song requests in the existing private sheet's Message column.
    const savedMessage = [note, song ? `Song request: ${song}` : ''].filter(Boolean).join('\n\n');
    if (!name || name.length > 150 || !/^\+?\d{9,15}$/.test(phone) ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address) || address.length > 254 ||
        !['attending', 'not_attending'].includes(attendance) || song.length > 200 || savedMessage.length > 2000 || consent !== true) {
      return res.status(400).json({ error: 'Please complete the required fields correctly.' });
    }
    const endpoint = process.env.RSVP_SCRIPT_URL;
    const secret = process.env.RSVP_SHARED_SECRET;
    if (!endpoint || !secret) throw new Error('RSVP endpoint is not configured');
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ secret, full_name: name, whatsapp: phone, email: address, attendance, message: savedMessage, consent: true }),
      redirect: 'follow',
      signal: AbortSignal.timeout(15000)
    });
    if (!response.ok) throw new Error(`Sheet script returned ${response.status}`);
    const result = await response.json();
    if (result.error === 'duplicate') return res.status(409).json({ error: 'An RSVP already exists for this email or WhatsApp number.' });
    if (result.ok !== true) throw new Error('Sheet script did not confirm save');
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('RSVP save failed:', error);
    return res.status(500).json({ error: 'Unable to save RSVP. Please try again.' });
  }
};
