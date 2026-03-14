window.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("nominationForm");

  if (!form) {
    return;
  }

  const toggleButtons = form.querySelectorAll("[data-form-toggle]");
  const panels = form.querySelectorAll("[data-form-panel]");
  const sectionToggles = form.querySelectorAll(".section-toggle");
  const addLinkButtons = form.querySelectorAll("[data-add-link]");
  const apiBase = (form.dataset.apiBase || "").replace(/\/$/, "");
  const endpoint = apiBase ? `${apiBase}/nomination` : "/nomination";

  const setStatus = (panel, message, type = "info") => {
    const status = panel.querySelector(".form-status");

    if (!status) {
      return;
    }

    status.textContent = message;
    status.classList.toggle("is-error", type === "error");
    status.classList.toggle("is-success", type === "success");
  };

  const clearStatus = () => {
    panels.forEach((panel) => {
      const status = panel.querySelector(".form-status");

      if (!status) {
        return;
      }

      status.textContent = "";
      status.classList.remove("is-error", "is-success");
    });
  };

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

  const getLinks = (panel, groupName) =>
    Array.from(panel.querySelectorAll(`[data-link-group="${groupName}"] input`))
      .map((input) => input.value.trim())
      .filter(Boolean);

  const setActivePanel = (panelName) => {
    clearStatus();

    toggleButtons.forEach((button) => {
      const isActive = button.dataset.formToggle === panelName;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isActive));
      button.tabIndex = isActive ? 0 : -1;
    });

    panels.forEach((panel) => {
      const isActive = panel.dataset.formPanel === panelName;
      panel.hidden = !isActive;
      panel.setAttribute("aria-hidden", String(!isActive));
      panel.classList.toggle("is-active", isActive);

      panel
        .querySelectorAll("input, textarea, select, button")
        .forEach((field) => {
          field.disabled = !isActive;
        });
    });
  };

  const initSectionToggles = () => {
    sectionToggles.forEach((toggle) => {
      const section = toggle.closest(".form-section");
      const body = section?.querySelector(".section-body");

      if (!section || !body) {
        return;
      }

      body.hidden = false;
      toggle.setAttribute("aria-expanded", "true");

      toggle.addEventListener("click", () => {
        const isCollapsed = section.classList.toggle("is-collapsed");
        body.hidden = isCollapsed;
        toggle.setAttribute("aria-expanded", String(!isCollapsed));
      });
    });
  };

  const initAddLinks = () => {
    addLinkButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const groupName = button.dataset.addLink;
        const panel = button.closest(".form-panel");
        const group = panel?.querySelector(`[data-link-group="${groupName}"]`);

        if (!group) {
          return;
        }

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

  const initImagePreview = () => {
    const uploads = form.querySelectorAll(".profile-upload");

    uploads.forEach((upload) => {
      const input = upload.querySelector('input[type="file"]');
      const preview = upload.querySelector(".profile-upload__preview");

      if (!input || !preview) {
        return;
      }

      input.addEventListener("change", (event) => {
        const file = event.target.files && event.target.files[0];

        if (!file) {
          preview.style.backgroundImage = "";
          preview.classList.remove("has-image");
          return;
        }

        if (!file.type.startsWith("image/")) {
          return;
        }

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          preview.style.backgroundImage = `url("${loadEvent.target.result}")`;
          preview.classList.add("has-image");
        };

        reader.readAsDataURL(file);
      });
    });
  };

  const buildPayload = (panel) => {
    const isSelfSubmission = panel.dataset.formPanel === "self-submission";
    const nomineeName = getValue(
      panel,
      isSelfSubmission ? "#self-nomineeName" : "#nomineeName",
    );
    const nomineeEmail = getValue(
      panel,
      isSelfSubmission ? "#self-nomineeEmail" : "#nomineeEmail",
    );
    const fieldOfWork = getValue(
      panel,
      isSelfSubmission ? "#self-fieldOfWork" : "#fieldOfWork",
    );
    const region = getValue(
      panel,
      isSelfSubmission ? "#self-region" : "#region",
    );
    const description = getValue(
      panel,
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
      evidence_urls: getLinks(panel, socialGroup),
      supporting_urls: getLinks(panel, supportingGroup),
      description,
    };

    if (!isSelfSubmission) {
      const nominatorName = getValue(panel, "#nominatorName");
      const nominatorEmail = getValue(panel, "#nominatorEmail");
      const relationship = getValue(panel, "#relationship");
      const { firstName: nominator_first_name, lastName: nominator_last_name } =
        splitName(nominatorName);

      payload.nominator_first_name = nominator_first_name;
      payload.nominator_last_name = nominator_last_name;
      payload.nominator_email = nominatorEmail;
      payload.relationship_to_nominee = relationship;
    }

    return payload;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    clearStatus();

    const activePanel = form.querySelector("[data-form-panel].is-active");

    if (!activePanel) {
      return;
    }

    const submitButton = activePanel.querySelector(".submit-btn");
    const originalButtonText = submitButton ? submitButton.textContent : "";
    const payload = buildPayload(activePanel);

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Submitting...";
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to submit nomination.");
      }

      setStatus(
        activePanel,
        "Submission received. We will reach out shortly.",
        "success",
      );
      form.reset();
      form.querySelectorAll(".profile-upload__preview").forEach((preview) => {
        preview.style.backgroundImage = "";
        preview.classList.remove("has-image");
      });
    } catch (error) {
      setStatus(
        activePanel,
        error.message || "Something went wrong. Please try again.",
        "error",
      );
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText || "Submit Nomination";
      }
    }
  };

  toggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setActivePanel(button.dataset.formToggle);
    });
  });

  form.addEventListener("submit", handleSubmit);

  initSectionToggles();
  initAddLinks();
  initImagePreview();
  setActivePanel("nomination");
});
