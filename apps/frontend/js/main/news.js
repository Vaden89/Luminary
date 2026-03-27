// js/main/news.js
import { sanityQuery } from '../cms/sanity.js'

window.addEventListener('DOMContentLoaded', async () => {

  const pageExtension = window.location.pathname.endsWith('.html') ? '.html' : ''
  const articleDetailPage = `./article-page${pageExtension}`
  const MAX_GRID_ITEMS    = 4

  const fieldFilter        = document.getElementById('fieldFilter')
  const regionFilter       = document.getElementById('regionFilter')
  const timeFilter         = document.getElementById('timeFilter')
  const filtersForm        = document.getElementById('newsFilters')
  const clearFiltersButton = document.getElementById('clearFiltersButton')
  const featuredTitle      = document.getElementById('featuredArticleTitle')
  const featuredSummary    = document.getElementById('featuredArticleSummary')
  const featuredMeta       = document.getElementById('featuredArticleMeta')
  const featuredLink       = document.getElementById('featuredArticleLink')
  const featuredImage      = document.getElementById('featuredArticleImage')
  const featuredField      = document.getElementById('featuredArticleField')
  const newsGrid           = document.getElementById('newsGrid')
  const roundupList        = document.getElementById('roundupList')
  const resultsSummary     = document.getElementById('resultsSummary')
  const emptyState         = document.getElementById('emptyState')
  const featuredLinkLabel  = featuredLink.textContent

  const apiBase = (document.body.dataset.apiBase || '').replace(/\/$/, '')

  const state = { field: 'all', region: 'all', time: 'all' }

  const getCategoryLabel = (category) => {
    if (typeof category === 'string') return category.trim()
    const label = [
      category?.name, category?.title, category?.label,
      category?.field, category?.value, category?.slug
    ].find((v) => typeof v === 'string' && v.trim())
    return label ? label.trim() : ''
  }

  const fetchCategories = async () => {
    const endpoint = apiBase ? `${apiBase}/categories` : '/api/categories'
    try {
      const res = await fetch(endpoint, { headers: { Accept: 'application/json' } })
      const result = await res.json().catch(() => ({}))
      if (!res.ok || !result.success) throw new Error()
      const categories = Array.isArray(result.data) ? result.data : []
      categories.forEach((cat) => {
        const label = getCategoryLabel(cat)
        if (!label) return
        const opt = document.createElement('option')
        opt.value = label
        opt.textContent = label
        fieldFilter.append(opt)
      })
    } catch {
      // Fallback: populate from article data
      const fields = [...new Set(browseableArticles.map((a) => a.field).filter(Boolean))].sort()
      fields.forEach((f) => {
        const opt = document.createElement('option')
        opt.value = f
        opt.textContent = f
        fieldFilter.append(opt)
      })
    }
  }

  const escapeHtml = (value) =>
    String(value ?? '')
      .replaceAll('&', '&amp;').replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;').replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;')

  const formatDate = (value) =>
    new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    }).format(new Date(value))

  const getDaysAgo = (value) => {
    const msPerDay = 1000 * 60 * 60 * 24
    return Math.floor((Date.now() - new Date(value)) / msPerDay)
  }

  const matchesTimeRange = (articleDate, range) => {
    if (range === 'all') return true
    const age = getDaysAgo(articleDate)
    if (range === 'last-7')  return age <= 7
    if (range === 'last-30') return age <= 30
    if (range === 'last-90') return age <= 90
    if (range === 'this-year')
      return new Date(articleDate).getFullYear() === new Date().getFullYear()
    return true
  }

  const buildArticleUrl = (slug) =>
    `${articleDetailPage}?slug=${encodeURIComponent(String(slug).trim())}`

  const disableFeaturedLink = () => {
    featuredLink.href = '#'
    featuredLink.textContent = featuredLinkLabel
    featuredLink.setAttribute('aria-disabled', 'true')
  }

  const enableFeaturedLink = (slug) => {
    if (!slug) {
      disableFeaturedLink()
      return
    }

    featuredLink.href = buildArticleUrl(slug)
    featuredLink.textContent = featuredLinkLabel
    featuredLink.setAttribute('aria-disabled', 'false')
  }

  featuredLink.addEventListener('click', (event) => {
    if (featuredLink.getAttribute('aria-disabled') === 'true') {
      event.preventDefault()
    }
  })

  // ── Fetch from Sanity ──────────────────────────────────────────────────────
  // GROQ aliases map Sanity field names → the shape of our render functions
  let articles = []
  disableFeaturedLink()

  try {
    const query = `
      *[_type == "article" && status == "published"]
      | order(publicationDate desc) {
        "id": _id,
        title,
        "slug": slug.current,
        author,
        source,
        "summary": excerpt,
        field,
        region,
        readTime,
        "imageUrl": coverImage.asset->url,
        featured,
        "date": publicationDate,
        externalUrl,
        sourceType
      }
    `
    articles = await sanityQuery(query)
  } catch (err) {
    console.error('Failed to load articles:', err)
    newsGrid.innerHTML = `<p class="news-empty__copy">
      Unable to load articles right now. Please try again later.
    </p>`
    return
  }

  // ── Everything below is your original logic — untouched ───────────────────

  const featuredArticle    = articles.find((a) => a.featured) || articles[0]
  const browseableArticles = articles.filter((a) => a.id !== featuredArticle?.id)

  const getFilteredArticles = () =>
    browseableArticles
      .filter((article) => {
        const matchesField  = state.field  === 'all' || article.field  === state.field
        const matchesRegion = state.region === 'all' || article.region === state.region
        const matchesTime   = matchesTimeRange(article.date, state.time)
        return matchesField && matchesRegion && matchesTime
      })
      .sort((l, r) => new Date(r.date) - new Date(l.date))

  const renderFeatured = () => {
    if (!featuredArticle) {
      disableFeaturedLink()
      return
    }
    featuredTitle.textContent   = featuredArticle.title
    featuredSummary.textContent = featuredArticle.summary
    featuredMeta.innerHTML = [
      featuredArticle.author,
      featuredArticle.source,
      formatDate(featuredArticle.date)
    ]
      .filter(Boolean)
      .map((item) => `<span>${escapeHtml(item)}</span>`)
      .join('')
    enableFeaturedLink(featuredArticle.slug)
    featuredImage.src       = featuredArticle.imageUrl || ''
    featuredImage.alt       = featuredArticle.title
    featuredField.textContent = featuredArticle.field || ''
  }

  const renderCards = (filteredArticles) => {
    newsGrid.innerHTML = filteredArticles
      .slice(0, MAX_GRID_ITEMS)
      .map((article) => `
        <article class="story-card">
          <a class="story-card__link" href="${buildArticleUrl(article.slug)}">
            <div class="story-card__media">
              <img
                class="story-card__image"
                src="${escapeHtml(article.imageUrl || '')}"
                alt=""
                loading="lazy"
                decoding="async"
              />
              <span class="story-card__tag">${escapeHtml(article.field)}</span>
            </div>
            <div class="story-card__body">
              <div class="story-card__meta">
                <span>${escapeHtml(article.source || article.author)}</span>
                <span>${escapeHtml(formatDate(article.date))}</span>
              </div>
              <h3 class="story-card__title">${escapeHtml(article.title)}</h3>
              <p class="story-card__summary">${escapeHtml(article.summary)}</p>
              <div class="story-card__footer">
                <span>${escapeHtml(article.readTime || '')}</span>
                <span class="story-card__footer-arrow" aria-hidden="true">↗</span>
              </div>
            </div>
          </a>
        </article>
      `)
      .join('')
  }

  const renderRoundup = (filteredArticles) => {
    roundupList.innerHTML = filteredArticles
      .slice(0, 3)
      .map((article, index) => `
        <li class="roundup-item">
          <span class="roundup-item__index">${String(index + 1).padStart(2, '0')}</span>
          <div>
            <p class="roundup-item__title">${escapeHtml(article.title)}</p>
            <p class="roundup-item__meta">
              ${escapeHtml(article.source || article.author)} · ${escapeHtml(formatDate(article.date))}
            </p>
          </div>
        </li>
      `)
      .join('')
  }

  const renderSummary = (count) => {
    if (count === 0) {
      resultsSummary.textContent = 'No stories matched your current filters.'
      return
    }
    if (count > MAX_GRID_ITEMS) {
      resultsSummary.textContent = `Showing ${MAX_GRID_ITEMS} of ${count} stories.`
      return
    }
    resultsSummary.textContent = `${count} ${count === 1 ? 'story' : 'stories'} currently visible.`
  }

  const render = () => {
    const filteredArticles = getFilteredArticles()
    renderCards(filteredArticles)
    renderRoundup(filteredArticles.length ? filteredArticles : browseableArticles)
    renderSummary(filteredArticles.length)
    emptyState.hidden = filteredArticles.length !== 0
  }

  await fetchCategories()

  renderFeatured()
  render()

  filtersForm.addEventListener('submit', (e) => {
    e.preventDefault()
    state.field  = fieldFilter.value
    state.region = regionFilter.value
    state.time   = timeFilter.value
    render()
  })

  clearFiltersButton.addEventListener('click', () => {
    state.field  = 'all'
    state.region = 'all'
    state.time   = 'all'
    fieldFilter.value  = 'all'
    regionFilter.value = 'all'
    timeFilter.value   = 'all'
    render()
  })
})
