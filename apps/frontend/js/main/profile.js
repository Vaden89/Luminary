async function fetchProfile(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
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
  const profileDataList = await fetchProfile("../assets/data/dummy_data.json");
  const profileData = profileDataList[0];

  const profile = document.querySelector(".profile-image");
  const briefInfo = document.querySelector(".brief-info");

  let name = document.createElement("h1");
  let occupation = document.createElement("p");
  name.textContent = "Maya Angelou";
  name.classList.add("name");
  occupation.textContent = profileData.work.occupation;
  occupation.ariaLabel = "Occupation";

  briefInfo.append(name, occupation);

  if (profileData.bio && profileData.bio.trim() !== "") {
    const bio = document.getElementById("bio-section");
    const header = document.createElement("h2");
    const paragraph = document.createElement("p");
    header.textContent = "Bio";
    paragraph.textContent = profileData.bio.trim();

    bio.append(header, paragraph);
  }

  if (profileData.about && Object.keys(profileData.about).length > 0) {
    const aboutSection = document.getElementById("about-section");
    const heading = document.createElement("h2");
    heading.textContent = "About";
    aboutSection.appendChild(heading);

    for (const [key, value] of Object.entries(profileData.about)) {
      const para = document.createElement("p");
      const bold = document.createElement("b");
      const span = document.createElement("span");

      para.classList.add("flex", "justify-between");
      bold.textContent = capitalizeFirstLetter(key.trim());
      span.textContent = capitalizeFirstLetter(value.trim());

      para.append(bold, span);
      aboutSection.appendChild(para);
    }
  }

  if (profileData.work && Object.keys(profileData.work).length > 0) {
    const workSection = document.getElementById("work-section");
    const heading = document.createElement("h2");
    heading.textContent = "Work";
    workSection.appendChild(heading);

    for (const [key, value] of Object.entries(profileData.work)) {
      const para = document.createElement("p");
      const bold = document.createElement("b");
      const span = document.createElement("span");

      para.classList.add("flex", "justify-between");
      bold.textContent = capitalizeFirstLetter(key.trim());
      span.textContent = capitalizeFirstLetter(value.trim());

      para.append(bold, span);
      workSection.appendChild(para);
    }
  }

  if (profileData.related_links && profileData.related_links.length > 0) {
    const relatedLinksSection = document.getElementById("related-links");
    const heading = document.createElement("h2");
    const div = document.createElement("div");

    heading.textContent = "Related Links";
    div.classList.add("links");
    relatedLinksSection.append(heading, div);

    profileData.related_links.forEach((item) => {
      const link = document.createElement("a");
      link.href = item.includes("://") ? item : `https://${item}`;
      link.target = "_blank";
      link.textContent = getHostName(item);

      div.appendChild(link);
    });
  }

  if (profileData.social_links && profileData.social_links.length > 0) {
    const relatedLinksSection = document.getElementById("social-links");
    const heading = document.createElement("h2");
    const div = document.createElement("div");

    heading.textContent = "Social Links";
    div.classList.add("links");
    relatedLinksSection.append(heading, div);

    profileData.social_links.forEach((item) => {
      const link = document.createElement("a");
      link.href = item.includes("://") ? item : `https://${item}`;
      link.target = "_blank";
      link.textContent = getHostName(item);
      console.log("item is ", item, "a tag is ", link);

      div.appendChild(link);
    });
  }
});
