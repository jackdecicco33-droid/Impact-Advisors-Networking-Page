const practices = window.CONNECT_HUB_PRACTICES || [];
const { people, getHeadshotUrl, normalizeKey, buildOutlookMeetingUrl } = window.ConnectHubData;
const select = document.getElementById("practiceSelect");
const sections = document.getElementById("practiceSections");
const titleRank = new Map([
  ["President", 0], ["Senior Vice President", 1], ["Vice President", 2],
  ["Managing Director", 3], ["Director", 4], ["Associate Director", 5],
  ["Managing Consultant", 6], ["Senior Consultant", 7], ["Consultant", 8], ["Analyst", 9]
]);

function colleaguesFor(practice) {
  return people.filter((person) => person.serviceLines.some((line) => normalizeKey(line) === normalizeKey(practice.rosterKey)))
    .sort((a, b) => (titleRank.get(a.title) ?? 999) - (titleRank.get(b.title) ?? 999) || a.name.localeCompare(b.name));
}

function createAvatar(person, className) {
  const avatar = document.createElement("div"); avatar.className = className;
  const image = document.createElement("img"); image.src = getHeadshotUrl(person.name, "../"); image.alt = ""; image.addEventListener("error", () => image.remove(), { once: true });
  avatar.appendChild(image); return avatar;
}

function createOrgNode(person) {
  const node = document.createElement("article"); node.className = "practice-org-node";
  const name = document.createElement("strong"); name.textContent = person.name;
  const role = document.createElement("span"); role.textContent = person.title || "Title not listed";
  node.append(createAvatar(person, "practice-org-avatar"), name, role); return node;
}

function createOrgChart(roster) {
  const chart = document.createElement("div"); chart.className = "practice-org-chart";
  const titles = [...new Set(roster.map((person) => person.title || "Other"))]
    .sort((a, b) => (titleRank.get(a) ?? 999) - (titleRank.get(b) ?? 999) || a.localeCompare(b));
  titles.forEach((title) => {
    const level = document.createElement("section"); level.className = "practice-org-level";
    const heading = document.createElement("h4"); heading.textContent = title;
    const nodes = document.createElement("div"); nodes.className = "practice-org-nodes";
    nodes.replaceChildren(...roster.filter((person) => (person.title || "Other") === title).map(createOrgNode));
    level.append(heading, nodes); chart.appendChild(level);
  });
  return chart;
}

function createPersonCard(person) {
  const card = document.createElement("article"); card.className = "profile-card";
  const header = document.createElement("div"); header.className = "profile-top";
  const avatar = document.createElement("div"); avatar.className = "avatar"; avatar.setAttribute("aria-hidden", "true"); avatar.textContent = person.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  const image = document.createElement("img"); image.src = getHeadshotUrl(person.name, "../"); image.alt = ""; image.addEventListener("error", () => image.remove(), { once: true }); avatar.appendChild(image);
  const copy = document.createElement("div"); const name = document.createElement("h4"); name.className = "name"; name.textContent = person.name;
  const role = document.createElement("p"); role.className = "role"; role.textContent = person.title || "Not listed"; copy.append(name, role); header.append(avatar, copy);
  const details = document.createElement("dl"); details.className = "profile-details";
  [["Service Line", person.serviceLines, "tag-blue"], ["Location", [person.location], "tag-green"]].forEach(([label, values, tagClass]) => {
    const term = document.createElement("dt"); term.textContent = label; const description = document.createElement("dd");
    values.filter(Boolean).forEach((value) => { const tag = document.createElement("span"); tag.className = `profile-tag ${tagClass}`; tag.textContent = value; description.appendChild(tag); });
    if (!description.childNodes.length) description.textContent = "Not listed"; details.append(term, description);
  });
  const contacts = document.createElement("div"); contacts.className = "contact-links";
  [["LinkedIn", person.linkedin, person.linkedin, "LinkedIn", true], ["Email", person.email, `mailto:${person.email}`, person.email, false]].forEach(([label, value, href, text, external]) => {
    const row = document.createElement("div"); row.className = "contact-row"; const rowLabel = document.createElement("span"); rowLabel.textContent = label;
    const content = document.createElement(value ? "a" : "span"); content.className = value ? "profile-link" : "profile-link muted-link"; content.textContent = value ? text : "Not listed";
    if (value) content.href = href; if (value && external) { content.target = "_blank"; content.rel = "noopener noreferrer"; } row.append(rowLabel, content); contacts.appendChild(row);
  });
  const actions = document.createElement("div"); actions.className = "card-actions";
  if (person.linkedin || person.email) { const connect = document.createElement("a"); connect.className = "action-btn primary"; connect.href = person.linkedin || `mailto:${person.email}`; connect.textContent = "Connect"; if (person.linkedin) { connect.target = "_blank"; connect.rel = "noopener noreferrer"; } actions.appendChild(connect); }
  if (person.email) {
    const schedule = document.createElement("a"); schedule.className = "action-btn secondary"; schedule.href = buildOutlookMeetingUrl(person); schedule.target = "_blank"; schedule.rel = "noopener noreferrer"; schedule.textContent = "Schedule a Meeting"; schedule.setAttribute("aria-label", `Schedule a meeting with ${person.name}`); actions.appendChild(schedule);
  }
  card.append(header, details, contacts, actions); return card;
}

function renderPractice(practice) {
  const roster = colleaguesFor(practice);
  const section = document.createElement("section"); section.id = practice.id; section.className = "practice-section practice-single-section";
  const overviewPanel = document.createElement("div"); overviewPanel.className = "practice-content-panel practice-overview-panel";
  const heading = document.createElement("h2"); heading.textContent = practice.title;
  const content = document.createElement("div"); content.className = "practice-content";
  practice.paragraphs.forEach((text) => { const p = document.createElement("p"); p.textContent = text; content.appendChild(p); });
  const intro = document.createElement("p"); intro.className = "support-intro"; intro.textContent = practice.listIntro;
  const list = document.createElement("ul"); list.className = "support-list"; practice.benefits.forEach((text) => { const li = document.createElement("li"); li.textContent = text; list.appendChild(li); });
  const closing = document.createElement("p"); closing.className = "practice-closing"; closing.textContent = practice.closing;
  const orgPanel = document.createElement("div"); orgPanel.className = "practice-content-panel practice-org-panel";
  const peopleHeading = document.createElement("h3"); peopleHeading.textContent = `Everyone in ${practice.name}`;
  const peoplePanel = document.createElement("div"); peoplePanel.className = "practice-content-panel practice-people-panel";
  const grid = document.createElement("div"); grid.className = "profiles-grid practice-roster-grid"; grid.replaceChildren(...roster.map(createPersonCard));
  const empty = document.createElement("p"); empty.className = "muted-message"; empty.textContent = "No colleagues are currently listed for this practice.";
  overviewPanel.append(heading, content, intro, list, closing);
  orgPanel.append(roster.length ? createOrgChart(roster) : empty.cloneNode(true));
  peoplePanel.append(peopleHeading, roster.length ? grid : empty);
  section.append(overviewPanel, orgPanel, peoplePanel);
  sections.replaceChildren(section);
  history.replaceState(null, "", `#${practice.id}`);
}

practices.forEach((practice) => select.add(new Option(practice.name, practice.id)));
const initialId = location.hash.slice(1);
if (practices.some((practice) => practice.id === initialId)) select.value = initialId;
select.addEventListener("change", () => renderPractice(practices.find((practice) => practice.id === select.value)));
renderPractice(practices.find((practice) => practice.id === select.value) || practices[0]);
