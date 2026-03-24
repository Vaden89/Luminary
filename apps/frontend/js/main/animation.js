/**
 * Luminary — GSAP Scroll Animations
 * Requires: gsap, ScrollTrigger, (optional) gsap/TextPlugin
 */

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────
   Respect reduced-motion preference
   ───────────────────────────────────────────── */
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

if (!prefersReducedMotion) {
  initAnimations();
}

function initAnimations() {
  /* ─────────────────────────────────────────────
     1. HERO — staggered entrance on page load
     ───────────────────────────────────────────── */
  const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

  heroTl
    .from(".hero-title", {
      y: 60,
      opacity: 0,
      duration: 1,
    })
    .from(
      ".hero-description",
      {
        y: 40,
        opacity: 0,
        duration: 0.8,
      },
      "-=0.55",
    )
    .from(
      ".hero-section > a > button",
      {
        y: 24,
        opacity: 0,
        duration: 0.6,
        scale: 0.95,
      },
      "-=0.5",
    )
    .from(
      ".hero-image-outer",
      {
        y: 50,
        opacity: 0,
        duration: 1,
        scale: 0.97,
        ease: "power2.out",
      },
      "-=0.4",
    );

  /* ─────────────────────────────────────────────
     2. METRICS — count-up + slide-up on scroll
     ───────────────────────────────────────────── */
  gsap.from(".metric-card", {
    scrollTrigger: {
      trigger: ".metrics-container",
      start: "top 85%",
      toggleActions: "play none none none",
    },
    y: 50,
    opacity: 0,
    duration: 0.7,
    stagger: 0.18,
    ease: "power2.out",
  });

  /* ─────────────────────────────────────────────
     3. SECTION HEADINGS — slide up with a clip
     ───────────────────────────────────────────── */
  document.querySelectorAll("main h2").forEach((heading) => {
    gsap.from(heading, {
      scrollTrigger: {
        trigger: heading,
        start: "top 88%",
        toggleActions: "play none none none",
      },
      y: 36,
      opacity: 0,
      duration: 0.75,
      ease: "power3.out",
    });
  });

  /* ─────────────────────────────────────────────
     4. FEATURE CARDS — alternate slide-in
        .flex-row  → image comes from right
        .flex-row-rev → image comes from left
     ───────────────────────────────────────────── */
  document.querySelectorAll(".feature-card").forEach((card) => {
    const isReversed = card.classList.contains("flex-row-rev");

    // Text block
    const textDiv = card.querySelector("div");
    gsap.from(textDiv, {
      scrollTrigger: {
        trigger: card,
        start: "top 82%",
        toggleActions: "play none none none",
      },
      x: isReversed ? -60 : 60,
      opacity: 0,
      duration: 0.85,
      ease: "power3.out",
    });

    // Image block
    const picture = card.querySelector("picture");
    gsap.from(picture, {
      scrollTrigger: {
        trigger: card,
        start: "top 82%",
        toggleActions: "play none none none",
      },
      x: isReversed ? 60 : -60,
      opacity: 0,
      duration: 0.85,
      delay: 0.12,
      ease: "power3.out",
    });
  });

  /* ─────────────────────────────────────────────
     5. CONTRIBUTORS GRID — cascading pop-in
     ───────────────────────────────────────────── */
  // Cards are injected dynamically, so we use a ScrollTrigger batch
  // after a tiny delay to let the fetch resolve
  function animateContributors() {
    const cards = document.querySelectorAll(".contributor-card");
    if (!cards.length) {
      // Retry until the grid is populated (max ~3 s)
      if (
        (animateContributors._attempts =
          (animateContributors._attempts || 0) + 1) < 30
      ) {
        setTimeout(animateContributors, 100);
      }
      return;
    }

    ScrollTrigger.batch(cards, {
      start: "top 90%",
      onEnter: (batch) =>
        gsap.fromTo(
          batch,
          { y: 40, opacity: 0, scale: 0.9 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.55,
            stagger: 0.08,
            ease: "back.out(1.4)",
          },
        ),
      once: true,
    });
  }
  animateContributors();

  /* ─────────────────────────────────────────────
     6. FEATURED STORIES — stagger slide-up
     ───────────────────────────────────────────── */
  gsap.from(".featured-stories article", {
    scrollTrigger: {
      trigger: ".featured-stories",
      start: "top 82%",
      toggleActions: "play none none none",
    },
    y: 60,
    opacity: 0,
    duration: 0.7,
    stagger: 0.15,
    ease: "power2.out",
  });

  gsap.from(".featured-stories .heading", {
    scrollTrigger: {
      trigger: ".featured-stories",
      start: "top 88%",
      toggleActions: "play none none none",
    },
    y: 30,
    opacity: 0,
    duration: 0.65,
    ease: "power3.out",
  });

  /* ─────────────────────────────────────────────
     7. FOOTER CTA — graceful rise
     ───────────────────────────────────────────── */
  gsap.from("footer > div:first-of-type > *", {
    scrollTrigger: {
      trigger: "footer",
      start: "top 88%",
      toggleActions: "play none none none",
    },
    y: 40,
    opacity: 0,
    duration: 0.65,
    stagger: 0.14,
    ease: "power3.out",
  });

  /* ─────────────────────────────────────────────
     8. HERO IMAGE — subtle parallax on scroll
     ───────────────────────────────────────────── */
  gsap.to(".hero-image-outer", {
    scrollTrigger: {
      trigger: ".hero-section",
      start: "top top",
      end: "bottom top",
      scrub: 1.5,
    },
    y: -80,
    ease: "none",
  });
}
