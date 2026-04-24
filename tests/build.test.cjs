const fs = require("node:fs");
const assert = require("node:assert");
const path = require("node:path");

const root = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

const html = read("index.html");
assert.match(html, /href="\/styles\.css"/);
assert.match(html, /defer src="\/app\.js"/);
assert.equal(html.split('<script src="https://cdn.tailwindcss.com"></script>').length - 1, 1, "head should have exactly one tailwind cdn");
assert.ok(!html.includes("// Tailwind script"), "inline app script should be external");
const appSrc = read("app.js");
assert.ok(appSrc.length > 1000);
assert.ok(appSrc.includes("DOMContentLoaded"), "app should boot on DOMContentLoaded (reliable on Vercel)");
assert.ok(appSrc.includes("initTailwind"), "tailwind config must be applied");
assert.ok(read("styles.css").includes(".cyber-card"));

process.stdout.write("build sanity ok\n");
