window.addEventListener("DOMContentLoaded", () => {
  const sourceType = document.getElementById("sourceType");
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

  let previewUrl = "";

  const revokePreviewUrl = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = "";
    }
  };

  const syncSourceType = () => {
    const isExternalSource = sourceType.value === "external";

    sourceNameInput.placeholder = isExternalSource
      ? "E.g. The New York Times"
      : "E.g. Ada Okafor";

    externalUrlInput.required = isExternalSource;
    contentNote.textContent = isExternalSource
      ? "Keep this section for optional notes or pasted excerpts while the article lives on an external site."
      : "Use this section when composing original Luminary content.";
  };

  const updateCoverImageState = () => {
    const file = coverImageInput.files && coverImageInput.files[0];

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

  toolbarButtons.forEach((button) => {
    button.addEventListener("click", () => {
      button.classList.toggle("is-active");
    });
  });

  uploadDropzone.addEventListener("dragover", (event) => {
    event.preventDefault();
    uploadDropzone.classList.add("is-dragging");
  });

  uploadDropzone.addEventListener("dragleave", () => {
    uploadDropzone.classList.remove("is-dragging");
  });

  uploadDropzone.addEventListener("drop", (event) => {
    event.preventDefault();
    uploadDropzone.classList.remove("is-dragging");

    const droppedFile = event.dataTransfer?.files?.[0];

    if (!droppedFile) {
      return;
    }

    if (typeof DataTransfer === "undefined") {
      return;
    }

    const transfer = new DataTransfer();
    transfer.items.add(droppedFile);
    coverImageInput.files = transfer.files;
    updateCoverImageState();
  });

  sourceType.addEventListener("change", syncSourceType);
  coverImageInput.addEventListener("change", updateCoverImageState);

  syncSourceType();
});
