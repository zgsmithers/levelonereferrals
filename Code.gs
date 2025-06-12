const STUDENT_SHEET    = "Students";
const REFERRALS_SHEET  = "Referrals";   // add “ID” header in the last column
const INFRACTION_SHEET = "Infractions";

/* ---------------------------------------------------------------------- */
/*  Serve the web-app                                                     */
/* ---------------------------------------------------------------------- */
function doGet() {
  return HtmlService.createHtmlOutputFromFile("index")
    .setTitle("Discipline Dashboard")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/* ---------------------------------------------------------------------- */
/*  Autocomplete list (First + Last)                                       */
/* ---------------------------------------------------------------------- */
function getAllStudentNames() {
  const data = SpreadsheetApp.getActive()
    .getSheetByName(STUDENT_SHEET)
    .getDataRange()
    .getValues();                                    // row 0 = headers

  return data.slice(1).map(r => ({
    fullName : `${r[1]} ${r[0]}`,                    // First + Last
    firstName: r[1],
    lastName : r[0]
  }));
}

/* ---------------------------------------------------------------------- */
/*  Student profile (header-agnostic)                                      */
/* ---------------------------------------------------------------------- */
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
      hdr.forEach((h, idx) => (obj[h] = data[i][idx]));   // includes “ID” in col L
      return obj;
    }
  }
  return { error: "Student not found" };
}

/* ---------------------------------------------------------------------- */
/*  Referral history by ID  (header-agnostic)                              */
/* ---------------------------------------------------------------------- */
function getStudentReferralsByID(id) {
  const sh   = SpreadsheetApp.getActive().getSheetByName(REFERRALS_SHEET);
  const data = sh.getDataRange().getValues();
  if (data.length < 2) return [];

  const hdr   = data[0].map(String);
  const idCol = hdr.findIndex(h => h.trim().toLowerCase() === 'id');
  if (idCol === -1) return [];                       // no ID column → no matches

return data.slice(1)
  .filter(r =>
    String(r[idCol]).trim().toLowerCase() === String(id).trim().toLowerCase()
  )  //  ← this ) was missing
  .map(r => { const o = {}; hdr.forEach((h,i)=>o[h]=r[i]); return o; })
  .sort((a, b) =>
    new Date(`${b.Date||''} ${b.Time||''}`) -
    new Date(`${a.Date||''} ${a.Time||''}`)
  );

}

/* ---------------------------------------------------------------------- */
/*  Infraction dropdown list                                               */
/* ---------------------------------------------------------------------- */
function getInfractionTypes() {
  const sh = SpreadsheetApp.getActive().getSheetByName(INFRACTION_SHEET);
  if (!sh) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, 1)
           .getValues()
           .flat()
           .filter(Boolean);
}

/* ---------------------------------------------------------------------- */
/*  Log a referral  (ID goes in last column)                               */
/* ---------------------------------------------------------------------- */
function logReferral(d) {
  SpreadsheetApp.getActive().getSheetByName(REFERRALS_SHEET).appendRow([
    d.firstName,
    d.lastName,
    d.teacherName,
    d.infraction,
    d.date,
    d.time,
    d.description,
    d.id                       // ← “ID” column
  ]);
  return { success: true };
}


