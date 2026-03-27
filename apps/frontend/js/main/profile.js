import { ACTIVE_CONFIG as CONFIG } from "../config.js";
const profileEndpoint = `${CONFIG.BACKEND_URL}/nomination`;

async function fetchProfile(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
  }
}

function capitalizeFirstLetter(str) {
  if (typeof str !== "string" && str.length === 0) {
    return "";
  }

  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getHostName(link) {
  let fullLink = link.includes("://") ? link : `http://${link}`;

  try {
    return new URL(fullLink).hostname;
  } catch {
    return link; // Return the original link if it's not a valid URL
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  const url = id ? `${profileEndpoint}/${id}` : `${profileEndpoint}`;

  let profileData = await fetchProfile(url);
  if (!profileData) return;

  if (Array.isArray(profileData)) {
    profileData = profileData[0];
  }

  const profile = document.querySelector(".profile-image");
  const briefInfo = document.querySelector(".brief-info");

  const imageUrl = profileData.image_url || profileData.nominee?.image_url;
  if (imageUrl) {
    profile.src = imageUrl;
  } else {
    if (profile) profile.remove();
  }

  let name = document.createElement("h1");
  let occupation = document.createElement("p");
  name.textContent =
    `${profileData.nominee?.first_name || ""} ${profileData.nominee?.last_name || ""}`.trim() ||
    "Unknown";
  name.classList.add("name");
  occupation.textContent = profileData.nominee?.field || "Unknown Field";
  occupation.ariaLabel = "Occupation";

  briefInfo.append(name, occupation);

  if (profileData.description && profileData.description.trim() !== "") {
    const bio = document.getElementById("bio-section");
    const header = document.createElement("h2");
    const paragraph = document.createElement("p");
    header.textContent = "Description";
    paragraph.textContent = profileData.description.trim();

    bio.append(header, paragraph);
  }

  const aboutSection = document.getElementById("about-section");
  if (profileData.nominee && Object.keys(profileData.nominee).length > 0) {
    const heading = document.createElement("h2");
    heading.textContent = "About";
    aboutSection.appendChild(heading);

    const attributes = {
      Field: profileData.nominee.field,
      Country: profileData.nominee.country,
      Organization: profileData.nominee.organization,
    };

    for (const [key, value] of Object.entries(attributes)) {
      if (!value) continue;
      const para = document.createElement("p");
      const bold = document.createElement("b");
      const span = document.createElement("span");

      para.classList.add("flex", "justify-between");
      bold.textContent = key;
      span.textContent = capitalizeFirstLetter(value.trim());

      para.append(bold, span);
      aboutSection.appendChild(para);
    }
  }

  let supportLinks = [];
  try {
    supportLinks =
      typeof profileData.supporting_urls === "string"
        ? JSON.parse(profileData.supporting_urls)
        : profileData.supporting_urls || [];
  } catch (e) {}

  if (supportLinks && supportLinks.length > 0) {
    const relatedLinksSection = document.getElementById("related-links");
    const heading = document.createElement("h2");
    const div = document.createElement("div");

    heading.textContent = "Supporting Links";
    div.classList.add("links");
    relatedLinksSection.append(heading, div);

    supportLinks.forEach((item) => {
      const link = document.createElement("a");
      link.href = item.includes("://") ? item : `https://${item}`;
      link.target = "_blank";
      link.textContent = getHostName(item);

      div.appendChild(link);
    });
  }

  let evidenceLinks = [];
  try {
    evidenceLinks =
      typeof profileData.evidence_urls === "string"
        ? JSON.parse(profileData.evidence_urls)
        : profileData.evidence_urls || [];
  } catch (e) {}

  if (evidenceLinks && evidenceLinks.length > 0) {
    const relatedLinksSection = document.getElementById("social-links");
    const heading = document.createElement("h2");
    const div = document.createElement("div");

    heading.textContent = "Evidence Links";
    div.classList.add("links");
    relatedLinksSection.append(heading, div);

    evidenceLinks.forEach((item) => {
      const link = document.createElement("a");
      link.href = item.includes("://") ? item : `https://${item}`;
      link.target = "_blank";
      link.textContent = getHostName(item);

      div.appendChild(link);
    });
  }
});
