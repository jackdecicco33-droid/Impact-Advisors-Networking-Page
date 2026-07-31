class ServiceLineOrgChart {
  constructor(container, serviceLineFilter, directory) {
    this.container = container;
    this.serviceLineFilter = serviceLineFilter;
    this.directory = directory;
    this.titleOrder = new Map([
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
  }

  start() {
    this.container.addEventListener("click", (event) => {
      const node = event.target.closest(".org-chart-node");
      if (node) this.scrollToProfile(node.dataset.employeeKey);
    });
    this.serviceLineFilter.addEventListener("change", () => this.update());
    this.update();
  }

  update() {
    const serviceLine = this.serviceLineFilter.value;
    if (!serviceLine) {
      this.container.hidden = true;
      this.container.replaceChildren();
      return;
    }

    const employees = this.directory.people.filter((person) =>
      person.serviceLines.includes(serviceLine)
    );
    if (employees.length === 0) {
      this.container.hidden = true;
      this.container.replaceChildren();
      return;
    }

    if (serviceLine === "Revenue Cycle Managed Services") {
      this.render(serviceLine, this.buildManagedServicesLevels(employees));
      this.container.hidden = false;
      return;
    }

    const groups = new Map();
    employees.forEach((employee) => {
      const title = employee.title || "Title not listed";
      if (!groups.has(title)) groups.set(title, []);
      groups.get(title).push(employee);
    });

    const levels = [...groups.entries()]
      .sort(([titleA], [titleB]) => {
        const rankA = this.titleOrder.get(titleA) ?? 999;
        const rankB = this.titleOrder.get(titleB) ?? 999;
        return rankA - rankB || titleA.localeCompare(titleB);
      })
      .map(([title, people]) => ({
        title,
        employees: people.sort((a, b) => a.name.localeCompare(b.name))
      }));

    this.render(serviceLine, levels);
    this.container.hidden = false;
  }

  buildManagedServicesLevels(employees) {
    const byName = new Map(
      employees.map((employee) => [employee.name.toLowerCase(), employee])
    );
    const find = (name, overrides = {}) => {
      const employee = byName.get(name.toLowerCase());
      return employee ? { ...employee, ...overrides } : null;
    };
    const level = (title, people) => ({
      title,
      employees: people.filter(Boolean)
    });

    return [
      level("President", [find("Wes Arnett")]),
      level("Managing Directors", [
        find("Patrick O'connor", { displayName: "Patrick O’Connor" }),
        find("Christopher McDonald", { displayName: "Chris McDonald" })
      ]),
      level("Senior Vice President", [find("Steve Bernard")]),
      level("Vice Presidents", [
        find("Conyers Poole"),
        find("Darbi Shanker"),
        find("Amber Thomas"),
        find("Danielle Voss"),
        find("Kristin Costanzo")
      ]),
      level("Directors", [
        find("Sarah Angerhofer"),
        find("Teresa Sutton"),
        find("Ryan Gavrilles")
      ]),
      level("Associate Director", [find("Robyn O'Connell")]),
      level("Managing Consultants", [
        find("Andrea Feldmann"),
        find("Corey Armstrong"),
        find("Jenifer Vaught", { displayTitle: "Managing Consultant" })
      ])
    ].filter((item) => item.employees.length > 0);
  }

  render(serviceLine, levels) {
    const titleId = `${this.container.id}Title`;
    this.container.setAttribute("aria-labelledby", titleId);
    this.container.innerHTML = `
      <div class="org-chart-heading">
        <h4 id="${titleId}">${serviceLine} Organizational Chart</h4>
        <p>Explore the ${serviceLine} team by role level.</p>
      </div>
      <div class="org-chart-levels" role="list" aria-label="${serviceLine} role hierarchy">
        ${levels.map((level, index) => this.renderLevel(level, index)).join("")}
      </div>
      <p class="org-chart-note">
        Organized by role level within the ${serviceLine} Practice. Lines indicate practice hierarchy and do not necessarily represent direct reporting relationships.
      </p>
    `;
  }

  renderLevel(level, index) {
    return `
      <section class="org-chart-level org-chart-level-${index + 1}" role="listitem" aria-label="${level.title}">
        <p class="org-chart-level-label">${level.title}</p>
        <div class="org-chart-people">
          ${level.employees.map((employee) => this.renderEmployee(employee)).join("")}
        </div>
      </section>
    `;
  }

  renderEmployee(employee) {
    const displayName = employee.displayName || employee.name;
    const displayTitle = employee.displayTitle || employee.title || "Not listed";
    const initials = displayName
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    const key = this.directory.employeeKey(employee);

    return `
      <button class="org-chart-node" type="button" data-employee-key="${key}" aria-label="View ${displayName}'s profile">
        <span class="org-chart-avatar" aria-hidden="true">
          <span>${initials}</span>
          <img src="${this.directory.getHeadshotUrl(employee.name)}" alt="" onerror="this.remove()" />
        </span>
        <span class="org-chart-name">${displayName}</span>
        <span class="org-chart-title">${displayTitle}</span>
      </button>
    `;
  }

  findProfile(key) {
    return [...document.querySelectorAll("#profilesGrid .profile-card")]
      .find((card) => card.dataset.employeeKey === key);
  }

  scrollToProfile(key) {
    let profile = this.findProfile(key);
    const showMoreButton = document.getElementById("showMoreButton");
    let attempts = 0;

    while (!profile && showMoreButton && !showMoreButton.hidden && attempts < 30) {
      showMoreButton.click();
      profile = this.findProfile(key);
      attempts += 1;
    }
    if (!profile) return;

    document.querySelectorAll(".profile-card.org-chart-target").forEach((card) => {
      card.classList.remove("org-chart-target");
    });
    profile.classList.add("org-chart-target");
    profile.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => profile.classList.remove("org-chart-target"), 1800);
  }
}

const orgChartContainer = document.getElementById("supplyChainOrgChart");
const serviceLineFilter = document.getElementById("serviceLineFilter");

if (orgChartContainer && serviceLineFilter && window.ConnectHubDirectory) {
  new ServiceLineOrgChart(
    orgChartContainer,
    serviceLineFilter,
    window.ConnectHubDirectory
  ).start();
}
