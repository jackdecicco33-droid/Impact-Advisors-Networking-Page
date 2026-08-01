const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "..", "assets", "data", "practice-data.js");
const source = fs.readFileSync(dataPath, "utf8");
const content = Function(`const window = {};\n${source}\nreturn window.CONNECT_HUB_PRACTICES;`)();
const countWords = (value) =>
  (value.match(/[A-Za-z0-9]+(?:[’'-][A-Za-z0-9]+)*/g) || []).length;

let hasErrors = false;

content.forEach((section) => {
  const serviceLine = section.name;
  const text = [
    section.title,
    ...section.paragraphs,
    section.listIntro,
    ...section.benefits,
    section.closing
  ].join(" ");
  const wordCount = countWords(text);
  const issues = [];

  if (section.paragraphs.length !== 2) issues.push("must have exactly 2 opening/supporting paragraphs");
  if (section.benefits.length < 4 || section.benefits.length > 6) issues.push("must have 4–6 bullets");
  if (wordCount < 130 || wordCount > 190) issues.push("must contain 130–190 words");
  if (!section.title.startsWith("What is ") || !section.title.endsWith("?")) issues.push("must use a ‘What is …?’ heading");
  if (!section.listIntro.endsWith("services may include:")) issues.push("must use the standard services introduction");

  if (issues.length > 0) {
    hasErrors = true;
    console.error(`${serviceLine}: ${wordCount} words — ${issues.join("; ")}`);
  } else {
    console.log(`${serviceLine}: ${wordCount} words, 2 paragraphs, ${section.benefits.length} bullets`);
  }
});

if (hasErrors) process.exitCode = 1;
