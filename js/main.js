/* ==========================================================================
   Endes Tamás – fő script (külső könyvtár nélkül)
   Részek: menü, szavanként beúszó címek, megjelenés, számlálók,
   név-„visszafejtés”, terminál gépelés, hero pontrács (canvas), lebegő
   kódcímkék, görgetés-jelző + óriásfelirat + élő build, kártyadöntés és
   fényfolt, kijelölés-méretcímke, mágneses gombok, kurzorgyűrű,
   e-mail másolás, GYIK-harmonika, menü-visszafejtés, címkegépelés,
   vissza a tetejére gomb.
   ========================================================================== */
(function () {
  "use strict";

  // Ha a látogató kérte a csökkentett mozgást, az animációkat kihagyjuk
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobil menü ---------- */
  var navToggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("main-nav");
  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.textContent = open ? "bezár" : "menü";
    });
    // Linkre kattintva bezárjuk
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.textContent = "menü";
      }
    });
  }

  /* ---------- Évszám a láblécben ---------- */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Címek szavakra bontása ([data-split]) ----------
     Minden szót két span-be csomagolunk: a külső levág (overflow: hidden),
     a belső alulról becsúszik. A beágyazott elemeket (pl. .grad) bejárjuk,
     és a színátmenetet a szavakra tesszük át, mert a transzformált
     inline-block a szülő színátmenetes szövegét nem örökli jól. */
  var wordIndex = 0;
  function splitNode(node, gradient) {
    Array.prototype.slice.call(node.childNodes).forEach(function (child) {
      if (child.nodeType === 3) {
        var parts = child.textContent.split(/(\s+)/);
        var frag = document.createDocumentFragment();
        parts.forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          var outer = document.createElement("span");
          outer.className = "w";
          var inner = document.createElement("span");
          inner.className = "w__in" + (gradient ? " grad" : "");
          inner.textContent = part;
          inner.style.setProperty("--i", wordIndex++);
          outer.appendChild(inner);
          frag.appendChild(outer);
        });
        node.replaceChild(frag, child);
      } else if (child.nodeType === 1) {
        var isGrad = child.classList.contains("grad");
        if (isGrad) child.classList.remove("grad");
        splitNode(child, gradient || isGrad);
      }
    });
  }
  var splitEls = document.querySelectorAll("[data-split]");
  if (!reduceMotion) {
    splitEls.forEach(function (el) { wordIndex = 0; splitNode(el, false); });
  }

  /* ---------- Görgetésre megjelenés (IntersectionObserver) ---------- */
  var revealEls = document.querySelectorAll(".reveal, [data-split]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px" });

    revealEls.forEach(function (el, i) {
      // Egymás után következő testvérek kis késleltetést kapnak (lépcsőzés)
      var siblings = el.parentElement ? el.parentElement.querySelectorAll(":scope > .reveal") : [];
      var idx = Array.prototype.indexOf.call(siblings, el);
      if (idx > 0) el.style.setProperty("--delay", Math.min(idx, 5) * 0.08 + "s");
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Számlálók (0-ról a végértékig) ---------- */
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    // Honnan induljon (évszámnál pl. 2000-ről, nem 0-ról)
    var start = parseInt(el.getAttribute("data-count-from") || "0", 10);
    // Ezres tagolás magyarosan (90 000), évszámnál nem
    var group = target >= 10000;
    var format = function (n) { return group ? n.toLocaleString("hu-HU") : String(n); };
    var duration = 1400;
    var t0 = null;
    function frame(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3); // lassuló végű görbe
      el.textContent = format(Math.round(start + (target - start) * eased));
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  if (!reduceMotion && "IntersectionObserver" in window) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    document.querySelectorAll("[data-count]").forEach(function (el) { countObserver.observe(el); });
  }

  /* ---------- Név „visszafejtése” véletlen karakterekből ---------- */
  function scramble(el, delay) {
    var finalText = el.textContent;
    var chars = "<>/{}[]=+*#$%01";
    var frameCount = 0;
    var totalFrames = 26;
    setTimeout(function tick() {
      frameCount++;
      var revealUpTo = Math.floor((frameCount / totalFrames) * finalText.length);
      var out = "";
      for (var i = 0; i < finalText.length; i++) {
        if (i < revealUpTo || finalText[i] === " ") out += finalText[i];
        else out += chars[Math.floor(Math.random() * chars.length)];
      }
      el.textContent = out;
      if (frameCount < totalFrames) setTimeout(tick, 40);
      else el.textContent = finalText;
    }, delay);
  }
  if (!reduceMotion) {
    document.querySelectorAll("[data-scramble]").forEach(function (el, i) { scramble(el, 150 + i * 260); });
  }

  /* ---------- Terminál: soronkénti begépelés ----------
     A HTML-ben a teljes szöveg benne van (JS nélkül is látszik).
     Itt kimentjük a sorokat, kiürítjük, majd karakterenként visszaírjuk. */
  var typer = document.querySelector("[data-typer]");
  if (typer && !reduceMotion) {
    var lines = Array.prototype.map.call(typer.querySelectorAll("span"), function (s) {
      return { cls: s.className, text: s.textContent };
    });
    typer.textContent = "";
    var caret = document.createElement("span");
    caret.className = "caret";
    caret.setAttribute("aria-hidden", "true");
    typer.appendChild(caret);

    var lineIdx = 0;
    function typeLine() {
      if (lineIdx >= lines.length) return;
      var line = lines[lineIdx];
      var span = document.createElement("span");
      span.className = line.cls;
      typer.insertBefore(span, caret);
      var isCmd = line.cls === "t-cmd";
      var charIdx = 0;
      (function typeChar() {
        // A parancsot karakterenként gépeljük, a kimenetet egyben „írja ki” a gép
        if (isCmd) {
          span.textContent = line.text.slice(0, ++charIdx);
          if (charIdx < line.text.length) return setTimeout(typeChar, 38 + Math.random() * 40);
        } else {
          span.textContent = line.text;
        }
        typer.insertBefore(document.createTextNode("\n"), caret);
        lineIdx++;
        setTimeout(typeLine, isCmd ? 380 : 140);
      })();
    }
    setTimeout(typeLine, 900);
  }

  /* ---------- Hero: egérre reagáló pontrács (canvas) ----------
     Rácsba rendezett pontok; az egér közelében a pont megnő és színt kap.
     devicePixelRatio-val rajzolunk, hogy éles legyen. Csak akkor fut a
     ciklus, ha a hero látszik. Csökkentett mozgásnál egyszer rajzolunk. */
  var canvas = document.querySelector(".hero__canvas");
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var hero = canvas.parentElement;
    var gap = 28;                 // pontok távolsága (CSS px)
    var mouse = { x: -9999, y: -9999 };
    var smooth = { x: -9999, y: -9999 };
    var w = 0, h = 0, dpr = 1;
    var running = false;
    var dotColor, accentColor;

    function readColors() {
      var cs = getComputedStyle(document.documentElement);
      dotColor = cs.getPropertyValue("--line").trim() || "#262c36";
      accentColor = cs.getPropertyValue("--accent-2").trim() || "#9d8fff";
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = hero.clientWidth;
      h = hero.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduceMotion || !running) draw();
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      // Az egérpozíciót lassan követjük, így „úszik” a fény
      smooth.x += (mouse.x - smooth.x) * 0.12;
      smooth.y += (mouse.y - smooth.y) * 0.12;
      var radius = 160;
      for (var y = gap / 2; y < h; y += gap) {
        for (var x = gap / 2; x < w; x += gap) {
          var dx = x - smooth.x, dy = y - smooth.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          var f = dist < radius ? 1 - dist / radius : 0; // 0..1 közelség
          ctx.globalAlpha = 0.55 + f * 0.45;
          ctx.fillStyle = f > 0.05 ? accentColor : dotColor;
          ctx.beginPath();
          ctx.arc(x, y, 1.1 + f * 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }

    function loop() {
      if (!running) return;
      draw();
      requestAnimationFrame(loop);
    }

    readColors();
    resize();
    window.addEventListener("resize", resize);
    // Ha a rendszer téma vált (sötét/világos), új színek
    window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", function () { readColors(); draw(); });

    if (!reduceMotion) {
      hero.addEventListener("pointermove", function (e) {
        var r = hero.getBoundingClientRect();
        mouse.x = e.clientX - r.left;
        mouse.y = e.clientY - r.top;
      });
      hero.addEventListener("pointerleave", function () { mouse.x = -9999; mouse.y = -9999; });

      // Csak akkor animálunk, ha a hero a képernyőn van (kíméli az akkut)
      new IntersectionObserver(function (entries) {
        var visible = entries[0].isIntersecting;
        if (visible && !running) { running = true; loop(); }
        if (!visible) running = false;
      }).observe(hero);
    }
  }

  /* ---------- Görgetés-jelző + idővonal + óriásfelirat + élő build ----------
     Egyetlen scroll-figyelő, requestAnimationFrame-mel összefogva. */
  var progressBar = document.querySelector(".scroll-progress");
  var gitlog = document.querySelector("[data-gitlog]");
  var band = document.querySelector("[data-band]");
  var bandRows = band ? band.querySelectorAll("[data-band-dir]") : [];

  var build = document.querySelector("[data-build]");
  var buildSteps = build ? build.querySelectorAll("[data-step]") : [];
  var buildBar = document.querySelector("[data-build-bar]");
  var buildLabel = document.querySelector("[data-build-label]");
  var themeLayer = document.querySelector("[data-theme-layer]");
  var demo = document.querySelector("[data-demo]");
  var cards = document.querySelector("[data-cards]");
  var lock = document.querySelector("[data-build-lock]");
  var codeBox = build ? build.querySelector(".code") : null;
  var STEP_COUNT = 8;
  var stepNames = ["", "váz (HTML)", "navigáció", "főcím", "gomb", "színek (CSS)", "kezelések", "animáció", "élesítés"];
  var currentStep = -1;

  // Az adott lépésig mindent bekapcsol; az épp most megjelenteket kiemeli
  function setBuildStep(step) {
    if (step === currentStep) return;
    currentStep = step;
    buildSteps.forEach(function (el) {
      var s = parseInt(el.getAttribute("data-step"), 10);
      el.classList.toggle("is-on", s <= step);
      el.classList.toggle("is-new", s === step && el.classList.contains("ln"));
    });
    // Ha a szerkesztő kicsi (mobil), odagörgetünk az épp megírt sorokhoz
    var firstNew = codeBox ? codeBox.querySelector(".ln.is-new") : null;
    if (firstNew && codeBox.scrollHeight > codeBox.clientHeight) {
      codeBox.scrollTo({ top: Math.max(0, firstNew.offsetTop - 16), behavior: reduceMotion ? "auto" : "smooth" });
    }
    if (themeLayer) themeLayer.classList.toggle("is-on", step >= 5);
    if (demo) demo.classList.toggle("is-themed", step >= 5);
    if (cards) cards.classList.toggle("is-animated", step >= 7);
    if (lock) lock.classList.toggle("is-on", step >= 8);
    if (buildLabel) buildLabel.textContent = step > 0 ? step + "/" + STEP_COUNT + " · " + stepNames[step] : "görgess tovább ↓";
  }

  function onScroll() {
    var vh = window.innerHeight;
    var docH = document.documentElement.scrollHeight - vh;
    if (progressBar) progressBar.style.transform = "scaleX(" + (docH > 0 ? window.scrollY / docH : 0) + ")";

    // Idővonal: a vonal a lista görgetésével együtt nő
    if (gitlog && !reduceMotion) {
      var r = gitlog.getBoundingClientRect();
      var p = (vh * 0.75 - r.top) / r.height;
      gitlog.style.setProperty("--line-progress", Math.max(0, Math.min(1, p)).toFixed(3));
    }

    // Óriásfelirat: amíg a sáv látszik, a két sor ellentétes irányba csúszik
    if (band && !reduceMotion) {
      var bb = band.getBoundingClientRect();
      if (bb.bottom > 0 && bb.top < vh) {
        var bp = (vh - bb.top) / (vh + bb.height); // 0..1 a sáv áthaladása alatt
        bandRows.forEach(function (row) {
          var dir = parseFloat(row.getAttribute("data-band-dir"));
          // -1: balra megy; 1: jobbról indul, és jobbra halad
          var x = dir < 0 ? -bp * 35 : (bp * 35) - 35;
          row.style.transform = "translateX(" + x.toFixed(2) + "%)";
        });
      }
    }

    // Élő build: a ragadós szakaszon belüli előrehaladás (0–1) adja a lépést
    if (build && !reduceMotion) {
      var br = build.getBoundingClientRect();
      var total = build.offsetHeight - vh;
      var progress = total > 0 ? Math.max(0, Math.min(1, -br.top / total)) : 1;
      // A legelején és a végén kis ráhagyás, hogy a kész állapot is kitartson
      var step = Math.min(STEP_COUNT, Math.floor(progress * (STEP_COUNT + 1.5)));
      setBuildStep(step);
      if (buildBar) buildBar.style.transform = "scaleX(" + progress.toFixed(3) + ")";
    }
  }

  if (reduceMotion) {
    setBuildStep(STEP_COUNT); // csak a kész állapot
    if (buildLabel) buildLabel.textContent = "kész oldal";
  }

  var ticking = false;
  window.addEventListener("scroll", function () {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(function () { onScroll(); ticking = false; });
    }
  }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();


  /* ---------- Egérrel használt finom effektek ----------
     Csak valódi egérnél (hover + pontos mutató) és mozgáscsökkentés nélkül. */
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var fancy = finePointer && !reduceMotion;

  /* Lebegő kódcímkék a hero-ban: az egérrel ellentétes irányba, mélységtől függően mozdulnak */
  var heroEl = document.querySelector(".hero");
  var chips = document.querySelectorAll(".chip[data-depth]");
  if (fancy && heroEl && chips.length) {
    heroEl.addEventListener("pointermove", function (e) {
      var r = heroEl.getBoundingClientRect();
      var dx = (e.clientX - r.left) / r.width - 0.5;   // -0.5 .. 0.5
      var dy = (e.clientY - r.top) / r.height - 0.5;
      chips.forEach(function (chip) {
        var d = parseFloat(chip.getAttribute("data-depth"));
        chip.style.transform = "translate3d(" + (dx * d * -40).toFixed(1) + "px," + (dy * d * -40).toFixed(1) + "px,0)";
      });
    });
    heroEl.addEventListener("pointerleave", function () {
      chips.forEach(function (chip) { chip.style.transform = ""; });
    });
  }

  /* Kártyák 3D-s döntése + a fényfolt helye ([data-tilt]) */
  if (fancy) {
    document.querySelectorAll("[data-tilt]").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width;   // 0..1
        var y = (e.clientY - r.top) / r.height;
        el.style.transition = "transform 0.15s ease-out";
        el.style.transform = "perspective(900px) rotateX(" + ((0.5 - y) * 7).toFixed(2) + "deg) rotateY(" + ((x - 0.5) * 9).toFixed(2) + "deg) translateY(-4px)";
        el.style.setProperty("--mx", (e.clientX - r.left) + "px");
        el.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
      el.addEventListener("pointerleave", function () {
        el.style.transition = "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)";
        el.style.transform = "";
      });
    });
  }

  /* Figma-szerű kijelölés: rámutatáskor kiírjuk az elem méretét */
  document.querySelectorAll("[data-select]").forEach(function (el) {
    el.addEventListener("pointerenter", function () {
      var label = el.querySelector(":scope > .sel-size");
      if (!label) {
        label = document.createElement("span");
        label.className = "sel-size";
        label.setAttribute("aria-hidden", "true");
        el.appendChild(label);
      }
      label.textContent = Math.round(el.offsetWidth) + " × " + Math.round(el.offsetHeight);
    });
  });

  /* Mágneses gombok: kicsit a kurzor felé húzódnak */
  if (fancy) {
    document.querySelectorAll("[data-magnetic]").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = "translate(" + (dx * 0.18).toFixed(1) + "px," + (dy * 0.3).toFixed(1) + "px)";
      });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });
  }

  /* Kurzorgyűrű: lágyan követi az egeret, linkek fölött megnő,
     a portfólió-előnézet fölött kiírja, hogy „görgetem” */
  if (fancy) {
    var cursor = document.createElement("div");
    cursor.className = "cursor is-hidden";
    cursor.setAttribute("aria-hidden", "true");
    var ring = document.createElement("span");
    ring.className = "cursor__ring";
    var cursorLabel = document.createElement("span");
    cursorLabel.className = "cursor__label";
    cursor.appendChild(ring);
    cursor.appendChild(cursorLabel);
    document.body.appendChild(cursor);
    var target = { x: -100, y: -100 }, pos = { x: -100, y: -100 };

    document.addEventListener("pointermove", function (e) {
      target.x = e.clientX; target.y = e.clientY;
      cursor.classList.remove("is-hidden");
    });
    document.documentElement.addEventListener("pointerleave", function () { cursor.classList.add("is-hidden"); });

    document.addEventListener("pointerover", function (e) {
      var labelled = e.target.closest(".showcase__frame");
      var interactive = e.target.closest("a, button, summary, input, select, textarea, label, [data-tilt]");
      cursor.classList.toggle("has-label", !!labelled);
      cursor.classList.toggle("is-hover", !labelled && !!interactive);
      cursorLabel.textContent = labelled ? "görgetem" : "";
    });

    (function follow() {
      // Minden képkockán a hátralévő távolság 20%-át tesszük meg: lágy követés
      pos.x += (target.x - pos.x) * 0.2;
      pos.y += (target.y - pos.y) * 0.2;
      cursor.style.transform = "translate3d(" + pos.x.toFixed(1) + "px," + pos.y.toFixed(1) + "px,0)";
      requestAnimationFrame(follow);
    })();
  }

  /* ---------- E-mail cím másolása (semmit nem tárolunk) ---------- */
  var copyBtn = document.querySelector("[data-copy-email]");
  var emailEl = document.querySelector("[data-email]");
  if (copyBtn && emailEl && navigator.clipboard) {
    copyBtn.hidden = false; // csak akkor látszik, ha működik
    var copyText = copyBtn.textContent;
    copyBtn.addEventListener("click", function () {
      navigator.clipboard.writeText(emailEl.textContent.trim()).then(function () {
        copyBtn.textContent = "másolva ✓";
        setTimeout(function () { copyBtn.textContent = copyText; }, 1800);
      });
    });
  }

  /* ---------- GYIK: egyszerre egy nyitott kérdés, csevegős válasszal ----------
     JS nélkül a name="gyik" attribútum miatt a böngésző maga zárja be a
     többit. JS-sel ezt levesszük, és mi animáljuk: a régi összecsukódik,
     az új kinyílik, a „gépel…” pöttyök után beúszik a válasz. */
  var faqItems = document.querySelectorAll("[data-faq] .faq__item");
  if (faqItems.length && !reduceMotion && Element.prototype.animate) {
    var ease = "cubic-bezier(0.22, 1, 0.36, 1)";

    faqItems.forEach(function (item) {
      item.removeAttribute("name"); // a kizárólagosságot innentől mi kezeljük
      var answer = item.querySelector(".faq__answer");
      var dots = document.createElement("span");
      dots.className = "faq__typing";
      dots.setAttribute("aria-hidden", "true");
      dots.appendChild(document.createElement("i"));
      dots.appendChild(document.createElement("i"));
      dots.appendChild(document.createElement("i"));
      answer.appendChild(dots);
    });

    function closeItem(item) {
      var body = item.querySelector(".faq__body");
      var anim = body.animate(
        [{ height: body.offsetHeight + "px", opacity: 1 }, { height: "0px", opacity: 0 }],
        { duration: 280, easing: ease }
      );
      item.classList.add("is-closing");
      anim.onfinish = function () {
        item.open = false;
        item.classList.remove("is-closing", "is-typing");
      };
    }

    function openItem(item) {
      var body = item.querySelector(".faq__body");
      item.open = true;
      item.classList.add("is-typing");
      var h = body.offsetHeight;
      body.animate(
        [{ height: "0px", opacity: 0 }, { height: h + "px", opacity: 1 }],
        { duration: 380, easing: ease }
      );
      // Rövid „gépelés”, aztán megjelenik a válasz
      clearTimeout(item._typingTimer);
      item._typingTimer = setTimeout(function () { item.classList.remove("is-typing"); }, 650);
    }

    faqItems.forEach(function (item) {
      item.querySelector("summary").addEventListener("click", function (e) {
        e.preventDefault();
        if (item.classList.contains("is-closing")) return;
        if (item.open) {
          closeItem(item);
        } else {
          faqItems.forEach(function (other) { if (other !== item && other.open) closeItem(other); });
          openItem(item);
        }
      });
    });
  } else if (faqItems.length) {
    // Mozgáscsökkentés vagy régi böngésző: animáció nélkül, de egyszerre egy nyitva
    faqItems.forEach(function (item) {
      item.addEventListener("toggle", function () {
        if (!item.open) return;
        faqItems.forEach(function (other) { if (other !== item) other.open = false; });
      });
    });
  }

  /* ---------- Menüpontok: rámutatáskor „visszafejtődnek” ---------- */
  if (fancy) {
    var glyphs = "<>/{}[]=+*#$%01";
    document.querySelectorAll(".nav__list a").forEach(function (link) {
      var original = link.textContent;
      var timer = null;
      link.addEventListener("pointerenter", function () {
        var frame = 0;
        clearInterval(timer);
        timer = setInterval(function () {
          frame++;
          var done = Math.floor(frame / 2); // két képkockánként egy betű áll be
          link.textContent = original.split("").map(function (ch, i) {
            return i < done ? ch : glyphs[Math.floor(Math.random() * glyphs.length)];
          }).join("");
          if (done >= original.length) { clearInterval(timer); link.textContent = original; }
        }, 28);
      });
    });
  }

  /* ---------- Szekciócímkék („// árak”) begépelése, amikor láthatóvá válnak ---------- */
  if (!reduceMotion && "IntersectionObserver" in window) {
    var eyebrows = document.querySelectorAll(".section__eyebrow.reveal");
    var typeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        typeObserver.unobserve(entry.target);
        var el = entry.target;
        var text = el.getAttribute("data-text");
        var i = 0;
        (function step() {
          el.textContent = text.slice(0, ++i);
          if (i < text.length) setTimeout(step, 28 + Math.random() * 30);
        })();
      });
    }, { rootMargin: "0px 0px -10% 0px" });
    eyebrows.forEach(function (el) {
      el.setAttribute("data-text", el.textContent);
      el.setAttribute("aria-label", el.textContent); // a felolvasó a teljes szöveget kapja
      el.textContent = "";
      typeObserver.observe(el);
    });
  }

  /* ---------- Vissza a tetejére: a hero után jelenik meg, a kör a görgetést mutatja ---------- */
  var toTop = document.querySelector("[data-to-top]");
  var toTopRing = document.querySelector("[data-to-top-ring]");
  if (toTop && toTopRing) {
    var ringLength = 2 * Math.PI * 21; // a kör kerülete (r = 21)
    var updateToTop = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? window.scrollY / max : 0;
      toTop.classList.toggle("is-shown", window.scrollY > window.innerHeight * 0.8);
      toTopRing.style.strokeDashoffset = (ringLength * (1 - p)).toFixed(1);
    };
    window.addEventListener("scroll", updateToTop, { passive: true });
    updateToTop();
  }
})();
