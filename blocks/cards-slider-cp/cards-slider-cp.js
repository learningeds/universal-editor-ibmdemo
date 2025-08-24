// One-slide-per-view slider with heading + dots + simple link caption.
// Slides are hardcoded here; UE panel settings are ignored except "heading".

const HEADING = "A Global Network"; // change or read from UE via data-heading if you prefer

const SLIDES = [
  {
    img: { src: "/media/slider-1.webp", alt: "Global network" },
    // show only link below image:
    cta: { label: "Find a Dealer", href: "/dealer" }
  },
  {
    img: { src: "/media/slider-2.webp", alt: "CP brand" },
    cta: { label: "This is Chicago Pneumatic", href: "/about" }
  }
];

function slideHTML(s) {
  return `
    <li class="cs-slide">
      <div class="cards-card-image">
        <picture><img src="${s.img.src}" alt="${s.img.alt ?? ""}"></picture>
      </div>
      <div class="cards-card-body">
        ${s.cta ? `<a class="cs-link" href="${s.cta.href}">${s.cta.label}</a>` : ""}
      </div>
    </li>
  `;
}

export default function decorate(block) {
  const section = block.closest(".cards-slider-cp");
  if (!section) return;

  const wrap = document.createElement("div");
  wrap.className = "cs-wrap";

  // Heading (centered)
  const h = document.createElement("h2");
  h.className = "cs-heading";
  h.textContent = section.dataset.heading || HEADING;

  // Viewport + track
  const viewport = document.createElement("div");
  viewport.className = "cs-viewport";

  const track = document.createElement("ul");
  track.className = "cs-track";
  track.innerHTML = SLIDES.map(slideHTML).join("");

  viewport.appendChild(track);

  // Dots
  const dots = document.createElement("div");
  dots.className = "cs-dots";

  const dotBtns = SLIDES.map((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "cs-dot";
    b.setAttribute("aria-label", `Go to slide ${i + 1}`);
    b.addEventListener("click", () => {
      // scroll to slide i
      viewport.scrollTo({
        left: i * viewport.clientWidth,
        behavior: "smooth",
      });
    });
    dots.appendChild(b);
    return b;
  });

  // Active dot updater
  function updateDots() {
    const idx = Math.round(viewport.scrollLeft / viewport.clientWidth);
    dotBtns.forEach((b, i) => b.classList.toggle("active", i === idx));
  }
  viewport.addEventListener("scroll", () => {
    // throttle a little
    window.requestAnimationFrame(updateDots);
  });

  // Mount
  block.innerHTML = "";
  wrap.append(h, viewport, dots);
  block.appendChild(wrap);

  // Initial state
  updateDots();

  // Recalculate on resize so one-slide-per-view keeps working
  window.addEventListener("resize", updateDots);
}
