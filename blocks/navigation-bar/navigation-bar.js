// navigation-bar (hard-coded) — simplest possible version
// Works without models/definitions. Logo left, two rows on the right.

const NAV_CONFIG = {
  brand: {
    logo: "https://brandmanual.cp.com/image/10624533.1678179780000/Artboard_1.svg", // <-- change to your logo URL
    alt: "Chicago Pneumatic",
    href: "/",
  },
  topLinks: [
    { label: "Back to cp.com", href: "https://cp.com" },
    { label: "Find a dealer", href: "/dealer" },
    { label: "Markets", href: "/markets" },
  ],
  mainMenu: [
    { label: "Products", href: "/products" },
    { label: "Parts and Lubricants", href: "/parts" },
    { label: "Expert Corner", href: "/experts" },
    { label: "This is Chicago Pneumatic", href: "/about" },
  ],
  sticky: false,
};

// safe UID without crypto
function makeUID(prefix = "eds-nav") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function styles(uid, sticky) {
  const s = `[data-uid="${uid}"]`;
  return `
${s}{ background:#000; color:#fff; ${sticky ? "position:sticky;top:0;z-index:100;" : ""} }
${s} .wrap{ width:100%; margin:0; border-bottom:4px solid #fff; }
${s} .bar{ display:grid; grid-template-columns:auto 1fr; gap:1rem; padding:.5rem 4rem 0rem .5rem; align-items:center; }
${s} .brand{ text-decoration:none; color:inherit; display:flex; align-items:center; gap:.5rem; }
${s} .brand img{ width:auto; display:block; }

/* right side: two rows, right aligned */
${s} .right{ display:grid; grid-template-rows:auto auto; justify-items:end; align-items:center; gap:.25rem; width:100%; }
${s} .row.top{ display:flex; gap:2rem; align-items:center; font-size:.78rem; font-family: Arial, sans-serif; padding-top: .4rem; }
${s} .row.top a{ color:#fff; text-decoration:none; opacity:.9; font-weight:600; }
${s} .row.top a:hover{ opacity:1; }

${s} .row.main nav > ul{ list-style:none; margin:0; padding:0; display:flex; gap:2rem; }
${s} .row.main nav a{ color:#fff; text-decoration:none; font-weight:700; letter-spacing:.2px; padding:.6rem .25rem; position:relative; display:inline-block; }
${s} .row.main nav a[aria-current="page"]::after{ content:""; position:absolute; left:0; right:0; bottom:-.45rem; height:3px; background:#d4001a; border-radius:2px; }

/* mobile */
${s} .toggle{ display:none; }
@media (max-width: 900px){
  ${s} .bar{ grid-template-columns:auto 1fr auto; }
  ${s} .toggle{ display:inline-flex; align-items:center; justify-content:center; width:40px; height:40px; background:transparent; border:1px solid #333; border-radius:.5rem; }
  ${s} .right{ grid-template-rows:auto; }
  ${s} .row.top{ display:none; }
  ${s} .row.main nav > ul{ display:none; position:absolute; left:0; right:0; top:100%; background:#000; padding:.5rem 1rem; flex-direction:column; gap:.25rem; border-top:1px solid #222; }
  ${s}.open .row.main nav > ul{ display:flex; }
}
`;
}

function buildMenu(items) {
  const ul = document.createElement("ul");
  items.forEach((item) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.textContent = item.label || "";
    a.href = item.href || "#";
    li.append(a);
    ul.append(li);
  });
  return ul;
}

function markActive(scope) {
  const here = window.location.pathname.replace(/index\.html$/, "");
  scope.querySelectorAll("a[href]").forEach((a) => {
    const href = (a.getAttribute("href") || "").replace(/index\.html$/, "");
    if (href === here) a.setAttribute("aria-current", "page");
    try {
      const u = new URL(a.href);
      if (u.origin !== window.location.origin) a.target = "_blank";
    } catch {}
  });
}

export default function decorate(block) {
  try {
    const uid = makeUID();
    const wrap = document.createElement("div");
    wrap.dataset.uid = uid;
    wrap.className = "navigation-bar";

    const container = document.createElement("div");
    container.className = "wrap";

    const bar = document.createElement("div");
    bar.className = "bar";

    // brand
    const brand = document.createElement("a");
    brand.className = "brand brand-cp";
    brand.href = NAV_CONFIG.brand.href || "/";
    if (NAV_CONFIG.brand.logo) {
      const img = document.createElement("img");
      img.src = NAV_CONFIG.brand.logo;
      img.alt = NAV_CONFIG.brand.alt || "";
      brand.append(img);
    } else if (NAV_CONFIG.brand.alt) {
      brand.textContent = NAV_CONFIG.brand.alt;
    }

    // mobile toggle
    const toggle = document.createElement("button");
    toggle.className = "toggle";
    toggle.setAttribute("aria-label", "Menu");
    toggle.innerHTML = "<span></span>";
    toggle.addEventListener("click", () => wrap.classList.toggle("open"));

    // right side (two rows)
    const right = document.createElement("div");
    right.className = "right";

    const topRow = document.createElement("div");
    topRow.className = "row top";
    (NAV_CONFIG.topLinks || []).forEach((lnk) => {
      const a = document.createElement("a");
      a.textContent = lnk.label || "";
      a.href = lnk.href || "#";
      topRow.append(a);
    });

    const mainRow = document.createElement("div");
    mainRow.className = "row main";
    const nav = document.createElement("nav");
    nav.append(buildMenu(NAV_CONFIG.mainMenu || []));
    mainRow.append(nav);

    right.append(topRow, mainRow);

    // assemble
    bar.append(brand, right, toggle);
    container.append(bar);
    wrap.append(container);

    // styles
    const style = document.createElement("style");
    style.textContent = styles(uid, !!NAV_CONFIG.sticky);

    // mount
    block.innerHTML = "";
    block.append(style, wrap);

    // behavior
    markActive(wrap);
  } catch (e) {
    // If anything goes wrong, show a small error so you see it in UE
    console.error("[navigation-bar] failed to render", e);
    block.innerHTML = `<div style="padding:8px;background:#fee;color:#900;border:1px solid #f99">
      navigation-bar: render error – check console
    </div>`;
  }
}
