const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
const required = ["index.html", "practices/index.html", "resources/index.html", "assets/data/roster-data.js", "assets/data/practice-data.js", "assets/data/resource-data.js", "assets/js/site-data.js"];
required.forEach((file) => { if (!fs.existsSync(path.join(root, file))) throw new Error(`Missing ${file}`); });
const pages = required.slice(0, 3).map((file) => fs.readFileSync(path.join(root, file), "utf8"));
pages.forEach((html, index) => {
  ["Home", "Practices", "Resources"].forEach((label) => { if (!html.includes(`>${label}<`)) throw new Error(`${required[index]} lacks ${label} navigation`); });
  if (!html.includes('aria-current="page"')) throw new Error(`${required[index]} lacks an active navigation state`);
});
const resourceSource = fs.readFileSync(path.join(root, "assets/data/resource-data.js"), "utf8");
const resources = Function(`const window={};${resourceSource};return window.CONNECT_HUB_RESOURCES;`)();
resources.forEach((resource) => {
  const decoded = decodeURIComponent(resource.path);
  if (!fs.existsSync(path.join(root, decoded))) throw new Error(`Missing resource file: ${decoded}`);
});
console.log(`Validated 3 pages and ${resources.length} resource files.`);
