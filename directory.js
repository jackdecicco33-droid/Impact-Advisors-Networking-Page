const PAGE_SIZE = 9;
const titleRank = new Map([
  ["President", 0], ["Senior Vice President", 1], ["Vice President", 2],
  ["Managing Director", 3], ["Director", 4], ["Associate Director", 5],
  ["Managing Consultant", 6], ["Senior Consultant", 7], ["Consultant", 8], ["Analyst", 9]
]);
const serviceLineLabels = new Map([
  ["Revenu Cycle Margin Improvement - Oracle Health", "RCMI - Oracle Health"]
]);

const { people, employeeKey, getHeadshotUrl, buildOutlookMeetingUrl } = window.ConnectHubData;
let visibleCount = PAGE_SIZE;

const els = {
  peopleSection: document.getElementById("people"),
  searchInput: document.getElementById("searchInput"),
  serviceLineFilter: document.getElementById("serviceLineFilter"),
  titleFilter: document.getElementById("titleFilter"),
  locationFilter: document.getElementById("locationFilter"),
  resultsCount: document.getElementById("resultsCount"),
  profilesGrid: document.getElementById("profilesGrid"),
  directoryControls: document.getElementById("directoryControls"),
  showMoreButton: document.getElementById("showMoreButton"),
  showLessButton: document.getElementById("showLessButton"),
  noResults: document.getElementById("noResults"),
  heroTotalPeople: document.getElementById("heroTotalPeople"),
  heroTotalServiceLines: document.getElementById("heroTotalServiceLines"),
  heroTotalLocations: document.getElementById("heroTotalLocations")
};

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function displayServiceLine(value) {
  return serviceLineLabels.get(value) || value;
}

function populateSelect(select, values, allLabel, displayValue = (value) => value) {
  select.replaceChildren(new Option(allLabel, ""));
  uniqueSorted(values).forEach((value) => select.add(new Option(displayValue(value), value)));
}

function getFilteredPeople() {
  const term = els.searchInput.value.trim().toLowerCase();
  const serviceLine = els.serviceLineFilter.value;
  const title = els.titleFilter.value;
  const location = els.locationFilter.value;
  return people.filter((person) => {
    const blob = [person.name, person.title, ...person.serviceLines, ...person.serviceLines.map(displayServiceLine), person.location, person.email, person.linkedin].join(" ").toLowerCase();
    return (!term || blob.includes(term)) &&
      (!serviceLine || person.serviceLines.includes(serviceLine)) &&
      (!title || person.title === title) &&
      (!location || person.location === location);
  }).sort((a, b) => {
    if (serviceLine) {
      const difference = (titleRank.get(a.title) ?? 999) - (titleRank.get(b.title) ?? 999);
      if (difference) return difference;
    }
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });
}

function initialsFromName(name) {
  return name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

function appendDetailTags(details, label, values, className) {
  const term = document.createElement("dt");
  term.textContent = label;
  const description = document.createElement("dd");
  const populated = values.filter(Boolean);
  if (!populated.length) description.textContent = "Not listed";
  populated.forEach((value) => {
    const tag = document.createElement("span");
    tag.className = `profile-tag ${className}${label === "Service Line" ? " profile-tag-single-line" : ""}`;
    tag.textContent = label === "Service Line" ? displayServiceLine(value) : value;
    description.appendChild(tag);
  });
  details.append(term, description);
}

function createContactRow(label, value, href, external = false) {
  const row = document.createElement("div");
  row.className = "contact-row";
  const rowLabel = document.createElement("span");
  rowLabel.textContent = label;
  const content = document.createElement(value ? "a" : "span");
  content.className = value ? "profile-link" : "profile-link muted-link";
  content.textContent = value ? (label === "LinkedIn" ? "LinkedIn" : value) : "Not listed";
  if (value) content.href = href;
  if (value && external) { content.target = "_blank"; content.rel = "noopener noreferrer"; }
  row.append(rowLabel, content);
  return row;
}

function createProfileCard(person) {
  const card = document.createElement("article");
  card.className = "profile-card";
  card.dataset.employeeKey = employeeKey(person);
  const top = document.createElement("div");
  top.className = "profile-top";
  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.setAttribute("aria-hidden", "true");
  avatar.textContent = initialsFromName(person.name);
  const image = document.createElement("img");
  image.src = getHeadshotUrl(person.name);
  image.alt = "";
  image.addEventListener("error", () => image.remove(), { once: true });
  avatar.appendChild(image);
  const heading = document.createElement("div");
  const name = document.createElement("h4");
  name.className = "name";
  name.textContent = person.name;
  const role = document.createElement("p");
  role.className = "role";
  role.textContent = person.title || "Not listed";
  heading.append(name, role);
  top.append(avatar, heading);
  const details = document.createElement("dl");
  details.className = "profile-details";
  appendDetailTags(details, "Service Line", person.serviceLines, "tag-blue");
  appendDetailTags(details, "Location", [person.location], "tag-green");
  const contacts = document.createElement("div");
  contacts.className = "contact-links";
  contacts.append(createContactRow("LinkedIn", person.linkedin, person.linkedin, true), createContactRow("Email", person.email, `mailto:${person.email}`));
  const actions = document.createElement("div");
  actions.className = "card-actions";
  if (person.linkedin || person.email) {
    const connect = document.createElement("a");
    connect.className = "action-btn primary";
    connect.textContent = "Connect";
    connect.href = person.linkedin || `mailto:${person.email}`;
    if (person.linkedin) { connect.target = "_blank"; connect.rel = "noopener noreferrer"; }
    actions.appendChild(connect);
  }
  if (person.email) {
    const schedule = document.createElement("a");
    schedule.className = "action-btn secondary";
    schedule.textContent = "Schedule a Meeting";
    schedule.href = buildOutlookMeetingUrl(person);
    schedule.target = "_blank";
    schedule.rel = "noopener noreferrer";
    schedule.setAttribute("aria-label", `Schedule a meeting with ${person.name}`);
    actions.appendChild(schedule);
  }
  card.append(top, details, contacts, actions);
  return card;
}

function renderProfiles() {
  const filtered = getFilteredPeople();
  const visible = filtered.slice(0, visibleCount);
  els.resultsCount.textContent = `Showing ${visible.length} of ${filtered.length} people`;
  els.profilesGrid.replaceChildren(...visible.map(createProfileCard));
  els.noResults.hidden = Boolean(filtered.length);
  els.showMoreButton.hidden = visibleCount >= filtered.length;
  els.showLessButton.hidden = visibleCount <= PAGE_SIZE;
  els.directoryControls.hidden = els.showMoreButton.hidden && els.showLessButton.hidden;
}

function init() {
  populateSelect(els.serviceLineFilter, people.flatMap((person) => person.serviceLines), "All Service Lines", displayServiceLine);
  populateSelect(els.titleFilter, people.map((person) => person.title), "All Titles");
  populateSelect(els.locationFilter, people.map((person) => person.location), "All Locations");
  els.heroTotalPeople.textContent = String(people.length);
  els.heroTotalServiceLines.textContent = String(uniqueSorted(people.flatMap((person) => person.serviceLines)).length);
  els.heroTotalLocations.textContent = String(uniqueSorted(people.map((person) => person.location)).length);
  [els.searchInput, els.serviceLineFilter, els.titleFilter, els.locationFilter].forEach((control) => {
    const update = () => { visibleCount = PAGE_SIZE; renderProfiles(); };
    control.addEventListener("input", update);
    control.addEventListener("change", update);
  });
  els.showMoreButton.addEventListener("click", () => { visibleCount += PAGE_SIZE; renderProfiles(); });
  els.showLessButton.addEventListener("click", () => { visibleCount = PAGE_SIZE; renderProfiles(); els.peopleSection.scrollIntoView({ behavior: "smooth" }); });
  renderProfiles();
}

init();
