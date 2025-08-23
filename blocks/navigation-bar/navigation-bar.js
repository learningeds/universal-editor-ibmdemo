// Navigation Bar (Header) — EDS + Universal Editor
// - Logo left; two rows on the right: Top links + Main menu
// - 100% width, UID-scoped styles, optional sticky
// - Reads model from block.blockModel or <script type="application/json"> fallback
// - If fragment_path is set, loads model from that page's .json

const makeUID = (p = 'eds-nav') => `${p}-${crypto.randomUUID()}`;

// Prefer UE's injected model, fallback to embedded <script> JSON
function getLocalModel(block) {
  if (block.blockModel) return block.blockModel;
  const script = block.querySelector('script[type="application/json"]');
  if (script) {
    try { return JSON.parse(script.textContent); } catch (e) { console.warn('Invalid block JSON', e); }
  }
  return {};
}

// Fetch model from a fragment page (e.g., /header.json) and return the first matching block model
async function getFragmentModel(path, blockId = 'navigation-bar') {
  try {
    const url = `${path.replace(/\.html$/, '')}.json`;
    const res = await fetch(url, { credentials: 'same-origin' });
    if (!res.ok) return null;
    const page = await res.json();

    // Walk blocks/sections and find the first matching block id
    const q = [];
    if (Array.isArray(page.blocks)) q.push(...page.blocks);
    if (Array.isArray(page.sections)) q.push(...page.sections);

    while (q.length) {
      const node = q.shift();
      if (node?.id === blockId && node.blockModel) return node.blockModel;
      if (Array.isArray(node?.blocks)) q.push(...node.blocks);
      if (Array.isArray(node?.sections)) q.push(...node.sections);
    }
  } catch (e) {
    console.warn('Fragment fetch failed:', e);
  }
  return null;
}

function styles(uid, sticky) {
  const s = `[data-uid="${uid}"]`;
  return `
${s}{ background:#000; color:#fff; ${sticky ? 'position:sticky;top:0;z-index:100;' : ''} }
${s} .wrap{ width:100%; margin:0; border-bottom:2px solid #fff; }
${s} .bar{ display:grid; grid-template-columns:auto 1fr; gap:1rem; padding:.5rem 1rem; align-items:center; }
${s} .brand{ text-decoration:none; color:inherit; display:flex; align-items:center; gap:.5rem; }
${s} .brand img{ height:32px; width:auto; display:block; }

/* Right side: two rows stacked and right-aligned */
${s} .right{ display:grid; grid-template-rows:auto auto; justify-items:end; align-items:center; gap:.25rem; width:100%; }
${s} .row.top{ display:flex; gap:1.25rem; align-items:center; font-size:.9rem; }
${s} .row.top a{ color:#fff; text-decoration:none; opacity:.9; font-weight:600; }
${s} .row.top a:hover{ opacity:1; }

${s} .row.main nav > ul{ list-style:none; margin:0; padding:0; display:flex; gap:2rem; }
${s} .row.main nav a{ color:#fff; text-decoration:none; font-weight:700; letter-spacing:.2px; padding:.6rem .25rem; position:relative; display:inline-block; }
${s} .row.main nav a[aria-current="page"]::after{ content:""; position:absolute; left:0; right:0; bottom:-.45rem; height:3px; background:#d4001a; border-radius:2px; }

/* Simple hover dropdown if children exist */
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
  const ul = document.createElement('ul');
  items.forEach((item) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.textContent = item.label || '';
    a.href = item.href || '#';
    li.append(a);

    if (Array.isArray(item.children) && item.children.length) {
      const sub = document.createElement('ul');
      item.children.forEach((c) => {
        const cli = document.createElement('li');
        const ca = document.createElement('a');
        ca.textContent = c.label || '';
        ca.href = c.href || '#';
        cli.append(ca);
        sub.append(cli);
      });
      li.classList.add('has-sub');
      li.append(sub);
    }
    ul.append(li);
  });
  return ul;
}

function applyActive(scope) {
  const here = window.location.pathname.replace(/index\.html$/, '');
  scope.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href')?.replace(/index\.html$/, '') || '';
    if (href === here) a.setAttribute('aria-current', 'page');
    try { const u = new URL(a.href); if (u.origin !== window.location.origin) a.target = '_blank'; } catch {}
  });
}

export default async function decorate(block) {
  // Resolve model: fragment (if set) takes precedence
  const local = getLocalModel(block);
  const model = local.fragment_path ? (await getFragmentModel(local.fragment_path)) || local : local;

  // Debug to help when the bar appears empty
  console.log('[navigation-bar] model:', model);
  const hasBrand = !!(model.brand_logo || model.brand_link);
  const hasTop = Array.isArray(model.top_links) && model.top_links.length > 0;
  const hasMain = Array.isArray(model.main_menu) && model.main_menu.length > 0;

  const uid = makeUID();
  const wrap = document.createElement('div');
  wrap.dataset.uid = uid;
  wrap.className = 'navigation-bar';

  const container = document.createElement('div');
  container.className = 'wrap';

  const bar = document.createElement('div');
  bar.className = 'bar';

  // Brand (left)
  const brand = document.createElement('a');
  brand.className = 'brand';
  brand.href = model.brand_link || '/';
  if (model.brand_logo) {
    const img = document.createElement('img');
    img.src = model.brand_logo;
    img.alt = model.brand_logoAlt || '';
    brand.append(img);
  } else if (model.brand_logoAlt) {
    // Fallback text only if alt provided (useful while wiring data)
    brand.textContent = model.brand_logoAlt;
  }

  // Mobile toggle
  const toggle = document.createElement('button');
  toggle.className = 'toggle';
  toggle.setAttribute('aria-label', 'Menu');
  toggle.innerHTML = '<span></span>';
  toggle.addEventListener('click', () => wrap.classList.toggle('open'));

  // Right (two rows)
  const right = document.createElement('div');
  right.className = 'right';

  // Row 1: top links (right-aligned)
  const topRow = document.createElement('div');
  topRow.className = 'row top';
  (model.top_links || []).forEach((lnk) => {
    const a = document.createElement('a');
    a.textContent = lnk.label || '';
    a.href = lnk.href || '#';
    topRow.append(a);
  });

  // Row 2: main menu (right-aligned)
  const mainRow = document.createElement('div');
  mainRow.className = 'row main';
  const nav = document.createElement('nav');
  nav.append(buildMenu(model.main_menu || []));
  mainRow.append(nav);

  right.append(topRow, mainRow);

  // Assemble
  bar.append(brand, right, toggle);
  container.append(bar);
  wrap.append(container);

  // Styles
  const style = document.createElement('style');
  style.textContent = styles(uid, !!model.sticky);

  // Optional hint if no data (to avoid a mysterious black bar)
  let hint;
  if (!hasBrand && !hasTop && !hasMain) {
    hint = document.createElement('div');
    hint.style.cssText = 'padding:.5rem 1rem;color:#bbb;font-size:.9rem;';
    hint.textContent = 'Configure Navigation Bar: set Fragment Path (e.g., /header) or add Brand/Top/Main items in the side panel.';
  }

  // Mount
  block.innerHTML = '';
  block.append(style, wrap);
  if (hint) wrap.append(hint);

  // Behavior
  applyActive(wrap);
}
