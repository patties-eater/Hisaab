const fs = require("fs");
const path = require("path");
const vm = require("vm");

const rootDir = path.resolve(__dirname, "..");
const ignoredDirs = new Set(["node_modules", ".git", ".vs", ".sixth"]);

function collectJavaScriptFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (ignoredDirs.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectJavaScriptFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".js")) {
      files.push(fullPath);
    }
  }

  return files;
}

const files = collectJavaScriptFiles(rootDir);

for (const filePath of files) {
  const source = fs.readFileSync(filePath, "utf8");

  try {
    new vm.Script(source, { filename: filePath });
  } catch (error) {
    console.error(`Build check failed in ${path.relative(rootDir, filePath)}`);
    throw error;
  }
}

console.log(`Build check passed for ${files.length} JavaScript file(s).`);
