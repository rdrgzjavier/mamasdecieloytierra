import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const indexed = [
  "index.html",
  "el-programa/index.html",
  "sobre-mi/index.html",
  "blog/index.html",
  "contacto/index.html",
];
const noindex = [
  "aviso-legal/index.html",
  "politica-privacidad/index.html",
];
const all = [...indexed, ...noindex];
const problems = [];
const canonicalOrigin = "https://mamasdecieloytierra.com";

function count(text, pattern) {
  return (text.match(pattern) || []).length;
}

for (const file of all) {
  const html = await readFile(join(root, file), "utf8");
  const checks = [
    ["title", /<title>/g],
    ["description", /<meta name="description"/g],
    ["robots", /<meta name="robots"/g],
    ["canonical", /<link rel="canonical"/g],
    ["Open Graph title", /<meta property="og:title"/g],
    ["Open Graph description", /<meta property="og:description"/g],
    ["Open Graph image", /<meta property="og:image"/g],
    ["JSON-LD", /<script type="application\/ld\+json">/g],
  ];
  for (const [label, pattern] of checks) {
    if (count(html, pattern) !== 1) problems.push(`${file}: expected one ${label}`);
  }
  const json = html.match(
    /<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/,
  );
  if (json) {
    try {
      JSON.parse(json[1]);
    } catch {
      problems.push(`${file}: invalid JSON-LD`);
    }
  }
  if (html.includes("https://www.mamasdecieloytierra.com")) {
    problems.push(`${file}: www canonical URLs are not allowed`);
  }
  if (!html.includes(canonicalOrigin)) {
    problems.push(`${file}: canonical origin missing`);
  }
  if (indexed.includes(file) && html.includes('content="noindex')) {
    problems.push(`${file}: indexable page marked noindex`);
  }
  if (noindex.includes(file) && !html.includes('content="noindex, follow"')) {
    problems.push(`${file}: legal page must be noindex, follow`);
  }
}

const sitemap = await readFile(join(root, "sitemap.xml"), "utf8");
for (const file of indexed) {
  const suffix = file === "index.html" ? "/" : `/${file.replace("index.html", "")}`;
  if (!sitemap.includes(`<loc>https://mamasdecieloytierra.com${suffix}</loc>`)) {
    problems.push(`sitemap.xml: missing ${suffix}`);
  }
}
for (const file of noindex) {
  const suffix = `/${file.replace("index.html", "")}`;
  if (sitemap.includes(`<loc>https://mamasdecieloytierra.com${suffix}</loc>`)) {
    problems.push(`sitemap.xml: noindex URL included ${suffix}`);
  }
}

const robots = await readFile(join(root, "robots.txt"), "utf8");
if (!robots.includes("Sitemap: https://mamasdecieloytierra.com/sitemap.xml")) {
  problems.push("robots.txt: missing sitemap URL");
}

for (const file of ["llms.txt", "llms-full.txt"]) {
  const content = await readFile(join(root, file), "utf8");
  if (!content.includes("# Mamás de Cielo y Tierra")) {
    problems.push(`${file}: missing project heading`);
  }
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}

console.log(`SEO check passed for ${all.length} pages.`);

