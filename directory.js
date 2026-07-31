const PAGE_SIZE = 9;
const RCMS_SERVICE_LINE = "Revenue Cycle Managed Services";
const PAYER_SERVICE_LINE = "Health Plan Practice";
const CLINICAL_OPTIMIZATION_SERVICE_LINE = "Clinical Optimization";
const SUPPLY_CHAIN_SERVICE_LINE = "Supply Chain";
const LABOR_SERVICE_LINE = "Labor";
const OPERATIONAL_EXCELLENCE_SERVICE_LINE = "Operational Excellence";
const PHYSICIAN_ENTERPRISE_SERVICE_LINE = "Physician Enterprise Services";
const QUALITY_SERVICE_LINE = "Quality";
const RCMI_ORACLE_HEALTH_SERVICE_LINE = "Revenu Cycle Margin Improvement - Oracle Health";
const RCMI_SERVICE_LINE = "Revenue Cycle Margin Improvement";
const titleRank = new Map([
  ["President", 0],
  ["Senior Vice President", 1],
  ["Vice President", 2],
  ["Managing Director", 3],
  ["Director", 4],
  ["Associate Director", 5],
  ["Managing Consultant", 6],
  ["Senior Consultant", 7],
  ["Consultant", 8],
  ["Analyst", 9]
]);

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

const serviceLineInfoContent = {
  [CLINICAL_OPTIMIZATION_SERVICE_LINE]: {
    title: "What is Clinical Optimization?",
    paragraphs: [
      "Clinical Optimization helps a healthcare organization improve how clinicians deliver, document, and coordinate patient care. Organizations use this service to reduce avoidable work, support safer and more consistent care, and make clinical technology easier to use.",
      "The work spans physicians, nurses, ancillary departments, clinical leaders, information technology teams, and operational staff. It may address electronic health record workflows, documentation practices, patient movement, clinical governance, and the way teams adopt new or existing systems."
    ],
    listIntro: "Clinical Optimization support may include:",
    benefits: [
      "Clinical workflow assessment and standardization",
      "Electronic health record usability and adoption",
      "Documentation improvement and burden reduction",
      "Patient throughput and care coordination",
      "Clinical governance and decision support",
      "Clinical system implementation and upgrade support"
    ],
    closing: "The consulting team helps the healthcare organization align clinical workflows, people, and technology so clinicians can focus more consistently on patient care."
  },
  [RCMS_SERVICE_LINE]: {
    title: "What is Revenue Cycle Managed Services?",
    paragraphs: [
      "Revenue Cycle Managed Services, or RCMS, is a long-term service model in which a healthcare organization partners with an external team to support and manage part or all of its revenue-cycle operations.",
      "The revenue cycle includes the financial and administrative processes that occur from patient scheduling and registration through billing, payment collection, and account follow-up. An RCMS team works alongside the organization’s staff to maintain daily operations, address performance issues, improve key processes, and provide consistent management support."
    ],
    listIntro: "RCMS support may include:",
    benefits: [
      "Scheduling, registration, and insurance verification",
      "Prior authorization and billing",
      "Denial prevention and account follow-up",
      "Patient financial services",
      "Performance reporting and process improvement"
    ],
    closing: "Unlike a traditional consulting engagement that ends after recommendations or implementation, RCMS provides ongoing operational support. The team functions as an extension of the healthcare organization’s revenue-cycle department."
  },
  [PAYER_SERVICE_LINE]: {
    title: "What is Health Plan Practice?",
    paragraphs: [
      "Health Plan Practice helps organizations that finance and administer healthcare coverage improve their products, operations, and relationships with members and providers. Health plans use this service to manage cost, access, quality, compliance, and the experience of receiving coverage.",
      "The work may involve commercial insurers, Medicare and Medicaid programs, provider-sponsored plans, and accountable care organizations. Common areas include health plan products, provider networks, claims, utilization management, payment integrity, care management, data, and core administrative systems."
    ],
    listIntro: "Health Plan Practice support may include:",
    benefits: [
      "Health plan product and market strategy",
      "Provider network and access improvement",
      "Claims, payment integrity, and core operations",
      "Utilization and care management",
      "Value-based care and provider contracting",
      "Quality, compliance, data, and reporting"
    ],
    closing: "The consulting team helps the health plan connect strategy, operations, technology, and data so it can administer coverage responsibly and serve members and providers effectively."
  },
  [SUPPLY_CHAIN_SERVICE_LINE]: {
    title: "What is Supply Chain?",
    paragraphs: [
      "Supply Chain helps a healthcare organization obtain the products, equipment, and services needed to deliver care while managing cost, availability, and supplier performance. Organizations use this service to make informed purchasing decisions and maintain reliable access to essential resources.",
      "The work can span spending analysis, sourcing, contracting, negotiations, inventory, supplier relationships, and product standardization. Consultants consider financial value alongside clinical needs, operational requirements, service levels, and the practical effect of changes on departments that use the products or services."
    ],
    listIntro: "Supply Chain support may include:",
    benefits: [
      "Spend, pricing, and supplier analysis",
      "Strategic sourcing and contract review",
      "Supplier negotiations and relationship management",
      "Inventory and distribution improvement",
      "Product and vendor standardization",
      "Financial opportunity assessment and tracking"
    ],
    closing: "The consulting team helps the healthcare organization balance cost, quality, and operational reliability while strengthening purchasing and supplier-management practices."
  },
  [LABOR_SERVICE_LINE]: {
    title: "What is Labor?",
    paragraphs: [
      "Labor services help a healthcare organization align staffing and workforce resources with patient demand, operational needs, and financial expectations. Organizations use this support to manage one of their largest expenses while maintaining safe care and dependable service.",
      "The work may involve nursing, clinical support, administrative, and shared-service departments across hospitals and ambulatory settings. It considers staffing levels, productivity measures, scheduling practices, overtime, contract labor, span of control, and the operating information leaders use to make workforce decisions."
    ],
    listIntro: "Labor support may include:",
    benefits: [
      "Workforce and staffing assessment",
      "Productivity measurement and reporting",
      "Scheduling and coverage review",
      "Overtime and contract-labor analysis",
      "Department and management structure review",
      "Workforce performance monitoring"
    ],
    closing: "The consulting team helps the healthcare organization establish practical workforce practices that support patient care, employee needs, and responsible overall labor spending."
  },
  [OPERATIONAL_EXCELLENCE_SERVICE_LINE]: {
    title: "What is Operational Excellence?",
    paragraphs: [
      "Operational Excellence helps a healthcare organization improve how work is organized, managed, and carried out across clinical and administrative settings. Organizations use this service to reduce delays and unnecessary variation while creating more reliable experiences for patients, clinicians, and staff.",
      "The work examines processes that cross departments, locations, and roles rather than focusing on a single technology or function. Common areas include patient flow, capacity, handoffs, governance, performance measures, management routines, and the daily processes teams use to identify and resolve operational problems."
    ],
    listIntro: "Operational Excellence support may include:",
    benefits: [
      "Process and workflow assessment",
      "Patient flow and capacity improvement",
      "Performance measurement and management routines",
      "Role, handoff, and governance clarification",
      "Operational standardization across locations",
      "Improvement planning and progress monitoring"
    ],
    closing: "The consulting team helps the healthcare organization build clear, repeatable operating practices that leaders and frontline teams can sustain over time."
  },
  [PHYSICIAN_ENTERPRISE_SERVICE_LINE]: {
    title: "What is Physician Enterprise Services?",
    paragraphs: [
      "Physician Enterprise Services helps a healthcare organization manage and improve its employed or affiliated physician network. Organizations use this service to support accessible, coordinated care while balancing physician needs, patient demand, operating performance, and financial stewardship.",
      "The physician enterprise can include medical groups, ambulatory clinics, service lines, and the administrative functions that support providers. The work may address governance, practice operations, access, scheduling, provider compensation, network development, performance reporting, and coordination between physicians and health-system leadership."
    ],
    listIntro: "Physician Enterprise Services support may include:",
    benefits: [
      "Medical group strategy and governance",
      "Practice operations and performance assessment",
      "Patient access and scheduling improvement",
      "Provider compensation and productivity review",
      "Network and service-line planning",
      "Physician performance reporting"
    ],
    closing: "The consulting team helps the healthcare organization create practical structures and operating practices that support providers, patients, and the long-term performance of the physician enterprise."
  },
  [QUALITY_SERVICE_LINE]: {
    title: "What is Quality?",
    paragraphs: [
      "Quality services help a healthcare organization measure and improve the safety, effectiveness, consistency, and outcomes of patient care. Organizations use this support to understand performance, meet external requirements, reduce preventable harm, and strengthen accountability for improvement.",
      "The work can involve clinical leaders, frontline teams, data specialists, compliance staff, and governing bodies. It may cover quality measures, patient safety events, regulatory reporting, clinical documentation, performance dashboards, improvement governance, and the processes used to turn findings into focused action."
    ],
    listIntro: "Quality support may include:",
    benefits: [
      "Quality measurement and performance reporting",
      "Patient safety and risk reduction",
      "Regulatory and accreditation readiness",
      "Clinical data validation and submission",
      "Improvement governance and accountability",
      "Performance dashboard and action-plan development"
    ],
    closing: "The consulting team helps the healthcare organization build a clear view of care quality and establish practical ways to improve performance and sustain accountability."
  },
  [RCMI_ORACLE_HEALTH_SERVICE_LINE]: {
    title: "What is Revenue Cycle Margin Improvement – Oracle Health?",
    paragraphs: [
      "Revenue Cycle Margin Improvement – Oracle Health helps a healthcare organization improve financial and administrative performance within its Oracle Health revenue-cycle systems and workflows. Organizations use this service when system configuration, work processes, or reporting limitations affect payment, staff efficiency, or the patient financial experience.",
      "The work follows the revenue cycle from scheduling and registration through coding, billing, collections, and account follow-up. It brings together operational leaders, revenue-cycle staff, information technology teams, and system specialists to understand how Oracle Health tools support daily work and where gaps contribute to delay or lost revenue."
    ],
    listIntro: "Revenue Cycle Margin Improvement – Oracle Health support may include:",
    benefits: [
      "Oracle Health workflow and configuration assessment",
      "Scheduling, registration, and charge-process review",
      "Billing, denial, and account follow-up improvement",
      "Revenue-cycle reporting and work-queue review",
      "System adoption and staff workflow support",
      "Financial opportunity measurement and monitoring"
    ],
    closing: "The consulting team helps the healthcare organization align Oracle Health functionality with sound revenue-cycle practices so staff can manage accounts accurately and efficiently."
  },
  [RCMI_SERVICE_LINE]: {
    title: "What is Revenue Cycle Margin Improvement?",
    paragraphs: [
      "Revenue Cycle Margin Improvement helps a healthcare organization strengthen the financial processes that convert patient services into accurate billing and payment. Organizations use this service to identify missed revenue, reduce avoidable delays and rework, and improve the experience of patients and staff.",
      "The work spans patient access, insurance verification, authorization, charge capture, coding, billing, denials, collections, and account follow-up. Consultants review how departments, workflows, technology, and performance measures connect across the revenue cycle to find practical opportunities for better financial and operational results."
    ],
    listIntro: "Revenue Cycle Margin Improvement support may include:",
    benefits: [
      "Patient access and authorization review",
      "Charge capture and coding improvement",
      "Billing and claim-process assessment",
      "Denial prevention and account follow-up",
      "Patient financial services improvement",
      "Revenue-cycle performance reporting"
    ],
    closing: "The consulting team helps the healthcare organization improve revenue-cycle performance while supporting accurate processes, clear accountability, and a more consistent patient financial experience."
  }
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

function getHeadshotUrl(name) {
  const filename = headshotFilenameOverrides[name] || `${name}.jpg`;
  return `assets/images/headshots/${encodeURIComponent(filename)}`;
}

function prepareEmployees(rows) {
  const byKey = new Map();

  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const person = {
      name: clean(row.name),
      title: clean(row.title),
      serviceLines: [...new Set((Array.isArray(row.serviceLines) ? row.serviceLines : [])
        .map(clean)
        .filter(Boolean))],
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

const people = prepareEmployees(window.CONNECT_HUB_EMPLOYEES);
window.ConnectHubDirectory = { people, employeeKey, getHeadshotUrl, normalizeKey };

let visibleCount = PAGE_SIZE;

const els = {
  peopleSection: document.getElementById("people"),
  searchInput: document.getElementById("searchInput"),
  serviceLineFilter: document.getElementById("serviceLineFilter"),
  titleFilter: document.getElementById("titleFilter"),
  resultsCount: document.getElementById("resultsCount"),
  serviceLineInfo: document.getElementById("serviceLineInfo"),
  serviceLineInfoTitle: document.getElementById("serviceLineInfoTitle"),
  serviceLineInfoContent: document.getElementById("serviceLineInfoContent"),
  clinicalOptimizationCaseStudy: document.getElementById("clinicalOptimizationCaseStudy"),
  supplyChainCaseStudy: document.getElementById("supplyChainCaseStudy"),
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

function populateSelect(select, values, allLabel) {
  select.replaceChildren(new Option(allLabel, ""));
  uniqueSorted(values).forEach((value) => select.add(new Option(value, value)));
}

function getSearchBlob(person) {
  return [
    person.name,
    person.title,
    ...person.serviceLines,
    person.location,
    person.email,
    person.linkedin
  ].join(" ").toLowerCase();
}

function getFilteredPeople() {
  const searchTerm = els.searchInput.value.trim().toLowerCase();
  const serviceLine = els.serviceLineFilter.value;
  const title = els.titleFilter.value;

  const filtered = people
    .filter((person) => {
      const matchesSearch = !searchTerm || getSearchBlob(person).includes(searchTerm);
      const matchesService = !serviceLine || person.serviceLines.includes(serviceLine);
      const matchesTitle = !title || person.title === title;
      return matchesSearch && matchesService && matchesTitle;
    });

  return filtered.sort((a, b) => {
    if (serviceLine) {
      const rankDifference = (titleRank.get(a.title) ?? 999) - (titleRank.get(b.title) ?? 999);
      if (rankDifference !== 0) return rankDifference;
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

  const populatedValues = values.filter(Boolean);
  if (populatedValues.length === 0) {
    description.textContent = "Not listed";
  } else {
    populatedValues.forEach((value) => {
      const tag = document.createElement("span");
      tag.className = `profile-tag ${className}`;
      if (value === RCMI_SERVICE_LINE) tag.classList.add("profile-tag-single-line");
      tag.textContent = value;
      description.appendChild(tag);
    });
  }
  details.append(term, description);
}

function createContactRow(label, value, href, options = {}) {
  const row = document.createElement("div");
  row.className = "contact-row";
  const rowLabel = document.createElement("span");
  rowLabel.textContent = label;

  if (!value) {
    const empty = document.createElement("span");
    empty.className = "profile-link muted-link";
    empty.textContent = "Not listed";
    row.append(rowLabel, empty);
    return row;
  }

  const link = document.createElement("a");
  link.className = "profile-link";
  link.href = href;
  link.textContent = options.linkText || value;
  if (options.external) {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }
  row.append(rowLabel, link);
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
  const title = document.createElement("p");
  title.className = "role";
  title.textContent = person.title || "Not listed";
  heading.append(name, title);
  top.append(avatar, heading);

  const details = document.createElement("dl");
  details.className = "profile-details";
  appendDetailTags(details, "Service Line", person.serviceLines, "tag-blue");
  appendDetailTags(details, "Location", [person.location], "tag-green");

  const contacts = document.createElement("div");
  contacts.className = "contact-links";
  contacts.append(
    createContactRow("LinkedIn", person.linkedin, person.linkedin, {
      external: true,
      linkText: "LinkedIn"
    }),
    createContactRow("Email", person.email, person.email ? `mailto:${person.email}` : "")
  );

  const actions = document.createElement("div");
  actions.className = "card-actions";
  if (person.linkedin || person.email) {
    const connect = document.createElement("a");
    connect.className = "action-btn primary";
    connect.textContent = "Connect";
    connect.href = person.linkedin || `mailto:${person.email}`;
    if (person.linkedin) {
      connect.target = "_blank";
      connect.rel = "noopener noreferrer";
    }
    actions.appendChild(connect);
  }

  card.append(top, details, contacts, actions);
  return card;
}

function renderServiceLineInfo() {
  const selected = els.serviceLineFilter.value;
  const content = serviceLineInfoContent[selected];
  els.serviceLineInfo.hidden = !content;
  if (els.clinicalOptimizationCaseStudy) {
    els.clinicalOptimizationCaseStudy.hidden = selected !== CLINICAL_OPTIMIZATION_SERVICE_LINE;
  }
  if (els.supplyChainCaseStudy) {
    els.supplyChainCaseStudy.hidden = selected !== SUPPLY_CHAIN_SERVICE_LINE;
  }
  if (!content) return;

  els.serviceLineInfoTitle.textContent = content.title;
  els.serviceLineInfoContent.replaceChildren();
  content.paragraphs.forEach((text) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    els.serviceLineInfoContent.appendChild(paragraph);
  });

  const intro = document.createElement("p");
  intro.textContent = content.listIntro;
  const list = document.createElement("ul");
  content.benefits.forEach((text) => {
    const item = document.createElement("li");
    item.textContent = text;
    list.appendChild(item);
  });
  const closing = document.createElement("p");
  closing.className = "service-line-info-closing";
  closing.textContent = content.closing;
  els.serviceLineInfoContent.append(intro, list, closing);
}

function renderProfiles() {
  const filtered = getFilteredPeople();
  const visiblePeople = filtered.slice(0, visibleCount);
  els.resultsCount.textContent = `Showing ${visiblePeople.length} of ${filtered.length} people`;
  els.profilesGrid.replaceChildren(...visiblePeople.map(createProfileCard));
  els.noResults.hidden = filtered.length > 0;
  els.showMoreButton.hidden = visibleCount >= filtered.length;
  els.showLessButton.hidden = visibleCount <= PAGE_SIZE;
  els.directoryControls.hidden = els.showMoreButton.hidden && els.showLessButton.hidden;
  renderServiceLineInfo();
}

function init() {
  populateSelect(
    els.serviceLineFilter,
    people.flatMap((person) => person.serviceLines),
    "All Service Lines"
  );
  populateSelect(els.titleFilter, people.map((person) => person.title), "All Titles");

  els.heroTotalPeople.textContent = String(people.length);
  els.heroTotalServiceLines.textContent = String(
    uniqueSorted(people.flatMap((person) => person.serviceLines)).length
  );
  els.heroTotalLocations.textContent = String(
    uniqueSorted(people.map((person) => person.location)).length
  );

  [els.searchInput, els.serviceLineFilter, els.titleFilter].forEach((control) => {
    const resetAndRender = () => {
      visibleCount = PAGE_SIZE;
      renderProfiles();
    };
    control.addEventListener("input", resetAndRender);
    control.addEventListener("change", resetAndRender);
  });

  els.showMoreButton.addEventListener("click", () => {
    visibleCount += PAGE_SIZE;
    renderProfiles();
  });
  els.showLessButton.addEventListener("click", () => {
    visibleCount = PAGE_SIZE;
    renderProfiles();
    els.peopleSection.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  renderProfiles();
}

init();
