/* RK Vridhi Digital — site behaviour (no dependencies) */
(function () {
  "use strict";
  var dl = (window.dataLayer = window.dataLayer || []);
  function track(name, params) {
    dl.push(Object.assign({ event: name }, params || {}));
  }

  /* ---------- year ---------- */
  var yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- mobile nav ---------- */
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- GA4 / GTM event tracking ---------- */
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-event]");
    if (!el) return;
    track(el.getAttribute("data-event"), {
      link_text: (el.textContent || "").trim().slice(0, 80),
      link_url: el.getAttribute("href") || "",
      package_name: el.getAttribute("data-package") || undefined,
    });
  });
  document.addEventListener("toggle", function (e) {
    var d = e.target;
    if (d.tagName === "DETAILS" && d.open && d.hasAttribute("data-event")) {
      track("faq_open", { faq_question: (d.querySelector("summary") || {}).textContent });
    }
  }, true);
  document.querySelectorAll('a[href^="http"]').forEach(function (a) {
    if (a.hostname && a.hostname !== location.hostname && !a.hasAttribute("data-event")) {
      a.addEventListener("click", function () { track("external_link_click", { link_url: a.href }); });
    }
  });

  /* scroll depth */
  var marks = [25, 50, 75, 90], fired = {};
  window.addEventListener("scroll", function () {
    var h = document.documentElement;
    var pct = ((h.scrollTop || document.body.scrollTop) / ((h.scrollHeight || 1) - h.clientHeight)) * 100;
    marks.forEach(function (m) {
      if (pct >= m && !fired[m]) { fired[m] = 1; track("scroll_" + m + "_percent", { percent_scrolled: m }); }
    });
  }, { passive: true });

  /* ---------- package deep-link highlight (case study -> package) ---------- */
  function highlight() {
    var id = location.hash.replace("#", "");
    if (!id) return;
    var el = document.getElementById(id);
    if (!el || !el.classList.contains("pkg")) return;
    el.classList.remove("pkg-highlight");
    void el.offsetWidth;
    el.classList.add("pkg-highlight");
    setTimeout(function () { el.classList.remove("pkg-highlight"); }, 2600);
  }
  window.addEventListener("hashchange", highlight);
  if (location.hash) setTimeout(highlight, 320);

  /* ---------- case study expand ---------- */
  document.querySelectorAll("[data-case-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      if (!panel) return;
      var open = panel.hasAttribute("hidden");
      if (open) { panel.removeAttribute("hidden"); } else { panel.setAttribute("hidden", ""); }
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.textContent = open ? "Hide case study" : "View case study";
      if (open) track("case_study_open", { case_name: btn.getAttribute("data-case-name") || "" });
    });
  });

  /* ---------- consultation form ---------- */
  var form = document.getElementById("consultForm");
  if (form) {
    var status = document.getElementById("formStatus");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.className = "form-status";
      if (form.querySelector(".hp input").value) return; /* spam honeypot */
      if (!form.checkValidity()) {
        form.reportValidity();
        status.textContent = "Please complete the required fields correctly.";
        status.className = "form-status err";
        return;
      }
      var data = Object.fromEntries(new FormData(form).entries());
      delete data.company_website;
      track("contact_form_submit", { preferred_package: data.package || "" });
      /* Python-ready: point ENDPOINT at your Flask / FastAPI / Django route. */
      var ENDPOINT = form.getAttribute("data-endpoint");
      var done = function () {
        status.textContent = "Thank you. Your request has been received — I will get back to you shortly.";
        status.className = "form-status ok";
        form.reset();
      };
      var fail = function () {
        status.innerHTML = 'Could not send right now. Please <a href="https://wa.me/917837897701" rel="noopener noreferrer" target="_blank">message on WhatsApp</a> or call +91 78378 97701.';
        status.className = "form-status err";
      };
      if (ENDPOINT) {
        fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }).then(function (r) { (r.ok ? done : fail)(); }).catch(fail);
      } else {
        var msg =
          "Consultation request%0A%0AName: " + encodeURIComponent(data.name || "") +
          "%0ABusiness: " + encodeURIComponent(data.business || "") +
          "%0APhone: " + encodeURIComponent(data.phone || "") +
          "%0AEmail: " + encodeURIComponent(data.email || "") +
          "%0ABusiness type: " + encodeURIComponent(data.business_type || "") +
          "%0ABudget: " + encodeURIComponent(data.budget || "") +
          "%0APreferred package: " + encodeURIComponent(data.package || "") +
          "%0AChallenge: " + encodeURIComponent(data.challenge || "") +
          "%0AMessage: " + encodeURIComponent(data.message || "");
        window.open("https://wa.me/917837897701?text=" + msg, "_blank", "noopener");
        done();
      }
    });
  }
})();
