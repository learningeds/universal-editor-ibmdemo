// Header Nav Bar block for EDS + Universal Editor
// Reads authored data from block.blockModel or embedded JSON

const makeUID = (prefix = 'eds-hnb') => `${prefix}-${crypto.randomUUID()}`;

function getBlockModel(block) {
  // Case 1: injected by UE runtime
  if (block.blockModel) return block.blockModel;

  // Case 2: embedded <script type="application/json">
  const script = block.querySelector('script[type="application/json"]');
  if (script) {
    try {
      return JSON.parse(script.textContent);
    } catch (e) {
      console.warn('Invalid block JSON', e);
    }
  }

  return {};
}

function buildScopedStyles(uid, sticky) {
  const s = `[data-uid="${uid}"]`;
  return `
${s}{ background:#000; color:#fff; ${sticky ? 'position:sticky;top:0;z-index:100;' : ''} }
${s} .bar{ width:100%; margin:0; padding:.625rem 1rem;
  display:grid; grid-template-columns:auto 1fr auto; align-items:center; gap:1rem; border-bottom:2px solid #fff; }
${s} .brand{ display:flex; align-items:center; gap:.5rem; text-decoration:none; color:inherit; }
${s} .brand img{ height:32px; width:auto; display:block; }
${s} .nav > ul{ list-style:none; margin:0; padding:0; display:flex; gap:2rem; }
${s} .nav a{ color:#fff; text-decoration:none; font-weight:700; letter-spacing:.2px;
  padding:.75rem .25rem; display:inline-block; position:relative; }
${s} .nav a[aria-current="page"]::after{ content:""; position:absolute; left:0; right:0;
  bottom:-.5rem; height:3px; background:#d4001a; border-radius:2px; }
${s} .right{ display:flex; align-items:center; gap:1.25rem; font-size:.9rem; }
${s} .right a{ color:#fff; text-decoration:none; opacity:.9; font-weight:600; }
${s} .right a:hover{ opacity:1; }
${s} .nav-toggle{ display:none; }
@media (max-width: 900px){
  ${s} .bar{ grid-template-columns:auto auto 1fr; }
  ${s} .nav-toggle{ display:inline-flex; align-items:center; justify-content:center;
    width:40px; height:40px; background:transparent; border:1px solid #333; border-radius:.5rem; }
  ${s} .nav > ul{ display:none; position:absolute; left:0; right:0; top:100%; background:#000;
    padding:.5rem 1rem; flex-direction:column; gap:.25rem; border-top:1px solid #222; }
  ${s}.open .nav > ul{ display:flex; }
  ${s} .right{ display:none; }
}`;
}

function buildMenu(menuItems = []) {
  const ul = document.createElement('ul');
  menuItems.forEach(item => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.textContent = item.label || '';
    a.href = item.href || '#';
    li.append(a);

    if (item.children && item.children.length) {
      const sub = document.createElement('ul');
      item.children.forEach(child => {
        const cli = document.createElement('li');
        const ca = document.createElement('a');
        ca.textContent = child.label || '';
        ca.href = child.href || '#';
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

export default function decorate(block) {
  const model = getBlockModel(block); // ✅ read authored UE data
  const uid = makeUID();
  const scope = document.createElement('div');
  scope.dataset.uid = uid;
  scope.className = 'eds-header-nav-bar';

  const bar = document.createElement('div');
  bar.className = 'bar';

  // Brand
  const brand = document.createElement('a');
  brand.className = 'brand';
  brand.href = model.brand_link || '/';
  if (model.brand_logo) {
    const img = document.createElement('img');
    img.src = model.brand_logo;
    img.alt = model.brand_logoAlt || 'Logo';
    brand.append(img);
  } else {
    brand.textContent = 'Home';
  }

  // Nav
  const nav = document.createElement('nav');
  nav.className = 'nav';
  nav.append(buildMenu(model.menu_items));

  // Right side links
  const right = document.createElement('div');
  right.className = 'right';
  (model.actions_links || []).forEach(link => {
    const a = document.createElement('a');
    a.textContent = link.label || '';
    a.href = link.href || '#';
    right.append(a);
  });

  // Mobile toggle
  const btn = document.createElement('button');
  btn.className = 'nav-toggle';
  btn.setAttribute('aria-label', 'Menu');
  btn.innerHTML = '<span></span>';
  btn.addEventListener('click', () => scope.classList.toggle('open'));

  bar.append(brand, btn, nav, right);
  scope.append(bar);

  // Highlight active link
  const here = window.location.pathname.replace(/index\\.html$/, '');
  scope.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href')?.replace(/index\\.html$/, '') || '';
    if (href === here) a.setAttribute('aria-current', 'page');
    try {
      const u = new URL(a.href);
      if (u.origin !== window.location.origin) a.target = '_blank';
    } catch {}
  });

  // Scoped styles
  const style = document.createElement('style');
  style.textContent = buildScopedStyles(uid, model.sticky);

  block.innerHTML = '';
  block.append(style, scope);
}
