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
  sticky: true,
};

// header-cp.js — sticky custom header with "hide top row on scroll"
// Works as a standalone block decorator.
// Expected inner markup (already authored inside your block):
//   .row.top   -> the slim top bar (will hide when scrolled)
//   .row.main  -> main row with your nav/links/etc.
//   .brand     -> optional logo/link

const HDR_UID = () =>
  `cp-header-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

function headerCSS(uid, mode) {
  const s = `[data-uid="${uid}"]`;
  const fixed = mode === 'fixed';
  return `
/* Header shell */
${s}{
  ${fixed
    ? `position:fixed; top:0; left:0; right:0; width:100vw; z-index:2147483000;`
    : `position:sticky; top:0; z-index:100;`}
  background:#000; color:#fff;
}

/* Shrink state (after small scroll) */
${s}.condensed .row.top{ display:none; }

/* Layout (adjust to your taste) */
${s} .wrap{ width:100%; border-bottom:4px solid #fff; }
${s} .bar{ display:grid; grid-template-columns:auto 1fr; gap:1rem; padding:.5rem 4rem 0 .5rem; align-items:center; }

${s} .brand img{ display:block; height:32px; width:auto; }

/* Top row links */
${s} .row.top{ display:flex; gap:2rem; font-size:.78rem; padding-top:.4rem; }
${s} .row.top a{ color:#fff; text-decoration:none; opacity:.9; font-weight:600; }
${s} .row.top a:hover{ opacity:1; }

/* Optional underline for current link if you have a nav in .row.main */
${s} .row.main nav ul{ display:flex; gap:2rem; margin:0; padding:0; list-style:none; }
${s} .row.main nav a{ color:#fff; text-decoration:none; font-weight:700; padding:.6rem .25rem; position:relative; }
${s} .row.main nav a[aria-current="page"]::after{
  content:""; position:absolute; left:0; right:0; bottom:-.45rem; height:3px; background:#d4001a; border-radius:2px;
}

/* Spacer (only used in fixed mode, inserted right after the header) */
#${uid}-spacer{ height:0; }

/* Mobile tweaks */
@media (max-width:900px){
  ${s} .bar{ grid-template-columns:auto 1fr; padding:.25rem 1rem 0 .5rem; }
  ${s} .row.top{ display:none; } /* always hidden on small screens */
}
`;
}

function markCurrentLinks(scope) {
  const here = window.location.pathname.replace(/index\.html$/, '');
  scope.querySelectorAll('a[href]').forEach((a) => {
    const href = (a.getAttribute('href') || '').replace(/index\.html$/, '');
    if (href === here) a.setAttribute('aria-current', 'page');
  });
}

export default function decorate(block) {
  const uid = HDR_UID();

  // Detect author so we don't hoist and break the UE overlay
  const isAuthor =
    /author-/i.test(location.hostname) ||
    document.querySelector('[data-aue-resource]');

  const mode = isAuthor ? 'sticky' : 'fixed';

  // Build shell and move authored content into it
  const shell = document.createElement('header');
  shell.dataset.uid = uid;
  shell.className = 'header-cp';

  const wrap = document.createElement('div');
  wrap.className = 'wrap';

  const bar = document.createElement('div');
  bar.className = 'bar';

  // Keep your authored children; just relocate them into .bar
  while (block.firstChild) bar.append(block.firstChild);
  wrap.append(bar);
  shell.append(wrap);

  // CSS
  const style = document.createElement('style');
  style.textContent = headerCSS(uid, mode);
  document.head.appendChild(style);

  if (mode === 'fixed') {
    // Hoist to <body> to avoid sticky/overflow/transform issues
    const spacer = document.createElement('div');
    spacer.id = `${uid}-spacer`;

    document.body.prepend(shell);
    shell.after(spacer);

    // Keep spacer in sync with header height (prevents layout jump)
    const setSpacer = () => { spacer.style.height = `${shell.offsetHeight}px`; };
    setSpacer();
    new ResizeObserver(setSpacer).observe(shell);
  } else {
    // Author: keep in place
    block.innerHTML = '';
    block.append(shell);
  }

  // Hide the top row after slight scroll
  const onScroll = () => {
    if ((window.scrollY || 0) > 10) shell.classList.add('condensed');
    else shell.classList.remove('condensed');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Optional: underline current nav link in .row.main
  markCurrentLinks(shell);
}
