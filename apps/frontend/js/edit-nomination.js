window.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("editNominationForm");
  const loadingState = document.getElementById("editLoadingState");
  const errorState = document.getElementById("editErrorState");
  const formSection = document.getElementById("editFormSection");
  const banner = document.querySelector(".edit-banner");
  const bannerName = document.getElementById("bannerNomineeName");

  if (!form) return;

  const DUMMY_NOMINATION = {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    status: "pending",
    description:
      "Amara has pioneered open-source tools for rural healthcare data collection across West Africa, directly impacting over 200,000 patients in underserved communities.",
    evidence_urls: ["https://linkedin.com/in/amara-okafor"],
    supporting_urls: ["https://techcabal.com/amara-okafor-healthtech"],
    nominee: {
      id: "n001",
      first_name: "Amara",
      last_name: "Okafor",
      email: "amara.okafor@example.com",
      country: "Lagos, Nigeria",
      field: "Technology & Engineering",
      organization: "",
    },
    /* Set to null to simulate self-submission form*/
    nominator: {
      id: "m001",
      first_name: "Chisom",
      last_name: "Adeyemi",
      email: "chisom.adeyemi@example.com",
      relationship_to_nominee: "Colleague",
    },
  };

  /* UI state helpers */
  const showLoading = () => {
    loadingState.hidden = false;
    errorState.hidden = true;
    formSection.hidden = true;
    banner.hidden = true;
  };

  const showError = () => {
    loadingState.hidden = true;
    errorState.hidden = false;
    formSection.hidden = true;
    banner.hidden = true;
  };

  const showForm = () => {
    loadingState.hidden = true;
    errorState.hidden = true;
    formSection.hidden = false;
    banner.hidden = false;
  };

  /* Populate fields from API data */
  const setField = (selector, value) => {
    const el = form.querySelector(selector);
    if (!el) return;
    if (el.tagName === "SELECT") {
      const option = Array.from(el.options).find(
        (opt) => opt.textContent.trim() === value,
      );
      if (option) option.selected = true;
    } else if (el.tagName === "TEXTAREA") {
      el.value = value;
    } else {
      el.value = value;
    }
  };

  const populateLinks = (groupSelector, urls) => {
    const group = form.querySelector(`[data-link-group="${groupSelector}"]`);
    if (!group || !urls) return;

    const inputs = group.querySelectorAll("input");
    urls.forEach((url, i) => {
      if (inputs[i]) {
        inputs[i].value = url;
      } else {
        const inputName = group.dataset.inputName || groupSelector;
        const placeholder = group.dataset.placeholder || "https://";
        const nextIndex = i + 1;
        const newInput = document.createElement("input");
        newInput.type = "url";
        newInput.placeholder = placeholder;
        newInput.id = `${inputName}${nextIndex}`;
        newInput.name = `${inputName}${nextIndex}`;
        newInput.value = url;
        group.appendChild(newInput);
      }
    });
  };

  const populateNominationPanel = (data) => {
    const { nominee, nominator } = data;
    const fullName = `${nominator.first_name} ${nominator.last_name}`.trim();

    setField("#nominatorName", fullName);
    setField("#nominatorEmail", nominator.email);
    setField("#relationship", nominator.relationship_to_nominee);
    setField(
      "#nomineeName",
      `${nominee.first_name} ${nominee.last_name}`.trim(),
    );
    setField("#nomineeEmail", nominee.email);
    setField("#fieldOfWork", nominee.field);
    setField("#region", nominee.country);
    setField("#impactDescription", data.description);

    populateLinks("supporting", data.supporting_urls);
    populateLinks("social", data.evidence_urls);
  };

  const populateSelfSubmissionPanel = (data) => {
    const { nominee } = data;

    setField(
      "#self-nomineeName",
      `${nominee.first_name} ${nominee.last_name}`.trim(),
    );
    setField("#self-nomineeEmail", nominee.email);
    setField("#self-fieldOfWork", nominee.field);
    setField("#self-region", nominee.country);
    setField("#self-impactDescription", data.description);

    populateLinks("self-supporting", data.supporting_urls);
    populateLinks("self-social", data.evidence_urls);
  };

  /* Activate the correct panel */
  const activatePanel = (panelName) => {
    const panels = form.querySelectorAll("[data-form-panel]");

    panels.forEach((panel) => {
      const isTarget = panel.dataset.formPanel === panelName;
      panel.hidden = !isTarget;
      panel.setAttribute("aria-hidden", String(!isTarget));
      panel.classList.toggle("is-active", isTarget);

      panel
        .querySelectorAll("input, textarea, select, button")
        .forEach((field) => {
          field.disabled = !isTarget;
        });
    });
  };

  /* Section collapse / expand */
  const initSectionToggles = () => {
    form.querySelectorAll(".section-toggle").forEach((toggle) => {
      const section = toggle.closest(".form-section");
      const body = section?.querySelector(".section-body");

      if (!section || !body) return;

      body.hidden = false;
      toggle.setAttribute("aria-expanded", "true");

      toggle.addEventListener("click", () => {
        const isCollapsed = section.classList.toggle("is-collapsed");
        body.hidden = isCollapsed;
        toggle.setAttribute("aria-expanded", String(!isCollapsed));
      });
    });
  };

  /* Add link inputs */
  const initAddLinks = () => {
    form.querySelectorAll("[data-add-link]").forEach((button) => {
      button.addEventListener("click", () => {
        const groupName = button.dataset.addLink;
        const panel = button.closest("[data-form-panel]") || form;
        const group = panel.querySelector(`[data-link-group="${groupName}"]`);

        if (!group) return;

        const inputName = group.dataset.inputName || groupName;
        const placeholder = group.dataset.placeholder || "https://";
        const inputCount = group.querySelectorAll("input").length;
        const nextIndex = inputCount + 1;

        const newInput = document.createElement("input");
        newInput.type = "url";
        newInput.placeholder = placeholder;
        newInput.id = `${inputName}${nextIndex}`;
        newInput.name = `${inputName}${nextIndex}`;
        newInput.setAttribute("aria-label", `${groupName} link ${nextIndex}`);

        group.appendChild(newInput);
      });
    });
  };

  /* Collect links from a group */
  const getLinks = (panel, groupName) =>
    Array.from(panel.querySelectorAll(`[data-link-group="${groupName}"] input`))
      .map((input) => input.value.trim())
      .filter(Boolean);

  /* Build payload */
  const splitName = (value) => {
    const parts = value.trim().split(/\s+/).filter(Boolean);
    return {
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" "),
    };
  };

  const getValue = (panel, selector) => {
    const input = panel.querySelector(selector);
    return input ? input.value.trim() : "";
  };

  const buildPayload = (activePanel) => {
    const isSelfSubmission =
      activePanel.dataset.formPanel === "self-submission";

    const nomineeName = getValue(
      activePanel,
      isSelfSubmission ? "#self-nomineeName" : "#nomineeName",
    );
    const nomineeEmail = getValue(
      activePanel,
      isSelfSubmission ? "#self-nomineeEmail" : "#nomineeEmail",
    );
    const fieldOfWork = getValue(
      activePanel,
      isSelfSubmission ? "#self-fieldOfWork" : "#fieldOfWork",
    );
    const region = getValue(
      activePanel,
      isSelfSubmission ? "#self-region" : "#region",
    );
    const description = getValue(
      activePanel,
      isSelfSubmission ? "#self-impactDescription" : "#impactDescription",
    );

    const { firstName: nominee_first_name, lastName: nominee_last_name } =
      splitName(nomineeName);

    const supportingGroup = isSelfSubmission ? "self-supporting" : "supporting";
    const socialGroup = isSelfSubmission ? "self-social" : "social";

    const payload = {
      is_self_submission: isSelfSubmission,
      nominee_first_name,
      nominee_last_name,
      nominee_email: nomineeEmail,
      nominee_country: region,
      nominee_field: fieldOfWork,
      nominee_organization: "",
      evidence_urls: getLinks(activePanel, socialGroup),
      supporting_urls: getLinks(activePanel, supportingGroup),
      description,
    };

    if (!isSelfSubmission) {
      const nominatorName = getValue(activePanel, "#nominatorName");
      const nominatorEmail = getValue(activePanel, "#nominatorEmail");
      const relationship = getValue(activePanel, "#relationship");
      const { firstName: nominator_first_name, lastName: nominator_last_name } =
        splitName(nominatorName);

      payload.nominator_first_name = nominator_first_name;
      payload.nominator_last_name = nominator_last_name;
      payload.nominator_email = nominatorEmail;
      payload.relationship_to_nominee = relationship;
    }

    return payload;
  };

  /* Status helpers */
  const setStatus = (panel, message, type = "info") => {
    const status = panel.querySelector(".form-status");
    if (!status) return;
    status.textContent = message;
    status.classList.toggle("is-error", type === "error");
    status.classList.toggle("is-success", type === "success");
  };

  const clearStatus = () => {
    form.querySelectorAll(".form-status").forEach((el) => {
      el.textContent = "";
      el.classList.remove("is-error", "is-success");
    });
  };

  /* Form submission */
  const handleSubmit = async (event) => {
    event.preventDefault();
    clearStatus();

    const activePanel = form.querySelector("[data-form-panel].is-active");
    if (!activePanel) return;

    const submitButton = activePanel.querySelector(".submit-btn");
    const originalText = submitButton ? submitButton.textContent : "";

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Updating...";
    }

    const payload = buildPayload(activePanel);

    try {
      /* Simulate API call */
      await new Promise((resolve) => setTimeout(resolve, 1200));

      console.log("Edit nomination payload:", payload);
      setStatus(
        activePanel,
        "Nomination updated successfully. Our team will continue the review.",
        "success",
      );
    } catch (error) {
      setStatus(
        activePanel,
        error.message || "Something went wrong. Please try again.",
        "error",
      );
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalText || "Update Nomination";
      }
    }
  };

  /* Fetch nomination */
  const fetchNomination = async () => {
    showLoading();

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return DUMMY_NOMINATION;
    } catch {
      return null;
    }
  };

  const bootstrap = async () => {
    const data = await fetchNomination();

    if (!data) {
      showError();
      return;
    }

    const isSelfSubmission = data.nominator === null;
    const { nominee } = data;
    const nomineeFull = `${nominee.first_name} ${nominee.last_name}`.trim();

    /* Update banner with nominee name */
    if (bannerName) bannerName.textContent = nomineeFull;

    /* Activate the correct panel based on nominator presence */
    if (isSelfSubmission) {
      activatePanel("self-submission");
      populateSelfSubmissionPanel(data);
    } else {
      activatePanel("nomination");
      populateNominationPanel(data);
    }

    showForm();
    initSectionToggles();
    initAddLinks();
    form.addEventListener("submit", handleSubmit);
  };

  bootstrap();
});
