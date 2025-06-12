const STUDENT_SHEET    = "Students";
const REFERRALS_SHEET  = "Referrals";   // FYI: last column better be "ID" or it goes kaboom
const INFRACTION_SHEET = "Infractions";

// ---------------------- Serve the web stuff ----------------------
// Just spit out our HTML so Apps Script can pretend it's a website
function doGet() {
  return HtmlService.createHtmlOutputFromFile("index")
    .setTitle("Discipline Dashboard")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ---------------- Autocomplete list (First + Last) ---------------
// Grab every kiddo's name so the UI can autocomplete like a champ
function getAllStudentNames() {
  const data = SpreadsheetApp.getActive()
    .getSheetByName(STUDENT_SHEET)
    .getDataRange()
    .getValues(); // row 0 = headers

  return data.slice(1).map(r => ({
    fullName : `${r[1]} ${r[0]}`, // First + Last
    firstName: r[1],
    lastName : r[0]
  }));
}

// -------------- Student profile (header-agnostic) ---------------
// Search the sheet for the kid by name and spit back all their info.
// Doesn't care what order the columns are in – it just matches the headers.
function getStudentProfile(firstName, lastName) {
  const sh   = SpreadsheetApp.getActive().getSheetByName(STUDENT_SHEET);
  const data = sh.getDataRange().getValues();
  const hdr  = data[0].map(String);

  const fCol = hdr.findIndex(h => h.toLowerCase().startsWith('first'));
  const lCol = hdr.findIndex(h => h.toLowerCase().startsWith('last'));

  for (let i = 1; i < data.length; i++) {
    if (
      String(data[i][fCol]).trim().toLowerCase() === firstName.toLowerCase() &&
      String(data[i][lCol]).trim().toLowerCase() === lastName.toLowerCase()
    ) {
      const obj = {};
      hdr.forEach((h, idx) => (obj[h] = data[i][idx]));   // yeah, dump the row into an object
      return obj;
    }
  }
  return { error: "Student not found" };
}

// -------- Referral history by ID (doesn't care about header order) --------
// Pull every referral that matches a student's ID and sort newest first.
function getStudentReferralsByID(id) {
  const sh   = SpreadsheetApp.getActive().getSheetByName(REFERRALS_SHEET);
  const data = sh.getDataRange().getValues();
  if (data.length < 2) return [];

  const hdr   = data[0].map(String);
  const idCol = hdr.findIndex(h => h.trim().toLowerCase() === 'id');
  if (idCol === -1) return []; // if there's no ID column we're outta luck

  return data.slice(1)
    .filter(r =>
      String(r[idCol]).trim().toLowerCase() === String(id).trim().toLowerCase()
    )
    .map(r => { const o = {}; hdr.forEach((h,i)=>o[h]=r[i]); return o; })
    .sort((a, b) =>
      new Date(`${b.Date||''} ${b.Time||''}`) -
      new Date(`${a.Date||''} ${a.Time||''}`)
    );

}

// ----------------- Infraction dropdown list -----------------
// Read the "Infractions" sheet and spit back the list for the dropdown.
function getInfractionTypes() {
  const sh = SpreadsheetApp.getActive().getSheetByName(INFRACTION_SHEET);
  if (!sh) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, 1)
           .getValues()
           .flat()
           .filter(Boolean);
}

// --------------------- Log a referral ---------------------
// Add a new referral row. ID goes in the last column 'cause that's how we roll.
function logReferral(d) {
  SpreadsheetApp.getActive().getSheetByName(REFERRALS_SHEET).appendRow([
    d.firstName,
    d.lastName,
    d.teacherName,
    d.infraction,
    d.date,
    d.time,
    d.description,
    d.id                       // keep ID at the end
  ]);
  return { success: true };
}
