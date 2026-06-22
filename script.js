/* =========================================================
   STEAM SHOW — interactions (vanilla JS, no dependencies)
   ========================================================= */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- header scroll state ---------- */
  var header = document.getElementById("header");
  function onScroll() {
    if (window.scrollY > 40) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile drawer ---------- */
  var burger = document.getElementById("burger");
  var drawer = document.getElementById("drawer");
  function toggleDrawer(open) {
    var isOpen = open !== undefined ? open : !drawer.classList.contains("is-open");
    drawer.classList.toggle("is-open", isOpen);
    burger.classList.toggle("is-open", isOpen);
    burger.setAttribute("aria-expanded", String(isOpen));
    drawer.setAttribute("aria-hidden", String(!isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";
  }
  if (burger) burger.addEventListener("click", function () { toggleDrawer(); });
  drawer.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { toggleDrawer(false); });
  });

  /* ---------- embers (hero) ---------- */
  var embers = document.getElementById("embers");
  if (embers && !prefersReduced) {
    var COUNT = window.innerWidth < 600 ? 14 : 30;
    for (var i = 0; i < COUNT; i++) {
      var e = document.createElement("span");
      e.className = "ember";
      var size = 2 + Math.random() * 4;
      e.style.left = Math.random() * 100 + "%";
      e.style.width = e.style.height = size + "px";
      e.style.animationDuration = 6 + Math.random() * 8 + "s";
      e.style.animationDelay = -Math.random() * 12 + "s";
      e.style.setProperty("--drift", (Math.random() * 120 - 60) + "px");
      e.style.opacity = 0.4 + Math.random() * 0.6;
      embers.appendChild(e);
    }
  }

  /* ---------- scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- catalogue filters ---------- */
  var filters = document.getElementById("filters");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".grid .card"));
  var gridEmpty = document.getElementById("gridEmpty");
  if (filters) {
    filters.addEventListener("click", function (ev) {
      var btn = ev.target.closest(".chip");
      if (!btn) return;
      filters.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("is-active"); });
      btn.classList.add("is-active");
      var f = btn.getAttribute("data-filter");
      var visible = 0;
      cards.forEach(function (card) {
        if (card.classList.contains("card--cta")) { card.classList.remove("is-hidden"); return; }
        var cats = card.getAttribute("data-cats") || "";
        var show = f === "all" || cats.indexOf(f) !== -1;
        card.classList.toggle("is-hidden", !show);
        if (show) visible++;
      });
      if (gridEmpty) gridEmpty.hidden = visible !== 0;
    });
  }

  /* ---------- lightbox (YouTube facade) ---------- */
  var lightbox = document.getElementById("lightbox");
  var lbFrame = document.getElementById("lightboxFrame");
  var lbClose = document.getElementById("lightboxClose");

  function openLightbox(ytId, title) {
    if (ytId) {
      lbFrame.innerHTML =
        '<iframe src="https://www.youtube-nocookie.com/embed/' + ytId +
        '?autoplay=1&rel=0" title="' + (title || "Video") +
        '" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>';
    } else {
      // graceful placeholder until a real video id is wired in
      lbFrame.innerHTML =
        '<div class="lightbox__placeholder"><span><b>' + (title || "Video") +
        '</b>Video coming soon — drop a YouTube link here and it plays inline.</span></div>';
    }
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    setTimeout(function () { lbFrame.innerHTML = ""; }, 400);
  }

  // any element with data-yt attribute opens the lightbox
  document.querySelectorAll("[data-yt]").forEach(function (el) {
    el.addEventListener("click", function () {
      openLightbox(el.getAttribute("data-yt"), el.getAttribute("data-title"));
    });
  });

  if (lbClose) lbClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", function (ev) { if (ev.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape" && lightbox.classList.contains("is-open")) closeLightbox();
  });

})();
