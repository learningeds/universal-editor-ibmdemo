import { getMetadata } from '../../scripts/aem.js';
// primary nav (first UL)
const firstList = section.querySelector('ul');
const nav = document.createElement('nav');
nav.className = 'nav';
if (firstList) {
nav.append(firstList.cloneNode(true));
firstList.remove();
} else {
nav.innerHTML = '<ul></ul>';
}


// right side: whatever is left in the fragment
const right = document.createElement('div');
right.className = 'right';
Array.from(section.children).forEach((el)=> right.append(el));


const bar = document.createElement('div');
bar.className = 'bar';
bar.append(brand, nav, right);


return bar;
};


const buildScopedStyles = (uid) => {
const s = `[data-uid="${uid}"]`;
return `
${s} { background:#000; color:#fff; border-bottom:2px solid #fff; }
${s} .bar{ max-width:1200px; margin:0 auto; padding:.5rem 1rem; display:grid; grid-template-columns:auto 1fr auto; align-items:center; gap:1rem; }
${s} .brand{ display:flex; align-items:center; gap:.5rem; text-decoration:none; color:inherit; }
${s} .brand img{ height:28px; width:auto; display:block; }
${s} .nav > ul{ list-style:none; margin:0; padding:0; display:flex; gap:1.5rem; }
${s} .nav a{ color:#fff; text-decoration:none; font-weight:600; padding:.75rem .25rem; display:inline-block; position:relative; }
${s} .nav a:hover{ opacity:.9; }
${s} .nav a[aria-current="page"]::after{ content:""; position:absolute; left:0; right:0; bottom:-.5rem; height:3px; background:#d4001a; border-radius:2px; }
${s} .right{ display:flex; align-items:center; gap:1rem; font-size:.9rem; }
${s} .right a{ color:#fff; text-decoration:none; opacity:.85; }
${s} .right a:hover{ opacity:1; }
${s} .has-sub{ position:relative; }
${s} .has-sub > ul{ position:absolute; top:100%; left:0; min-width:220px; background:#111; border:1px solid #2a2a2a; display:none; padding:.5rem; border-radius:.5rem; }
${s} .has-sub:hover > ul, ${s} .has-sub:focus-within > ul{ display:block; }
${s} .has-sub > a::after{ content:"▾"; margin-left:.35rem; font-size:.8em; }


/* basic mobile collapse */
@media (max-width: 900px){
${s} .bar{ grid-template-columns: auto auto 1fr; }
${s} .nav-toggle{ display:inline-flex; align-items:center; justify-content:center; width:40px; height:40px; background:transparent; border:1px solid #333; border-radius:.5rem; }
${s} .nav > ul{ display:none; position:absolute; left:0; right:0; top:100%; background:#000; padding:.5rem 1rem; flex-direction:column; gap:.25rem; border-top:1px solid #222; }
${s}.open .nav > ul{ display:flex; }
${s} .right{ display:none; }
}
`;
};


export default async function decorate(block){
const uid = makeUID();
const navPath = getMetadata('nav') || '/nav';
const fragment = await loadFragment(navPath);
if (!fragment) return;


block.innerHTML = '';


const scope = document.createElement('div');
scope.dataset.uid = uid;
scope.className = 'eds-header-nav-bar';


const bar = buildFromFragment(fragment);


// mobile toggle (very small)
const btn = document.createElement('button');
btn.className = 'nav-toggle';
btn.setAttribute('aria-label','Menu');
btn.innerHTML = '<span></span>';
bar.insertBefore(btn, bar.querySelector('.nav'));
btn.addEventListener('click', ()=> scope.classList.toggle('open'));


scope.append(bar);


// scoped styles
const style = document.createElement('style');
style.textContent = buildScopedStyles(uid);
block.prepend(style);


// behaviors
markActive(scope);
wireSimpleDropdowns(scope);
}