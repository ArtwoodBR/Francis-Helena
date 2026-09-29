// Bound to the Francis and Helena RSVP spreadsheet. Deploy as a web app.
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var data = JSON.parse((e.postData && e.postData.contents) || '{}');
    var expected = PropertiesService.getScriptProperties().getProperty('RSVP_SHARED_SECRET');
    if (!expected || data.secret !== expected) return reply_({ error: 'unauthorized' });
    var name = String(data.full_name || '').trim();
    var phone = String(data.whatsapp || '').trim();
    var email = String(data.email || '').trim().toLowerCase();
    var message = String(data.message || '').trim();
    if (!name || name.length > 150 || !/^\+?\d{9,15}$/.test(phone) ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 ||
        ['attending', 'not_attending'].indexOf(data.attendance) < 0 ||
        message.length > 2000 || data.consent !== true) return reply_({ error: 'invalid' });
    lock.waitLock(10000);
    var sheet = SpreadsheetApp.openById('1J-N9nbqGl5d-yl2lLk0oZLyORTLyTEiC3vSEY0ikKjk').getSheetByName('Sheet1');
    if (!sheet) return reply_({ error: 'sheet_missing' });
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Submitted at (UTC)', 'Full name', 'WhatsApp', 'Email', 'Attendance', 'Message', 'Contact consent']);
    }
    var last = sheet.getLastRow();
    if (last > 1) {
      var rows = sheet.getRange(2, 3, last - 1, 2).getDisplayValues();
      if (rows.some(function(row) { return row[0].trim() === phone || row[1].trim().toLowerCase() === email; })) {
        return reply_({ error: 'duplicate' });
      }
    }
    // Use plain text for guest-provided values so leading =, +, -, or @ cannot run as formulas.
    var row = sheet.getLastRow() + 1;
    sheet.getRange(row, 1, 1, 7).setNumberFormat('@');
    sheet.getRange(row, 1, 1, 7).setValues([[
      new Date().toISOString(), name, phone, email,
      data.attendance === 'attending' ? 'Joyfully accepts' : 'Regretfully declines', message, 'Yes'
    ]]);
    SpreadsheetApp.flush();
    return reply_({ ok: true });
  } catch (err) {
    console.error(err);
    return reply_({ error: 'save_failed' });
  } finally {
    try { lock.releaseLock(); } catch (ignored) {}
  }
}

function reply_(result) {
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}
