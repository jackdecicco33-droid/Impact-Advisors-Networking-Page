const resources = window.CONNECT_HUB_RESOURCES || [];
const container = document.getElementById("resourceCategories");
const list = document.createElement("div");
list.className = "resource-featured-list";

resources.forEach((resource) => {
  const card = document.createElement("a");
  card.className = "featured-resource-card";
  card.href = `../${resource.path}`;
  card.target = "_blank";
  card.rel = "noopener noreferrer";
  card.setAttribute("aria-label", resource.ariaLabel);

  const icon = document.createElement("span");
  icon.className = "featured-resource-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.innerHTML = '<svg viewBox="0 0 24 24" focusable="false"><path d="M6 2.75h8l4 4v14.5H6z"></path><path d="M14 2.75v4h4M8.75 11h6.5M8.75 14h6.5M8.75 17h4.25"></path></svg><span>PDF</span>';

  const copy = document.createElement("span");
  copy.className = "featured-resource-copy";
  const label = document.createElement("span"); label.className = "featured-resource-label"; label.textContent = resource.label;
  const title = document.createElement("span"); title.className = "featured-resource-title"; title.textContent = resource.title;
  const description = document.createElement("span"); description.className = "featured-resource-description"; description.textContent = resource.description;
  copy.append(label, title, description);

  const button = document.createElement("span");
  button.className = "featured-resource-button";
  button.setAttribute("aria-hidden", "true");
  button.textContent = resource.buttonText;
  card.append(icon, copy, button);
  list.appendChild(card);
});

container.replaceChildren(list);
