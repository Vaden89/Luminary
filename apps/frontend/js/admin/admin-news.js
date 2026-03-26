window.addEventListener("DOMContentLoaded", () => {
  const PAGE_SIZE = 5;
  const mockToday = new Date("2026-03-19T00:00:00");

  const articles = [
    {
      id: "news-001",
      title: "Women Rewriting the Rules of Deep Tech",
      publication: "Tech Digest",
      initials: "WR",
      tone: "gold",
      author: {
        name: "Sarah Jenkins",
        role: "Staff Reporter",
      },
      category: "Technology",
      date: "2026-03-17",
      status: "Draft",
      summary:
        "A deep dive into the female founders pushing boundaries in AI, robotics, and semiconductor design.",
    },
    {
      id: "news-002",
      title: "Breathing New Life Into Urban Air Quality",
      publication: "Climate Wire",
      initials: "BN",
      tone: "blue",
      author: {
        name: "Dr. Elena Rostova",
        role: "Contributing Scientist",
      },
      category: "Climate",
      date: "2026-03-15",
      status: "Under Review",
      summary:
        "How low-cost sensor networks built by a Berlin-based team are changing how cities measure pollution.",
    },
    {
      id: "news-003",
      title: "First-Generation Students Are Rewriting College Access",
      publication: "EduAccess Times",
      initials: "FG",
      tone: "rose",
      author: {
        name: "Priya Sharma",
        role: "Education Correspondent",
      },
      category: "Education",
      date: "2026-03-13",
      status: "Approved",
      summary:
        "A look at the district partnerships expanding scholarship pipelines for first-generation university students.",
    },
    {
      id: "news-004",
      title: "The Maternal Health Platform Saving Lives at Scale",
      publication: "Global Health Review",
      initials: "MH",
      tone: "mint",
      author: {
        name: "Dr. Linda Chen",
        role: "Health Correspondent",
      },
      category: "Healthcare",
      date: "2026-03-09",
      status: "Published",
      summary:
        "Inside the platform supporting early intervention workflows in underserved clinics across Southeast Asia.",
    },
    {
      id: "news-005",
      title: "Solar Micro-Grids Power Women-Led Cooperatives in Nigeria",
      publication: "GreenGrid Africa",
      initials: "SG",
      tone: "lavender",
      author: {
        name: "Amina Bello",
        role: "Field Correspondent",
      },
      category: "Climate",
      date: "2026-03-06",
      status: "Draft",
      summary:
        "How solar micro-grid deployments are bringing reliable energy to farming cooperatives led by women.",
    },
    {
      id: "news-006",
      title: "Cairo's Urban Renewal: Architecture as Community Repair",
      publication: "Urban Futures",
      initials: "CU",
      tone: "sand",
      author: {
        name: "Nadia Al-Fayed",
        role: "Architecture Writer",
      },
      category: "Architecture",
      date: "2026-02-26",
      status: "Declined",
      summary:
        "Submission lacked verifiable source links after editorial follow-up; review closed pending stronger evidence.",
    },
    {
      id: "news-007",
      title: "Open Data Tools That Put Gender Budgets in Plain Sight",
      publication: "Civic Data Lab",
      initials: "OD",
      tone: "blue",
      author: {
        name: "Marta Alvarez",
        role: "Policy Analyst",
      },
      category: "Policy",
      date: "2026-02-22",
      status: "Under Review",
      summary:
        "New open-source tooling is helping local governments publish gender budget reports in accessible formats.",
    },
    {
      id: "news-008",
      title: "A Multilingual Hub for Community Birth Workers",
      publication: "SafeBirth Collective",
      initials: "ML",
      tone: "mint",
      author: {
        name: "Chioma Okafor",
        role: "Community Health Writer",
      },
      category: "Healthcare",
      date: "2026-02-18",
      status: "Published",
      summary:
        "The multilingual maternal care resource hub now supports birth workers across three regions.",
    },
    {
      id: "news-009",
      title: "Robotics Training Opens Doors for Young Women in Ghana",
      publication: "Horizon Robotics",
      initials: "RT",
      tone: "gold",
      author: {
        name: "Ifeoma Dike",
        role: "Technology Reporter",
      },
      category: "Technology",
      date: "2026-02-11",
      status: "Approved",
      summary:
        "Cohort-based robotics training programs are opening advanced manufacturing pathways for young women.",
    },
    {
      id: "news-010",
      title: "Connecting Women Growers to Regional Markets",
      publication: "Harvest Forward",
      initials: "CW",
      tone: "rose",
      author: {
        name: "Zainab Yusuf",
        role: "Agriculture Correspondent",
      },
      category: "Agriculture",
      date: "2026-02-03",
      status: "Draft",
      summary:
        "A market access network is linking women growers to new regional buyers and cooperative financing.",
    },
  ];

  const statusClassMap = {
    Draft: "status--draft",
    "Under Review": "status--under-review",
    Approved: "status--approved",
    Published: "status--published",
    Declined: "status--declined",
  };

  const state = {
    search: "",
    category: "all",
    status: "all",
    dateRange: "this-month",
    sort: "recent",
    page: 1,
  };

  const tableBody = document.getElementById("newsTableBody");
  const tableScroll = document.querySelector(".table-scroll");
  const cardsContainer = document.getElementById("newsCards");
  const emptyState = document.getElementById("emptyState");
  const resultsSummary = document.getElementById("resultsSummary");
  const paginationPages = document.getElementById("paginationPages");
  const prevPageButton = document.getElementById("prevPage");
  const nextPageButton = document.getElementById("nextPage");
  const pagination = document.querySelector(".pagination");
  const categoryFilter = document.getElementById("categoryFilter");
  const statusFilter = document.getElementById("statusFilter");
  const dateFilter = document.getElementById("dateFilter");
  const sortFilter = document.getElementById("sortFilter");
  const searchInput = document.getElementById("searchInput");
  const toast = document.getElementById("actionToast");

  let toastTimeoutId = 0;

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

  const getStatusSlug = (status) => status.toLowerCase().replaceAll(" ", "-");

  const getQuarter = (date) => Math.floor(date.getMonth() / 3);

  const populateCategoryOptions = () => {
    const categories = [
      ...new Set(articles.map((article) => article.category)),
    ].sort((first, second) => first.localeCompare(second));

    const categoryOptions = categories
      .map(
        (category) =>
          `<option value="${escapeHtml(category)}">Category: ${escapeHtml(category)}</option>`,
      )
      .join("");

    categoryFilter.insertAdjacentHTML("beforeend", categoryOptions);
  };

  const matchesDateRange = (articleDate, dateRange) => {
    if (dateRange === "all-time") {
      return true;
    }

    const date = new Date(articleDate);
    const timeDifference = mockToday.getTime() - date.getTime();
    const dayDifference = timeDifference / (1000 * 60 * 60 * 24);

    if (dateRange === "this-month") {
      return (
        date.getFullYear() === mockToday.getFullYear() &&
        date.getMonth() === mockToday.getMonth()
      );
    }

    if (dateRange === "last-30") {
      return dayDifference >= 0 && dayDifference <= 30;
    }

    if (dateRange === "this-quarter") {
      return (
        date.getFullYear() === mockToday.getFullYear() &&
        getQuarter(date) === getQuarter(mockToday)
      );
    }

    if (dateRange === "year-to-date") {
      return date.getFullYear() === mockToday.getFullYear();
    }

    return true;
  };

  const getFilteredArticles = () => {
    const query = state.search.trim().toLowerCase();

    const filtered = articles.filter((article) => {
      const articleStatus = getStatusSlug(article.status);
      const searchableText = [
        article.title,
        article.publication,
        article.author.name,
        article.author.role,
        article.category,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchableText.includes(query);
      const matchesCategory =
        state.category === "all" || article.category === state.category;
      const matchesStatus =
        state.status === "all" || articleStatus === state.status;
      const matchesDate = matchesDateRange(article.date, state.dateRange);

      return matchesSearch && matchesCategory && matchesStatus && matchesDate;
    });

    filtered.sort((first, second) => {
      if (state.sort === "oldest") {
        return new Date(first.date) - new Date(second.date);
      }

      if (state.sort === "title") {
        return first.title.localeCompare(second.title);
      }

      if (state.sort === "category") {
        return first.category.localeCompare(second.category);
      }

      return new Date(second.date) - new Date(first.date);
    });

    return filtered;
  };

  const buildActionMenu = (articleId) => `
    <details class="row-actions">
      <summary aria-label="Open actions for article">
        <span aria-hidden="true" class="action-icon">···</span>
      </summary>
      <div class="action-menu">
        <a
          href="admin-news-profile.html?article=${encodeURIComponent(articleId)}"
          class="action-link"
        >
          <i class="fa-solid fa-expand"></i>
          View article
        </a>
        <button
          type="button"
          class="action-approve"
          data-action="approve"
          data-id="${articleId}"
        >
          <i class="fa-solid fa-check"></i>
          Publish article
        </button>
        <button
          type="button"
          class="action-reject"
          data-action="reject"
          data-id="${articleId}"
        >
          <i class="fa-solid fa-x"></i>
          Decline article
        </button>
      </div>
    </details>
  `;

  const renderTableRows = (articlesToRender) => {
    if (!articlesToRender.length) {
      tableBody.innerHTML = "";
      return;
    }

    tableBody.innerHTML = articlesToRender
      .map(
        (article) => `
          <tr>
            <td>
              <div class="article-cell">
                <div class="article-meta">
                  <strong>${escapeHtml(article.title)}</strong>
                  <span>${escapeHtml(article.publication)}</span>
                </div>
              </div>
            </td>
            <td>
              <div class="author-meta">
                <strong>${escapeHtml(article.author.name)}</strong>
                <span>${escapeHtml(article.author.role)}</span>
              </div>
            </td>
            <td>
              <span class="category-value">${escapeHtml(article.category)}</span>
            </td>
            <td>
              <span class="date-value">${escapeHtml(formatDate(article.date))}</span>
            </td>
            <td>
              <span class="status-chip ${statusClassMap[article.status]}">${escapeHtml(article.status)}</span>
            </td>
            <td>
              ${buildActionMenu(article.id)}
            </td>
          </tr>
        `,
      )
      .join("");
  };

  const renderCards = (articlesToRender) => {
    if (!articlesToRender.length) {
      cardsContainer.innerHTML = "";
      return;
    }

    cardsContainer.innerHTML = articlesToRender
      .map(
        (article) => `
          <article class="news-card">
            <div class="news-card__header">
              <div class="article-cell">
                <div class="article-meta">
                  <strong>${escapeHtml(article.title)}</strong>
                  <span>${escapeHtml(article.publication)}</span>
                </div>
              </div>
              <span class="status-chip ${statusClassMap[article.status]}">${escapeHtml(article.status)}</span>
            </div>

            <div class="news-card__grid">
              <div class="news-card__item">
                <span class="news-card__label">Author</span>
                <span class="news-card__value">${escapeHtml(article.author.name)} · ${escapeHtml(article.author.role)}</span>
              </div>
              <div class="news-card__item">
                <span class="news-card__label">Category</span>
                <span class="news-card__value">${escapeHtml(article.category)}</span>
              </div>
              <div class="news-card__item">
                <span class="news-card__label">Date</span>
                <span class="news-card__value">${escapeHtml(formatDate(article.date))}</span>
              </div>
              <div class="news-card__item">
                <span class="news-card__label">Publication</span>
                <span class="news-card__value">${escapeHtml(article.publication)}</span>
              </div>
            </div>

            <div class="news-card__footer">
              <span class="table-summary">${escapeHtml(article.id.toUpperCase())}</span>
              ${buildActionMenu(article.id)}
            </div>
          </article>
        `,
      )
      .join("");
  };

  const renderPagination = (currentPage, totalPages) => {
    paginationPages.innerHTML = Array.from(
      { length: totalPages },
      (_, index) => {
        const pageNumber = index + 1;
        const activeClass = pageNumber === currentPage ? " is-active" : "";

        return `
        <button
          class="page-button${activeClass}"
          type="button"
          data-page="${pageNumber}"
          aria-label="Go to page ${pageNumber}"
          ${pageNumber === currentPage ? 'aria-current="page"' : ""}
        >
          ${pageNumber}
        </button>
      `;
      },
    ).join("");

    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === totalPages;
  };

  const closeAllMenus = () => {
    document.querySelectorAll(".row-actions[open]").forEach((menu) => {
      menu.removeAttribute("open");
    });
  };

  const render = () => {
    const filteredArticles = getFilteredArticles();
    const totalItems = filteredArticles.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

    if (state.page > totalPages) {
      state.page = totalPages;
    }

    const startIndex = (state.page - 1) * PAGE_SIZE;
    const paginatedArticles = filteredArticles.slice(
      startIndex,
      startIndex + PAGE_SIZE,
    );

    renderTableRows(paginatedArticles);
    renderCards(paginatedArticles);
    renderPagination(state.page, totalPages);

    emptyState.hidden = totalItems !== 0;
    tableScroll.hidden = totalItems === 0;
    cardsContainer.hidden = totalItems === 0;
    pagination.hidden = totalItems === 0;
    resultsSummary.textContent = totalItems
      ? `Showing ${startIndex + 1}-${Math.min(startIndex + PAGE_SIZE, totalItems)} of ${totalItems} articles`
      : "Showing 0 articles";

    statusFilter.value = state.status;
  };

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimeoutId);
    toastTimeoutId = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 2200);
  };

  const updateStatus = (articleId, nextStatus) => {
    const article = articles.find((item) => item.id === articleId);

    if (!article) {
      return;
    }

    article.status = nextStatus;
    render();
    showToast(
      nextStatus === "Published"
        ? `"${article.title}" has been approved and marked as published.`
        : `"${article.title}" has been marked as declined.`,
    );
  };

  populateCategoryOptions();
  render();

  searchInput.addEventListener("input", (event) => {
    state.search = event.target.value;
    state.page = 1;
    render();
  });

  categoryFilter.addEventListener("change", (event) => {
    state.category = event.target.value;
    state.page = 1;
    render();
  });

  statusFilter.addEventListener("change", (event) => {
    state.status = event.target.value;
    state.page = 1;
    render();
  });

  dateFilter.addEventListener("change", (event) => {
    state.dateRange = event.target.value;
    state.page = 1;
    render();
  });

  sortFilter.addEventListener("change", (event) => {
    state.sort = event.target.value;
    state.page = 1;
    render();
  });

  paginationPages.addEventListener("click", (event) => {
    const button = event.target.closest("[data-page]");

    if (!button) {
      return;
    }

    state.page = Number(button.dataset.page);
    render();
  });

  prevPageButton.addEventListener("click", () => {
    if (state.page > 1) {
      state.page -= 1;
      render();
    }
  });

  nextPageButton.addEventListener("click", () => {
    const totalPages = Math.max(
      1,
      Math.ceil(getFilteredArticles().length / PAGE_SIZE),
    );

    if (state.page < totalPages) {
      state.page += 1;
      render();
    }
  });

  document.addEventListener(
    "toggle",
    (event) => {
      const menu = event.target;

      if (
        !(menu instanceof HTMLDetailsElement) ||
        !menu.classList.contains("row-actions")
      ) {
        return;
      }

      if (menu.open) {
        document.querySelectorAll(".row-actions[open]").forEach((openMenu) => {
          if (openMenu !== menu) {
            openMenu.removeAttribute("open");
          }
        });
      }
    },
    true,
  );

  document.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-action]");

    if (!event.target.closest(".row-actions")) {
      closeAllMenus();
    }

    if (!actionButton) {
      return;
    }

    const articleId = actionButton.dataset.id;
    const article = articles.find((item) => item.id === articleId);

    if (!article) {
      return;
    }

    closeAllMenus();

    if (actionButton.dataset.action === "approve") {
      updateStatus(articleId, "Published");
      return;
    }

    if (actionButton.dataset.action === "reject") {
      updateStatus(articleId, "Declined");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAllMenus();
    }
  });
});
