// js/main/add-article.js
import { sanityMutate, sanityUploadImage } from "../cms/sanity.js";

window.addEventListener("DOMContentLoaded", () => {
  // ── DOM refs ───────────────────────────────────────────────────────────────
  const sourceType = document.getElementById("sourceType");
  const sourceNameLabel = document.getElementById("sourceNameLabel");
  const sourceNameInput = document.getElementById("sourceName");
  const externalUrlInput = document.getElementById("externalUrl");
  const contentNote = document.getElementById("contentNote");
  const coverImageInput = document.getElementById("coverImage");
  const uploadDropzone = document.getElementById("uploadDropzone");
  const uploadPreview = document.getElementById("uploadPreview");
  const uploadTitle = document.getElementById("uploadTitle");
  const uploadMeta = document.getElementById("uploadMeta");
  const toolbarButtons = Array.from(
    document.querySelectorAll(".editor-toolbar button"),
  );
  const submitBtn = document.getElementById("submitBtn");
  const submitLabel = submitBtn.querySelector(".submit-btn__label");
  const formMessage = document.getElementById("formMessage");
  const form = document.getElementById("articleEditor");
  const categorySelect = document.getElementById("articleCategory");

  const apiBase = (document.body.dataset.apiBase || "").replace(/\/$/, "");

  let previewUrl = "";

  // ── Helpers ────────────────────────────────────────────────────────────────

  const revokePreviewUrl = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = "";
    }
  };

  const showMessage = (text, type) => {
    formMessage.textContent = text;
    formMessage.className = `form-message form-message--${type}`;
    formMessage.style.display = "block";
    formMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const clearMessage = () => {
    formMessage.style.display = "none";
  };

  const estimateReadTime = (text) => {
    const words = (text ?? "").trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 250));
    return `${minutes} min read`;
  };

  const slugify = (text) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const getCategoryLabel = (category) => {
    if (typeof category === "string") return category.trim();
    const label = [
      category?.name,
      category?.title,
      category?.label,
      category?.field,
      category?.value,
      category?.slug,
    ].find((v) => typeof v === "string" && v.trim());
    return label ? label.trim() : "";
  };

  // ── Mark a field as invalid ────────────────────────────────────────────────

  const setFieldError = (el, message) => {
    const field = el.closest(".field") || el.parentElement;
    field.classList.add("field--error");
    let hint = field.querySelector(".field-error");
    if (!hint) {
      hint = document.createElement("span");
      hint.className = "field-error";
      field.appendChild(hint);
    }
    hint.textContent = message;
  };

  const clearFieldErrors = () => {
    form.querySelectorAll(".field--error").forEach((f) => {
      f.classList.remove("field--error");
      f.querySelector(".field-error")?.remove();
    });
  };

  // ── Fetch categories from API ──────────────────────────────────────────────

  const fetchCategories = async () => {
    const endpoint = apiBase
      ? `${apiBase}/categories`
      : "/api/categories";

    try {
      const res = await fetch(endpoint, {
        headers: { Accept: "application/json" },
      });
      const result = await res.json().catch(() => ({}));

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Unable to load categories.");
      }

      const categories = Array.isArray(result.data) ? result.data : [];
      categorySelect.innerHTML = '<option value="">Select category</option>';
      categories.forEach((cat) => {
        const label = getCategoryLabel(cat);
        if (!label) return;
        const opt = document.createElement("option");
        opt.value = label;
        opt.textContent = label;
        categorySelect.appendChild(opt);
      });
    } catch {
      categorySelect.innerHTML =
        '<option value="">Unable to load categories</option>';
    }
  };

  fetchCategories();

  // ── Source type toggle ─────────────────────────────────────────────────────

  const syncSourceType = () => {
    const isExternal = sourceType.value === "external";

    sourceNameLabel.textContent = isExternal ? "Source Name" : "Author Name";
    sourceNameInput.placeholder = isExternal
      ? "E.g. The New York Times"
      : "E.g. Ada Okafor";
    externalUrlInput.required = isExternal;
    contentNote.textContent = isExternal
      ? "Optional — paste excerpts or notes. The full article lives on the external site."
      : "Use this section when composing original Luminary content.";
  };

  // ── Cover image preview ────────────────────────────────────────────────────

  const updateCoverImageState = () => {
    const file = coverImageInput.files?.[0];
    revokePreviewUrl();

    if (!file) {
      uploadDropzone.classList.remove("has-file");
      uploadPreview.hidden = true;
      uploadPreview.style.backgroundImage = "";
      uploadTitle.textContent = "Click to upload or drag and drop";
      uploadMeta.textContent = "SVG, PNG, JPG or GIF (max. 5MB)";
      return;
    }

    uploadDropzone.classList.add("has-file");
    uploadTitle.textContent = file.name;
    uploadMeta.textContent = `${Math.max(1, Math.round(file.size / 1024))} KB selected`;

    if (file.type.startsWith("image/")) {
      previewUrl = URL.createObjectURL(file);
      uploadPreview.style.backgroundImage = `url("${previewUrl}")`;
      uploadPreview.hidden = false;
    } else {
      uploadPreview.hidden = true;
      uploadPreview.style.backgroundImage = "";
    }
  };

  // ── Toolbar — bold / italic / underline ─────────────────────────────────────

  const contentEditor = document.getElementById("articleContent");

  toolbarButtons.forEach((btn) => {
    const command = btn.dataset.command;
    if (!command) return;

    btn.addEventListener("click", () => {
      document.execCommand(command, false, null);
      btn.classList.toggle("is-active", document.queryCommandState(command));
      contentEditor.focus();
    });
  });

  // Keep toolbar button states in sync with the caret position
  contentEditor.addEventListener("keyup", updateToolbarState);
  contentEditor.addEventListener("mouseup", updateToolbarState);

  function updateToolbarState() {
    toolbarButtons.forEach((btn) => {
      const command = btn.dataset.command;
      if (command) {
        btn.classList.toggle("is-active", document.queryCommandState(command));
      }
    });
  }

  // ── Drag and drop ──────────────────────────────────────────────────────────

  uploadDropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadDropzone.classList.add("is-dragging");
  });

  uploadDropzone.addEventListener("dragleave", () => {
    uploadDropzone.classList.remove("is-dragging");
  });

  uploadDropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadDropzone.classList.remove("is-dragging");
    const droppedFile = e.dataTransfer?.files?.[0];
    if (!droppedFile) return;
    const transfer = new DataTransfer();
    transfer.items.add(droppedFile);
    coverImageInput.files = transfer.files;
    updateCoverImageState();
  });

  sourceType.addEventListener("change", syncSourceType);
  coverImageInput.addEventListener("change", updateCoverImageState);
  syncSourceType();

  // ── Submit button states ───────────────────────────────────────────────────

  const setSubmitLoading = (loading) => {
    submitBtn.disabled = loading;
    submitBtn.classList.toggle("is-loading", loading);
    submitLabel.textContent = loading ? "Submitting…" : "Submit Article";
  };

  // ── Form validation ────────────────────────────────────────────────────────

  const validate = ({ title, category, region, sourceTypeVal, externalUrl, body, imageFile }) => {
    clearFieldErrors();
    const errors = [];

    if (!title) {
      setFieldError(document.getElementById("articleTitle"), "Headline is required.");
      errors.push("title");
    }

    if (!category) {
      setFieldError(categorySelect, "Please select a category.");
      errors.push("category");
    }

    if (!region) {
      setFieldError(document.getElementById("articleRegion"), "Please select a region.");
      errors.push("region");
    }

    if (!imageFile) {
      setFieldError(uploadDropzone, "A cover image is required.");
      errors.push("image");
    } else if (imageFile.size > 5 * 1024 * 1024) {
      setFieldError(uploadDropzone, "Image must be under 5 MB.");
      errors.push("image");
    }

    if (sourceTypeVal === "external" && !externalUrl) {
      setFieldError(externalUrlInput, "External URL is required for this source type.");
      errors.push("externalUrl");
    }

    if (sourceTypeVal === "external" && externalUrl) {
      try {
        new URL(externalUrl);
      } catch {
        setFieldError(externalUrlInput, "Please enter a valid URL.");
        errors.push("externalUrl");
      }
    }

    if (sourceTypeVal === "original" && !body) {
      setFieldError(contentEditor, "Article content is required for original posts.");
      errors.push("body");
    }

    if (errors.length) {
      const firstBad = form.querySelector(".field--error");
      firstBad?.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    return errors.length === 0;
  };

  // ── Form submission → Sanity ───────────────────────────────────────────────

  submitBtn.addEventListener("click", async () => {
    clearMessage();

    // ── Collect values ───────────────────────────────────────────────────────
    const title = document.getElementById("articleTitle").value.trim();
    const category = categorySelect.value;
    const region = document.getElementById("articleRegion").value;
    const sourceName = document.getElementById("sourceName").value.trim();
    const publicationDate = document.getElementById("publicationDate").value;
    const externalUrl = externalUrlInput.value.trim();
    const summary = document.getElementById("briefSummary").value.trim();
    const bodyEl = document.getElementById("articleContent");
    const body = bodyEl.innerText.trim();
    const bodyHtml = bodyEl.innerHTML.trim();
    const sourceTypeVal = sourceType.value;
    const imageFile = coverImageInput.files?.[0];

    // ── Validation ───────────────────────────────────────────────────────────
    if (!validate({ title, category, region, sourceTypeVal, externalUrl, body, imageFile })) {
      return;
    }

    // ── Loading state ─────────────────────────────────────────────────────────
    setSubmitLoading(true);

    try {
      // ── Upload image ───────────────────────────────────────────────────────
      const assetId = await sanityUploadImage(imageFile);
      const coverImageRef = {
        _type: "image",
        asset: { _type: "reference", _ref: assetId },
      };

      // ── Build slug ─────────────────────────────────────────────────────────
      const slug = slugify(title);

      // ── Send mutation to Sanity ────────────────────────────────────────────
      await sanityMutate([
        {
          create: {
            _type: "article",
            title,
            slug: { _type: "slug", current: slug },
            field: category,
            region,
            source: sourceTypeVal === "external" ? sourceName : "Luminary",
            author: sourceName,
            sourceType: sourceTypeVal,
            externalUrl: externalUrl || null,
            excerpt: summary || null,
            body: bodyHtml || null,
            coverImage: coverImageRef,
            publicationDate: publicationDate || null,
            readTime: body ? estimateReadTime(body) : null,
            status: "pending_review",
            submittedByUser: true,
            submittedAt: new Date().toISOString(),
          },
        },
      ]);

      // ── Success ────────────────────────────────────────────────────────────
      showMessage(
        "Your story has been submitted and is pending review. Thank you!",
        "success",
      );
      form.reset();
      contentEditor.innerHTML = "";
      clearFieldErrors();
      revokePreviewUrl();
      uploadDropzone.classList.remove("has-file");
      uploadPreview.hidden = true;
      uploadTitle.textContent = "Click to upload or drag and drop";
      uploadMeta.textContent = "SVG, PNG, JPG or GIF (max. 5MB)";
      syncSourceType();
    } catch (err) {
      console.error(err);
      showMessage("Something went wrong. Please try again.", "error");
    } finally {
      setSubmitLoading(false);
    }
  });
});
