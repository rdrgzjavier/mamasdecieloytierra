import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const required = [
  "index.html",
  "el-programa/index.html",
  "sobre-mi/index.html",
  "blog/index.html",
  "contacto/index.html",
  "aviso-legal/index.html",
  "politica-privacidad/index.html",
  "assets/site.css",
  "assets/site.js",
  "assets/mamas-cielo-tierra-isotipo.png",
  "assets/hero-background-serene.png",
  "assets/aripa-loop-navy.png",
  "assets/elena-gallo-molto.jpg",
  "sitemap.xml",
  "robots.txt",
  "llms.txt",
  "llms-full.txt",
  "CNAME"
];

for (const file of required) {
  await stat(join(root, file));
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (
      entry.name === ".git" ||
      entry.name === "node_modules" ||
      entry.name === ".codex-checks" ||
      entry.name.startsWith(".chrome-")
    ) {
      continue;
    }
    if (entry.isDirectory()) files.push(...await walk(path));
    else files.push(path);
  }
  return files;
}

const htmlFiles = (await walk(root)).filter((file) => file.endsWith(".html"));
const problems = [];

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  if (!html.includes('lang="es"')) problems.push(`${file}: missing lang`);
  if (!html.includes("assets/site.css")) problems.push(`${file}: missing css`);
  if (html.includes("Supera tu pérdida")) problems.push(`${file}: unsafe promise copy`);
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}

console.log(`Checked ${htmlFiles.length} HTML files and ${required.length} required assets.`);

