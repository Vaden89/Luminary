const articleSummary = document.getElementById("article-summary");
const articleDetails = document.getElementById("article-details");
const articleHeading = document.getElementById("article-heading");
const articleDescription = document.getElementById("article-description");
const articleContent = document.getElementById("article-content");
const articleHeaderImage = document.getElementById("article-header-image");
const articleSidebar = document.getElementById("article-sidebar");
const articleStatus = document.getElementById("article-status");
const articleSourceType = document.getElementById("article-source-type");
const articleSubmitter = document.getElementById("article-submitter");
const articleCategory = document.getElementById("article-category");
const submissionDate = document.getElementById("article-submission-date");

articleHeading.innerText = "New Grants Announced For STEM Educators";

articleDescription.innerText =
"A comprehensive overview of the newly announced $5M grant program aimed at supporting women educators in STEM fields across the country.";

articleStatus.innerText = 'Pending Review';

articleSourceType.innerText = 'Community Tip';

articleSubmitter.innerText = 'Sarah Mustafa';

articleCategory.innerText = 'Education';

submissionDate.innerText = "Oct 23, 2023, 10:45am";

articleHeaderImage.innerHTML = `
    <img src="../assets/images/women-grants.png" alt="" />
`;

articleContent.innerHTML = `
  <p>
    The Department of Education, in partnership with several leading technology firms,
    has announced a new $5 million grant program specifically designed to support
    and elevate female educators in STEM (Science, Technology, Engineering, and
    Mathematics) fields.
  </p>

  <p>
    This initiative comes in response to recent studies highlighting the persistent
    gender gap in STEM education and the critical need for more female role models in
    these subjects.
  </p>

  <h3>Key Objectives</h3>

  <ul>
    <li>Provide funding for innovative STEM curriculum development.</li>
    <li>Offer professional development workshops and networking opportunities.</li>
    <li>Supply classrooms with state-of-the-art technological equipment.</li>
    <li>Mentorship programs pairing new educators with experienced professionals.</li>
  </ul>

  <p>
    Educators can apply for grants ranging from $5,000 to $50,000. Applications open
    next month and will be reviewed by a panel of distinguished STEM professionals.
  </p>

  <p>
    Dr. Elena Rodriguez, head of the initiative, stated:
    <q>
      By empowering the educators who inspire our youth, we are planting the seeds
      for a more diverse and innovative future in technology and science.
    </q>
  </p>
`;



