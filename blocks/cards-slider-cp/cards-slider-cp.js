const SLIDES = [
  {
    img: { src: "/media/slider-1.webp", alt: "Global network" },
    title: "Find a Dealer",
    desc: "Locate your nearest CP partner for sales and support.",
    cta: { label: "Find Dealers", href: "/dealer" }
  },
  {
    img: { src: "/media/slider-2.webp", alt: "CP brand" },
    title: "This is Chicago Pneumatic",
    desc: "Over a century of compressed air expertise.",
    cta: { label: "Learn More", href: "/about" }
  }
];

function cardHTML(s) {
  return `
    <li class="cs-slide">
      <div class="cards-card-image">
        <picture>
          <img src="${s.img.src}" alt="${s.img.alt ?? ""}">
        </picture>
      </div>
      <div class="cards-card-body">
        <h3>${s.title}</h3>
        <p>${s.desc ?? ""}</p>
        ${s.cta ? `<a href="${s.cta.href}">${s.cta.label}</a>` : ""}
      </div>
    </li>
  `;
}

export default function decorate(block) {
  const section = block.closest(".cards-slider-cp");
  if (!section) return;

  const viewport = document.createElement("div");
  viewport.className = "cs-viewport";

  const ul = document.createElement("ul");
  ul.className = "cs-track";
  ul.innerHTML = SLIDES.map(cardHTML).join("");

  block.innerHTML = "";
  viewport.appendChild(ul);
  block.appendChild(viewport);
}
