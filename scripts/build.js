"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const output = path.join(root, "docs");
const files = ["index.html", "styles.css", "app.js", "triage.js"];

fs.mkdirSync(output, { recursive: true });
for (const file of files) {
  fs.copyFileSync(path.join(root, file), path.join(output, file));
}
console.log(`Built ${files.length} static app files into docs/.`);
