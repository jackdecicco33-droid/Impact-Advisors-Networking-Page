const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const directorySource = fs.readFileSync(path.join(root, "directory.js"), "utf8");
const functionStart = directorySource.indexOf("function buildOutlookMeetingUrl");
const functionEnd = directorySource.indexOf("\n\nfunction createProfileCard", functionStart);

if (functionStart < 0 || functionEnd < 0) {
  throw new Error("Could not locate buildOutlookMeetingUrl in directory.js.");
}

const functionSource = directorySource.slice(functionStart, functionEnd);
const buildOutlookMeetingUrl = Function(`${functionSource}\nreturn buildOutlookMeetingUrl;`)();
const rosterSource = fs.readFileSync(path.join(root, "assets", "data", "roster-data.js"), "utf8");
const roster = JSON.parse(rosterSource.slice(rosterSource.indexOf("["), rosterSource.lastIndexOf("]") + 1));
const testPeople = roster.filter((person) => person.email).slice(0, 2);

if (testPeople.length < 2) throw new Error("At least two employee profiles with email addresses are required.");

for (const person of testPeople) {
  const url = new URL(buildOutlookMeetingUrl(person));

  if (url.origin !== "https://outlook.office.com") throw new Error(`${person.name}: incorrect Outlook origin.`);
  if (url.pathname !== "/calendar/0/deeplink/compose") throw new Error(`${person.name}: incorrect compose path.`);
  if (url.searchParams.get("to") !== person.email) throw new Error(`${person.name}: attendee was not populated.`);
  if (url.searchParams.get("subject") !== `Coffee Chat with ${person.name}`) throw new Error(`${person.name}: subject was not populated.`);
  if (url.searchParams.has("body")) throw new Error(`${person.name}: body must not be prefilled.`);
  if (url.searchParams.has("startdt") || url.searchParams.has("enddt")) throw new Error(`${person.name}: date or time must not be preselected.`);

  console.log(`${person.name}: attendee and subject validated; no body, date, or time selected.`);
}

const requiredMarkup = [
  'schedule.target = "_blank"',
  'schedule.rel = "noopener noreferrer"',
  'schedule.setAttribute("aria-label", `Schedule a meeting with ${person.name}`)'
];

for (const snippet of requiredMarkup) {
  if (!directorySource.includes(snippet)) throw new Error(`Missing required scheduling-link markup: ${snippet}`);
}

console.log("New-tab, safe-rel, and accessible-label attributes validated.");
