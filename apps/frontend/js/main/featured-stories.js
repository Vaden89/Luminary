// js/main/featured-stories.js
import { sanityQuery } from '../cms/sanity.js'

const container = document.getElementById('featuredStories')
if (container) {
  const pageExtension = window.location.pathname.endsWith('.html') ? '.html' : ''
  const articlePage = `./pages/main/article-page${pageExtension}`

  const escapeHtml = (value) =>
    String(value ?? '')
      .replaceAll('&', '&amp;').replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;').replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;')

  try {
    const articles = await sanityQuery(`
      *[_type == "article" && status == "published"]
      | order(publicationDate desc) [0...3] {
        title,
        "slug": slug.current,
        field,
        region,
        source,
        author
      }
    `)

    if (articles.length) {
      container.innerHTML = articles
        .map((a) => {
          const url = `${articlePage}?slug=${encodeURIComponent(a.slug)}`
          return `
            <article>
              <a href="${url}" style="text-decoration:none;color:inherit;display:flex;flex-direction:column;gap:16px;height:100%">
                <h3>${escapeHtml(a.title)}</h3>
                <p>
                  ${a.field ? `<span>${escapeHtml(a.field)}</span>` : ''}
                  ${a.region ? `<span>${escapeHtml(a.region)}</span>` : ''}
                </p>
                <p class="outlet">${escapeHtml(a.source || a.author || '')}</p>
              </a>
            </article>`
        })
        .join('')
    } else {
      container.innerHTML = '<p style="color:#888">No stories published yet.</p>'
    }
  } catch (err) {
    console.error('Failed to load featured stories:', err)
    container.innerHTML = '<p style="color:#888">Unable to load stories right now.</p>'
  }
}
