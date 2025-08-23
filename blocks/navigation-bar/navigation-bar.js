// Simple Navigation Bar (no UE model, no fragments)
// Logo left; two rows on the right: top utility links + main menu.
// Full width, black theme, red active underline. Mobile toggle included.

const NAV_CONFIG = {
  brand: {
    logo: "/icons/cp_logo.png" // ← change to your logo URL
    alt: "Chicago Pneumatic",
    href: "/",
  },
  topLinks: [
    { label: "🔍", href: "/search" },
    { label: "Back to cp.com", href: "https://cp.com" },
    { label: "Find a dealer", href: "/dealer" },
    { label: "Markets", href: "/markets" }, // (use children in main menu if you want dropdowns)
  ],
  mainMenu: [
    { label: "Products", href: "/products" },
    { label: "Parts and Lubricants", href: "/parts" },
    { label: "Expert Corner", href: "/experts" },
    { label: "This is Chicago Pneumatic", href: "/about" },
    // Example with dropdown:
    // {
    //   label: "Markets",
    //   href: "/markets",
    //   children: [
    //     { label: "Automotive", href: "/markets/auto" },
    //     { label: "Manufacturing", href: "/markets/mfg" },
    //   ],
    // },
  ],
  sticky: false, // set true if you want it fixed to top
};

const makeUID = (p = "eds-nav") => `${p}-${crypto.randomUUID()}`;

function css(uid, sticky) {
  const s = `[data-uid="${uid}"]`;
  return `
${s}{ background:#000; color:#fff; ${sticky ? "position:sticky;top:0;z-index:100;" : ""} }
${s} .wrap{ width:100%; margin:0; border-bottom:2px solid #fff; }
${s} .bar{ display:grid; grid-template-columns:auto 1fr; gap:1rem; padding:.5rem 1rem; align-items:center; }
${s} .brand{ text-decoration:none; color:inherit; display:flex; align-items:center; gap:.5rem; }
${s} .brand img{ height:32px; width:auto; display:block; }

/* Right side: two rows aligned to the right */
${s} .right{ display:grid; grid-template-rows:auto auto; justify-items:end; align-items:center; gap:.25rem; width:100%; }
${s} .row.top{ display:flex; gap:1.25rem; align-items:center; font-size:.9rem; }
${s} .row.top a{ color:#fff; text-decoration:none; opacity:.9; font-weight:600; }
${s} .row.top a:hover{ opacity:1; }

${s} .row.main nav > ul{ list-style:none; margin:0; padding:0; display:flex; gap:2rem; }
${s} .row.main nav a{ color:#fff; text-decoration:none; font-weight:700; letter-spacing:.2px; padding:.6rem .25rem; position:relative; display:inline-block; }
${s} .row.main nav a[aria-current="page"]::after{ content:""; position:absolute; left:0; right:0; bottom:-.45rem; height:3px; background:#d4001a; border-radius:2px; }

/* Simple hover dropdown for any item with children */
${s} li.has-sub{ position:relative; }
${s} li.has-sub > ul{ position:absolute; top:100%; left:0; min-width:220px; background:#111; border:1px solid #2a2a2a; display:none; padding:.5rem; border-radius:.5rem; }
${s} li.has-sub:hover > ul, ${s} li.has-sub:focus-within > ul{ display:block; }
${s} li.has-sub > a::after{ content:"▾"; margin-left:.35rem; font-size:.8em; }

/* Mobile */
${s} .toggle{ display:none; }
@media (max-width: 900px){
  ${s} .bar{ grid-template-columns:auto 1fr auto; }
  ${s} .toggle{ display:inline-flex; align-items:center; justify-content:center; width:40px; height:40px; background:transparent; border:1px solid #333; border-radius:.5rem; }
  ${s} .right{ grid-template-rows:auto; }
  ${s} .row.top{ display:none; } /* keep mobile simple */
  ${s} .row.main nav > ul{ display:none; position:absolute; left:0; right:0; top:100%; background:#000; padding:.5rem 1rem; flex-direction:column; gap:.25rem; border-top:1px solid #222; }
  ${s}.open .row.main nav > ul{ display:flex; }
}
`;
}

function buildMenu(items = []) {
  const ul = document.createElement("ul");
  items.forEach((item) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.textContent = item.label || "";
    a.href = item.href || "#";
    li.append(a);

    if (Array.isArray(item.children) && item.children.length) {
      const sub = document.createElement("ul");
      item.children.forEach((c) => {
        const cli = document.createElement("li");
        const ca = document.createElement("a");
        ca.textContent = c.label || "";
        ca.href = c.href || "#";
        cli.append(ca);
        sub.append(cli);
      });
      li.classList.add("has-sub");
      li.append(sub);
    }
    ul.append(li);
  });
  return ul;
}

function applyActive(scope) {
  const here = window.location.pathname.replace(/index\.html$/, "");
  scope.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute("href")?.replace(/index\.html$/, "") || "";
    if (href === here) a.setAttribute("aria-current", "page");
    try { const u = new URL(a.href); if (u.origin !== window.location.origin) a.target = "_blank"; } catch {}
  });
}

export default function decorate(block) {
  const uid = makeUID();
  const wrap = document.createElement("div");
  wrap.dataset.uid = uid;
  wrap.className = "navigation-bar";

  const container = document.createElement("div");
  container.className = "wrap";

  const bar = document.createElement("div");
  bar.className = "bar";

  // Brand (left)
  const brand = document.createElement("a");
  brand.className = "brand";
  brand.href = NAV_CONFIG.brand.href || "/";
  if (NAV_CONFIG.brand.logo) {
    const img = document.createElement("img");
    img.src = NAV_CONFIG.brand.logo;
    img.alt = NAV_CONFIG.brand.alt || "";
    brand.append(img);
  } else if (NAV_CONFIG.brand.alt) {
    brand.textContent = NAV_CONFIG.brand.alt;
  }

  // Mobile toggle
  const toggle = document.createElement("button");
  toggle.className = "toggle";
  toggle.setAttribute("aria-label", "Menu");
  toggle.innerHTML = "<span></span>";
  toggle.addEventListener("click", () => wrap.classList.toggle("open"));

  // Right (two rows)
  const right = document.createElement("div");
  right.className = "right";

  // Row 1: top links
  const topRow = document.createElement("div");
  topRow.className = "row top";
  (NAV_CONFIG.topLinks || []).forEach((lnk) => {
    const a = document.createElement("a");
    a.textContent = lnk.label || "";
    a.href = lnk.href || "#";
    topRow.append(a);
  });

  // Row 2: main menu
  const mainRow = document.createElement("div");
  mainRow.className = "row main";
  const nav = document.createElement("nav");
  nav.append(buildMenu(NAV_CONFIG.mainMenu || []));
  mainRow.append(nav);

  right.append(topRow, mainRow);

  // Assemble
  bar.append(brand, right, toggle);
  container.append(bar);
  wrap.append(container);

  // Styles
  const style = document.createElement("style");
  style.textContent = css(uid, !!NAV_CONFIG.sticky);

  // Mount
  block.innerHTML = "";
  block.append(style, wrap);

  // Behavior
  applyActive(wrap);
}
