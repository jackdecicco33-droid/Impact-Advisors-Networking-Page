const resources = window.CONNECT_HUB_RESOURCES || [];
const container = document.getElementById("resourceCategories");
const categories = [...new Set(resources.map((resource) => resource.category))];
categories.forEach((category) => {
  const section = document.createElement("section"); section.className = "resource-category";
  const heading = document.createElement("h2"); heading.textContent = category;
  const grid = document.createElement("div"); grid.className = "resource-grid";
  resources.filter((resource) => resource.category === category).forEach((resource) => {
    const card = document.createElement("article"); card.className = "resource-card";
    const type = document.createElement("span"); type.className = "resource-type"; type.textContent = resource.type;
    const title = document.createElement("h3"); title.textContent = resource.title;
    const description = document.createElement("p"); description.textContent = resource.description;
    const link = document.createElement("a"); link.className = "action-btn primary inline-action"; link.href = `../${resource.path}`; link.target = "_blank"; link.rel = "noopener noreferrer"; link.setAttribute("aria-label", resource.ariaLabel); link.textContent = resource.buttonText;
    card.append(type, title, description, link); grid.appendChild(card);
  });
  section.append(heading, grid); container.appendChild(section);
});
