/* ============================================================
   mm2026-tilastot.js — interaktiivisuus sivulle /mm-kisat-2026-tilastot/
   @custom — hand-built; scrapers/converters must never overwrite it.

   Vanilla JS, no dependencies. Reads window.MM2026 (set by
   /mm2026-data.js, loaded first — both defer). Static markup is
   rendered at build time; this file only adds behaviour:
   - group explorer tabs (ARIA tablist, keyboard operable)
   - sortable stat tables (aria-sort)
   - top-scorer text filter
   - inline SVG charts (goals per edition + titles donut)
   - team comparator
   - records category filter chips
   - scroll reveals for .mm-reveal cards (transform/opacity only)

   Budget rules (same as /arctic.js): animate transform/opacity only;
   prefers-reduced-motion → no tweens, content fully visible.
   ============================================================ */
(function () {
  "use strict";
  if (window.__kirWc2026) return; // idempotent
  window.__kirWc2026 = true;

  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var D = window.MM2026;
  if (!D) return;

  var nf = new Intl.NumberFormat("fi-FI");
  var nf2 = new Intl.NumberFormat("fi-FI", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function refreshST() {
    if (!reduce && window.ScrollTrigger) {
      try { window.ScrollTrigger.refresh(); } catch (e) { /* noop */ }
    }
  }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function norm(s) {
    return String(s).toLowerCase().normalize("NFD").replace(new RegExp("[\\u0300-\\u036f]", "g"), "");
  }

  /* ---------- (b) Group explorer: ARIA tabs ---------- */
  function initTabs() {
    var list = document.querySelector('.mm-tabs[role="tablist"]');
    if (!list) return;
    var tabs = [].slice.call(list.querySelectorAll('[role="tab"]'));

    function activate(tab, setFocus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !on;
      });
      if (setFocus) tab.focus();
      refreshST();
    }

    list.addEventListener("click", function (e) {
      var t = e.target.closest('[role="tab"]');
      if (t) activate(t);
    });
    list.addEventListener("keydown", function (e) {
      var i = tabs.indexOf(document.activeElement);
      if (i === -1) return;
      var n = null;
      if (e.key === "ArrowRight") n = (i + 1) % tabs.length;
      else if (e.key === "ArrowLeft") n = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") n = 0;
      else if (e.key === "End") n = tabs.length - 1;
      if (n !== null) {
        e.preventDefault();
        activate(tabs[n], true);
      }
    });
  }

  /* ---------- (c)(d) Sortable tables ---------- */
  function initSortable(table) {
    var tbody = table.querySelector("tbody");
    if (!tbody) return;
    var ths = [].slice.call(table.querySelectorAll("thead th"));

    ths.forEach(function (th, idx) {
      var btn = th.querySelector("button.mm-sort");
      if (!btn) return;
      btn.addEventListener("click", function () {
        var type = th.getAttribute("data-type") || "text";
        var current = th.getAttribute("aria-sort");
        var dir =
          current === "descending" ? "ascending" :
          current === "ascending" ? "descending" :
          type === "num" ? "descending" : "ascending";
        ths.forEach(function (o) { o.setAttribute("aria-sort", "none"); });
        th.setAttribute("aria-sort", dir);
        var mul = dir === "ascending" ? 1 : -1;
        var rows = [].slice.call(tbody.rows);
        rows.sort(function (a, b) {
          var av = a.cells[idx].getAttribute("data-v") || "";
          var bv = b.cells[idx].getAttribute("data-v") || "";
          if (type === "num") return (parseFloat(av) - parseFloat(bv)) * mul;
          return av.localeCompare(bv, "fi") * mul;
        });
        rows.forEach(function (r) { tbody.appendChild(r); });
      });
    });
  }

  /* ---------- (d) Top-scorer text filter ---------- */
  function initScorerFilter() {
    var input = document.getElementById("mm-haku");
    var table = document.getElementById("mm-taulukko-maalintekijat");
    var status = document.getElementById("mm-haku-tulos");
    if (!input || !table) return;
    var rows = [].slice.call(table.querySelectorAll("tbody tr"));

    function update() {
      var q = norm(input.value.trim());
      var shown = 0;
      rows.forEach(function (r) {
        var hit = !q || norm(r.getAttribute("data-haku") || "").indexOf(q) !== -1;
        r.hidden = !hit;
        if (hit) shown++;
      });
      if (status) {
        status.textContent = "Näkyvissä " + shown + " / " + rows.length + " pelaajaa";
      }
      refreshST();
    }
    input.addEventListener("input", update);
    update();
  }

  /* ---------- (f1) Bar chart: goals per edition ---------- */
  function renderBarChart() {
    var host = document.getElementById("mm-kaavio-maalit");
    if (!host) return;
    var rows = D.maalitTurnauksittain;
    var W = 720, H = 340, L = 46, R = 10, T = 16, B = 40;
    var plotW = W - L - R, plotH = H - T - B;
    var yMax = 180;
    var n = rows.length;
    var step = plotW / n;
    var barW = step * 0.62;

    var maxRow = rows.reduce(function (m, r) { return r.maalit > m.maalit ? r : m; }, rows[0]);
    var minVal = rows.reduce(function (m, r) { return Math.min(m, r.maalit); }, Infinity);
    var minYears = rows.filter(function (r) { return r.maalit === minVal; })
      .map(function (r) { return r.vuosi; }).join(" ja ");
    var label =
      "Pylväskaavio: maalien kokonaismäärä jokaisessa MM-lopputurnauksessa 1930–2022. " +
      "Pienin maalimäärä on " + minVal + " (" + minYears + ") ja suurin " +
      maxRow.maalit + " (" + maxRow.vuosi + ").";

    /* role="group" (not "img"): the bars are focusable, so they must stay in
       the accessibility tree with names of their own (WCAG 4.1.2). */
    var s = '<svg viewBox="0 0 ' + W + " " + H + '" role="group" aria-label="' + esc(label) + '">';
    s += "<defs><linearGradient id=\"mmGradTeal\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">" +
      "<stop offset=\"0\" stop-color=\"#5eead4\"/><stop offset=\"1\" stop-color=\"#0d9488\"/>" +
      "</linearGradient></defs>";

    [0, 60, 120, 180].forEach(function (g) {
      var y = T + (1 - g / yMax) * plotH;
      s += '<line class="mm-grid-line" x1="' + L + '" y1="' + y + '" x2="' + (W - R) + '" y2="' + y + '"/>';
      s += '<text class="mm-axis-text" x="' + (L - 8) + '" y="' + (y + 4) + '" text-anchor="end">' + g + "</text>";
    });

    rows.forEach(function (r, i) {
      var x = L + i * step + (step - barW) / 2;
      var h = (r.maalit / yMax) * plotH;
      var y = T + plotH - h;
      var tip = r.vuosi + ": " + r.maalit + " maalia · " + r.ottelut + " ottelua · " +
        nf2.format(r.maalit / r.ottelut) + " maalia/ottelu";
      s += '<rect class="mm-bar" tabindex="0" role="img" aria-label="' + esc(tip) +
        '" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) +
        '" width="' + barW.toFixed(1) + '" height="' + h.toFixed(1) +
        '" rx="3" fill="url(#mmGradTeal)" data-tip="' + esc(tip) + '"/>';
      if ((i % 4 === 0 && i !== 20) || i === n - 1) {
        s += '<text class="mm-axis-text" x="' + (x + barW / 2).toFixed(1) + '" y="' + (H - B + 18) +
          '" text-anchor="middle">' + r.vuosi + "</text>";
      }
    });
    s += "</svg>";
    host.innerHTML = s;

    var tipEl = document.createElement("div");
    tipEl.className = "mm-tooltip";
    tipEl.setAttribute("aria-hidden", "true");
    host.appendChild(tipEl);

    function showTip(target) {
      var tr = target.getBoundingClientRect();
      var hr = host.getBoundingClientRect();
      var left = tr.left + tr.width / 2 - hr.left;
      left = Math.max(70, Math.min(hr.width - 70, left));
      tipEl.textContent = target.getAttribute("data-tip");
      tipEl.style.left = left + "px";
      tipEl.style.top = (tr.top - hr.top) + "px";
      tipEl.classList.add("mm-on");
    }
    function hideTip() {
      tipEl.classList.remove("mm-on");
    }
    host.addEventListener("mouseover", function (e) {
      if (e.target.classList && e.target.classList.contains("mm-bar")) showTip(e.target);
    });
    host.addEventListener("mouseout", hideTip);
    host.addEventListener("focusin", function (e) {
      if (e.target.classList && e.target.classList.contains("mm-bar")) showTip(e.target);
    });
    host.addEventListener("focusout", hideTip);
  }

  /* ---------- (f2) Donut: titles by confederation ---------- */
  function renderDonut() {
    var host = document.getElementById("mm-kaavio-maanosat");
    var legend = document.getElementById("mm-legenda");
    if (!host) return;
    var data = D.maanosaMestaruudet;
    var colors = ["#2dd4bf", "#8b5cf6"];
    var total = data.reduce(function (s, x) { return s + x.mestaruudet; }, 0);
    var size = 230, c = size / 2, r = 72, sw = 30;
    var circ = 2 * Math.PI * r;

    var label = "Rengaskaavio: maailmanmestaruudet maanosaliitoittain. " +
      data.map(function (x) { return x.maanosa + " " + x.mestaruudet + " mestaruutta"; }).join(" ja ") +
      ", yhteensä " + total + ".";

    var s = '<svg viewBox="0 0 ' + size + " " + size + '" role="img" aria-label="' + esc(label) + '">';
    var offset = 0;
    data.forEach(function (x, i) {
      var seg = (x.mestaruudet / total) * circ;
      s += '<circle cx="' + c + '" cy="' + c + '" r="' + r + '" fill="none" stroke="' + colors[i % colors.length] +
        '" stroke-width="' + sw + '" stroke-dasharray="' + seg.toFixed(2) + " " + circ.toFixed(2) +
        '" stroke-dashoffset="' + (-offset).toFixed(2) + '" transform="rotate(-90 ' + c + " " + c + ')"/>';
      offset += seg;
    });
    s += '<text class="mm-donut-keskus" x="' + c + '" y="' + (c + 4) + '" text-anchor="middle" font-size="40">' + total + "</text>";
    s += '<text class="mm-donut-keskus-sub" x="' + c + '" y="' + (c + 30) + '" text-anchor="middle">mestaruutta</text>';
    s += "</svg>";
    host.innerHTML = s;

    if (legend) {
      legend.innerHTML = data.map(function (x, i) {
        return '<li><span class="mm-swatch" style="background:' + colors[i % colors.length] + '" aria-hidden="true"></span>' +
          esc(x.maanosa) + " – " + x.mestaruudet + " mestaruutta</li>";
      }).join("");
    }
  }

  /* ---------- (g) Team comparator ---------- */
  function initComparator() {
    var selA = document.getElementById("mm-vs-a");
    var selB = document.getElementById("mm-vs-b");
    var out = document.getElementById("mm-vs-tulos");
    if (!selA || !selB || !out) return;

    var byId = {};
    D.joukkueet.forEach(function (j) { byId[j.id] = j; });

    function saavutus(j) {
      return j.saavutusVuodet ? j.parasSaavutus + " (" + j.saavutusVuodet + ")" : j.parasSaavutus;
    }
    function rows(a, b) {
      return [
        { l: "FIFA-ranking", av: a.fifaRanking + ".", bv: b.fifaRanking + ".", aB: a.fifaRanking < b.fifaRanking, bB: b.fifaRanking < a.fifaRanking },
        { l: "MM-osallistumiset", av: String(a.osallistumiset), bv: String(b.osallistumiset), aB: a.osallistumiset > b.osallistumiset, bB: b.osallistumiset > a.osallistumiset },
        { l: "Mestaruudet", av: String(a.mestaruudet), bv: String(b.mestaruudet), aB: a.mestaruudet > b.mestaruudet, bB: b.mestaruudet > a.mestaruudet },
        { l: "Paras saavutus", av: saavutus(a), bv: saavutus(b), aB: a.saavutusTaso > b.saavutusTaso, bB: b.saavutusTaso > a.saavutusTaso },
        { l: "Lohko", av: a.lohko, bv: b.lohko, aB: false, bB: false },
        { l: "Maanosaliitto", av: a.maanosa, bv: b.maanosa, aB: false, bB: false },
      ];
    }
    function card(team, rws, side) {
      var lis = rws.map(function (row) {
        var better = side === "a" ? row.aB : row.bB;
        var value = side === "a" ? row.av : row.bv;
        return '<li class="mm-vs-row"><span class="mm-vs-l">' + esc(row.l) + "</span>" +
          '<span class="' + (better ? "mm-vs-v mm-parempi" : "mm-vs-v") + '">' + esc(value) +
          (better ? '<span class="sr-only"> (parempi)</span>' : "") + "</span></li>";
      }).join("");
      return '<article class="mm-card mm-vs-card"><p class="mm-vs-name">' +
        '<span class="mm-flag" aria-hidden="true">' + esc(team.lippu) + "</span> " + esc(team.nimi) +
        '</p><ul class="mm-vs-rows">' + lis + "</ul></article>";
    }
    function render() {
      var a = byId[selA.value];
      var b = byId[selB.value];
      if (!a || !b) return;
      var rws = rows(a, b);
      out.innerHTML = card(a, rws, "a") + card(b, rws, "b");
      refreshST();
    }
    selA.addEventListener("change", render);
    selB.addEventListener("change", render);
  }

  /* ---------- (h) Records: category filter chips ---------- */
  function initRecordFilter() {
    var wrap = document.getElementById("mm-ennatys-suodatin");
    var grid = document.getElementById("mm-ennatykset-lista");
    if (!wrap || !grid) return;
    var chips = [].slice.call(wrap.querySelectorAll(".mm-chip"));
    var cards = [].slice.call(grid.querySelectorAll(".mm-record"));

    wrap.addEventListener("click", function (e) {
      var chip = e.target.closest(".mm-chip");
      if (!chip) return;
      var k = chip.getAttribute("data-kategoria");
      chips.forEach(function (c) {
        c.setAttribute("aria-pressed", c === chip ? "true" : "false");
      });
      cards.forEach(function (card) {
        card.hidden = k !== "kaikki" && card.getAttribute("data-kategoria") !== k;
      });
      refreshST();
    });
  }

  /* ---------- Hero stat band entrance (transform/opacity only) ----------
     The cards intentionally do NOT use .top-card-box, so arctic.js's
     homepage podium choreography never touches them; this is their own
     guarded one-shot entrance. Content stays visible without JS. */
  function initHeroStats() {
    if (reduce || !window.gsap) return;
    var cards = document.querySelectorAll(".kir-hero .mm-stat");
    if (!cards.length) return;
    window.gsap.from(cards, {
      y: 36,
      autoAlpha: 0,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.1,
      delay: 0.45,
    });
  }

  /* ---------- Scroll reveals for .mm-reveal (transform/opacity only) ---------- */
  function initReveals() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    var els = [].slice.call(document.querySelectorAll(".mm-reveal")).filter(function (el) {
      return el.getBoundingClientRect().top > innerHeight * 0.9;
    });
    if (!els.length) return;
    window.gsap.set(els, { y: 26, autoAlpha: 0 });
    window.ScrollTrigger.batch(els, {
      start: "top 90%",
      once: true,
      onEnter: function (batch) {
        window.gsap.to(batch, {
          y: 0,
          autoAlpha: 1,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.06,
          overwrite: true,
        });
      },
    });
  }

  initTabs();
  [].slice.call(document.querySelectorAll("table.mm-sortable")).forEach(initSortable);
  initScorerFilter();
  renderBarChart();
  renderDonut();
  initComparator();
  initRecordFilter();
  initHeroStats();
  initReveals();
})();
