/* The Best DIY Home — site behaviour (v4)
   Header mega menu, mobile navigation, header search row, live search
   suggestions and the search results page. Vanilla JS, no dependencies.
   All search data below is real site content: 2 published articles and the
   8 site categories. Nothing here invents articles, dates or prices. */
(function () {
  "use strict";

  /* Root prefix of the site, derived from this script's own URL so the
     same file works from /, /categories/ and /posts/. */
  var scriptEl = document.currentScript ||
    document.querySelector('script[src*="assets/js/main.js"]');
  var root = "";
  if (scriptEl) {
    var src = scriptEl.getAttribute("src") || "";
    root = src.replace(/assets\/js\/main\.js.*$/, "");
  }

  /* ---------------- Search data (real content only) ---------------- */
  var SEARCH_DATA = [
    {
      type: "Article",
      title: "Small Bedroom Makeover Ideas for a Cozy, Clutter-Free Space",
      description: "Small bedroom makeover ideas for beginners: layout, colour, light, storage and wall decor that make a compact bedroom feel bigger, calmer and cosier — without a renovation.",
      category: "Bedroom Makeover",
      url: "posts/small-bedroom-makeover-ideas.html",
      image: "assets/images/small-bedroom-hero.jpg",
      imageAlt: "Compact bedroom with a neatly made bed, dark blue wall panels, wall lights and a blue runner",
      keywords: "small bedroom tiny bedroom compact bedroom cozy clutter-free clutter free storage layout colour color light wall decor under bed shelves hooks mirror lamp beginner makeover bigger"
    },
    {
      type: "Article",
      title: "Budget Bedroom Makeover Ideas That Make a Big Difference",
      description: "Beginner-friendly budget bedroom makeover ideas grouped by walls, bedding, lighting, storage and layout — small changes that make a room feel fresh and cosy.",
      category: "Bedroom Makeover",
      url: "posts/budget-bedroom-makeover-ideas.html",
      image: "assets/images/article-bedroom-1.jpg",
      imageAlt: "Bedroom with white quilted bedding, orange cushions and a bold floral painting above the bed",
      keywords: "bedroom budget makeover bedding storage lighting walls layout cozy small bedroom furniture cushions throw mirror lamp beginner weekend"
    },
    {
      type: "Category",
      title: "Bedroom Makeover",
      description: "Cozy, restful bedrooms on a realistic budget — layout, colour, storage and finishing touches.",
      category: "Bedroom Makeover",
      url: "categories/bedroom-makeover.html",
      image: "assets/images/cat-bedroom.jpg",
      imageAlt: "Bright bedroom with white bedding, bedside lamps and a framed print above the bed",
      keywords: "bedroom makeover budget cozy small bedroom wall decor storage furniture styling bedding"
    },
    {
      type: "Category",
      title: "DIY Wall Decor",
      description: "Handmade art, gallery walls and shelves that turn blank walls into focal points.",
      category: "DIY Wall Decor",
      url: "categories/diy-wall-decor.html",
      image: "assets/images/cat-wall-decor.jpg",
      imageAlt: "Gallery wall of six framed prints above a tan sofa in a living room",
      keywords: "wall decor handmade wall art gallery wall shelves affordable paper wall art decorative panels frames prints"
    },
    {
      type: "Category",
      title: "Dollar Store DIY Decor",
      description: "Affordable finds transformed into vases, centrepieces and seasonal decor.",
      category: "Dollar Store DIY Decor",
      url: "categories/dollar-store-diy-decor.html",
      image: "assets/images/cat-dollar-store.jpg",
      imageAlt: "Tall glass floor vase filled with dried pampas grass beside a sofa",
      keywords: "dollar store home decor affordable crafts vases trays centrepieces centerpieces budget decorations seasonal cheap transformations"
    },
    {
      type: "Category",
      title: "Renter-Friendly Decor",
      description: "No-damage, no-drill ideas that make a rental feel like home and come down cleanly.",
      category: "Renter-Friendly Decor",
      url: "categories/renter-friendly-decor.html",
      image: "assets/images/cat-renter.jpg",
      imageAlt: "Small apartment living and dining space with a red armchair by a large window",
      keywords: "renter friendly no damage wall decor removable wallpaper apartment decorating storage no drill temporary rental bedroom"
    },
    {
      type: "Category",
      title: "Budget Living Room Makeover",
      description: "Affordable living room refreshes — layout, furniture makeovers and cozy styling.",
      category: "Budget Living Room Makeover",
      url: "categories/budget-living-room-makeover.html",
      image: "assets/images/cat-living-room.jpg",
      imageAlt: "Neutral living room with a sectional sofa, coffee table and a decorated gallery wall",
      keywords: "living room makeover affordable diy decorations small living room furniture makeovers coffee table decor cozy styling"
    },
    {
      type: "Category",
      title: "Handmade Home Decorations",
      description: "Crafted vases, centrepieces and accessories, including recycled-material projects.",
      category: "Handmade Home Decorations",
      url: "categories/handmade-home-decorations.html",
      image: "assets/images/cat-handmade.jpg",
      imageAlt: "Colourful balls of yarn with crochet hooks",
      keywords: "handmade home decor crafts vases centerpieces centrepieces recycled diy flowers accessories creative"
    },
    {
      type: "Category",
      title: "Seasonal Home Decor",
      description: "Spring through winter, plus Christmas and Halloween — fresh looks through the year.",
      category: "Seasonal Home Decor",
      url: "categories/seasonal-home-decor.html",
      image: "assets/images/cat-seasonal.jpg",
      imageAlt: "Christmas greenery, eucalyptus and red berries arranged on a light table",
      keywords: "seasonal home decor spring summer fall autumn winter christmas halloween seasonal diy crafts wreath garland"
    },
    {
      type: "Category",
      title: "Small Bathroom Makeover",
      description: "Space-saving storage, organisation and decor for compact bathrooms.",
      category: "Small Bathroom Makeover",
      url: "categories/small-bathroom-makeover.html",
      image: "assets/images/cat-bathroom.jpg",
      imageAlt: "Modern bathroom with a freestanding tub, vessel sink and green plants",
      keywords: "small bathroom makeover budget decorations diy storage organization organisation accessories space saving wall decor tiny"
    }
  ];

  function haystack(item) {
    return (item.title + " " + item.description + " " + item.category + " " +
      item.keywords).toLowerCase();
  }

  /* Match rule: every word in the query must appear somewhere in the
     item's title/description/category/keywords (substring, case-insensitive,
     so partial words match). Score rewards full-phrase and title matches. */
  function searchItems(query) {
    var q = (query || "").trim().toLowerCase();
    if (!q) return [];
    var words = q.split(/\s+/);
    var scored = [];
    SEARCH_DATA.forEach(function (item) {
      var hay = haystack(item);
      var ok = words.every(function (w) { return hay.indexOf(w) !== -1; });
      if (!ok) return;
      var score = 0;
      if (item.title.toLowerCase().indexOf(q) !== -1) score += 5;
      if (hay.indexOf(q) !== -1) score += 2;
      words.forEach(function (w) {
        if (item.title.toLowerCase().indexOf(w) !== -1) score += 2;
        if (item.category.toLowerCase().indexOf(w) !== -1) score += 1;
      });
      if (item.type === "Article") score += 0.5;
      scored.push({ item: item, score: score });
    });
    scored.sort(function (a, b) { return b.score - a.score; });
    return scored.map(function (s) { return s.item; });
  }

  function cardHTML(item) {
    var label = item.type === "Article"
      ? "Article · " + item.category
      : "Category";
    var linkText = item.type === "Article" ? "Read Article" : "Explore Category";
    return '<article class="card">' +
      '<div class="visual"><img src="' + root + item.image + '" alt="' +
        item.imageAlt + '" loading="lazy"></div>' +
      '<div class="card-body">' +
        '<p class="card-cat">' + label + "</p>" +
        '<h3><a href="' + root + item.url + '">' + item.title + "</a></h3>" +
        "<p>" + item.description + "</p>" +
        '<a class="card-link" href="' + root + item.url + '">' + linkText + "</a>" +
      "</div></article>";
  }

  /* ---------------- Mega menu ---------------- */
  var megaToggle = document.querySelector(".mega-toggle");
  var megaMenu = document.getElementById("mega-menu");
  if (megaToggle && megaMenu) {
    var setMega = function (open) {
      megaToggle.setAttribute("aria-expanded", open ? "true" : "false");
      megaMenu.hidden = !open;
    };
    var megaOpen = function () {
      return megaToggle.getAttribute("aria-expanded") === "true";
    };
    megaToggle.addEventListener("click", function () { setMega(!megaOpen()); });
    var header = document.querySelector(".site-header");
    header.addEventListener("mouseenter", function () {
      if (window.innerWidth > 900) setMega(true);
    });
    header.addEventListener("mouseleave", function () {
      if (window.innerWidth > 900 && !megaMenu.contains(document.activeElement) &&
          document.activeElement !== megaToggle) setMega(false);
    });
    megaMenu.addEventListener("focusout", function () {
      setTimeout(function () {
        if (!megaMenu.contains(document.activeElement) &&
            document.activeElement !== megaToggle) setMega(false);
      }, 0);
    });
    document.addEventListener("click", function (e) {
      if (megaOpen() && !header.contains(e.target)) setMega(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && megaOpen()) {
        setMega(false);
        megaToggle.focus();
      }
    });
  }

  /* ---------------- Mobile panel ---------------- */
  var navToggle = document.querySelector(".nav-toggle");
  var mobilePanel = document.getElementById("mobile-panel");
  if (navToggle && mobilePanel) {
    navToggle.addEventListener("click", function () {
      var open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", open ? "false" : "true");
      mobilePanel.hidden = open;
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !mobilePanel.hidden) {
        mobilePanel.hidden = true;
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.focus();
      }
    });
  }

  /* ---------------- Header search row ---------------- */
  var searchToggle = document.querySelector(".search-toggle");
  var searchRow = document.getElementById("search-row");
  if (searchToggle && searchRow) {
    searchToggle.addEventListener("click", function () {
      var open = searchToggle.getAttribute("aria-expanded") === "true";
      searchToggle.setAttribute("aria-expanded", open ? "false" : "true");
      searchRow.hidden = open;
      if (!open) {
        var input = searchRow.querySelector('input[name="q"]');
        if (input) input.focus();
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !searchRow.hidden) {
        searchRow.hidden = true;
        searchToggle.setAttribute("aria-expanded", "false");
        searchToggle.focus();
      }
    });
  }

  /* ---------------- Live suggestions + clear button ---------------- */
  document.querySelectorAll(".search-form").forEach(function (form) {
    var input = form.querySelector('input[name="q"]');
    if (!input) return;
    var field = input.closest(".search-field");
    var box = field ? field.querySelector(".suggestions") : null;
    var clearBtn = field ? field.querySelector(".search-clear") : null;

    var renderSuggestions = function () {
      if (!box) return;
      var q = input.value.trim();
      if (clearBtn) clearBtn.classList.toggle("visible", q.length > 0);
      if (q.length < 2) { box.hidden = true; box.innerHTML = ""; return; }
      var results = searchItems(q).slice(0, 6);
      if (!results.length) { box.hidden = true; box.innerHTML = ""; return; }
      box.innerHTML = results.map(function (item) {
        return '<a class="suggestion" href="' + root + item.url + '">' +
          '<img src="' + root + item.image + '" alt="" loading="lazy">' +
          '<span><span class="sug-type">' + item.type + "</span>" +
          '<span class="sug-title">' + item.title + "</span></span></a>";
      }).join("");
      box.hidden = false;
    };
    input.addEventListener("input", renderSuggestions);
    input.addEventListener("focus", renderSuggestions);
    document.addEventListener("click", function (e) {
      if (box && !field.contains(e.target)) box.hidden = true;
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && box) box.hidden = true;
    });
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        input.value = "";
        renderSuggestions();
        input.focus();
      });
    }
  });

  /* ---------------- Search results page ---------------- */
  var resultsEl = document.getElementById("search-results");
  if (resultsEl) {
    var params = new URLSearchParams(window.location.search);
    var q = (params.get("q") || "").trim();
    var titleEl = document.getElementById("search-heading");
    var metaEl = document.getElementById("search-meta");
    var pageInput = document.querySelector(
      '.search-page-form input[name="q"]');
    if (pageInput && q) pageInput.value = q;

    if (!q) {
      if (titleEl) titleEl.textContent = "Browse DIY Ideas and Categories";
      if (metaEl) {
        metaEl.textContent = "Type a word above to search, or browse everything below — " +
          "our published articles and all eight categories.";
      }
      resultsEl.innerHTML = SEARCH_DATA.map(cardHTML).join("");
    } else {
      var results = searchItems(q);
      if (titleEl) titleEl.textContent = "Results for \u201C" + q + "\u201D";
      if (results.length) {
        if (metaEl) {
          metaEl.textContent = results.length +
            (results.length === 1 ? " result" : " results") +
            " matched your search across our articles and categories.";
        }
        resultsEl.innerHTML = results.map(cardHTML).join("");
      } else {
        if (metaEl) metaEl.textContent = "No results matched your search.";
        resultsEl.innerHTML =
          '<div class="no-results"><h2>Nothing matched \u201C' + q + "\u201D</h2>" +
          "<p>Try a simpler word — for example \u201Cbedroom\u201D, \u201Cwall\u201D, " +
          "\u201Cstorage\u201D or \u201Cchristmas\u201D — or browse a category instead:</p>" +
          "<ul>" + SEARCH_DATA.filter(function (i) { return i.type === "Category"; })
            .map(function (i) {
              return '<li><a href="' + root + i.url + '">' + i.title + "</a></li>";
            }).join("") + "</ul></div>";
      }
    }
  }
})();
