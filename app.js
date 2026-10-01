// RSVP submissions are saved by /api/rsvp to the private Google Sheet.

// Wedding date: 31 October 2026, 3:00 PM, Ghana time (UTC)
const WEDDING_DATE = new Date("2026-10-31T15:00:00Z");

const envelopeScreen = document.getElementById("envelope-screen");
const openEnvelopeButton = document.getElementById("open-envelope");
const website = document.getElementById("website");
const body = document.body;
const toast = document.getElementById("toast");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 4500);
}

function revealWebsite() {
  openEnvelopeButton.classList.add("is-opening");

  window.setTimeout(() => {
    website.classList.add("visible");
    website.setAttribute("aria-hidden", "false");
  }, 600);

  window.setTimeout(() => {
    envelopeScreen.classList.add("opened");
    body.classList.remove("locked");
    document.getElementById("invitation").focus?.();
  }, 1600);
}

openEnvelopeButton.addEventListener("click", revealWebsite);

// Header and mobile navigation
const header = document.querySelector(".site-header");
const menuButton = document.getElementById("menu-button");
const nav = document.getElementById("main-nav");
const navLinks = [...document.querySelectorAll(".main-nav a")];

menuButton.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  });
});

window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 40);
});

// Active navigation section
const trackedSections = ["invitation", "story", "gallery", "rsvp"]
  .map((id) => document.getElementById(id));

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      navLinks.forEach((link) => {
        link.classList.toggle(
          "active",
          link.getAttribute("href") === `#${entry.target.id}`
        );
      });
    });
  },
  { rootMargin: "-35% 0px -55% 0px" }
);

trackedSections.forEach((section) => sectionObserver.observe(section));

// Scroll reveal
const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

// Countdown
const daysElement = document.getElementById("days");
const hoursElement = document.getElementById("hours");
const minutesElement = document.getElementById("minutes");
const secondsElement = document.getElementById("seconds");
const countdownMessage = document.getElementById("countdown-message");

function pad(value, length = 2) {
  return String(value).padStart(length, "0");
}

function updateCountdown() {
  const now = new Date();
  const difference = WEDDING_DATE.getTime() - now.getTime();

  if (difference <= 0) {
    daysElement.textContent = "000";
    hoursElement.textContent = "00";
    minutesElement.textContent = "00";
    secondsElement.textContent = "00";
    countdownMessage.textContent = "Today, forever begins.";
    return;
  }

  const totalSeconds = Math.floor(difference / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  daysElement.textContent = pad(days, 3);
  hoursElement.textContent = pad(hours);
  minutesElement.textContent = pad(minutes);
  secondsElement.textContent = pad(seconds);
}

updateCountdown();
window.setInterval(updateCountdown, 1000);

// Gallery lightbox
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const closeLightboxButton = document.getElementById("close-lightbox");

document.querySelectorAll(".gallery-item").forEach((item) => {
  item.addEventListener("click", () => {
    lightboxImage.src = item.dataset.image;
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    body.classList.add("locked");
  });
});

function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  body.classList.remove("locked");
}

closeLightboxButton.addEventListener("click", closeLightbox);

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightbox.classList.contains("open")) {
    closeLightbox();
  }
});

// RSVP form
const form = document.getElementById("rsvp-form");
const formStatus = document.getElementById("form-status");
const submitButton = document.getElementById("submit-button");

function setFormStatus(message, type = "") {
  formStatus.textContent = message;
  formStatus.className = `form-status ${type}`.trim();
}

function normalizeWhatsApp(number) {
  return number.replace(/[^\d+]/g, "");
}

function validatePhone(number) {
  const cleaned = normalizeWhatsApp(number);
  return /^\+?\d{9,15}$/.test(cleaned);
}

function celebrateRSVP() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const celebration = document.createElement('div');
  celebration.className = 'rsvp-celebration';
  celebration.setAttribute('aria-hidden', 'true');
  document.body.appendChild(celebration);
  for (let i = 0; i < 20; i++) {
    const petal = document.createElement('span');
    petal.className = 'celebration-petal';
    petal.style.left = `${20 + Math.random() * 60}%`;
    petal.style.backgroundColor = ['#c49a45', '#f4e7d9', '#a94720'][i % 3];
    celebration.appendChild(petal);
    petal.animate([
      { transform: 'translateY(0) rotate(0deg)', opacity: 0 },
      { opacity: 0.85, offset: 0.15 },
      { transform: `translate(${Math.random() * 100 - 50}px, 180px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
    ], { duration: 1600, delay: i * 30, easing: 'ease-out', fill: 'forwards' });
  }
  window.setTimeout(() => celebration.remove(), 2400);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setFormStatus("");

  const fullName = document.getElementById("full-name").value.trim();
  const whatsapp = normalizeWhatsApp(
    document.getElementById("whatsapp").value.trim()
  );
  const email = document.getElementById("email").value.trim().toLowerCase();
  const attendance = document.getElementById("attendance").value;
  const message = document.getElementById("message").value.trim();
  const song_request = document.getElementById("song-request").value.trim();
  const consent = document.getElementById("consent").checked;

  if (!validatePhone(whatsapp)) {
    setFormStatus("Please enter a valid WhatsApp number, including country code.", "error");
    return;
  }

  submitButton.disabled = true;
  submitButton.querySelector("span").textContent = "Sending...";
  setFormStatus("Saving your response...");

  try {
    const response = await fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: fullName, whatsapp, email, attendance, message, song_request, consent })
    });
    const result = await response.json();
    if (response.status === 409) {
      setFormStatus("An RSVP is already saved with this email or WhatsApp number. You do not need to submit again. If you need to change your response, please contact the couple.", "error");
      return;
    }
    if (response.status === 400) {
      setFormStatus("Please check your name, email, WhatsApp number and required fields, then try again.", "error");
      return;
    }
    if (!response.ok || result.ok !== true) throw new Error(result.error || "Unable to save RSVP");
    form.reset();
    setFormStatus(attendance === "not_attending"
      ? "Thank you for letting us know. You will be missed."
      : "Thank you! Your RSVP has been received. Your table number will be shared later.", "success");
    if (attendance === 'attending') celebrateRSVP();
  } catch (error) {
    console.error(error);
    setFormStatus("Your RSVP could not be saved. Please try again.", "error");
  } finally {
    submitButton.disabled = false;
    submitButton.querySelector("span").textContent = "Send RSVP";
  }
});
