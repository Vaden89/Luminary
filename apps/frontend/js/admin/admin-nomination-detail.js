import { ACTIVE_CONFIG as CONFIG } from "../config.js";

window.addEventListener("DOMContentLoaded", () => {
  const STATUS_META = {
    pending: {
      label: "Pending",
      className: "status-tag--pending",
    },
    approved: {
      label: "Approved",
      className: "status-tag--approved",
    },
    suspended: {
      label: "Suspended",
      className: "status-tag--suspended",
    },
    rejected: {
      label: "Rejected",
      className: "status-tag--rejected",
    },
  };
  const nominationsEndpoint = `${CONFIG.BACKEND_URL}/admin/nominations`;
  const accessToken = localStorage.getItem("access_token") || "";
  const queryParams = new URLSearchParams(window.location.search);
  const toast = document.getElementById("actionToast");
  const reviewHeading = document.getElementById("reviewHeading");
  const statusTag = document.getElementById("statusTag");
  const detailIntro = document.getElementById("detailIntro");
  const nomineeAvatar = document.getElementById("nomineeAvatar");
  const nomineeName = document.getElementById("nomineeName");
  const nomineeOrganization = document.getElementById("nomineeOrganization");
  const nomineeField = document.getElementById("nomineeField");
  const nomineeRegion = document.getElementById("nomineeRegion");
  const nomineeSummary = document.getElementById("nomineeSummary");
  const nomineeEmail = document.getElementById("nomineeEmail");
  const impactDescription = document.getElementById("impactDescription");
  const submittedByName = document.getElementById("submittedByName");
  const submittedByRelationship = document.getElementById(
    "submittedByRelationship",
  );
  const submittedByEmail = document.getElementById("submittedByEmail");
  const submitterSectionTitle = document.getElementById(
    "submitterSectionTitle",
  );
  const statusOverviewValue = document.getElementById("statusOverviewValue");
  const submittedAtValue = document.getElementById("submittedAtValue");
  const updatedAtValue = document.getElementById("updatedAtValue");
  const submissionTypeValue = document.getElementById("submissionTypeValue");
  const supportingLinksList = document.getElementById("supportingLinksList");
  const evidenceLinksList = document.getElementById("evidenceLinksList");
  const approveButton = document.getElementById("approveNominationButton");
  const rejectButton = document.getElementById("rejectNominationButton");
  const refreshButton = document.getElementById("refreshDetailButton");

  const state = {
    nomination: null,
    isLoading: false,
    pendingAction: "",
  };

  let toastTimeoutId = 0;

  const resolveNominationId = () => {
    const fromQuery =
      queryParams.get("nomination")?.trim() ||
      queryParams.get("id")?.trim() ||
      "";

    if (fromQuery) {
      sessionStorage.setItem("active_admin_nomination_id", fromQuery);
      return fromQuery;
    }

    const pathSegments = window.location.pathname
      .split("/")
      .map((segment) => segment.trim())
      .filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1] || "";
    const normalizedLastSegment = lastSegment.replace(/\.html$/i, "");

    if (
      normalizedLastSegment &&
      !["admin-nomination-detail", "admin-nomination-detail/index"].includes(
        normalizedLastSegment,
      )
    ) {
      sessionStorage.setItem(
        "active_admin_nomination_id",
        normalizedLastSegment,
      );
      return normalizedLastSegment;
    }

    return sessionStorage.getItem("active_admin_nomination_id")?.trim() || "";
  };

  const nominationId = resolveNominationId();

  const redirectToLogin = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "admin-login.html";
  };

  const getAuthHeaders = () => ({
    Accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
  });

  const getName = (person) =>
    [person?.first_name, person?.last_name].filter(Boolean).join(" ").trim();

  const getInitials = (name) =>
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "NA";

  const normalizeStatus = (status) => {
    const normalized = String(status || "pending")
      .trim()
      .toLowerCase();
    return STATUS_META[normalized] ? normalized : "pending";
  };

  const formatDate = (value) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "--";
    }

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  };

  const getLinkLabel = (url) => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.hostname.replace(/^www\./, "");
    } catch {
      return url;
    }
  };

  const asUrlList = (value) =>
    Array.isArray(value)
      ? value.filter((item) => typeof item === "string" && item.trim())
      : [];

  const setText = (element, value, fallback = "--") => {
    element.textContent =
      typeof value === "string" && value.trim() ? value.trim() : fallback;
  };

  const setDetailIntro = (message, type = "info") => {
    detailIntro.textContent = message;
    detailIntro.classList.toggle("is-error", type === "error");
  };

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimeoutId);
    toastTimeoutId = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 2200);
  };

  const clearChildren = (element) => {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  };

  const createAnchor = (url, label) => {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noreferrer noopener";
    link.textContent = label;
    return link;
  };

  const renderSupportingLinks = (links) => {
    clearChildren(supportingLinksList);

    if (!links.length) {
      const item = document.createElement("li");
      item.textContent = "No supporting links available.";
      supportingLinksList.appendChild(item);
      return;
    }

    links.forEach((url, index) => {
      const item = document.createElement("li");
      item.appendChild(createAnchor(url, `Supporting link ${index + 1}`));
      supportingLinksList.appendChild(item);
    });
  };

  const renderEvidenceLinks = (links) => {
    clearChildren(evidenceLinksList);

    if (!links.length) {
      const item = document.createElement("li");
      item.textContent = "No evidence links were submitted.";
      evidenceLinksList.appendChild(item);
      return;
    }

    links.forEach((url, index) => {
      const item = document.createElement("li");
      const content = document.createElement("div");
      const title = document.createElement("h5");
      const description = document.createElement("p");
      const link = createAnchor(url, "Open link");

      title.textContent = `Evidence link ${index + 1}`;
      description.textContent = getLinkLabel(url);

      content.append(title, description);
      item.append(content, link);
      evidenceLinksList.appendChild(item);
    });
  };

  const syncActionButtons = () => {
    const status = normalizeStatus(state.nomination?.status);
    const isBusy = Boolean(state.pendingAction) || state.isLoading;
    const hasNomination = Boolean(state.nomination);

    approveButton.disabled = !hasNomination || isBusy || status === "approved";
    rejectButton.disabled = !hasNomination || isBusy || status === "rejected";
    refreshButton.disabled = isBusy;

    approveButton.textContent =
      state.pendingAction === "approve" ? "Approving..." : "Approve nomination";
    rejectButton.textContent =
      state.pendingAction === "reject" ? "Rejecting..." : "Reject nomination";
  };

  const renderNomination = (nomination) => {
    const nomineeFullName = getName(nomination.nominee) || "Unknown nominee";
    const nominatorFullName = getName(nomination.nominator);
    const submissionType = nominatorFullName ? "Nomination" : "Self submission";
    const status = normalizeStatus(nomination.status);
    const statusMeta = STATUS_META[status];
    const summary = nomination.description || "No summary available.";
    const supportingLinks = asUrlList(nomination.supporting_urls);
    const evidenceLinks = asUrlList(nomination.evidence_urls);

    reviewHeading.textContent = `Reviewing ${nomineeFullName}`;
    statusTag.className = `status-tag ${statusMeta.className}`;
    statusTag.textContent = statusMeta.label;
    nomineeAvatar.textContent = getInitials(nomineeFullName);
    nomineeName.textContent = nomineeFullName;
    nomineeOrganization.textContent =
      nomination.nominee?.organization || "Independent / not provided";
    setText(nomineeField, nomination.nominee?.field, "Unspecified");
    setText(nomineeRegion, nomination.nominee?.country, "Unknown region");
    setText(nomineeSummary, summary, "No summary available.");
    setText(
      nomineeEmail,
      nomination.nominee?.email,
      "No contact email provided",
    );
    setText(
      impactDescription,
      nomination.description,
      "No impact description provided.",
    );
    setText(
      submittedByName,
      nominatorFullName || "Self Submission",
      "Self Submission",
    );
    setText(
      submittedByRelationship,
      nomination.nominator?.relationship_to_nominee ||
        (nominatorFullName ? "Nominator" : "Self-submitted"),
      "Self-submitted",
    );
    setText(
      submittedByEmail,
      nomination.nominator?.email || nomination.nominee?.email,
      "No email provided",
    );
    submitterSectionTitle.textContent = nominatorFullName
      ? "Nominator Details"
      : "Self Submission Details";
    statusOverviewValue.textContent = statusMeta.label;
    submittedAtValue.textContent = formatDate(nomination.created_at);
    updatedAtValue.textContent = formatDate(
      nomination.updated_at || nomination.created_at,
    );
    submissionTypeValue.textContent = submissionType;
    setDetailIntro(
      `${submissionType} for ${nomineeFullName} loaded successfully.`,
    );

    renderSupportingLinks(supportingLinks);
    renderEvidenceLinks(evidenceLinks);
    syncActionButtons();
  };

  const renderErrorState = (message) => {
    reviewHeading.textContent = "Nomination Review";
    statusTag.className = "status-tag status-tag--rejected";
    statusTag.textContent = "Unavailable";
    nomineeAvatar.textContent = "NA";
    nomineeName.textContent = "Unable to load nomination";
    nomineeOrganization.textContent = "Please try again.";
    setDetailIntro(message, "error");
    clearChildren(supportingLinksList);
    clearChildren(evidenceLinksList);

    const supportingItem = document.createElement("li");
    supportingItem.textContent = "No supporting links available.";
    supportingLinksList.appendChild(supportingItem);

    const evidenceItem = document.createElement("li");
    evidenceItem.textContent = "No evidence links were submitted.";
    evidenceLinksList.appendChild(evidenceItem);

    [
      nomineeField,
      nomineeRegion,
      nomineeSummary,
      nomineeEmail,
      impactDescription,
      submittedByName,
      submittedByRelationship,
      submittedByEmail,
      statusOverviewValue,
      submittedAtValue,
      updatedAtValue,
      submissionTypeValue,
    ].forEach((element) => {
      element.textContent = "--";
    });

    syncActionButtons();
  };

  const fetchNominationDetails = async () => {
    if (!nominationId) {
      renderErrorState("No nomination id was provided in the URL.");
      return;
    }

    state.isLoading = true;
    setDetailIntro("Loading nomination details from the server.");
    syncActionButtons();

    try {
      const response = await fetch(
        `${nominationsEndpoint}/${encodeURIComponent(nominationId)}`,
        {
          headers: getAuthHeaders(),
        },
      );
      const result = await response.json().catch(() => ({}));

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error || "Unable to load nomination details.");
      }

      state.nomination = result.data;
      renderNomination(result.data);
    } catch (error) {
      state.nomination = null;
      renderErrorState(
        error.message || "Unable to load nomination details right now.",
      );
      showToast(
        error.message || "Unable to load nomination details right now.",
      );
    } finally {
      state.isLoading = false;
      syncActionButtons();
    }
  };

  const updateNominationStatus = async (action) => {
    if (!state.nomination || state.pendingAction) {
      return;
    }

    state.pendingAction = action;
    syncActionButtons();

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

      state.nomination = {
        ...state.nomination,
        ...result.data,
        status:
          result.data?.status ||
          (action === "approve" ? "approved" : "rejected"),
      };

      renderNomination(state.nomination);
      showToast(
        action === "approve"
          ? "Nomination approved successfully."
          : "Nomination rejected successfully.",
      );
    } catch (error) {
      showToast(
        error.message ||
          `Unable to ${action === "approve" ? "approve" : "reject"} nomination.`,
      );
    } finally {
      state.pendingAction = "";
      syncActionButtons();
    }
  };

  if (!accessToken) {
    redirectToLogin();
    return;
  }

  approveButton.addEventListener("click", () => {
    updateNominationStatus("approve");
  });

  rejectButton.addEventListener("click", () => {
    updateNominationStatus("reject");
  });

  refreshButton.addEventListener("click", () => {
    fetchNominationDetails();
  });

  fetchNominationDetails();
});
