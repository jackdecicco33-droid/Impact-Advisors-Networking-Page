const practices = window.CONNECT_HUB_PRACTICES || [];
const { people, getHeadshotUrl, normalizeKey } = window.ConnectHubData;
const nav = document.getElementById("practiceNav");
const sections = document.getElementById("practiceSections");

function createPersonCard(person) {
  const card = document.createElement("article"); card.className = "practice-person-card";
  const image = document.createElement("img"); image.src = getHeadshotUrl(person.name, "../"); image.alt = ""; image.addEventListener("error", () => image.remove(), { once: true });
  const copy = document.createElement("div"); const name = document.createElement("h4"); name.textContent = person.name;
  const role = document.createElement("p"); role.textContent = person.title || "Title not listed"; copy.append(name, role); card.append(image, copy); return card;
}

practices.forEach((practice) => {
  const link = document.createElement("a"); link.href = `#${practice.id}`; link.textContent = practice.name; nav.appendChild(link);
  const section = document.createElement("section"); section.id = practice.id; section.className = "practice-section";
  const heading = document.createElement("h2"); heading.textContent = practice.title;
  const content = document.createElement("div"); content.className = "practice-content";
  practice.paragraphs.forEach((text) => { const p = document.createElement("p"); p.textContent = text; content.appendChild(p); });
  const intro = document.createElement("p"); intro.className = "support-intro"; intro.textContent = practice.listIntro;
  const list = document.createElement("ul"); list.className = "support-list"; practice.benefits.forEach((text) => { const li = document.createElement("li"); li.textContent = text; list.appendChild(li); });
  const closing = document.createElement("p"); closing.className = "practice-closing"; closing.textContent = practice.closing;
  const peopleHeading = document.createElement("h3"); peopleHeading.textContent = "People in This Practice";
  const roster = people.filter((person) => person.serviceLines.some((line) => normalizeKey(line) === normalizeKey(practice.rosterKey)));
  const grid = document.createElement("div"); grid.className = "practice-people-grid"; grid.replaceChildren(...roster.map(createPersonCard));
  const empty = document.createElement("p"); empty.className = "muted-message"; empty.textContent = "No colleagues are currently listed for this practice.";
  const back = document.createElement("a"); back.className = "back-to-top"; back.href = "#top"; back.textContent = "Back to top ↑";
  section.append(heading, content, intro, list, closing, peopleHeading, roster.length ? grid : empty, back); sections.appendChild(section);
});
