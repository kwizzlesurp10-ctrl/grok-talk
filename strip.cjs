const fs = require("node:fs");
const path = require("node:path");

const here = __dirname;
const inputPath = process.argv[2] || path.join(here, "source.html");
const raw = fs.readFileSync(inputPath, "utf8");

const withoutStyle = raw.replace(
  /<style>[\s\S]*?<\/style>\s*/m,
  "    <link rel=\"stylesheet\" href=\"styles.css\" />\n",
);

const withApp = withoutStyle.replace(
  /<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>\s*<script>[\s\S]*?<\/script>\s*(?=[\r\n]*<\/body>)/m,
  "    <script defer src=\"app.js\"></script>\n",
);

const out = path.join(here, "index.html");
fs.writeFileSync(out, withApp, "utf8");
process.stdout.write(`Wrote ${out} (${String(withApp.length)} bytes)\n`);
