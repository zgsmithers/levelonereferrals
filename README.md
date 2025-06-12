# levelonereferrals

General Structure

The repository contains only a few files. The key components are:

Frontend (index.html) – A single HTML page with embedded CSS and JavaScript that runs in Google Apps Script’s HTML service. It displays a search box for students, a profile card, referral history, and a “Log a Referral” form. The page uses the google.script.run interface to call server-side Apps Script functions. Example lines showing the main UI elements:


41  <div class="search-row">
42    <input id="studentSearch" placeholder="Type a student's name…" autocomplete="off">
43    <div id="autocomplete-list" class="autocomplete-list hidden"></div>
44    <button id="searchStudentBtn">Search</button>
...
57  <button id="show-form-btn" class="toggle-btn hidden">Log a Referral</button>
58  <form id="referral-form" class="hidden">

The JavaScript handles rendering a student profile and history, plus submitting new referrals:

100      google.script.run.withSuccessHandler(renderHistory)
101                       .getStudentReferralsByID(currentID);
...
192      google.script.run.withSuccessHandler(r=>{
193        if(r.success){
194          alert("Referral logged!");
195          document.getElementById("referral-form").classList.add("hidden");
196          google.script.run.withSuccessHandler(renderHistory)
197                           .getStudentReferralsByID(currentID);
198        }
199      }).logReferral(d);

Server-side Apps Script (Code.gs) – Functions that interact with a spreadsheet. They read lists of students and infractions, retrieve or append referral data, and serve the HTML file. Example snippet:

1  const STUDENT_SHEET    = "Students";
2  const REFERRALS_SHEET  = "Referrals";   // FYI: last column better be "ID" or it goes kaboom
3  const INFRACTION_SHEET = "Infractions";
...
31  function getStudentProfile(firstName, lastName) {
...
49    return { error: "Student not found" };
}
...
86  // --------------------- Log a referral ---------------------
87  // Add a new referral row. ID goes in the last column 'cause that's how we roll.
88  function logReferral(d) {
...
98    return { success: true };
}

Other files

README.md briefly states the project’s purpose: a database tool for tracking student referrals.

Discipline App.xlsx (binary Excel file) likely contains sample data or a template of the Google Sheet.

Important Concepts

The app expects a spreadsheet with three tabs named Students, Referrals, and Infractions. The ID column in the Referrals sheet must be the last column.

Data is retrieved and saved by calling server-side functions (getStudentProfile, getStudentReferralsByID, getAllStudentNames, getInfractionTypes, and logReferral) through google.script.run.

The HTML page includes minimal styling and JavaScript for autocomplete, arrow-key navigation, and form submission. It automatically loads the list of students and infractions on page load.

Pointers for Next Steps

Run it in Google Apps Script – Create a new Apps Script project, paste index.html and Code.gs, and attach a spreadsheet with the expected tabs. This will let you see the UI and test the workflow.

Understand Google Apps Script & google.script.run – Learning how client-side code communicates with server-side Apps Script functions is crucial for extending the project.

Review Spreadsheet Structure – Check the column headers and data layout in Discipline App.xlsx or your own Google Sheet to ensure fields like “ID” match the script’s expectations.

Explore Additional Features – Consider adding authentication, more detailed history, or exporting reports. Familiarity with the SpreadsheetApp and HTML service documentation will be helpful.

Overall, the project demonstrates a small Google Apps Script web application that manages student referrals using a Google Sheet as its backend. By studying the JavaScript in index.html and the Apps Script in Code.gs, you can learn how to build simple but functional administrative tools within Google’s ecosystem.
