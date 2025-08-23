import { getMetadata } from '../../scripts/aem.js';


// scope wrapper
const scope = document.createElement('div');
scope.dataset.uid = uid;
scope.className = 'eds-header-nav-bar';


const bar = document.createElement('div');
bar.className = 'bar';


// Read authored JSON from UE-rendered DOM (model fields are emitted as cells)
// Expect structure: div > div* with text/links/images per model. Safer to use dataset props if present.
// Fallback to data embedded via block config (if provided via metadata).


// BRAND
const brand = document.createElement('a');
brand.className = 'brand';
brand.href = '/';
// try find an <img> inside the block authored content
const img = block.querySelector('img');
if (img) {
brand.append(img.cloneNode(true));
} else {
brand.textContent = 'Home';
}


// MENU (build from any links in first list, otherwise from links in first column)
const nav = document.createElement('nav');
nav.className = 'nav';
const ul = document.createElement('ul');


// Try to read JSON authored by UE via script tag (if your project emits data). Otherwise, infer from markup.
const menuCells = [...block.querySelectorAll(':scope > div > ul')][0]
|| [...block.querySelectorAll(':scope ul')][0];


if (menuCells) {
// Convert existing UL/LI into our structure
const clone = menuCells.cloneNode(true);
// mark li with children
clone.querySelectorAll('li').forEach((li)=>{
if (li.querySelector(':scope > ul')) li.classList.add('has-sub');
});
ul.replaceWith(clone);
nav.append(clone);
} else {
// fallback: gather direct anchors as menu
const anchors = [...block.querySelectorAll(':scope a')].slice(0,5);
anchors.forEach((a)=>{ const li = document.createElement('li'); li.append(a.cloneNode(true)); ul.append(li); });
nav.append(ul);
}


// RIGHT SIDE (links after the first list)
const right = document.createElement('div');
right.className = 'right';
const afterList = [...block.querySelectorAll(':scope > div > *')];
afterList.forEach((el)=>{
if (el.tagName?.toLowerCase() === 'ul') return; // skip main UL
const a = el.querySelector('a');
if (a) right.append(a.cloneNode(true));
});


// Mobile button
const btn = document.createElement('button');
btn.className = 'nav-toggle';
btn.setAttribute('aria-label','Menu');
btn.innerHTML = '<span></span>';
btn.addEventListener('click', ()=> scope.classList.toggle('open'));


bar.append(brand, btn, nav, right);
scope.append(bar);


// Active link marking
const here = window.location.pathname.replace(/index\.html$/, '');
scope.querySelectorAll('a[href]').forEach((a)=>{
const href = a.getAttribute('href')?.replace(/index\.html$/, '') || '';
if (href === here) a.setAttribute('aria-current','page');
});


// Styles
const style = document.createElement('style');
style.textContent = buildScopedStyles(uid, sticky);
block.innerHTML = '';
block.append(style, scope);
}