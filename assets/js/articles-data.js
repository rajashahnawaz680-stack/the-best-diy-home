/* The Best DIY Home — article data source (single source of truth).
   This static site has no CMS or database: THIS file is the article data
   source. The publishing workflow adds one entry here when an article is
   published, and the homepage Latest section, the articles archive page
   and site search all read from it automatically.
   Rules: only real, published articles; status must be "published" to
   appear anywhere public; newest first; never invent titles, dates,
   excerpts or read times — take them from the article itself. */
window.ARTICLES = [
  {
    title: "Small Bedroom Makeover Ideas for a Cozy, Clutter-Free Space",
    url: "posts/small-bedroom-makeover-ideas.html",
    category: "Bedroom Makeover",
    categoryUrl: "categories/bedroom-makeover.html",
    image: "assets/images/small-bedroom-hero.jpg",
    imageAlt: "Compact bedroom with a neatly made bed, dark blue wall panels, wall lights and a blue runner",
    excerpt: "Most small bedrooms feel tight for the same few reasons: the bed is in the wrong place, too much furniture is fighting for the same floor space, the light is flat, and everything without a home ends up on a chair or the floor.",
    datePublished: "2026-11-21",
    readTime: "About 20 min read (estimated)",
    status: "published",
    keywords: "small bedroom tiny bedroom compact bedroom cozy clutter-free clutter free storage layout colour color light wall decor under bed shelves hooks mirror lamp beginner makeover bigger"
  },
  {
    title: "Budget Bedroom Makeover Ideas That Make a Big Difference",
    url: "posts/budget-bedroom-makeover-ideas.html",
    category: "Bedroom Makeover",
    categoryUrl: "categories/bedroom-makeover.html",
    image: "assets/images/article-bedroom-1.jpg",
    imageAlt: "Bedroom with white quilted bedding, orange cushions and a bold floral painting above the bed",
    excerpt: "Beginner-friendly budget bedroom makeover ideas grouped by walls, bedding, lighting, storage and layout — small changes that make a room feel fresh and cosy.",
    datePublished: "2026-11-21",
    readTime: "About 13 min read (estimated)",
    status: "published",
    keywords: "bedroom budget makeover bedding storage lighting walls layout cozy small bedroom furniture cushions throw mirror lamp beginner weekend"
  }
];
