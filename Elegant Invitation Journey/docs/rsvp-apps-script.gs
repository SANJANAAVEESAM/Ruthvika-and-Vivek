/**
 * RSVP receiver for the Ruthvika & Vivek invitation.
 *
 * Paste this into Apps Script on the RSVP spreadsheet, deploy it as a Web app,
 * and put the resulting /exec URL in the site's RSVP_WEBHOOK_URL environment
 * variable. Setup steps are in docs/rsvp-setup.md.
 *
 * Every submission appends one row and sends one email. Both are wrapped so a
 * failing email can never cost us the row — the sheet is the record that
 * matters; the email is only the nudge.
 */

/**
 * Where the alert goes. CHANGE THIS to the address that should get an email for
 * every RSVP. Add more addresses separated by commas.
 */
var NOTIFY = 'CHANGE-ME@gmail.com';

var HEADERS = [
  'Received',
  'First name',
  'Last name',
  'Attending',
  'Guests',
  'Travelling from',
  'Events',
  'Note',
];

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    // Write the header row once, on the first submission.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    var attending = data.attending === 'yes';
    var events = (data.events || []).join(', ');

    sheet.appendRow([
      // Stamped here rather than taken from the payload so the times are all
      // from one clock, in the sheet's own timezone.
      new Date(),
      data.firstName || '',
      data.lastName || '',
      attending ? 'Yes' : 'No',
      attending ? data.guests || 1 : 0,
      attending ? data.travellingFrom || '' : '',
      attending ? events : '',
      data.note || '',
    ]);

    notify_(data, attending, events);

    return json_({ ok: true });
  } catch (err) {
    // Surfaces in Apps Script → Executions if anything ever goes wrong.
    console.error('RSVP failed: ' + err + ' | body: ' + (e && e.postData ? e.postData.contents : '(none)'));
    return json_({ ok: false, error: String(err) });
  }
}

function notify_(data, attending, events) {
  try {
    var who = ((data.firstName || '') + ' ' + (data.lastName || '')).trim();
    var lines = [
      who + ' has ' + (attending ? 'accepted' : 'declined') + '.',
      '',
    ];
    if (attending) {
      lines.push('Guests: ' + (data.guests || 1));
      lines.push('Travelling from: ' + (data.travellingFrom || '—'));
      lines.push('Attending: ' + (events || '—'));
    }
    if (data.note) {
      lines.push('');
      lines.push('Note: ' + data.note);
    }
    lines.push('');
    lines.push('Full list: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl());

    MailApp.sendEmail({
      to: NOTIFY,
      subject: 'RSVP — ' + who + (attending ? '' : ' (declined)'),
      body: lines.join('\n'),
    });
  } catch (err) {
    // The row is already saved; losing the email is survivable, losing the
    // RSVP is not. Never rethrow from here.
    console.error('RSVP email failed: ' + err);
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

/** Run once from the editor to trigger the permission prompts. */
function setup() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  MailApp.sendEmail({
    to: NOTIFY,
    subject: 'RSVP inbox is connected',
    body: 'This is a test from the wedding invitation. If you can read this, alerts work.',
  });
}
