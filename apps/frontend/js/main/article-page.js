// js/main/article-page.js
import { sanityQuery } from "../cms/sanity.js";

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const formatDate = (value) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

// ── Read slug from URL (?slug=some-article-slug) ──────────────────────────────
const params = new URLSearchParams(window.location.search);
const slug = params.get("slug")?.trim();
const pageExtension = window.location.pathname.endsWith(".html") ? ".html" : "";
const articlePagePath = `./article-page${pageExtension}`;

const articleCard = document.getElementById("articleCard");
const relatedArticles = document.getElementById("relatedArticles");

if (!slug) {
  articleCard.innerHTML = `<p>Article not found.</p>`;
} else {
  try {
    // ── Fetch the article ───────────────────────────────────────────────────
    const article = await sanityQuery(
      `*[_type == "article" && slug.current == $slug && status == "published"][0] {
        title,
        "slug": slug.current,
        author,
        source,
        field,
        body,
        "imageUrl": coverImage.asset->url,
        publicationDate,
        readTime,
        externalUrl,
        sourceType
      }`,
      { slug },
    );

    if (!article) {
      articleCard.innerHTML = `<p>Article not found or not yet published.</p>`;
    } else {
      // ── Update page title ─────────────────────────────────────────────────
      document.title = `${article.title} | Luminary`;

      // ── Render article body ──────────────────────────────────────────────
      // Original content is saved as HTML from the rich-text editor;
      // external/legacy content is plain text split into paragraphs.
      const bodyHtml =
        article.sourceType === "original"
          ? `<div>${article.body ?? ""}</div>`
          : (article.body ?? "")
              .split("\n")
              .filter((line) => line.trim())
              .map((line) => `<p>${escapeHtml(line)}</p>`)
              .join("");

      // ── Build meta line ───────────────────────────────────────────────────
      const metaParts = [
        article.source || article.author,
        article.publicationDate ? formatDate(article.publicationDate) : null,
        article.readTime,
      ].filter(Boolean);

      // ── If external, link out; otherwise render body ──────────────────────
      const contentHtml =
        article.sourceType === "external" && article.externalUrl
          ? `
           <a
             class="spotlight-link"
             href="${escapeHtml(article.externalUrl)}"
             target="_blank"
             rel="noopener noreferrer"
           >
              Read the full article on ${escapeHtml(article.source || "the original site")} ↗
            </a>`
          : bodyHtml;

      articleCard.innerHTML = `
        ${
          article.field
            ? `<div class="tags"><span>${escapeHtml(article.field)}</span></div>`
            : ""
        }

        <h1 class="title">${escapeHtml(article.title)}</h1>

        <div class="meta">${escapeHtml(metaParts.join(" • "))}</div>

        ${
          article.imageUrl
            ? `<img src="${escapeHtml(article.imageUrl)}" alt="${escapeHtml(article.title)}" class="hero" />`
            : ""
        }

        <div class="article-body">
          ${contentHtml}
        </div>
      `;

      // ── Fetch related articles (same field, different slug) ───────────────
      if (article.field) {
        try {
          const related = await sanityQuery(
            `*[_type == "article"
               && status == "published"
               && field == $field
               && slug.current != $slug
             ] | order(publicationDate desc) [0..1] {
              title,
              "slug": slug.current,
              field,
              "imageUrl": coverImage.asset->url,
              publicationDate
            }`,
            { field: article.field, slug },
          );

          if (related && related.length) {
            relatedArticles.innerHTML = related
              .map(
                (rel) => `
              <a class="related" href="${articlePagePath}?slug=${encodeURIComponent(rel.slug)}">
                ${
                  rel.imageUrl
                    ? `<img src="${escapeHtml(rel.imageUrl)}" alt="" />`
                    : ""
                }
                <p>${escapeHtml(rel.title)}</p>
                <span>${escapeHtml(rel.field)} · ${rel.publicationDate ? formatDate(rel.publicationDate) : ""}</span>
              </a>
            `,
              )
              .join("");
          } else {
            relatedArticles.innerHTML = `<p class="roundup-item__meta">No related articles yet.</p>`;
          }
        } catch {
          relatedArticles.innerHTML = "";
        }
      }
    }
  } catch (err) {
    console.error(err);
    articleCard.innerHTML = `<p>Something went wrong loading this article.</p>`;
  }
}
