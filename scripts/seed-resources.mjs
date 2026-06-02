// seed-resources.mjs — inserts the 28 curated design resources + retries existing ones
// Run: node --env-file=.env.local scripts/seed-resources.mjs

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function domain(url) {
  return new URL(url).hostname.replace(/^www\./, "");
}

const RESOURCES = [
  {
    title: "shadcn/ui",
    url: "https://ui.shadcn.com",
    source: "Library",
    categories: ["Components"],
    tags: ["React", "Tailwind", "Radix", "Copy-paste"],
    ai_summary:
      "Copy-paste React components built on Radix primitives and Tailwind. You own the code — no dependency to fight — which is why half the internet's apps now look like this.",
  },
  {
    title: "Mobbin",
    url: "https://mobbin.com",
    source: "Gallery",
    categories: ["Inspiration"],
    tags: ["Mobile", "Flows", "Patterns", "Reference"],
    ai_summary:
      "A searchable library of real app screenshots and full user flows from thousands of products. The fastest way to see how the best teams actually solve a UI problem.",
  },
  {
    title: "Motion (Framer Motion)",
    url: "https://motion.dev",
    source: "Library",
    categories: ["Animation", "Components"],
    tags: ["React", "Animation", "Gestures", "Spring"],
    ai_summary:
      "The production-grade animation library for React and vanilla JS. Springs, gestures, layout animations, and scroll effects with an API that stays readable as motion gets complex.",
  },
  {
    title: "v0",
    url: "https://v0.dev",
    source: "AI",
    categories: ["Tools", "Components"],
    tags: ["Generate", "React", "Tailwind", "Prototyping"],
    ai_summary:
      "Vercel's prompt-to-UI tool. Describe a screen and get React + Tailwind + shadcn/ui code you can iterate on, copy out, or ship — the canonical vibe-coding starting point.",
  },
  {
    title: "Realtime Colors",
    url: "https://www.realtimecolors.com",
    source: "Tool",
    categories: ["Color", "Typography"],
    tags: ["Palette", "Preview", "Contrast", "Export"],
    ai_summary:
      "Test color palettes and typography on a real landing page in real time, instead of staring at disconnected swatches. Export to CSS, Tailwind, or a shareable link.",
  },
  {
    title: "Lucide",
    url: "https://lucide.dev",
    source: "Icons",
    categories: ["Icons"],
    tags: ["SVG", "Open-source", "React", "Consistent"],
    ai_summary:
      "A clean, consistent open-source icon set — the community fork of Feather — with 1,500+ icons and first-class packages for React, Vue, Svelte, and plain SVG.",
  },
  {
    title: "Aceternity UI",
    url: "https://ui.aceternity.com",
    source: "Library",
    categories: ["Components", "Animation"],
    tags: ["Tailwind", "Framer Motion", "Landing", "Effects"],
    ai_summary:
      "Bold, animated Tailwind + Framer Motion components — spotlight cards, aurora backgrounds, 3D effects. Drop-in flourishes that make a landing page feel expensive.",
  },
  {
    title: "Godly",
    url: "https://godly.website",
    source: "Gallery",
    categories: ["Inspiration"],
    tags: ["Web Design", "Landing", "Trends", "Curated"],
    ai_summary:
      "Astronomically good web design inspiration, tagged by style, color, and section. A tighter, more art-directed feed than the firehose galleries.",
  },
  {
    title: "Lovable",
    url: "https://lovable.dev",
    source: "AI",
    categories: ["Tools"],
    tags: ["Full-stack", "Generate", "Supabase", "No-code"],
    ai_summary:
      "Prompt your way to a full-stack app — UI, database, and auth — entirely in the browser. Strong defaults make the generated front-end look designed, not just functional.",
  },
  {
    title: "Fontshare",
    url: "https://www.fontshare.com",
    source: "Fonts",
    categories: ["Typography"],
    tags: ["Free", "Fonts", "Display", "Self-host"],
    ai_summary:
      "A free, quality-first type service from the Indian Type Foundry. Distinctive display and text faces — Satoshi, Clash, General Sans — that you won't see on every other site.",
  },
  {
    title: "Radix UI",
    url: "https://www.radix-ui.com",
    source: "Library",
    categories: ["Components"],
    tags: ["Headless", "Accessible", "Primitives", "React"],
    ai_summary:
      "Unstyled, fully accessible component primitives — dialogs, dropdowns, popovers — that handle focus, keyboard, and ARIA so you can style with total freedom. The base shadcn builds on.",
  },
  {
    title: "Spline",
    url: "https://spline.design",
    source: "Tool",
    categories: ["Animation", "Assets"],
    tags: ["3D", "Interactive", "Hero", "Embed"],
    ai_summary:
      "Design and animate 3D scenes in the browser and embed them live on the web. The go-to for that interactive 3D hero object without opening Blender.",
  },
  {
    title: "Land-book",
    url: "https://land-book.com",
    source: "Gallery",
    categories: ["Inspiration"],
    tags: ["Landing", "Gallery", "Marketing", "Reference"],
    ai_summary:
      "One of the largest curated galleries of landing pages, filterable by style, industry, and color. Great for surveying how a whole category presents itself.",
  },
  {
    title: "GSAP",
    url: "https://gsap.com",
    source: "Library",
    categories: ["Animation"],
    tags: ["JavaScript", "Scroll", "Timeline", "WebGL"],
    ai_summary:
      "The professional-grade JavaScript animation platform behind most award-winning sites. ScrollTrigger, timelines, and morphing — framework-agnostic and now fully free.",
  },
  {
    title: "Magic UI",
    url: "https://magicui.design",
    source: "Library",
    categories: ["Components", "Animation"],
    tags: ["shadcn", "Animated", "Tailwind", "Effects"],
    ai_summary:
      "150+ animated components and effects designed to pair with shadcn/ui — marquees, animated beams, shimmer buttons. Copy-paste motion without wiring it up yourself.",
  },
  {
    title: "Krea",
    url: "https://www.krea.ai",
    source: "AI",
    categories: ["Tools", "Assets"],
    tags: ["Image", "Realtime", "Upscale", "Moodboard"],
    ai_summary:
      "Real-time AI image and design generation — sketch and watch it render live. Strong for mood boards, hero imagery, and upscaling without the prompt-roulette.",
  },
  {
    title: "Coolors",
    url: "https://coolors.co",
    source: "Tool",
    categories: ["Color"],
    tags: ["Palette", "Generator", "Export", "Contrast"],
    ai_summary:
      "The fast palette generator — hit spacebar to cycle, lock the swatches you like, and export anywhere. A staple of the first ten minutes of any project.",
  },
  {
    title: "Phosphor Icons",
    url: "https://phosphoricons.com",
    source: "Icons",
    categories: ["Icons"],
    tags: ["SVG", "Weights", "Flexible", "Open-source"],
    ai_summary:
      "A flexible icon family with six weights from thin to fill, so your icons can match any type weight. 9,000+ glyphs with packages for every major framework.",
  },
  {
    title: "Rive",
    url: "https://rive.app",
    source: "Tool",
    categories: ["Animation"],
    tags: ["Interactive", "State Machine", "Runtime", "Lottie"],
    ai_summary:
      "Build interactive, state-driven animations that respond to user input and ship as tiny runtimes across web and apps. Far lighter and smarter than exporting Lottie loops.",
  },
  {
    title: "Typewolf",
    url: "https://www.typewolf.com",
    source: "Reference",
    categories: ["Typography", "Inspiration"],
    tags: ["Pairings", "Trends", "Type", "Examples"],
    ai_summary:
      "What's trending in type on the web, with real-world examples and specific font-pairing recommendations. The reference for choosing typefaces with taste.",
  },
  {
    title: "Bolt",
    url: "https://bolt.new",
    source: "AI",
    categories: ["Tools"],
    tags: ["Full-stack", "WebContainer", "Deploy", "Generate"],
    ai_summary:
      "Prompt to a running full-stack web app in an in-browser dev environment — install packages, edit files, deploy. StackBlitz's take on agentic vibe coding.",
  },
  {
    title: "SVGL",
    url: "https://svgl.app",
    source: "Assets",
    categories: ["Icons", "Assets"],
    tags: ["Logos", "SVG", "Brands", "Wordmarks"],
    ai_summary:
      "A clean, searchable library of brand and product logos as optimized SVGs, with light/dark variants and wordmarks. Stop digging through press kits for a logo.",
  },
  {
    title: "Happy Hues",
    url: "https://www.happyhues.co",
    source: "Reference",
    categories: ["Color"],
    tags: ["Palette", "Applied", "Roles", "Examples"],
    ai_summary:
      "Curated color palettes shown applied to a full sample site, with each color labeled by role — background, text, accent. Solves the 'now where does this color go?' problem.",
  },
  {
    title: "Awwwards",
    url: "https://www.awwwards.com",
    source: "Gallery",
    categories: ["Inspiration", "Animation"],
    tags: ["Awards", "Motion", "Showcase", "Web Design"],
    ai_summary:
      "Awards and a gallery for the most ambitious web design and interaction work. Best mined for motion and layout ideas you'll adapt rather than copy outright.",
  },
  {
    title: "unDraw",
    url: "https://undraw.co",
    source: "Assets",
    categories: ["Assets"],
    tags: ["Illustrations", "Recolor", "Free", "Spot Art"],
    ai_summary:
      "Open-source illustrations you can recolor to your brand on the fly and use without attribution. The default when you need friendly spot art fast.",
  },
  {
    title: "Google Fonts",
    url: "https://fonts.google.com",
    source: "Fonts",
    categories: ["Typography"],
    tags: ["Free", "Variable", "Self-host", "Preview"],
    ai_summary:
      "The free library of open-source typefaces you can preview, pair, and self-host. Filter by classification and variable-font axes to narrow 1,800+ families fast.",
  },
  {
    title: "Haikei",
    url: "https://haikei.app",
    source: "Generator",
    categories: ["Assets", "Color"],
    tags: ["SVG", "Backgrounds", "Blobs", "Generator"],
    ai_summary:
      "Generate unique SVG backgrounds — blobs, waves, layered peaks, stacked grids — and export them ready to drop in. A quick way to add depth to a flat section.",
  },
  {
    title: "Unsplash",
    url: "https://unsplash.com",
    source: "Photos",
    categories: ["Assets"],
    tags: ["Photos", "Free", "Hi-res", "Commercial"],
    ai_summary:
      "The huge library of free high-resolution photography, usable commercially without attribution. Still the first stop for hero and background imagery on a budget.",
  },
];

async function main() {
  // 1. Check which URLs already exist
  const { data: existing } = await supabase
    .from("resources")
    .select("id, url, title");

  const existingUrls = new Set((existing || []).map((r) => r.url));
  console.log(`Found ${existing?.length ?? 0} existing resources`);

  // 2. Insert new resources
  const toInsert = RESOURCES.filter((r) => !existingUrls.has(r.url));
  console.log(`Inserting ${toInsert.length} new resources…`);

  if (toInsert.length > 0) {
    const rows = toInsert.map((r) => ({
      url: r.url,
      title: r.title,
      domain: domain(r.url),
      status: "ready",
      source: r.source,
      categories: r.categories,
      tags: r.tags,
      ai_summary: r.ai_summary,
      description: null,
      favicon_url: null,
      og_image_url: null,
      screenshot_url: null,
      submitted_by: null,
    }));

    const { error } = await supabase.from("resources").insert(rows);
    if (error) {
      console.error("Insert error:", error.message);
      process.exit(1);
    }
    console.log(`✓ Inserted ${toInsert.length} resources`);
  }

  // 3. Update existing resources that have old format (source = 'web' or null)
  //    by matching on URL and applying the correct title/kind/categories/tags
  const toUpdate = RESOURCES.filter((r) => existingUrls.has(r.url));
  console.log(`Updating ${toUpdate.length} existing resources to new format…`);

  for (const r of toUpdate) {
    const existing_row = existing?.find((e) => e.url === r.url);
    if (!existing_row) continue;

    const { error } = await supabase
      .from("resources")
      .update({
        title: r.title,
        domain: domain(r.url),
        status: "ready",
        source: r.source,
        categories: r.categories,
        tags: r.tags,
        ai_summary: r.ai_summary,
      })
      .eq("id", existing_row.id);

    if (error) {
      console.error(`Update error for ${r.title}:`, error.message);
    } else {
      console.log(`  ✓ Updated: ${r.title}`);
    }
  }

  console.log("\nDone.");
}

main().catch(console.error);
