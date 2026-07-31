const fs = require("fs");
const path = require("path");

const directoryPath = path.join(__dirname, "..", "directory.js");
const source = fs.readFileSync(directoryPath, "utf8");
const contentEnd = source.indexOf("\nfunction clean");

if (contentEnd < 0) {
  throw new Error("Could not locate the service-line content block in directory.js.");
}

const declarations = source.slice(0, contentEnd);
const content = Function(`${declarations}\nreturn serviceLineInfoContent;`)();
const countWords = (value) =>
  (value.match(/[A-Za-z0-9]+(?:[’'-][A-Za-z0-9]+)*/g) || []).length;

let hasErrors = false;

Object.entries(content).forEach(([serviceLine, section]) => {
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
  if (!section.listIntro.endsWith("support may include:")) issues.push("must use the standard support-area introduction");

  if (issues.length > 0) {
    hasErrors = true;
    console.error(`${serviceLine}: ${wordCount} words — ${issues.join("; ")}`);
  } else {
    console.log(`${serviceLine}: ${wordCount} words, 2 paragraphs, ${section.benefits.length} bullets`);
  }
});

if (hasErrors) process.exitCode = 1;
