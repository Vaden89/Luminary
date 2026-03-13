window.addEventListener("DOMContentLoaded", () => {
  const toggleButtons = document.querySelectorAll("[data-form-toggle]");
  const panels = document.querySelectorAll("[data-form-panel]");
  const sectionToggles = document.querySelectorAll(".section-toggle");
  const addLinkButtons = document.querySelectorAll("[data-add-link]");

  const setActivePanel = (panelName) => {
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
        const group = document.querySelector(
          `[data-link-group="${groupName}"]`
        );

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
    const photoInput = document.getElementById("profilePhoto");
    const preview = document.querySelector(".profile-upload__preview");

    if (!photoInput || !preview) {
      return;
    }

    photoInput.addEventListener("change", (event) => {
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
  };

  toggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setActivePanel(button.dataset.formToggle);
    });
  });

  initSectionToggles();
  initAddLinks();
  initImagePreview();
  setActivePanel("nomination");
});
