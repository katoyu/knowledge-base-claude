// Markdown のノートを HTML に変換して dist/ に静的サイトを生成する。
// 依存は marked（Markdown→HTML）と gray-matter（フロントマター解析）のみ。
// GitHub Actions から `npm run build` で呼ばれ、出力を GitHub Pages に公開する。

import { readdir, readFile, mkdir, writeFile, cp, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { marked } from "marked";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const NOTES_DIR = path.join(root, "notes");
const TEMPLATES_DIR = path.join(root, "templates");
const ASSETS_DIR = path.join(root, "assets");
const DIST_DIR = path.join(root, "dist");

const config = JSON.parse(await readFile(path.join(root, "config.json"), "utf8"));

marked.setOptions({ gfm: true, breaks: false });

function escapeHtml(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function render(tpl, vars) {
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => (k in vars ? vars[k] : ""));
}

function formatDate(d) {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return String(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function tagsToHtml(tags, base = "") {
  if (!tags || !tags.length) return "";
  return tags
    .map((t) => `<span class="tag">#${escapeHtml(t)}</span>`)
    .join(" ");
}

async function collectNotes(dir) {
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...(await collectNotes(full)));
    else if (e.name.endsWith(".md")) files.push(full);
  }
  return files;
}

async function main() {
  // dist を作り直す
  await rm(DIST_DIR, { recursive: true, force: true });
  await mkdir(DIST_DIR, { recursive: true });

  const pageTpl = await readFile(path.join(TEMPLATES_DIR, "page.html"), "utf8");
  const indexTpl = await readFile(path.join(TEMPLATES_DIR, "index.html"), "utf8");

  const files = await collectNotes(NOTES_DIR);
  const notes = [];

  for (const file of files) {
    const raw = await readFile(file, "utf8");
    const { data, content } = matter(raw);

    const rel = path
      .relative(NOTES_DIR, file)
      .split(path.sep)
      .join("/")
      .replace(/\.md$/, ".html");

    const category = data.category || rel.split("/")[0] || "uncategorized";
    const title = data.title || path.basename(rel, ".html");
    const date = formatDate(data.date);
    const tags = Array.isArray(data.tags) ? data.tags : [];
    const description = data.description || data.question || "";

    const depth = rel.split("/").length - 1;
    const base = "../".repeat(depth);

    const bodyHtml = marked.parse(content);
    const questionHtml = data.question
      ? `<aside class="question"><span class="q-label">質問</span><p>${escapeHtml(
          data.question
        )}</p></aside>`
      : "";

    const html = render(pageTpl, {
      lang: config.lang || "ja",
      siteTitle: escapeHtml(config.title),
      title: escapeHtml(title),
      description: escapeHtml(description),
      category: escapeHtml(category),
      date,
      tags: tagsToHtml(tags),
      question: questionHtml,
      content: bodyHtml,
      base,
      year: new Date().getFullYear(),
    });

    const outPath = path.join(DIST_DIR, rel);
    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(outPath, html, "utf8");

    notes.push({ rel, category, title, date, tags, description });
  }

  // インデックスをカテゴリごとにまとめる
  notes.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  const byCategory = new Map();
  for (const n of notes) {
    if (!byCategory.has(n.category)) byCategory.set(n.category, []);
    byCategory.get(n.category).push(n);
  }

  const categories = [...byCategory.keys()].sort((a, b) => a.localeCompare(b));
  let listHtml = "";
  if (notes.length === 0) {
    listHtml = `<p class="empty">まだノートがありません。Claude Code に「質問〜」と聞いてみてください。</p>`;
  } else {
    for (const cat of categories) {
      const items = byCategory.get(cat);
      listHtml += `<section class="category"><h2 id="${escapeHtml(
        cat
      )}">${escapeHtml(cat)} <span class="count">${items.length}</span></h2><ul class="note-list">`;
      for (const n of items) {
        const search = escapeHtml(
          `${n.title} ${n.description} ${n.tags.join(" ")} ${n.category}`.toLowerCase()
        );
        listHtml += `<li class="note-card" data-search="${search}">
          <a class="note-link" href="${n.rel}">
            <span class="note-card-title">${escapeHtml(n.title)}</span>
            ${n.description ? `<span class="note-card-desc">${escapeHtml(n.description)}</span>` : ""}
          </a>
          <div class="note-card-meta">
            <time>${n.date}</time>
            <span class="tags">${tagsToHtml(n.tags)}</span>
          </div>
        </li>`;
      }
      listHtml += `</ul></section>`;
    }
  }

  const indexHtml = render(indexTpl, {
    lang: config.lang || "ja",
    siteTitle: escapeHtml(config.title),
    description: escapeHtml(config.description || ""),
    content: listHtml,
    count: notes.length,
    year: new Date().getFullYear(),
  });
  await writeFile(path.join(DIST_DIR, "index.html"), indexHtml, "utf8");

  // アセットをコピー
  if (existsSync(ASSETS_DIR)) {
    await cp(ASSETS_DIR, path.join(DIST_DIR, "assets"), { recursive: true });
  }
  // GitHub Pages の Jekyll 処理を無効化（_ 始まりのファイル等をそのまま配信）
  await writeFile(path.join(DIST_DIR, ".nojekyll"), "", "utf8");

  console.log(`✓ built ${notes.length} note(s) into ${path.relative(root, DIST_DIR)}/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
