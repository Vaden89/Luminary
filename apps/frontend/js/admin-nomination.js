window.addEventListener("DOMContentLoaded", () => {
  const PAGE_SIZE = 5;
  const SEARCH_DEBOUNCE_MS = 320;
  const AVATAR_TONES = ["gold", "blue", "rose", "mint", "lavender", "sand"];
  const STATUS_META = {
    pending: {
      label: "Pending",
      className: "status--pending",
    },
    approved: {
      label: "Approved",
      className: "status--approved",
    },
    suspended: {
      label: "Suspended",
      className: "status--suspended",
    },
    rejected: {
      label: "Rejected",
      className: "status--rejected",
    },
  };

  const apiBase = (document.body.dataset.apiBase || "").replace(/\/$/, "");
  const nominationsEndpoint = apiBase
    ? `${apiBase}/admin/nominations`
    : "/api/admin/nominations";
  const accessToken = localStorage.getItem("access_token") || "";

  const tableBody = document.getElementById("nominationTableBody");
  const tableScroll = document.querySelector(".table-scroll");
  const cardsContainer = document.getElementById("nominationCards");
  const emptyState = document.getElementById("emptyState");
  const emptyStateTitle = emptyState.querySelector("h3");
  const emptyStateCopy = emptyState.querySelector("p");
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

  const state = {
    nominations: [],
    search: "",
    field: "all",
    status: "all",
    dateRange: "all-time",
    sort: "recent",
    page: 1,
    isLoading: false,
    error: "",
    pendingActionId: "",
    latestRequestId: 0,
  };

  let toastTimeoutId = 0;
  let searchTimeoutId = 0;

  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const formatDate = (value) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Unknown";
    }

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const getTimestamp = (value) => {
    const timestamp = new Date(value).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
  };

  const getQuarter = (date) => Math.floor(date.getMonth() / 3);

  const getName = (person) =>
    [person?.first_name, person?.last_name].filter(Boolean).join(" ").trim();

  const getInitials = (name) =>
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "NA";

  const getAvatarTone = (seed) => {
    const total = Array.from(String(seed)).reduce(
      (sum, character, index) => sum + character.charCodeAt(0) * (index + 1),
      0,
    );

    return AVATAR_TONES[total % AVATAR_TONES.length];
  };

  const normalizeStatus = (status) => {
    const normalized = String(status || "pending").trim().toLowerCase();

    return STATUS_META[normalized] ? normalized : "pending";
  };

  const getAuthHeaders = () => ({
    Accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
  });

  const redirectToLogin = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "admin-login.html";
  };

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimeoutId);
    toastTimeoutId = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 2200);
  };

  const setEmptyState = (title, message) => {
    emptyStateTitle.textContent = title;
    emptyStateCopy.textContent = message;
  };

  const matchesDateRange = (nominationDate, dateRange) => {
    if (dateRange === "all-time") {
      return true;
    }

    const timestamp = getTimestamp(nominationDate);

    if (!timestamp) {
      return false;
    }

    const date = new Date(timestamp);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const timeDifference = today.getTime() - date.getTime();
    const dayDifference = timeDifference / (1000 * 60 * 60 * 24);

    if (dateRange === "this-month") {
      return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth()
      );
    }

    if (dateRange === "last-30") {
      return dayDifference >= 0 && dayDifference <= 30;
    }

    if (dateRange === "this-quarter") {
      return (
        date.getFullYear() === today.getFullYear() &&
        getQuarter(date) === getQuarter(today)
      );
    }

    if (dateRange === "year-to-date") {
      return date.getFullYear() === today.getFullYear();
    }

    return true;
  };

  const normalizeNomination = (nomination) => {
    const nomineeName = getName(nomination.nominee) || "Unknown nominee";
    const nominatorName = getName(nomination.nominator);
    const status = normalizeStatus(nomination.status);

    return {
      id: String(nomination.id),
      nominee: {
        name: nomineeName,
        organization: nomination.nominee?.organization || "Independent",
        initials: getInitials(nomineeName),
        tone: getAvatarTone(`${nomineeName}-${nomination.nominee?.field || ""}`),
        region: nomination.nominee?.country || "Unknown region",
      },
      submittedBy: {
        name: nominatorName || "Self Submission",
        relationship:
          nomination.nominator?.relationship_to_nominee ||
          (nominatorName ? "Nominator" : "Direct"),
      },
      field: nomination.nominee?.field || "Unspecified",
      date:
        nomination.created_at ||
        nomination.updated_at ||
        nomination.submitted_at ||
        nomination.date ||
        "",
      status,
      statusLabel: STATUS_META[status].label,
      summary: nomination.description || "No description provided yet.",
    };
  };

  const populateFieldOptions = () => {
    const fields = [
      ...new Set(state.nominations.map((nomination) => nomination.field)),
    ].sort((first, second) => first.localeCompare(second));

    fieldFilter.innerHTML = [
      '<option value="all">Field: All fields</option>',
      ...fields.map(
        (field) =>
          `<option value="${escapeHtml(field)}">Field: ${escapeHtml(field)}</option>`,
      ),
    ].join("");

    if (state.field !== "all" && !fields.includes(state.field)) {
      state.field = "all";
    }

    fieldFilter.value = state.field;
  };

  const getFilteredNominations = () => {
    const filtered = state.nominations.filter((nomination) => {
      const matchesField =
        state.field === "all" || nomination.field === state.field;
      const matchesStatus =
        state.status === "all" || nomination.status === state.status;
      const matchesDate = matchesDateRange(nomination.date, state.dateRange);

      return matchesField && matchesStatus && matchesDate;
    });

    filtered.sort((first, second) => {
      if (state.sort === "oldest") {
        return getTimestamp(first.date) - getTimestamp(second.date);
      }

      if (state.sort === "name") {
        return first.nominee.name.localeCompare(second.nominee.name);
      }

      if (state.sort === "field") {
        return first.field.localeCompare(second.field);
      }

      return getTimestamp(second.date) - getTimestamp(first.date);
    });

    return filtered;
  };

  const buildActionMenu = (nomination) => {
    const isBusy = state.pendingActionId === nomination.id;
    const actions = [
      `
        <a
          href="admin-nomination-detail.html?nomination=${encodeURIComponent(nomination.id)}"
          class="action-link"
        >
          <span aria-hidden="true">&#9675;</span>
          View nomination
        </a>
      `,
    ];

    if (nomination.status !== "approved") {
      actions.push(`
        <button
          type="button"
          class="action-approve"
          data-action="approve"
          data-id="${nomination.id}"
          ${isBusy ? "disabled" : ""}
        >
          <span aria-hidden="true">&#10003;</span>
          ${isBusy ? "Approving..." : "Approve nomination"}
        </button>
      `);
    }

    if (nomination.status !== "rejected") {
      actions.push(`
        <button
          type="button"
          class="action-reject"
          data-action="reject"
          data-id="${nomination.id}"
          ${isBusy ? "disabled" : ""}
        >
          <span aria-hidden="true">&#10005;</span>
          ${isBusy ? "Rejecting..." : "Reject nomination"}
        </button>
      `);
    }

    return `
      <details class="row-actions">
        <summary aria-label="Open actions for nomination">
          <span aria-hidden="true" class="action-icon">···</span>
        </summary>
        <div class="action-menu">
          ${actions.join("")}
        </div>
      </details>
    `;
  };

  const renderTableRows = (nominationsToRender) => {
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
              <span class="status-chip ${STATUS_META[nomination.status].className}">${escapeHtml(nomination.statusLabel)}</span>
            </td>
            <td>
              ${buildActionMenu(nomination)}
            </td>
          </tr>
        `,
      )
      .join("");
  };

  const renderCards = (nominationsToRender) => {
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
              <span class="status-chip ${STATUS_META[nomination.status].className}">${escapeHtml(nomination.statusLabel)}</span>
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
              ${buildActionMenu(nomination)}
            </div>
          </article>
        `,
      )
      .join("");
  };

  const renderPagination = (currentPage, totalPages) => {
    paginationPages.innerHTML = Array.from({ length: totalPages }, (_, index) => {
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
    }).join("");

    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === totalPages;
  };

  const closeAllMenus = () => {
    document.querySelectorAll(".row-actions[open]").forEach((menu) => {
      menu.removeAttribute("open");
    });
  };

  const renderLoadingState = () => {
    tableBody.innerHTML = "";
    cardsContainer.innerHTML = "";
    paginationPages.innerHTML = "";
    setEmptyState(
      "Loading nominations",
      "Fetching the latest nominations from the server.",
    );
    emptyState.hidden = false;
    tableScroll.hidden = true;
    cardsContainer.hidden = true;
    pagination.hidden = true;
    resultsSummary.textContent = "Loading nominations...";
    prevPageButton.disabled = true;
    nextPageButton.disabled = true;
  };

  const renderErrorState = () => {
    tableBody.innerHTML = "";
    cardsContainer.innerHTML = "";
    paginationPages.innerHTML = "";
    setEmptyState(
      "Unable to load nominations",
      state.error || "Something went wrong while loading nominations.",
    );
    emptyState.hidden = false;
    tableScroll.hidden = true;
    cardsContainer.hidden = true;
    pagination.hidden = true;
    resultsSummary.textContent = "Showing 0 nominations";
    prevPageButton.disabled = true;
    nextPageButton.disabled = true;
  };

  const render = () => {
    if (state.isLoading) {
      renderLoadingState();
      return;
    }

    if (state.error) {
      renderErrorState();
      return;
    }

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

    if (!totalItems) {
      setEmptyState(
        "No nominations match this filter",
        "Try widening the date range, changing the status, or clearing the search term.",
      );
    }

    emptyState.hidden = totalItems !== 0;
    tableScroll.hidden = totalItems === 0;
    cardsContainer.hidden = totalItems === 0;
    pagination.hidden = totalItems === 0;
    resultsSummary.textContent = totalItems
      ? `Showing ${startIndex + 1}-${Math.min(startIndex + PAGE_SIZE, totalItems)} of ${totalItems} nominations`
      : "Showing 0 nominations";

    statusFilter.value = state.status;
    dateFilter.value = state.dateRange;
    sortFilter.value = state.sort;
  };

  const fetchNominations = async () => {
    const requestId = ++state.latestRequestId;
    const query = state.search.trim();
    const requestUrl = query
      ? `${nominationsEndpoint}?search=${encodeURIComponent(query)}`
      : nominationsEndpoint;

    state.isLoading = true;
    state.error = "";
    render();

    try {
      const response = await fetch(requestUrl, {
        headers: getAuthHeaders(),
      });
      const result = await response.json().catch(() => ({}));

      if (requestId !== state.latestRequestId) {
        return;
      }

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to load nominations.");
      }

      state.nominations = Array.isArray(result.data)
        ? result.data.map(normalizeNomination)
        : [];
      state.error = "";
      populateFieldOptions();
    } catch (error) {
      if (requestId !== state.latestRequestId) {
        return;
      }

      state.nominations = [];
      state.error =
        error.message || "Unable to load nominations at the moment.";
      populateFieldOptions();
      showToast(state.error);
    } finally {
      if (requestId === state.latestRequestId) {
        state.isLoading = false;
        render();
      }
    }
  };

  const updateNominationStatus = async (nominationId, action) => {
    const nomination = state.nominations.find((item) => item.id === nominationId);

    if (!nomination || state.pendingActionId) {
      return;
    }

    state.pendingActionId = nominationId;
    render();

    try {
      const response = await fetch(
        `${nominationsEndpoint}/${encodeURIComponent(nominationId)}/${action}`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
        },
      );
      const result = await response.json().catch(() => ({}));

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ||
            `Unable to ${action === "approve" ? "approve" : "reject"} nomination.`,
        );
      }

      const nextStatus = normalizeStatus(
        result.data?.status || (action === "approve" ? "approved" : "rejected"),
      );

      nomination.status = nextStatus;
      nomination.statusLabel = STATUS_META[nextStatus].label;
      closeAllMenus();
      render();
      showToast(
        action === "approve"
          ? `${nomination.nominee.name} approved successfully.`
          : `${nomination.nominee.name} rejected successfully.`,
      );
    } catch (error) {
      closeAllMenus();
      showToast(
        error.message ||
          `Unable to ${action === "approve" ? "approve" : "reject"} nomination.`,
      );
    } finally {
      state.pendingActionId = "";
      render();
    }
  };

  if (!accessToken) {
    redirectToLogin();
    return;
  }

  searchInput.addEventListener("input", (event) => {
    state.search = event.target.value;
    state.page = 1;
    window.clearTimeout(searchTimeoutId);
    searchTimeoutId = window.setTimeout(fetchNominations, SEARCH_DEBOUNCE_MS);
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

    closeAllMenus();

    if (actionButton.dataset.action === "approve") {
      updateNominationStatus(nominationId, "approve");
      return;
    }

    if (actionButton.dataset.action === "reject") {
      updateNominationStatus(nominationId, "reject");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAllMenus();
    }
  });

  fetchNominations();
});
