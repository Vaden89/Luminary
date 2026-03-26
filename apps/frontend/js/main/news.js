window.addEventListener("DOMContentLoaded", () => {
  const mockToday = new Date("2026-03-21T00:00:00");
  const articleDetailPage = "./article-page.html";
  const MAX_GRID_ITEMS = 4;

  const articles = [
    {
      id: "article-001",
      title:
        "Dr. Elena Rostova Leads Breakthrough in Renewable Energy Grid Integration",
      summary:
        "A new distributed energy showcase built with Luminary-backed engineers is helping cities cut grid strain while scaling renewable adoption.",
      field: "Climate Tech",
      region: "Global",
      source: "Climate Tech Review",
      author: "Clara Nnoli",
      date: "2026-03-20",
      readTime: "7 min read",
      imageUrl: "../../assets/images/profile-image.jpg",
      featured: true,
    },
    {
      id: "article-002",
      title: "Sarah Chen Appointed as Head of Global AI Ethics Council",
      summary:
        "Following her influential work in machine learning fairness, Sarah Chen will chair a new international AI governance body.",
      field: "Technology",
      region: "Global",
      source: "Tech Daily",
      author: "Mina Solis",
      date: "2026-03-19",
      readTime: "5 min read",
      imageUrl:
        "https://res.cloudinary.com/dtqqv0lb3/image/upload/v1773998270/axlmh33f12eeryc3p9o9.png",
      featured: false,
    },
    {
      id: "article-003",
      title: "New Maternal Health Initiative Launched in Sub-Saharan Africa",
      summary:
        "A cross-border program is expanding mobile care access and training for frontline health workers in underserved communities.",
      field: "Health",
      region: "Africa",
      source: "Global Health News",
      author: "Ada Ume",
      date: "2026-03-17",
      readTime: "6 min read",
      imageUrl:
        "https://res.cloudinary.com/dtqqv0lb3/image/upload/v1773998270/axlmh33f12eeryc3p9o9.png",
      featured: false,
    },
    {
      id: "article-004",
      title: "Maria Santos Wins Prestigious Architecture Biennale Award",
      summary:
        "Her climate-resilient housing prototypes are being recognised for combining design, dignity, and public access.",
      field: "Architecture",
      region: "Europe",
      source: "Design Weekly",
      author: "Lina Adebayo",
      date: "2026-03-12",
      readTime: "4 min read",
      imageUrl:
        "https://res.cloudinary.com/dtqqv0lb3/image/upload/v1773998270/axlmh33f12eeryc3p9o9.png",
      featured: false,
    },
    {
      id: "article-005",
      title: "First All-Female Led VC Fund Closes at $250M",
      summary:
        "The new fund plans to invest exclusively in high-growth startups solving infrastructure and inclusion challenges.",
      field: "Finance",
      region: "North America",
      source: "Financial Times",
      author: "Joy Mercer",
      date: "2026-03-10",
      readTime: "5 min read",
      imageUrl:
        "https://res.cloudinary.com/dtqqv0lb3/image/upload/v1773998270/axlmh33f12eeryc3p9o9.png",
      featured: false,
    },
    {
      id: "article-006",
      title: "Women-Led Farm Cooperatives Scale Solar Cold Storage in Kaduna",
      summary:
        "The project is reducing waste and increasing margins for smallholder growers by keeping produce market-ready for longer.",
      field: "Agriculture",
      region: "Africa",
      source: "Harvest Report",
      author: "Tola Hassan",
      date: "2026-03-04",
      readTime: "6 min read",
      imageUrl:
        "https://res.cloudinary.com/dtqqv0lb3/image/upload/v1773998265/pwukndeioojcirmuh4l9.png",
      featured: false,
    },
    {
      id: "article-007",
      title: "Community Data Fellows Open New Pathways Into Public Policy",
      summary:
        "An emerging fellowship model is helping women use civic data to shape local budgets, transit, and public accountability.",
      field: "Policy",
      region: "Europe",
      source: "Civic Ledger",
      author: "Rina Karlsson",
      date: "2026-02-27",
      readTime: "4 min read",
      imageUrl:
        "https://res.cloudinary.com/dtqqv0lb3/image/upload/v1773482008/oqxxmzoxovmftfpfb8yn.png",
      featured: false,
    },
  ];

  const featuredArticle =
    articles.find((article) => article.featured) || articles[0];
  const browseableArticles = articles.filter(
    (article) => article.id !== featuredArticle.id,
  );

  const fieldFilter = document.getElementById("fieldFilter");
  const regionFilter = document.getElementById("regionFilter");
  const timeFilter = document.getElementById("timeFilter");
  const filtersForm = document.getElementById("newsFilters");
  const clearFiltersButton = document.getElementById("clearFiltersButton");
  const featuredTitle = document.getElementById("featuredArticleTitle");
  const featuredSummary = document.getElementById("featuredArticleSummary");
  const featuredMeta = document.getElementById("featuredArticleMeta");
  const featuredLink = document.getElementById("featuredArticleLink");
  const featuredImage = document.getElementById("featuredArticleImage");
  const featuredField = document.getElementById("featuredArticleField");
  const newsGrid = document.getElementById("newsGrid");
  const roundupList = document.getElementById("roundupList");
  const resultsSummary = document.getElementById("resultsSummary");
  const emptyState = document.getElementById("emptyState");

  const state = {
    field: "all",
    region: "all",
    time: "all",
  };

  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const formatDate = (value) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value));

  const getDaysAgo = (value) => {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    return Math.floor((mockToday - new Date(value)) / millisecondsPerDay);
  };

  const matchesTimeRange = (articleDate, range) => {
    if (range === "all") {
      return true;
    }

    const ageInDays = getDaysAgo(articleDate);

    if (range === "last-7") {
      return ageInDays <= 7;
    }

    if (range === "last-30") {
      return ageInDays <= 30;
    }

    if (range === "last-90") {
      return ageInDays <= 90;
    }

    if (range === "this-year") {
      return new Date(articleDate).getFullYear() === mockToday.getFullYear();
    }

    return true;
  };

  const buildArticleUrl = (articleId) =>
    `${articleDetailPage}?article=${encodeURIComponent(articleId)}`;

  const populateSelect = (select, values) => {
    values.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.append(option);
    });
  };

  const renderFeatured = () => {
    featuredTitle.textContent = featuredArticle.title;
    featuredSummary.textContent = featuredArticle.summary;
    featuredMeta.innerHTML = [
      featuredArticle.author,
      featuredArticle.source,
      formatDate(featuredArticle.date),
    ]
      .map((item) => `<span>${escapeHtml(item)}</span>`)
      .join("");
    featuredLink.href = buildArticleUrl(featuredArticle.id);
    featuredImage.src = featuredArticle.imageUrl;
    featuredField.textContent = featuredArticle.field;
  };

  const getFilteredArticles = () =>
    browseableArticles
      .filter((article) => {
        const matchesField =
          state.field === "all" || article.field === state.field;
        const matchesRegion =
          state.region === "all" || article.region === state.region;
        const matchesTime = matchesTimeRange(article.date, state.time);

        return matchesField && matchesRegion && matchesTime;
      })
      .sort((left, right) => new Date(right.date) - new Date(left.date));

  const renderCards = (filteredArticles) => {
    newsGrid.innerHTML = filteredArticles
      .slice(0, MAX_GRID_ITEMS)
      .map(
        (article) => `
          <article class="story-card">
            <a class="story-card__link" href="${buildArticleUrl(article.id)}">
              <div class="story-card__media">
                <img
                  class="story-card__image"
                  src="${escapeHtml(article.imageUrl)}"
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
                <span class="story-card__tag">${escapeHtml(article.field)}</span>
              </div>
              <div class="story-card__body">
                <div class="story-card__meta">
                  <span>${escapeHtml(article.source)}</span>
                  <span>${escapeHtml(formatDate(article.date))}</span>
                </div>
                <h3 class="story-card__title">${escapeHtml(article.title)}</h3>
                <p class="story-card__summary">${escapeHtml(article.summary)}</p>
                <div class="story-card__footer">
                  <span>${escapeHtml(article.readTime)}</span>
                  <span class="story-card__footer-arrow" aria-hidden="true">↗</span>
                </div>
              </div>
            </a>
          </article>
        `,
      )
      .join("");
  };

  const renderRoundup = (filteredArticles) => {
    const roundupItems = filteredArticles.slice(0, 3);

    roundupList.innerHTML = roundupItems
      .map(
        (article, index) => `
          <li class="roundup-item">
            <span class="roundup-item__index">${String(index + 1).padStart(2, "0")}</span>
            <div>
              <p class="roundup-item__title">${escapeHtml(article.title)}</p>
              <p class="roundup-item__meta">
                ${escapeHtml(article.source)} · ${escapeHtml(formatDate(article.date))}
              </p>
            </div>
          </li>
        `,
      )
      .join("");
  };

  const renderSummary = (count) => {
    if (count === 0) {
      resultsSummary.textContent = "No stories matched your current filters.";
      return;
    }

    if (count > MAX_GRID_ITEMS) {
      resultsSummary.textContent = `Showing ${MAX_GRID_ITEMS} of ${count} stories.`;
      return;
    }

    resultsSummary.textContent = `${count} ${count === 1 ? "story" : "stories"} currently visible.`;
  };

  const render = () => {
    const filteredArticles = getFilteredArticles();

    renderCards(filteredArticles);
    renderRoundup(
      filteredArticles.length ? filteredArticles : browseableArticles,
    );
    renderSummary(filteredArticles.length);
    emptyState.hidden = filteredArticles.length !== 0;
  };

  populateSelect(
    fieldFilter,
    [...new Set(browseableArticles.map((article) => article.field))].sort(),
  );
  populateSelect(
    regionFilter,
    [...new Set(browseableArticles.map((article) => article.region))].sort(),
  );

  renderFeatured();
  render();

  filtersForm.addEventListener("submit", (event) => {
    event.preventDefault();

    state.field = fieldFilter.value;
    state.region = regionFilter.value;
    state.time = timeFilter.value;

    render();
  });

  clearFiltersButton.addEventListener("click", () => {
    state.field = "all";
    state.region = "all";
    state.time = "all";

    fieldFilter.value = "all";
    regionFilter.value = "all";
    timeFilter.value = "all";

    render();
  });
});
