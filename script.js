/* ============================================================
   SINDI'S GLAMOUR STUDIO — Main JavaScript
   Covers:
     2.1  Interactive Elements  (accordion, tabs, modal, lightbox)
     2.2  Dynamic Content       (service filter/search, dynamic load)
     3.   SEO helpers           (structured data injection)
     4.   Form Functionality    (validation, AJAX-style submission,
                                 cost/availability response)
     Utility: animations on scroll, mobile nav toggle
   ============================================================ */

"use strict";

/* ── 0. DOMContentLoaded wrapper ── */
document.addEventListener("DOMContentLoaded", function () {

  initMobileNav();
  initScrollAnimations();
  initAccordion();
  initTabs();
  initLightbox();
  initServiceFilter();
  initReservationForm();
  initContactForm();
  injectStructuredData();

});

/* ══════════════════════════════════════════════════════════
   1. MOBILE NAV TOGGLE
   ══════════════════════════════════════════════════════════ */
function initMobileNav() {
  const nav = document.querySelector("nav");
  if (!nav) return;

  // Create hamburger button
  const btn = document.createElement("button");
  btn.className = "nav-toggle";
  btn.setAttribute("aria-label", "Toggle navigation");
  btn.setAttribute("aria-expanded", "false");
  btn.innerHTML = "&#9776;";

  const header = document.querySelector("header");
  if (header) header.insertBefore(btn, nav);

  btn.addEventListener("click", function () {
    const open = nav.classList.toggle("nav-open");
    btn.setAttribute("aria-expanded", open.toString());
    btn.innerHTML = open ? "&#10005;" : "&#9776;";
  });

  // Close nav when a link is clicked
  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      nav.classList.remove("nav-open");
      btn.setAttribute("aria-expanded", "false");
      btn.innerHTML = "&#9776;";
    });
  });
}

/* ══════════════════════════════════════════════════════════
   2. SCROLL-TRIGGERED FADE-IN ANIMATIONS
   ══════════════════════════════════════════════════════════ */
function initScrollAnimations() {
  // Add .reveal class to cards and sections
  const targets = document.querySelectorAll(
    ".service-card, .contact-card, .about-block, .team-block, .img-grid img, .hero-images img"
  );

  targets.forEach(function (el) {
    el.classList.add("reveal");
  });

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  targets.forEach(function (el) {
    observer.observe(el);
  });
}

/* ══════════════════════════════════════════════════════════
   3. ACCORDION (FAQ / Info blocks — used on Services page)
   ══════════════════════════════════════════════════════════ */
function initAccordion() {
  const accordions = document.querySelectorAll(".accordion");
  accordions.forEach(function (acc) {
    const header = acc.querySelector(".accordion-header");
    const body   = acc.querySelector(".accordion-body");
    if (!header || !body) return;

    header.setAttribute("aria-expanded", "false");
    body.hidden = true;

    header.addEventListener("click", function () {
      const isOpen = header.getAttribute("aria-expanded") === "true";
      // Close all siblings
      acc.closest(".accordion-group") &&
        acc.closest(".accordion-group").querySelectorAll(".accordion").forEach(function (sibling) {
          sibling.querySelector(".accordion-header").setAttribute("aria-expanded", "false");
          sibling.querySelector(".accordion-body").hidden = true;
          sibling.classList.remove("accordion-open");
        });

      if (!isOpen) {
        header.setAttribute("aria-expanded", "true");
        body.hidden = false;
        acc.classList.add("accordion-open");
      }
    });
  });
}

/* ══════════════════════════════════════════════════════════
   4. TABS (used on Services page for Hair / Nails tabs)
   ══════════════════════════════════════════════════════════ */
function initTabs() {
  const tabGroups = document.querySelectorAll(".tab-group");
  tabGroups.forEach(function (group) {
    const tabs    = group.querySelectorAll(".tab-btn");
    const panels  = group.querySelectorAll(".tab-panel");

    tabs.forEach(function (tab, i) {
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-selected", i === 0 ? "true" : "false");
      if (i !== 0) panels[i] && (panels[i].hidden = true);

      tab.addEventListener("click", function () {
        tabs.forEach(function (t, j) {
          t.setAttribute("aria-selected", "false");
          t.classList.remove("tab-active");
          panels[j] && (panels[j].hidden = true);
        });
        tab.setAttribute("aria-selected", "true");
        tab.classList.add("tab-active");
        panels[i] && (panels[i].hidden = false);
      });
    });
  });
}

/* ══════════════════════════════════════════════════════════
   5. LIGHTBOX (gallery images)
   ══════════════════════════════════════════════════════════ */
function initLightbox() {
  // Build lightbox overlay once
  const overlay = document.createElement("div");
  overlay.id = "lightbox";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Image viewer");
  overlay.innerHTML =
    '<button class="lb-close" aria-label="Close">&times;</button>' +
    '<button class="lb-prev"  aria-label="Previous">&#8249;</button>' +
    '<img class="lb-img" src="" alt="">' +
    '<button class="lb-next"  aria-label="Next">&#8250;</button>' +
    '<p class="lb-caption"></p>';
  document.body.appendChild(overlay);

  let images = [];
  let current = 0;

  function open(idx) {
    current = idx;
    const img = overlay.querySelector(".lb-img");
    const cap = overlay.querySelector(".lb-caption");
    img.src = images[current].src;
    img.alt = images[current].alt;
    cap.textContent = images[current].alt;
    overlay.classList.add("lb-open");
    document.body.style.overflow = "hidden";
    overlay.focus();
  }

  function close() {
    overlay.classList.remove("lb-open");
    document.body.style.overflow = "";
  }

  function prev() { open((current - 1 + images.length) % images.length); }
  function next() { open((current + 1) % images.length); }

  overlay.querySelector(".lb-close").addEventListener("click", close);
  overlay.querySelector(".lb-prev").addEventListener("click", prev);
  overlay.querySelector(".lb-next").addEventListener("click", next);
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) close();
  });

  document.addEventListener("keydown", function (e) {
    if (!overlay.classList.contains("lb-open")) return;
    if (e.key === "Escape")      close();
    if (e.key === "ArrowLeft")   prev();
    if (e.key === "ArrowRight")  next();
  });

  // Attach to all .img-grid images on the page
  function attachLightbox() {
    images = Array.from(document.querySelectorAll(".img-grid img, .hero-images img"));
    images.forEach(function (img, i) {
      img.style.cursor = "pointer";
      img.setAttribute("tabindex", "0");
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", "View larger: " + (img.alt || "image"));
      img.addEventListener("click",   function () { open(i); });
      img.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(i); }
      });
    });
  }
  attachLightbox();
}

/* ══════════════════════════════════════════════════════════
   6. SERVICE SEARCH / FILTER  (Services page)
   ══════════════════════════════════════════════════════════ */
function initServiceFilter() {
  const filterBar = document.getElementById("service-filter-bar");
  if (!filterBar) return;

  const input = filterBar.querySelector("#service-search");
  const cards = document.querySelectorAll(".service-card");

  if (!input) return;

  input.addEventListener("input", function () {
    const query = input.value.trim().toLowerCase();
    let visible = 0;

    cards.forEach(function (card) {
      const text = card.textContent.toLowerCase();
      const match = text.includes(query);
      card.style.display = match ? "" : "none";
      if (match) visible++;
    });

    // Show "no results" message
    let noMsg = document.getElementById("no-services-msg");
    if (!noMsg) {
      noMsg = document.createElement("p");
      noMsg.id = "no-services-msg";
      noMsg.style.cssText = "text-align:center;color:var(--text-muted);padding:2rem;";
      noMsg.textContent = "No services match your search.";
      const grid = document.querySelector(".services-grid");
      if (grid) grid.after(noMsg);
    }
    noMsg.hidden = visible > 0;
  });
}

/* ══════════════════════════════════════════════════════════
   7. RESERVATION / ENQUIRY FORM  (Reservation.html)
      — HTML5 + JS validation
      — Shows cost & availability response after submit
   ══════════════════════════════════════════════════════════ */
function initReservationForm() {
  const form = document.getElementById("reservation-form");
  if (!form) return;

  // Service cost lookup
  const servicePrices = {
    "goddess-braids": { name: "Goddess Braids",  price: "R 550", duration: "3–4 hours" },
    "locs":           { name: "Locs",             price: "R 600", duration: "4–5 hours" },
    "straight-up":    { name: "Straight Up",      price: "R 400", duration: "2–3 hours" },
    "twisted-braids": { name: "Twisted Braids",   price: "R 500", duration: "2–3 hours" },
    "straight-back":  { name: "Straight Back",    price: "R 350", duration: "1–2 hours" },
    "manicure":       { name: "Manicure",         price: "R 180", duration: "45 min"    },
    "pedicure":       { name: "Pedicure",         price: "R 180", duration: "1 hour"    },
    "gel-polish":     { name: "Gel Polish",       price: "R 250", duration: "1 hour"    },
    "acrylic-nails":  { name: "Acrylic Nails",    price: "R 280", duration: "1.5 hours" },
  };

  // Live price preview when service is selected
  const serviceSelect = form.querySelector("#service");
  const pricePreview  = document.getElementById("price-preview");
  if (serviceSelect && pricePreview) {
    serviceSelect.addEventListener("change", function () {
      const info = servicePrices[serviceSelect.value];
      if (info) {
        pricePreview.innerHTML =
          "<strong>" + info.name + "</strong> — " +
          info.price + " &bull; Est. duration: " + info.duration;
        pricePreview.hidden = false;
      } else {
        pricePreview.hidden = true;
      }
    });
  }

  // Validation helpers
  function showError(fieldId, msg) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    let err = field.parentElement.querySelector(".field-error");
    if (!err) {
      err = document.createElement("span");
      err.className = "field-error";
      err.setAttribute("role", "alert");
      field.parentElement.appendChild(err);
    }
    err.textContent = msg;
    field.setAttribute("aria-invalid", "true");
    field.classList.add("input-error");
  }

  function clearError(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    const err = field.parentElement.querySelector(".field-error");
    if (err) err.textContent = "";
    field.setAttribute("aria-invalid", "false");
    field.classList.remove("input-error");
  }

  function validateForm() {
    let valid = true;

    // Full name — min 3 chars
    const name = document.getElementById("full-name");
    clearError("full-name");
    if (!name || name.value.trim().length < 3) {
      showError("full-name", "Please enter your full name (at least 3 characters).");
      valid = false;
    }

    // Email
    const email = document.getElementById("email");
    clearError("email");
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRx.test(email.value.trim())) {
      showError("email", "Please enter a valid email address.");
      valid = false;
    }

    // Phone — SA format: +27 or 0 followed by 9 digits
    const phone = document.getElementById("phone");
    clearError("phone");
    const phoneRx = /^(\+27|0)[0-9]{9}$/;
    if (!phone || !phoneRx.test(phone.value.replace(/\s/g, ""))) {
      showError("phone", "Please enter a valid SA phone number (e.g. 0821234567).");
      valid = false;
    }

    // Service
    const svc = document.getElementById("service");
    clearError("service");
    if (!svc || !svc.value) {
      showError("service", "Please select a service.");
      valid = false;
    }

    // Date — must not be in the past
    const dateField = document.getElementById("date");
    clearError("date");
    if (!dateField || !dateField.value) {
      showError("date", "Please select a preferred date.");
      valid = false;
    } else {
      const chosen = new Date(dateField.value);
      const today  = new Date();
      today.setHours(0, 0, 0, 0);
      if (chosen < today) {
        showError("date", "Please select a future date.");
        valid = false;
      }
    }

    // Time
    const timeField = document.getElementById("time");
    clearError("time");
    if (!timeField || !timeField.value) {
      showError("time", "Please select a preferred time.");
      valid = false;
    } else {
      const [h] = timeField.value.split(":").map(Number);
      if (h < 8 || h >= 18) {
        showError("time", "Please choose a time between 08:00 and 18:00.");
        valid = false;
      }
    }

    return valid;
  }

  // Inline real-time validation on blur
  ["full-name", "email", "phone", "service", "date", "time"].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("blur", function () { validateForm(); });
      el.addEventListener("input", function () { clearError(id); });
    }
  });

  // Form submit
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validateForm()) return;

    const svcVal  = document.getElementById("service").value;
    const info    = servicePrices[svcVal] || {};
    const nameVal = document.getElementById("full-name").value.trim();
    const dateVal = document.getElementById("date").value;
    const timeVal = document.getElementById("time").value;

    // Simulate AJAX submission
    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting…";

    setTimeout(function () {
      // Show confirmation response
      const response = document.getElementById("reservation-response");
      if (response) {
        response.innerHTML =
          "<h3>🌸 Booking Received!</h3>" +
          "<p>Thank you, <strong>" + escHtml(nameVal) + "</strong>! " +
          "Your reservation for <strong>" + escHtml(info.name || svcVal) + "</strong> " +
          "on <strong>" + dateVal + "</strong> at <strong>" + timeVal + "</strong> has been received.</p>" +
          "<p><strong>Service cost:</strong> " + (info.price || "TBC") + "<br>" +
          "<strong>Estimated duration:</strong> " + (info.duration || "TBC") + "</p>" +
          "<p>We will contact you shortly to confirm your appointment.</p>";
        response.hidden = false;
        response.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      form.reset();
      if (pricePreview) pricePreview.hidden = true;
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Reservation";
    }, 1200);
  });
}

/* ══════════════════════════════════════════════════════════
   8. CONTACT FORM  (Contact.html)
      — Validates, builds email mailto href, AJAX-style
   ══════════════════════════════════════════════════════════ */
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  function showErr(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    let span = el.parentElement.querySelector(".field-error");
    if (!span) {
      span = document.createElement("span");
      span.className = "field-error";
      span.setAttribute("role", "alert");
      el.parentElement.appendChild(span);
    }
    span.textContent = msg;
    el.classList.add("input-error");
    el.setAttribute("aria-invalid", "true");
  }

  function clearErr(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const span = el.parentElement.querySelector(".field-error");
    if (span) span.textContent = "";
    el.classList.remove("input-error");
    el.setAttribute("aria-invalid", "false");
  }

  function validate() {
    let ok = true;
    const nameEl    = document.getElementById("contact-name");
    const emailEl   = document.getElementById("contact-email");
    const subjectEl = document.getElementById("contact-subject");
    const msgEl     = document.getElementById("contact-message");

    clearErr("contact-name");
    clearErr("contact-email");
    clearErr("contact-subject");
    clearErr("contact-message");

    if (!nameEl || nameEl.value.trim().length < 2) {
      showErr("contact-name", "Please enter your name."); ok = false;
    }
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailEl || !emailRx.test(emailEl.value.trim())) {
      showErr("contact-email", "Please enter a valid email address."); ok = false;
    }
    if (!subjectEl || !subjectEl.value) {
      showErr("contact-subject", "Please select a message type."); ok = false;
    }
    if (!msgEl || msgEl.value.trim().length < 20) {
      showErr("contact-message", "Please enter a message (at least 20 characters)."); ok = false;
    }
    return ok;
  }

  ["contact-name","contact-email","contact-subject","contact-message"].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("blur",  function () { validate(); });
      el.addEventListener("input", function () { clearErr(id); });
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate()) return;

    const nameEl    = document.getElementById("contact-name");
    const emailEl   = document.getElementById("contact-email");
    const subjectEl = document.getElementById("contact-subject");
    const msgEl     = document.getElementById("contact-message");

    const nameVal    = nameEl.value.trim();
    const emailVal   = emailEl.value.trim();
    const subjectVal = subjectEl.options[subjectEl.selectedIndex].text;
    const msgVal     = msgEl.value.trim();

    // Build email body
    const body =
      "Name: " + nameVal + "\n" +
      "Email: " + emailVal + "\n" +
      "Subject: " + subjectVal + "\n\n" +
      "Message:\n" + msgVal;

    // Simulate AJAX send (opens mailto as fallback)
    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";

    setTimeout(function () {
      // Open mailto with compiled message
      const mailto =
        "mailto:info@sindisglamourstudio.co.za" +
        "?subject=" + encodeURIComponent("[SGS Enquiry] " + subjectVal) +
        "&body=" + encodeURIComponent(body);
      window.location.href = mailto;

      const resp = document.getElementById("contact-response");
      if (resp) {
        resp.innerHTML =
          "<h3>✅ Message Ready!</h3>" +
          "<p>Thank you, <strong>" + escHtml(nameVal) + "</strong>! " +
          "Your email client has been opened with your message pre-filled. " +
          "Please send it from there. We'll respond within 1–2 business days.</p>";
        resp.hidden = false;
        resp.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = "Send Message";
    }, 900);
  });
}

/* ══════════════════════════════════════════════════════════
   9. SEO — Inject JSON-LD Structured Data
   ══════════════════════════════════════════════════════════ */
function injectStructuredData() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "name": "Sindi's Glamour Studio",
    "description": "Premium hair and nail services in Pretoria. Goddess Braids, Locs, Manicures, Pedicures and more.",
    "url": "https://sindisglamourstudio.co.za",
    "telephone": "+27-000-000-0000",
    "email": "info@sindisglamourstudio.co.za",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "189 Jan Coetzee, Ekklesia",
      "addressLocality": "Pretoria",
      "postalCode": "0186",
      "addressCountry": "ZA"
    },
    "openingHours": "Mo-Sa 08:00-18:00",
    "priceRange": "R180–R600",
    "sameAs": [
      "https://www.facebook.com/sindisglamourstudio",
      "https://www.instagram.com/sindisglamourstudio",
      "https://www.tiktok.com/@sindisglamourstudio"
    ]
  };

  const script = document.createElement("script");
  script.type  = "application/ld+json";
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

/* ══════════════════════════════════════════════════════════
   UTILITY
   ══════════════════════════════════════════════════════════ */
function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

