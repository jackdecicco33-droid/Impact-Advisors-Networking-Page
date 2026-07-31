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
  const card = document.createElement("article"); card.className = "practice-profile-card";
  const header = document.createElement("div"); header.className = "practice-profile-header";
  const copy = document.createElement("div"); const name = document.createElement("h4"); name.textContent = person.name;
  const role = document.createElement("p"); role.textContent = person.title || "Title not listed"; copy.append(name, role); header.append(createAvatar(person, "practice-profile-avatar"), copy);
  const details = document.createElement("p"); details.className = "practice-profile-location"; details.textContent = person.location || "Location not listed";
  const actions = document.createElement("div"); actions.className = "practice-profile-actions";
  if (person.email) {
    const email = document.createElement("a"); email.href = `mailto:${person.email}`; email.textContent = "Email"; email.setAttribute("aria-label", `Email ${person.name}`); actions.appendChild(email);
    const schedule = document.createElement("a"); schedule.href = buildOutlookMeetingUrl(person); schedule.target = "_blank"; schedule.rel = "noopener noreferrer"; schedule.textContent = "Schedule a Meeting"; schedule.setAttribute("aria-label", `Schedule a meeting with ${person.name}`); actions.appendChild(schedule);
  }
  if (person.linkedin) { const linkedin = document.createElement("a"); linkedin.href = person.linkedin; linkedin.target = "_blank"; linkedin.rel = "noopener noreferrer"; linkedin.textContent = "LinkedIn"; linkedin.setAttribute("aria-label", `View ${person.name} on LinkedIn`); actions.appendChild(linkedin); }
  card.append(header, details, actions); return card;
}

function renderPractice(practice) {
  const roster = colleaguesFor(practice);
  const section = document.createElement("section"); section.id = practice.id; section.className = "practice-section practice-single-section";
  const heading = document.createElement("h2"); heading.textContent = practice.title;
  const content = document.createElement("div"); content.className = "practice-content";
  practice.paragraphs.forEach((text) => { const p = document.createElement("p"); p.textContent = text; content.appendChild(p); });
  const intro = document.createElement("p"); intro.className = "support-intro"; intro.textContent = practice.listIntro;
  const list = document.createElement("ul"); list.className = "support-list"; practice.benefits.forEach((text) => { const li = document.createElement("li"); li.textContent = text; list.appendChild(li); });
  const closing = document.createElement("p"); closing.className = "practice-closing"; closing.textContent = practice.closing;
  const orgHeading = document.createElement("h3"); orgHeading.textContent = `${practice.name} Organizational Chart`;
  const peopleHeading = document.createElement("h3"); peopleHeading.textContent = `Everyone in ${practice.name}`;
  const grid = document.createElement("div"); grid.className = "practice-profile-grid"; grid.replaceChildren(...roster.map(createPersonCard));
  const empty = document.createElement("p"); empty.className = "muted-message"; empty.textContent = "No colleagues are currently listed for this practice.";
  section.append(heading, content, intro, list, closing, orgHeading, roster.length ? createOrgChart(roster) : empty.cloneNode(true), peopleHeading, roster.length ? grid : empty);
  sections.replaceChildren(section);
  history.replaceState(null, "", `#${practice.id}`);
}

practices.forEach((practice) => select.add(new Option(practice.name, practice.id)));
const initialId = location.hash.slice(1);
if (practices.some((practice) => practice.id === initialId)) select.value = initialId;
select.addEventListener("change", () => renderPractice(practices.find((practice) => practice.id === select.value)));
renderPractice(practices.find((practice) => practice.id === select.value) || practices[0]);
