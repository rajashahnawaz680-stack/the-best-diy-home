/* The Best DIY Home — site behaviour (v6)
   Header mega menu (click-only), mobile navigation, header search row,
   live search suggestions, the search results page, the data-driven
   Latest / archive article grids and the newsletter form.
   Vanilla JS, no dependencies.
   Article data comes from assets/js/articles-data.js (window.ARTICLES) —
   the site's single article data source. Only articles with
   status "published" ever appear publicly. Category data below is the
   site's 8 real categories. Nothing here invents articles, dates,
   prices or subscribers. */
(function () {
  "use strict";

  /* Newsletter integration point: paste the form endpoint of the email
     provider here when one is connected (e.g. a Formspree / provider
     POST URL). While it is empty, the form honestly tells the visitor
     that sign-up is not connected yet and collects nothing. */
  var NEWSLETTER_ENDPOINT = "";

  /* Root prefix of the site, derived from this script's own URL so the
     same file works from /, /categories/ and /posts/. */
  var scriptEl = document.currentScript ||
    document.querySelector('script[src*="assets/js/main.js"]');
  var root = "";
  if (scriptEl) {
    var src = scriptEl.getAttribute("src") || "";
    root = src.replace(/assets\/js\/main\.js.*$/, "");
  }

  /* ---------------- Article data (single source of truth) ---------------- */
  var ALL_ARTICLES = (typeof window !== "undefined" && window.ARTICLES) || [];

  /* Published articles only, newest first. The sort is stable, so
     articles sharing a date keep the data file's newest-first order. */
  function publishedArticles(list) {
    return (list || [])
      .map(function (a, i) { return { a: a, i: i }; })
      .filter(function (x) { return x.a && x.a.status === "published"; })
      .sort(function (x, y) {
        var d = String(y.a.datePublished || "").localeCompare(
          String(x.a.datePublished || ""));
        return d !== 0 ? d : x.i - y.i;
      })
      .map(function (x) { return x.a; });
  }

  function articleCardHTML(a) {
    return '<article class="article-card">' +
      '<a class="ac-visual" href="' + root + a.url + '">' +
        '<img src="' + root + a.image + '" alt="' + (a.imageAlt || "") +
          '" loading="lazy">' +
        '<span class="pill-cat">' + a.category + "</span></a>" +
      '<div class="ac-body">' +
        (a.readTime ? '<p class="ac-meta">' + a.readTime + "</p>" : "") +
        '<h3><a href="' + root + a.url + '">' + a.title + "</a></h3>" +
        '<p class="ac-excerpt">' + a.excerpt + "</p>" +
        '<div class="ac-foot"><span class="ac-brand">The Best DIY Home</span>' +
        '<a href="' + root + a.url + '">Read Article &rarr;</a></div>' +
      "</div></article>";
  }

  /* ------------- Paginated article grids (Latest + archive) -------- */
  /* 15 articles per page = 3 per row x 5 rows. One shared renderer:
     the current page's cards go into the grid, a pagination bar
     (Prev / page numbers / Next) is inserted directly after the grid,
     and the count element under the bar reads
     "Showing A–B of Z articles (Page N of M)". */
  var ARTICLES_PER_PAGE = 15;
  var paginatedGrids = {};

  function setupPaginatedGrid(gridId, countId) {
    var grid = document.getElementById(gridId);
    if (!grid) return;
    var published = publishedArticles(ALL_ARTICLES);
    var total = published.length;
    var pages = Math.max(1, Math.ceil(total / ARTICLES_PER_PAGE));
    var countEl = document.getElementById(countId);
    var bar = document.createElement("nav");
    bar.className = "pagination";
    bar.setAttribute("aria-label", "Article pages");
    if (countEl && countEl.parentNode) {
      countEl.parentNode.insertBefore(bar, countEl);
    } else if (grid.parentNode) {
      grid.parentNode.insertBefore(bar, grid.nextSibling);
    }
    var current = 1;

    function render(page) {
      current = Math.min(Math.max(1, page), pages);
      var start = (current - 1) * ARTICLES_PER_PAGE;
      var slice = published.slice(start, start + ARTICLES_PER_PAGE);
      grid.innerHTML = slice.map(articleCardHTML).join("");
      var html = '<button type="button" class="page-btn" data-page="' +
        (current - 1) + '"' + (current === 1 ? " disabled" : "") +
        ">&lsaquo; Prev</button>";
      for (var p = 1; p <= pages; p++) {
        html += '<button type="button" class="page-btn' +
          (p === current ? " active" : "") + '" data-page="' + p + '"' +
          (p === current ? ' aria-current="page"' : "") + ">" + p + "</button>";
      }
      html += '<button type="button" class="page-btn" data-page="' +
        (current + 1) + '"' + (current === pages ? " disabled" : "") +
        ">Next &rsaquo;</button>";
      bar.innerHTML = html;
      if (countEl) {
        var from = total === 0 ? 0 : start + 1;
        var to = start + slice.length;
        countEl.textContent = "Showing " + from + "\u2013" + to + " of " +
          total + " articles (Page " + current + " of " + pages + ")";
      }
    }

    bar.addEventListener("click", function (e) {
      var btn = e.target;
      while (btn && btn !== bar &&
             !(btn.tagName === "BUTTON" && btn.hasAttribute("data-page"))) {
        btn = btn.parentNode;
      }
      if (!btn || btn === bar || btn.disabled) return;
      var target = parseInt(btn.getAttribute("data-page"), 10);
      if (!isNaN(target) && target !== current &&
          target >= 1 && target <= pages) {
        render(target);
        if (grid.scrollIntoView) {
          grid.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });

    render(1);
    paginatedGrids[gridId] = { render: render, bar: bar, grid: grid };
  }

  /* Homepage Latest and the All Articles archive share the renderer. */
  setupPaginatedGrid("latest-grid", "latest-count");
  setupPaginatedGrid("articles-grid", "articles-count");

  /* ---------------- Search data (articles derived + categories) ------- */
  var CATEGORY_DATA = [
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
      description: "Christmas and New Year decor — festive ideas for the holiday season.",
      category: "Seasonal Home Decor",
      url: "categories/seasonal-home-decor.html",
      image: "assets/images/cat-seasonal.jpg",
      imageAlt: "Christmas greenery, eucalyptus and red berries arranged on a light table",
      keywords: "seasonal home decor christmas new year holiday festive diy crafts wreath garland decorations celebration"
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

  var ARTICLE_SEARCH_DATA = publishedArticles(ALL_ARTICLES).map(function (a) {
    return {
      type: "Article",
      title: a.title,
      description: a.excerpt,
      category: a.category,
      url: a.url,
      image: a.image,
      imageAlt: a.imageAlt || "",
      keywords: a.keywords || ""
    };
  });

  var SEARCH_DATA = ARTICLE_SEARCH_DATA.concat(CATEGORY_DATA);

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

  /* ---------------- Mega menu (click-only, controlled) ----------------
     Closed by default. Opens ONLY when the Categories toggle itself is
     clicked; the toggle stops propagation so document handlers never
     fight it. Clicking any other nav item or anywhere outside the menu
     closes it; choosing a category navigates and closes it; Escape
     closes it. No hover or focus auto-open anywhere. */
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
    megaToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      setMega(!megaOpen());
    });
    megaMenu.addEventListener("click", function (e) {
      var link = e.target && e.target.closest ? e.target.closest("a") : null;
      if (link) setMega(false);
    });
    document.addEventListener("click", function (e) {
      if (!megaOpen()) return;
      if (megaMenu.contains(e.target) || megaToggle.contains(e.target)) return;
      setMega(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && megaOpen()) {
        setMega(false);
        megaToggle.focus();
      }
    });
  }

  /* ---------------- Seasonal Decor submenu (header nav) ----------------
     Click-only, same rules as the Categories menu: the chevron button
     toggles it, outside clicks and Escape close it. */
  var subToggle = document.querySelector(".sub-toggle");
  var subMenu = document.querySelector(".sub-menu");
  if (subToggle && subMenu) {
    var setSub = function (open) {
      subToggle.setAttribute("aria-expanded", open ? "true" : "false");
      subMenu.hidden = !open;
    };
    var subOpen = function () {
      return subToggle.getAttribute("aria-expanded") === "true";
    };
    subToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      setSub(!subOpen());
    });
    /* Clicking the "Seasonal Decor" link itself also opens the menu
       (owner's request) instead of navigating away. */
    var subLink = subToggle.parentNode ? subToggle.parentNode.querySelector("a") : null;
    if (subLink) {
      subLink.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        setSub(!subOpen());
      });
    }
    subMenu.addEventListener("click", function (e) {
      var link = e.target && e.target.closest ? e.target.closest("a") : null;
      if (link) setSub(false);
    });
    document.addEventListener("click", function (e) {
      if (!subOpen()) return;
      if (subMenu.contains(e.target) || subToggle.contains(e.target)) return;
      setSub(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && subOpen()) {
        setSub(false);
        subToggle.focus();
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

  /* ---------------- Newsletter form ----------------
     Honest by design: success is shown ONLY after the connected email
     provider's endpoint confirms the subscription. With no endpoint
     configured, the visitor is told plainly that sign-up is not
     connected yet and that no email was collected or stored. */
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email || "").trim());
  }

  var newsForm = document.getElementById("newsletter-form");
  if (newsForm) {
    var newsMsg = document.getElementById("newsletter-msg");
    var setNewsMsg = function (kind, text) {
      if (!newsMsg) return;
      newsMsg.className = "news-msg " + kind;
      newsMsg.textContent = text;
    };
    newsForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = newsForm.querySelector('input[name="email"]');
      var email = input ? input.value.trim() : "";
      if (!validateEmail(email)) {
        setNewsMsg("error",
          "Please enter a valid email address — for example you@example.com.");
        if (input) input.focus();
        return;
      }
      if (!NEWSLETTER_ENDPOINT) {
        setNewsMsg("notice",
          "Newsletter signup is not connected yet. Please check back soon — no email was collected.");
        return;
      }
      setNewsMsg("notice", "Subscribing…");
      fetch(NEWSLETTER_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email: email })
      }).then(function (res) {
        if (res && res.ok) {
          setNewsMsg("success",
            "Thank you — your subscription is confirmed. Fresh DIY ideas are on their way to your inbox.");
          newsForm.reset();
        } else {
          setNewsMsg("error",
            "Something went wrong and you were not subscribed. Please try again later.");
        }
      }).catch(function () {
        setNewsMsg("error",
          "Something went wrong and you were not subscribed. Please try again later.");
      });
    });
  }

  /* Small public namespace — also used by the local test harness. */
  window.TBDH = {
    ARTICLES: ALL_ARTICLES,
    publishedArticles: publishedArticles,
    articleCardHTML: articleCardHTML,
    ARTICLES_PER_PAGE: ARTICLES_PER_PAGE,
    paginatedGrids: paginatedGrids,
    setupPaginatedGrid: setupPaginatedGrid,
    searchItems: searchItems,
    validateEmail: validateEmail,
    NEWSLETTER_ENDPOINT: NEWSLETTER_ENDPOINT
  };
})();
