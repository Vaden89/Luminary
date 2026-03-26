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
  const formMessage = document.getElementById("formMessage");
  const form = document.getElementById("articleEditor");

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

  // ── Source type toggle (your existing logic) ───────────────────────────────

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

  // ── Cover image preview (your existing logic) ──────────────────────────────

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

  // ── Toolbar (your existing logic) ─────────────────────────────────────────

  toolbarButtons.forEach((btn) => {
    btn.addEventListener("click", () => btn.classList.toggle("is-active"));
  });

  // ── Drag and drop (your existing logic) ───────────────────────────────────

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

  // ── Form submission → Sanity ───────────────────────────────────────────────

  submitBtn.addEventListener("click", async () => {
    // ── Collect values ───────────────────────────────────────────────────────
    const title = document.getElementById("articleTitle").value.trim();
    const category = document.getElementById("articleCategory").value;
    const region = document.getElementById("articleRegion").value;
    const sourceName = document.getElementById("sourceName").value.trim();
    const publicationDate = document.getElementById("publicationDate").value;
    const externalUrl = externalUrlInput.value.trim();
    const summary = document.getElementById("briefSummary").value.trim();
    const body = document.getElementById("articleContent").value.trim();
    const sourceTypeVal = sourceType.value;
    const imageFile = coverImageInput.files?.[0];

    // ── Validation ───────────────────────────────────────────────────────────
    if (!title) {
      showMessage("Please enter a headline.", "error");
      return;
    }
    if (!category) {
      showMessage("Please select a category.", "error");
      return;
    }
    if (!region) {
      showMessage("Please select a region.", "error");
      return;
    }
    if (sourceTypeVal === "external" && !externalUrl) {
      showMessage("Please enter the external URL for this source.", "error");
      return;
    }
    if (sourceTypeVal === "original" && !body) {
      showMessage("Please write the article content.", "error");
      return;
    }

    // ── Disable button ───────────────────────────────────────────────────────
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting…";

    try {
      // ── Upload image if one was selected ─────────────────────────────────
      let coverImageRef = null;
      if (imageFile) {
        const assetId = await sanityUploadImage(imageFile);
        coverImageRef = {
          _type: "image",
          asset: { _type: "reference", _ref: assetId },
        };
      }

      // ── Build slug ────────────────────────────────────────────────────────
      const slug = slugify(title);

      // ── Send mutation to Sanity ───────────────────────────────────────────
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
            body: body || null,
            coverImage: coverImageRef,
            publicationDate: publicationDate || null,
            readTime: body ? estimateReadTime(body) : null,
            status: "pending_review",
            submittedByUser: true,
            submittedAt: new Date().toISOString(),
          },
        },
      ]);

      // ── Success ───────────────────────────────────────────────────────────
      showMessage(
        "✅ Your story has been submitted and is pending review. Thank you!",
        "success",
      );
      form.reset();
      revokePreviewUrl();
      uploadDropzone.classList.remove("has-file");
      uploadPreview.hidden = true;
      uploadTitle.textContent = "Click to upload or drag and drop";
      uploadMeta.textContent = "SVG, PNG, JPG or GIF (max. 5MB)";
      syncSourceType();
    } catch (err) {
      console.error(err);
      showMessage("❌ Something went wrong. Please try again.", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Article";
    }
  });
});
