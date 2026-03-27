let womenDirectory = [];

const directoryContainer = document.getElementById("directory");
const searchInput = document.getElementById("searchInput");

/* =========================
   Render Directory Cards
========================= */
function renderDirectory(data) {
  directoryContainer.innerHTML = "";

  if (!data || data.length === 0) {
    directoryContainer.innerHTML = "<p>No profiles found.</p>";
    return;
  }

  data.forEach(person => {

    const linksHTML = person.links && person.links.length > 0
      ? `
        <div class="links">
         <span class='link-heading'>Links & Profiles</span>
          ${person.links
            .map(link => `
              <p class="link-item">
                <i data-lucide="${link.logo}"></i>
                <a href="${link.url}" target="_blank">${link.label}</a>
              </p>
            `)
            .join("")}
        </div>
      `
      : "";

    const evidenceHTML = person.evidence && person.evidence.length > 0
      ? `
        <div class="evidence">
        <span class="link-heading">Evidence and coverage</span>
          ${person.evidence
            .map(item => `
              <div class="evidence-item">
                <strong>${item.title}</strong>
                <p>${item.category} • ${item.year}</p>
              </div>
            `)
            .join("")}
        </div>
      `
      : "";

    const card = `
      <div class="card">
        <section class="profile-header">
            <img src="${person.imageURL}" alt="">
          <section>
            <h3>${person.name}</h3>
            <span>${person.field}</span>
            <section class="meta">
              <span class="country">${person.mainField}</span>
              <span class="country">${person.country}</span>
            </section>
          </section>
        </section>

        <p class="description">${person.bio}</p>

        ${linksHTML ? "<hr>" : ""}
        ${linksHTML}

        ${evidenceHTML ? "<hr>" : ""}
        ${evidenceHTML}

        <button class="profile-btn">
          View Full Profile
        </button>
      </div>
    `;

    directoryContainer.insertAdjacentHTML("beforeend", card);
  });

  lucide.createIcons();
}

/* =========================
   Load Directory From API
========================= */
async function loadDirectory() {
  try {
    directoryContainer.innerHTML = "<p>Loading directory...</p>";

    const response = await fetch("https://luminary-2lvb.onrender.com/api/nomination");
    console.log("Response:", response);

    const result = await response.json();
    console.log("API Data:", result);

    if (!result.success || !result.data) {
      directoryContainer.innerHTML = "<p>Failed to load directory.</p>";
      return;
    }

    womenDirectory = result.data.map(item => {

      let evidenceArray = [];
      try {
        evidenceArray = item.evidence_urls
          ? JSON.parse(item.evidence_urls)
          : [];
      } catch {
        evidenceArray = [];
      }

      return {
        id: item.id,
        imageURL: "https://res.cloudinary.com/dtqqv0lb3/image/upload/v1773482008/oqxxmzoxovmftfpfb8yn.png",
        name: `${item.nominee?.first_name || ""} ${item.nominee?.last_name || ""}`,
        field: item.nominee?.field || "Unknown Field",
        mainField: item.nominee?.organization || "Not specified",
        country: item.nominee?.country || "Unknown",
        bio: item.description || "",

        links: (item.supporting_urls || []).map(url => ({
          logo: "globe",
          label: "Supporting Link",
          url: url
        })),

        evidence: evidenceArray.map(url => ({
          title: "Evidence Link",
          category: "Evidence",
          year: "—"
        }))
      };
    });

    renderDirectory(womenDirectory);

  } catch (error) {
    console.error("Error loading directory:", error);
    directoryContainer.innerHTML = "<p>Error loading directory.</p>";
  }
}

/* =========================
   Search Function
========================= */
searchInput.addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();

  const filteredData = womenDirectory.filter(person => {

    const searchableText = `
      ${person.name}
      ${person.field}
      ${person.mainField}
      ${person.country}
      ${person.bio}
    `.toLowerCase();

    return searchableText.includes(searchTerm);
  });

  renderDirectory(filteredData);
});

/* =========================
   Initialize
========================= */
loadDirectory();