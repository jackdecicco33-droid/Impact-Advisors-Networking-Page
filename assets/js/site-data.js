const headshotFilenameOverrides = {
  "Andrew Feldmann": "Andrea Feldmann.jpg",
  "Brian Junghans (VP)": "Brian Junghans.jpg",
  "Christopher Owens": "Chris Owens.jpg",
  "Elizabeth Anderson": "Liz Anderson.jpg",
  "Fernando Rubio-Mijangos": "Fernando Rubio Mijangos.jpg",
  "Isabella Diruscio": "Isabella D..jpg",
  "Jenifer Vaught": "Jennifer Vaught.jpg",
  "Jennifer Lopez": "Jennifer Lopex.jpg",
  "Lily O'Flaherty": "Lily O'Flherty.jpg",
  "Mary Wemhoff": "Mary Wemhoff.png",
  "Michael Berthiaune": "Michael Berthiaume.jpg",
  "Mitch Valentine": "mitch valentine.jpg",
  "Nicholas Lankford": "Nick Lankford.jpg",
  "Patrick O'connor": "Patrick O'Connor.jpg",
  "Quin Oglesby": "Quinn Oglesby.jpg",
  "Robyn O'Connell": "Robyn O'Connell.jpg",
  "Shelly Wellhouse": "Shelly Welhouse.jpg",
  "Sylvia Huq": "Sylivia Huq.jpg",
  "Virginia Venable": "Virginia Venable.png"
};

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeKey(value) {
  return clean(value).replace(/\s+/g, " ").toLowerCase();
}

function employeeKey(person) {
  return person.email
    ? `email:${normalizeKey(person.email)}`
    : `name-service:${normalizeKey(person.name)}|${person.serviceLines.map(normalizeKey).sort().join("|")}`;
}

function getHeadshotUrl(name, prefix = "") {
  const filename = headshotFilenameOverrides[name] || `${name}.jpg`;
  return `${prefix}assets/images/headshots/${encodeURIComponent(filename)}`;
}

function prepareEmployees(rows) {
  const byKey = new Map();
  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const person = {
      name: clean(row.name),
      title: clean(row.title),
      serviceLines: [...new Set((Array.isArray(row.serviceLines) ? row.serviceLines : []).map(clean).filter(Boolean))],
      location: clean(row.location),
      email: clean(row.email),
      linkedin: clean(row.linkedin)
    };
    if (!person.name) return;
    const key = employeeKey(person);
    if (!byKey.has(key)) byKey.set(key, person);
  });
  return [...byKey.values()];
}

function buildOutlookMeetingUrl(person) {
  const params = new URLSearchParams({
    to: person.email,
    subject: `Coffee Chat with ${person.name}`
  });
  return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`;
}

const people = prepareEmployees(window.CONNECT_HUB_EMPLOYEES);
window.ConnectHubData = { people, employeeKey, getHeadshotUrl, normalizeKey, buildOutlookMeetingUrl };
