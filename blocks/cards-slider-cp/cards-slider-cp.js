const SLIDES = [
  {
    img: { src: "https://atlascopco.scene7.com/is/image/atlascopco/CP-globe1?$landscape1600$", alt: "Global network" },
    title: "Find a Dealer",
    desc: "Locate your nearest CP partner for sales and support.",
    cta: { label: "Find Dealers", href: "/dealer" }
  },
  {
    img: { src: "https://atlascopco.scene7.com/is/image/atlascopco/CP-polaroid-pictures?$landscape1600$&fmt=png-alpha", alt: "CP brand" },
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
