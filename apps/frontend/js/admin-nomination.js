window.addEventListener("DOMContentLoaded", () => {
  const PAGE_SIZE = 5;
  const mockToday = new Date("2026-03-19T00:00:00");

  const nominations = [
    {
      id: "lum-001",
      nominee: {
        name: "Sarah Jenkins",
        organization: "Tech Innovations Inc.",
        initials: "SJ",
        tone: "gold",
        region: "Austin, United States",
      },
      submittedBy: {
        name: "Michael Ross",
        relationship: "Colleague",
      },
      field: "Technology",
      date: "2026-03-17",
      status: "Submitted",
      summary:
        "Built a return-to-tech fellowship that helped women re-enter engineering roles after career breaks.",
    },
    {
      id: "lum-002",
      nominee: {
        name: "Dr. Elena Rostova",
        organization: "Climate Tech Solutions",
        initials: "ER",
        tone: "blue",
        region: "Berlin, Germany",
      },
      submittedBy: {
        name: "Self-Submission",
        relationship: "Direct",
      },
      field: "Engineering",
      date: "2026-03-15",
      status: "Outreach Sent",
      summary:
        "Designed low-cost sensor networks that improved air-quality monitoring across public school districts.",
    },
    {
      id: "lum-003",
      nominee: {
        name: "Priya Sharma",
        organization: "EduAccess Org",
        initials: "PS",
        tone: "rose",
        region: "Mumbai, India",
      },
      submittedBy: {
        name: "Anita Desai",
        relationship: "Mentor",
      },
      field: "Education",
      date: "2026-03-13",
      status: "Consent Received",
      summary:
        "Expanded scholarship pathways for first-generation university students through district partnerships.",
    },
    {
      id: "lum-004",
      nominee: {
        name: "Dr. Linda Chen",
        organization: "Global Health Initiative",
        initials: "LC",
        tone: "mint",
        region: "Singapore",
      },
      submittedBy: {
        name: "Self-Submission",
        relationship: "Direct",
      },
      field: "Healthcare",
      date: "2026-03-09",
      status: "Published",
      summary:
        "Scaled a maternal health platform that now supports early intervention workflows in underserved clinics.",
    },
    {
      id: "lum-005",
      nominee: {
        name: "Amina Bello",
        organization: "GreenGrid Africa",
        initials: "AB",
        tone: "lavender",
        region: "Lagos, Nigeria",
      },
      submittedBy: {
        name: "Tolu Adeyemi",
        relationship: "Board Member",
      },
      field: "Sustainability",
      date: "2026-03-06",
      status: "Submitted",
      summary:
        "Led solar micro-grid deployments that brought reliable power to women-led farming cooperatives.",
    },
    {
      id: "lum-006",
      nominee: {
        name: "Nadia Al-Fayed",
        organization: "Urban Renewal Project",
        initials: "NA",
        tone: "sand",
        region: "Cairo, Egypt",
      },
      submittedBy: {
        name: "Omar Hassan",
        relationship: "Community Leader",
      },
      field: "Architecture",
      date: "2026-02-26",
      status: "Declined",
      summary:
        "Nomination lacked enough verifiable links after follow-up, so the review was closed pending stronger evidence.",
    },
    {
      id: "lum-007",
      nominee: {
        name: "Marta Alvarez",
        organization: "Civic Data Lab",
        initials: "MA",
        tone: "blue",
        region: "Madrid, Spain",
      },
      submittedBy: {
        name: "Lucia Gomez",
        relationship: "Peer",
      },
      field: "Public Policy",
      date: "2026-02-22",
      status: "Outreach Sent",
      summary:
        "Created open-data tooling that helped local governments publish gender budget reports in accessible formats.",
    },
    {
      id: "lum-008",
      nominee: {
        name: "Chioma Okafor",
        organization: "SafeBirth Collective",
        initials: "CO",
        tone: "mint",
        region: "Abuja, Nigeria",
      },
      submittedBy: {
        name: "Self-Submission",
        relationship: "Direct",
      },
      field: "Healthcare",
      date: "2026-02-18",
      status: "Published",
      summary:
        "Built a multilingual maternal care resource hub used by community birth workers across three regions.",
    },
    {
      id: "lum-009",
      nominee: {
        name: "Ifeoma Dike",
        organization: "Horizon Robotics",
        initials: "ID",
        tone: "gold",
        region: "Accra, Ghana",
      },
      submittedBy: {
        name: "Daniel Mensah",
        relationship: "Manager",
      },
      field: "Technology",
      date: "2026-02-11",
      status: "Consent Received",
      summary:
        "Championed robotics training cohorts that opened advanced manufacturing pathways for young women.",
    },
    {
      id: "lum-010",
      nominee: {
        name: "Zainab Yusuf",
        organization: "Harvest Forward",
        initials: "ZY",
        tone: "rose",
        region: "Kano, Nigeria",
      },
      submittedBy: {
        name: "Moses Ibrahim",
        relationship: "Program Partner",
      },
      field: "Agriculture",
      date: "2026-02-03",
      status: "Submitted",
      summary:
        "Built a market access network connecting women growers to new regional buyers and cooperative financing.",
    },
  ];

  const statusClassMap = {
    Submitted: "status--submitted",
    "Outreach Sent": "status--outreach-sent",
    "Consent Received": "status--consent-received",
    Published: "status--published",
    Declined: "status--declined",
  };

  const state = {
    search: "",
    field: "all",
    status: "all",
    dateRange: "this-month",
    sort: "recent",
    page: 1,
  };

  const tableBody = document.getElementById("nominationTableBody");
  const tableScroll = document.querySelector(".table-scroll");
  const cardsContainer = document.getElementById("nominationCards");
  const emptyState = document.getElementById("emptyState");
  const resultsSummary = document.getElementById("resultsSummary");
  const paginationPages = document.getElementById("paginationPages");
  const prevPageButton = document.getElementById("prevPage");
  const nextPageButton = document.getElementById("nextPage");
  const pagination = document.querySelector(".pagination");
  const fieldFilter = document.getElementById("fieldFilter");
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

  const populateFieldOptions = () => {
    const fields = [
      ...new Set(nominations.map((nomination) => nomination.field)),
    ].sort((first, second) => first.localeCompare(second));

    const fieldOptions = fields
      .map(
        (field) =>
          `<option value="${escapeHtml(field)}">Field: ${escapeHtml(field)}</option>`,
      )
      .join("");

    fieldFilter.insertAdjacentHTML("beforeend", fieldOptions);
  };

  const matchesDateRange = (nominationDate, dateRange) => {
    if (dateRange === "all-time") {
      return true;
    }

    const date = new Date(nominationDate);
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

  const getFilteredNominations = () => {
    const query = state.search.trim().toLowerCase();

    const filtered = nominations.filter((nomination) => {
      const nominationStatus = getStatusSlug(nomination.status);
      const searchableText = [
        nomination.nominee.name,
        nomination.nominee.organization,
        nomination.nominee.region,
        nomination.submittedBy.name,
        nomination.submittedBy.relationship,
        nomination.field,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchableText.includes(query);
      const matchesField =
        state.field === "all" || nomination.field === state.field;
      const matchesStatus =
        state.status === "all" || nominationStatus === state.status;
      const matchesDate = matchesDateRange(nomination.date, state.dateRange);

      return matchesSearch && matchesField && matchesStatus && matchesDate;
    });

    filtered.sort((first, second) => {
      if (state.sort === "oldest") {
        return new Date(first.date) - new Date(second.date);
      }

      if (state.sort === "name") {
        return first.nominee.name.localeCompare(second.nominee.name);
      }

      if (state.sort === "field") {
        return first.field.localeCompare(second.field);
      }

      return new Date(second.date) - new Date(first.date);
    });

    return filtered;
  };

  const buildActionMenu = (nominationId) => `
    <details class="row-actions">
      <summary aria-label="Open actions for nomination">
        <span aria-hidden="true" class="action-icon">···</span>
      </summary>
      <div class="action-menu">
        <a
          href="admin-nomination-profile.html?nomination=${encodeURIComponent(nominationId)}"
          class="action-link"
        >
          <span aria-hidden="true">&#9675;</span>
          View nomination
        </a>
        <button
          type="button"
          class="action-approve"
          data-action="approve"
          data-id="${nominationId}"
        >
          <span aria-hidden="true">&#10003;</span>
          Approve nomination
        </button>
        <button
          type="button"
          class="action-reject"
          data-action="reject"
          data-id="${nominationId}"
        >
          <span aria-hidden="true">&#10005;</span>
          Reject nomination
        </button>
      </div>
    </details>
  `;

  const renderTableRows = (nominationsToRender) => {
    if (!nominationsToRender.length) {
      tableBody.innerHTML = "";
      return;
    }

    tableBody.innerHTML = nominationsToRender
      .map(
        (nomination) => `
          <tr>
            <td>
              <div class="nominee-cell">
                <span class="avatar avatar--${escapeHtml(nomination.nominee.tone)}">${escapeHtml(nomination.nominee.initials)}</span>
                <div class="nominee-meta">
                  <strong>${escapeHtml(nomination.nominee.name)}</strong>
                  <span>${escapeHtml(nomination.nominee.organization)}</span>
                </div>
              </div>
            </td>
            <td>
              <div class="submitter-meta">
                <strong>${escapeHtml(nomination.submittedBy.name)}</strong>
                <span>${escapeHtml(nomination.submittedBy.relationship)}</span>
              </div>
            </td>
            <td>
              <span class="field-value">${escapeHtml(nomination.field)}</span>
            </td>
            <td>
              <span class="date-value">${escapeHtml(formatDate(nomination.date))}</span>
            </td>
            <td>
              <span class="status-chip ${statusClassMap[nomination.status]}">${escapeHtml(nomination.status)}</span>
            </td>
            <td>
              ${buildActionMenu(nomination.id)}
            </td>
          </tr>
        `,
      )
      .join("");
  };

  const renderCards = (nominationsToRender) => {
    if (!nominationsToRender.length) {
      cardsContainer.innerHTML = "";
      return;
    }

    cardsContainer.innerHTML = nominationsToRender
      .map(
        (nomination) => `
          <article class="nomination-card">
            <div class="nomination-card__header">
              <div class="nominee-cell">
                <span class="avatar avatar--${escapeHtml(nomination.nominee.tone)}">${escapeHtml(nomination.nominee.initials)}</span>
                <div class="nominee-meta">
                  <strong>${escapeHtml(nomination.nominee.name)}</strong>
                  <span>${escapeHtml(nomination.nominee.organization)}</span>
                </div>
              </div>
              <span class="status-chip ${statusClassMap[nomination.status]}">${escapeHtml(nomination.status)}</span>
            </div>

            <div class="nomination-card__grid">
              <div class="nomination-card__item">
                <span class="nomination-card__label">Submitted by</span>
                <span class="nomination-card__value">${escapeHtml(nomination.submittedBy.name)} · ${escapeHtml(nomination.submittedBy.relationship)}</span>
              </div>
              <div class="nomination-card__item">
                <span class="nomination-card__label">Field</span>
                <span class="nomination-card__value">${escapeHtml(nomination.field)}</span>
              </div>
              <div class="nomination-card__item">
                <span class="nomination-card__label">Date</span>
                <span class="nomination-card__value">${escapeHtml(formatDate(nomination.date))}</span>
              </div>
              <div class="nomination-card__item">
                <span class="nomination-card__label">Region</span>
                <span class="nomination-card__value">${escapeHtml(nomination.nominee.region)}</span>
              </div>
            </div>

            <div class="nomination-card__footer">
              <span class="table-summary">${escapeHtml(nomination.id.toUpperCase())}</span>
              ${buildActionMenu(nomination.id)}
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
    const filteredNominations = getFilteredNominations();
    const totalItems = filteredNominations.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

    if (state.page > totalPages) {
      state.page = totalPages;
    }

    const startIndex = (state.page - 1) * PAGE_SIZE;
    const paginatedNominations = filteredNominations.slice(
      startIndex,
      startIndex + PAGE_SIZE,
    );

    renderTableRows(paginatedNominations);
    renderCards(paginatedNominations);
    renderPagination(state.page, totalPages);

    emptyState.hidden = totalItems !== 0;
    tableScroll.hidden = totalItems === 0;
    cardsContainer.hidden = totalItems === 0;
    pagination.hidden = totalItems === 0;
    resultsSummary.textContent = totalItems
      ? `Showing ${startIndex + 1}-${Math.min(startIndex + PAGE_SIZE, totalItems)} of ${totalItems} nominations`
      : "Showing 0 nominations";

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

  const updateStatus = (nominationId, nextStatus) => {
    const nomination = nominations.find((item) => item.id === nominationId);

    if (!nomination) {
      return;
    }

    nomination.status = nextStatus;
    render();
    showToast(
      nextStatus === "Published"
        ? `${nomination.nominee.name} has been approved and marked as published.`
        : `${nomination.nominee.name} has been marked as declined.`,
    );
  };

  populateFieldOptions();
  render();

  searchInput.addEventListener("input", (event) => {
    state.search = event.target.value;
    state.page = 1;
    render();
  });

  fieldFilter.addEventListener("change", (event) => {
    state.field = event.target.value;
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
      Math.ceil(getFilteredNominations().length / PAGE_SIZE),
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

    const nominationId = actionButton.dataset.id;
    const nomination = nominations.find((item) => item.id === nominationId);

    if (!nomination) {
      return;
    }

    closeAllMenus();

    if (actionButton.dataset.action === "approve") {
      updateStatus(nominationId, "Published");
      return;
    }

    if (actionButton.dataset.action === "reject") {
      updateStatus(nominationId, "Declined");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAllMenus();
    }
  });
});
