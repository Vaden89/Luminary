const womenDirectory = [
  {
    id: 1,
    imageURL:
      "https://res.cloudinary.com/dtqqv0lb3/image/upload/v1773482008/oqxxmzoxovmftfpfb8yn.png",
    name: "Maya Angelou",
    field: "Civil Rights Activist",
    country: "United States",
    mainField: "Literature",
    bio: "American memoirist, popular poet, and civil rights activist. She published seven autobiographies, three books of essays,several books of poetry, and is credited with a list of plays, movies, and television shows spanning over 50 years.",

    links: [
      {
        logo: "globe",
        label: "Official Website",
        url: "https://mayaangelou.com",
      },
      { logo: "book-open-text", label: "View Publications", url: "#" },
    ],

    evidence: [
      {
        title: "I Know Why The Caged Bird Sings",
        category: "Published Autobiography",
        year: "1969",
      },
      {
        title: "Presidential Medal of Freedom",
        category: "National Award",
        year: "2010",
      },
    ],
  },

  {
    id: 2,
    imageURL:
      "https://res.cloudinary.com/dtqqv0lb3/image/upload/v1773482007/lfmmh7aqcly2i0uwsjy4.png",
    name: "Amina J.",
    field: "Rural Health Initiative",
    country: "East Africa",
    mainField: "Healthcare",
    bio: "Rewriting maternal health protocols from a one-room clinic, significantly reducing preventable complications in her district. Her innovative approach has been adopted by neighboring regions.",

    links: [{ logo: "globe", label: "ruralhealth.org", url: "#" }],

    evidence: [
      {
        title: "WHO Regional Health Award",
        category: "Award Record",
        year: "2023",
      },
    ],
  },

  {
    id: 3,
    imageURL:
      "https://res.cloudinary.com/dtqqv0lb3/image/upload/v1773482008/kbxsb2bsyqw7iruj3rcp.png",
    name: "Dr. Elena Rostova",
    field: "Climate Tech Solutions",
    country: "Global",
    mainField: "Climate Engineering",
    bio: "Lead engineer developing scalable carbon capture technologies. Her recent patents have revolutionized how industrial facilities reduce emissions efficiently.",

    links: [
      { logo: "linkedin", label: "LinkedIn Profile", url: "#" },
      { logo: "newspaper", label: "Research Papers", url: "#" },
    ],

    evidence: [],
  },
];

const directoryContainer = document.getElementById("directory");

function renderDirectory(data) {
  directoryContainer.innerHTML = "";

  data.forEach((person) => {
    const linksHTML =
      person.links && person.links.length > 0
        ? `
        <div class="links">
         <span class='link-heading'>Links & Profiles</span>
          ${person.links
            .map(
              (link) => `
              <p class="link-item">
                <i data-lucide=${link.logo}></i>
                <a href="${link.url}" target="_blank">${link.label}</a>
              </p>
            `,
            )
            .join("")}
        </div>
      `
        : "";

    const evidenceHTML =
      person.evidence && person.evidence.length > 0
        ? `
        <div class="evidence">
        <span class = "link-heading">Evidence and coverage</span>
          ${person.evidence
            .map(
              (item) => `
              <div class="evidence-item">
                <strong>${item.title}</strong>
                <p>${item.category} • ${item.year}</p>
              </div>
            `,
            )
            .join("")}
        </div>
      `
        : "";
    const card = `
      <div class="card">
        <section class="profile-header">
            <img src=${person.imageURL} alt="">
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

        <a class="profile-btn" href="./profile.html">
        View Full Profile
        </a>
      </div>
    `;

    directoryContainer.insertAdjacentHTML("beforeend", card);
  });

  lucide.createIcons();
}

renderDirectory(womenDirectory);
lucide.createIcons();

const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();

  const filteredData = womenDirectory.filter((person) => {
    const searchableText = `
${person.name}
${person.field}
${person.mainField}
${person.country}
${person.bio}
${person.links.map((l) => l.label).join(" ")}
${person.evidence.map((e) => e.title + " " + e.category).join(" ")}
`.toLowerCase();

    return searchableText.includes(searchTerm);
  });

  renderDirectory(filteredData);

  lucide.createIcons();
});
