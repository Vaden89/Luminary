// js/articles.js
import { sanityQuery } from './sanity.js'

// ─── Fetch all published articles ────────────────────────────────────────────

export async function fetchPublishedArticles() {
  const query = `
    *[_type == "article" && status == "published"]
    | order(submittedAt desc) {
      _id,
      title,
      "slug": slug.current,
      author,
      excerpt,
      coverImage,
      submittedAt
    }
  `
  return sanityQuery(query)
}


// ─── Fetch a single article by slug ──────────────────────────────────────────

export async function fetchArticleBySlug(slug) {
  const query = `
    *[_type == "article" && slug.current == $slug && status == "published"][0] {
      _id,
      title,
      author,
      body,
      coverImage,
      submittedAt
    }
  `
  return sanityQuery(query, { slug })
}


// ─── Render article cards into a container ───────────────────────────────────

export function renderArticleCards(articles, containerId) {
  const container = document.getElementById(containerId)
  if (!container) return

  if (!articles || articles.length === 0) {
    container.innerHTML = `<p class="no-articles">No articles published yet.</p>`
    return
  }

  container.innerHTML = articles.map(article => `
    <article class="article-card">
      ${article.coverImage
        ? `<img src="${article.coverImage}" alt="${article.title}" class="article-card__image">`
        : ''
      }
      <div class="article-card__content">
        <h2 class="article-card__title">
          <a href="/article.html?slug=${article.slug}">${article.title}</a>
        </h2>
        <p class="article-card__meta">
          By <strong>${article.author}</strong> ·
          ${new Date(article.submittedAt).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
          })}
        </p>
        ${article.excerpt
          ? `<p class="article-card__excerpt">${article.excerpt}</p>`
          : ''
        }
        <a href="/article.html?slug=${article.slug}" class="article-card__link">
          Read more →
        </a>
      </div>
    </article>
  `).join('')
}