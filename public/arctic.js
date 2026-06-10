/* ============================================================
   KIR ARCTIC MOTION — aurora sky + scroll choreography
   ------------------------------------------------------------
   Companion to /redesign.css ("Arctic Night" theme). Injected by
   Shell.astro after self-hosted /vendor/{lenis,gsap,ScrollTrigger}.
   Works on top of the scraped WordPress markup — no markup edits.

   Budget rules (non-negotiable):
   - animate transform/opacity only (GPU compositor)
   - prefers-reduced-motion → static sky, native scroll, no tweens
   - aurora renders on a low-res offscreen canvas, ~30fps, pauses
     when the tab is hidden
   ============================================================ */
(function () {
  "use strict";
  if (window.__kirArctic) return; // idempotent
  window.__kirArctic = true;

  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isMobile = matchMedia("(max-width: 767px)").matches;
  var isHome = document.body.classList.contains("home");

  /* ----------------------------------------------------------
     1. AURORA SKY — canvas behind everything (#arctic-sky)
     ---------------------------------------------------------- */
  var sky = document.createElement("canvas");
  sky.id = "arctic-sky";
  sky.setAttribute("aria-hidden", "true");
  document.body.prepend(sky);

  var ctx = sky.getContext("2d");
  var off = document.createElement("canvas"); // low-res aurora buffer
  var octx = off.getContext("2d");

  // --- Canvas filter support detection (iOS Safari has none) ---
  // iOS Safari silently ignores assignments to ctx.filter (it stays
  // "none"), so the blur composite no-ops and users see hard-edged
  // vertical strips. Detect once; when unsupported we soften the
  // buffer ourselves with a downscale/upscale box-blur (below).
  // Verification hook: set `window.__forceNoCanvasFilter = true`
  // before this script runs (or load with `?nofilter` in the query
  // string) to force the fallback path in any browser.
  var canvasFilterOK = (function () {
    if (window.__forceNoCanvasFilter) return false;
    try {
      if (/[?&]nofilter\b/.test(location.search)) return false;
      var probe = document.createElement("canvas").getContext("2d");
      probe.filter = "blur(2px)";
      var ok = probe.filter !== "none";
      probe.filter = "none";
      return ok;
    } catch (e) {
      return false;
    }
  })();
  window.__kirCanvasFilter = canvasFilterOK; // exposed for testing

  // Fallback-blur helper canvases (allocated in resize(), not per frame):
  // mip-chain off → 1/2 → 1/4 → 1/2 → full buffer size, run twice.
  // Bilinear filtering on each resample approximates a wide box blur;
  // stepping through 1/2 avoids the block artifacts of a direct 4x jump.
  var blurHalf = null, blurSmall = null, blurOut = null;
  var bhctx = null, bsctx = null, boctx = null;

  var W = 0, H = 0, OW = 0, OH = 0;
  var stars = [];
  // The aurora "state" the scroll choreography can drive.
  // energy: scroll-velocity excitement (decays); phase: scroll position
  // stirring the curtain shapes; animTime: our own clock so energy can
  // speed the flow up without time-jumps.
  var aurora = { intensity: 1, flare: 0, drift: 0, energy: 0, phase: 0 };
  window.__aurora = aurora; // exposed for deterministic testing
  var animTime = 0;
  var lastT = 0;

  var dpr = 1;
  function resize() {
    W = innerWidth;
    H = innerHeight;
    // Render the main canvas at device resolution (capped at 2× — enough
    // for retina sharpness without tripling fill cost on DPR-3 phones).
    // Without this the canvas is stretched 2-3× across physical pixels
    // and the whole sky reads as pixelated on phones, regardless of how
    // soft the aurora buffer is.
    dpr = Math.min(2, window.devicePixelRatio || 1);
    sky.width = Math.ceil(W * dpr);
    sky.height = Math.ceil(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // keep drawing in CSS units
    if ("imageSmoothingQuality" in ctx) ctx.imageSmoothingQuality = "high";
    // Aurora buffer: sized against PHYSICAL pixels so the final upscale
    // ratio stays sane on dense screens (phones were 0.34 of CSS width —
    // a 132px buffer stretched ~9× across an iPhone's 1170 hardware px).
    var scale = (isMobile ? 0.34 : 0.36) * dpr;
    OW = off.width = Math.min(1100, Math.ceil(W * scale));
    OH = off.height = Math.ceil(H * scale);
    if (!canvasFilterOK) {
      blurHalf = blurHalf || document.createElement("canvas");
      blurSmall = blurSmall || document.createElement("canvas");
      blurOut = blurOut || document.createElement("canvas");
      blurHalf.width = Math.max(1, Math.round(OW / 2));
      blurHalf.height = Math.max(1, Math.round(OH / 2));
      blurSmall.width = Math.max(1, Math.round(OW / 4));
      blurSmall.height = Math.max(1, Math.round(OH / 4));
      blurOut.width = OW;
      blurOut.height = OH;
      bhctx = blurHalf.getContext("2d");
      bsctx = blurSmall.getContext("2d");
      boctx = blurOut.getContext("2d");
      bhctx.imageSmoothingEnabled = true;
      bsctx.imageSmoothingEnabled = true;
      boctx.imageSmoothingEnabled = true;
      if ("imageSmoothingQuality" in boctx) {
        bhctx.imageSmoothingQuality = "high";
        bsctx.imageSmoothingQuality = "high";
        boctx.imageSmoothingQuality = "high";
      }
    }
    // starfield: density-capped, precomputed
    var n = Math.min(230, Math.floor((W * H) / 9000));
    stars = [];
    for (var i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() < 0.85 ? 1 : 1.8,
        p: Math.random() * Math.PI * 2,
        s: 0.3 + Math.random() * 0.9,
      });
    }
  }
  resize();
  addEventListener("resize", resize);

  // Layered-sine "noise" — cheap, organic, deterministic.
  function band(x, t, a, b, c) {
    return (
      Math.sin(x * a + t) * 0.55 +
      Math.sin(x * b - t * 0.7 + 1.7) * 0.3 +
      Math.sin(x * c + t * 0.45 + 4.1) * 0.15
    );
  }

  var RIBBONS = [
    { hue: "45,212,191", base: 0.30, amp: 0.10, len: 0.46, speed: 1.00, alpha: 0.5 },  // teal
    { hue: "52,211,153", base: 0.22, amp: 0.13, len: 0.40, speed: 0.62, alpha: 0.42 }, // green
    { hue: "139,92,246", base: 0.40, amp: 0.08, len: 0.34, speed: 0.81, alpha: 0.3 },  // violet
  ];
  if (isMobile) {
    // Tall narrow viewports: keep the aurora in the upper sky (it must
    // not sit behind body text) and dim it ~20% so text stays readable.
    RIBBONS = RIBBONS.slice(0, 2);
    RIBBONS.forEach(function (rb) {
      rb.base *= 0.8;
      rb.len *= 0.85;
      rb.alpha *= 0.8;
    });
  }

  function drawAurora() {
    var t = animTime;
    octx.clearRect(0, 0, OW, OH);
    octx.globalCompositeOperation = "lighter";
    var e = aurora.energy;
    var amp = aurora.intensity + aurora.flare + e * 0.45;
    for (var r = 0; r < RIBBONS.length; r++) {
      var rb = RIBBONS[r];
      // each ribbon is stirred by scroll position at its own rate, so
      // scrolling visibly re-shapes the curtains (not just dims them)
      var stir = aurora.phase * (0.7 + r * 0.45);
      var widen = 1 + e * 0.6; // energy makes the waves swell
      var step = isMobile ? 3 : 4; // narrower columns on mobile = less banding
      for (var x = 0; x <= OW; x += step) {
        var nx = x / OW;
        var topY =
          OH * rb.base +
          band(nx * 6.2 + stir, t * 0.00021 * rb.speed + r * 9, 1.9, 4.3, 9.7) * OH * rb.amp * widen +
          aurora.drift * OH * 0.05 * (r + 1);
        var len = OH * rb.len * (0.65 + 0.35 * band(nx * 3.1 - stir * 0.6, t * 0.00013 + r * 5, 2.3, 5.1, 8.3)) * (1 + e * 0.25);
        var a = rb.alpha * amp * (0.55 + 0.45 * band(nx * 9.7 + stir * 1.8, t * 0.0003 + r * 2, 3.7, 7.9, 13.1));
        if (a <= 0.01) continue;
        var g = octx.createLinearGradient(0, topY, 0, topY + len);
        g.addColorStop(0, "rgba(" + rb.hue + ",0)");
        g.addColorStop(0.72, "rgba(" + rb.hue + "," + (a * 0.5).toFixed(3) + ")");
        g.addColorStop(1, "rgba(" + rb.hue + "," + a.toFixed(3) + ")");
        octx.fillStyle = g;
        octx.fillRect(x, topY, step, len);
      }
    }
    octx.globalCompositeOperation = "source-over";
    if (!canvasFilterOK) softenBuffer();
  }

  // Fallback blur for browsers without ctx.filter (iOS Safari): two
  // mip-chain passes (src → 1/2 → 1/4 → 1/2 → full). Bilinear
  // resampling at each step smears the 3-4px columns into soft
  // curtains — visually close to the blur() path, works everywhere.
  // Runs only when the aurora buffer was redrawn (~30fps), and the
  // result lives in blurOut, which drawFrame composites unfiltered.
  function softenChain(src) {
    var hw = blurHalf.width, hh = blurHalf.height;
    var sw = blurSmall.width, sh = blurSmall.height;
    bhctx.clearRect(0, 0, hw, hh);
    bhctx.drawImage(src, 0, 0, hw, hh);          // down to 1/2
    bsctx.clearRect(0, 0, sw, sh);
    bsctx.drawImage(blurHalf, 0, 0, sw, sh);     // down to 1/4
    bhctx.clearRect(0, 0, hw, hh);
    bhctx.drawImage(blurSmall, 0, 0, hw, hh);    // up to 1/2
    boctx.clearRect(0, 0, OW, OH);
    boctx.drawImage(blurHalf, 0, 0, OW, OH);     // up to full
  }
  function softenBuffer() {
    softenChain(off);     // pass 1
    softenChain(blurOut); // pass 2
  }

  function drawFrame(t, auroraToo) {
    ctx.clearRect(0, 0, W, H);
    // stars
    ctx.fillStyle = "#cfe3ff";
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      ctx.globalAlpha = 0.22 + 0.5 * Math.abs(Math.sin(t * 0.0004 * s.s + s.p));
      ctx.fillRect(s.x, s.y, s.r, s.r);
    }
    ctx.globalAlpha = 1;
    if (auroraToo) drawAurora();
    // aurora sits in the upper sky, gently parallaxed by scroll drift;
    // a single filtered composite softens the low-res buffer into
    // ribbons. On mobile the composite is compressed vertically so the
    // curtains stay in roughly the top 55-60% of the tall viewport.
    var compH = H * (isMobile ? 0.58 : 0.78);
    var compY = -H * 0.04 * aurora.drift;
    if (canvasFilterOK) {
      ctx.filter = "blur(" + Math.round(W / 110) + "px)";
      ctx.drawImage(off, 0, compY, W, compH);
      ctx.filter = "none";
    } else {
      // pre-softened buffer (see softenBuffer) — no ctx.filter needed
      ctx.drawImage(blurOut, 0, compY, W, compH);
    }
  }

  if (reduce) {
    // Static night sky: one frame, no animation loop at all.
    aurora.intensity = 0.8;
    animTime = 4200;
    drawFrame(4200, true);
  } else {
    var frame = 0;
    var running = true;
    document.addEventListener("visibilitychange", function () {
      running = !document.hidden;
    });
    (function loop(t) {
      requestAnimationFrame(loop);
      if (!running) { lastT = t; return; }
      var dt = Math.min(64, t - lastT || 16);
      lastT = t;
      // our own clock: scroll energy makes the lights flow faster
      animTime += dt * (0.85 + aurora.energy * 3.2);
      aurora.energy *= Math.pow(0.94, dt / 16.7); // calm back down
      frame++;
      drawFrame(t, frame % 2 === 0); // aurora at ~30fps, stars at 60
    })(0);
  }

  // Scroll feeds the sky: position stirs the curtain shapes, velocity
  // excites them. Works with Lenis (below) or native scroll.
  function feedScroll(y, velocity) {
    aurora.phase = y * 0.0018;
    var v = Math.min(1, Math.abs(velocity || 0) / 28);
    if (v > aurora.energy) aurora.energy = v;
  }
  if (reduce) {
    /* static sky — no scroll reactivity */
  } else {
    var lastY = scrollY;
    addEventListener("scroll", function () {
      // native fallback (Lenis replaces this signal when present)
      if (window.lenis) return;
      var y = scrollY;
      feedScroll(y, (y - lastY) * 0.6);
      lastY = y;
    }, { passive: true });
  }

  /* ----------------------------------------------------------
     2. MOTION SYSTEM — Lenis + GSAP ScrollTrigger
     ---------------------------------------------------------- */
  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  var lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({
      duration: 1.15,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
    });
    lenis.on("scroll", function (e) {
      ScrollTrigger.update();
      feedScroll(e.scroll, e.velocity);
    });
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    window.lenis = lenis; // exposed for deterministic testing
  }

  // Smooth in-page anchors through Lenis (theme has #top back-to-top etc.)
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || !lenis) return;
    var id = a.getAttribute("href");
    if (id.length < 2) return;
    var target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: -90 });
  });

  // Aurora dims as you scroll away from the hero (hero-weighted sky).
  ScrollTrigger.create({
    start: 0,
    end: function () { return innerHeight * 1.6; },
    scrub: 0.6,
    onUpdate: function (self) {
      aurora.intensity = 1 - self.progress * 0.48;
      aurora.drift = self.progress;
    },
    invalidateOnRefresh: true,
  });

  /* ---------- Entrance: the hero deals itself in ---------- */
  var hero = document.querySelector(".kir-hero");
  if (hero) {
    var crumbs = hero.querySelector(".custom-breadcrumb");
    var heroH1 = hero.querySelector("h1");
    var heroIntro = hero.querySelectorAll("p");
    var podium = hero.querySelectorAll(".top-card-box");
    var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    if (heroH1) tl.from(heroH1, { y: 34, opacity: 0, duration: 0.9 }, 0.1);
    if (crumbs) tl.from(crumbs, { y: 12, opacity: 0, duration: 0.6 }, 0.25);
    if (heroIntro.length) {
      tl.from(heroIntro, { y: 22, opacity: 0, duration: 0.8, stagger: 0.08 }, 0.3);
    }
    if (podium.length) {
      // casino motif: the top-3 cards are DEALT in, with a little spin
      tl.from(podium, {
        y: 90,
        rotation: function (i) { return (i - 1) * 7; },
        opacity: 0,
        duration: 0.95,
        ease: "back.out(1.4)",
        stagger: 0.12,
      }, 0.45);
    }
  }

  /* ---------- Pointer parallax in the hero (faux-3D) ---------- */
  if (hero && !isMobile) {
    var layers = [];
    var h1El = hero.querySelector("h1");
    if (h1El) layers.push({ el: h1El, d: 0.18 });
    hero.querySelectorAll(".top-card-box").forEach(function (el, i) {
      layers.push({ el: el, d: 0.32 + i * 0.08 });
    });
    var movers = layers.map(function (l) {
      return {
        d: l.d,
        x: gsap.quickTo(l.el, "x", { duration: 0.9, ease: "power3" }),
        y: gsap.quickTo(l.el, "y", { duration: 0.9, ease: "power3" }),
      };
    });
    addEventListener("pointermove", function (e) {
      var nx = e.clientX / innerWidth - 0.5;
      var ny = e.clientY / innerHeight - 0.5;
      movers.forEach(function (m) {
        m.x(-nx * 46 * m.d);
        m.y(-ny * 26 * m.d);
      });
    });
  }

  /* ---------- Homepage: pinned, scrubbed hero scene ----------
     The sky flares, the headline lifts away and the podium fans
     out laterally as you scroll — fully reversible. Desktop only;
     starts from the page's natural loaded state (gsap.set of the
     current state + .to() only — deterministic under scrub).   */
  if (isHome && hero && !isMobile && innerWidth >= 992) {
    var cards = gsap.utils.toArray(hero.querySelectorAll(".top-card-box"));
    var head = [hero.querySelector("h1")].concat(
      gsap.utils.toArray(hero.querySelectorAll(".kir-hero > .container > p, p"))
    ).filter(Boolean);
    var flare = { v: 0 };

    var scene = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "+=120%",
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
    scene
      .to(flare, {
        v: 0.3, duration: 0.5, ease: "sine.in",
        onUpdate: function () { aurora.flare = flare.v; },
      }, 0)
      .to(head, { yPercent: -36, opacity: 0.15, duration: 0.7, ease: "power2.in", stagger: 0.03 }, 0.05);
    if (cards.length >= 3) {
      scene
        .to(cards[0], { x: function () { return -innerWidth * 0.16; }, rotation: -8, duration: 1, ease: "power2.inOut" }, 0.15)
        .to(cards[2], { x: function () { return innerWidth * 0.16; }, rotation: 8, duration: 1, ease: "power2.inOut" }, 0.15)
        .to(cards[1], { scale: 1.07, y: -14, duration: 1, ease: "power2.inOut" }, 0.15);
    }
    scene
      .to(flare, {
        v: 0, duration: 0.45, ease: "sine.out",
        onUpdate: function () { aurora.flare = flare.v; },
      }, 0.85)
      .to({}, { duration: 0.25 }); // tail hold before unpin
  }

  /* ---------- Scroll reveals, sitewide ----------
     Cards/sections fade-rise once as they enter. Only elements
     genuinely below the fold are hidden (LCP-safe), and content
     is never hidden without JS (initial state set here, not CSS). */
  var REVEAL = ".horizontal-card, .article-box, .review-card, .casino-card, " +
    ".wp-content-area h2, .intro-content-area h2, .featured-card";

  function armReveals(scope) {
    var els = gsap.utils.toArray((scope || document).querySelectorAll(REVEAL))
      .filter(function (el) {
        return !el.__armed && el.getBoundingClientRect().top > innerHeight * 0.9;
      });
    if (!els.length) return;
    els.forEach(function (el) { el.__armed = true; });
    gsap.set(els, { y: 30, autoAlpha: 0 });
    ScrollTrigger.batch(els, {
      start: "top 90%",
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, {
          y: 0, autoAlpha: 1, duration: 0.8,
          ease: "power3.out", stagger: 0.07, overwrite: true,
        });
      },
    });
  }
  armReveals(document);

  // RLAAF toplists render via Mustache after our init, and "Lisää"
  // appends more — arm whatever appears.
  document.querySelectorAll(".rlaaf-render-container").forEach(function (container) {
    new MutationObserver(function () {
      armReveals(container);
      ScrollTrigger.refresh();
    }).observe(container, { childList: true });
  });

  addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
