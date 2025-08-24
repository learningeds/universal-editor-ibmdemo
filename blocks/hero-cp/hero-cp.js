// hero-cp — full-bleed video hero with left red gradient and overlay text/CTA.
// No UE models required. Tweak the HERO_CONFIG below.

const HERO_CONFIG = {
  media: {
    // <<< update to your published video paths >>>
    src: "/media/CP8323 Tire Buffer.mp4",
    poster: "https://marcem.com.au/app/uploads/2024/04/Marcem-Social-Media-Planning-2024-1.jpg.avif", // used while loading / as fallback
    autoplay: true,
    loop: true,
    muted: true,      // REQUIRED for autoplay on mobile
    playsinline: true // REQUIRED for autoplay on iOS
  },
  layout: {
    height: "70vh",   // ~70% of the viewport; tweak as needed
    minHeight: 420,   // px guard for short viewports
    gradient: true    // left-side red gradient overlay
  },
  content: {
    eyebrow: "", // optional small line above title
    title: "Chicago Pneumatic\nCompressors",
    cta: { label: "Request A Quote", href: "/contact" }
  }
};

// small uid without crypto
function uid(prefix = "eds-hero") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function css(u, cfg) {
  const s = `[data-uid="${u}"]`;
  return `
${s} {
  position: relative;
  width: 100%;
  height: 70vh;   /* fallback for old browsers */
  height: 70lvh;  /* modern browsers: ignore DevTools shrink */
  min-height: ${cfg.layout.minHeight}px;
  color: #fff;
  overflow: hidden;
  background: #000;
}

/* video layer */
${s} .media {
  position: absolute; inset: 0;
}
${s} .media video, ${s} .media img.poster {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
}

/* optional left gradient */
${s} .shade {
  position: absolute; inset: 0;
  pointer-events: none;
  ${cfg.layout.gradient ? `
    background: linear-gradient(
      to right,
      rgba(212, 0, 26, .65) 0%,
      rgba(212, 0, 26, .45) 28%,
      rgba(212, 0, 26, .15) 52%,
      rgba(0, 0, 0, 0) 70%
    );` : `background: none;`
  }
}

/* content overlay */
${s} .content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: grid;
  align-items: center;
  padding: 1.25rem 1.25rem 1.75rem 1.25rem;
}

${s} .inner {
  max-width: 560px;
  /* no card background; text sits on gradient */
}

${s} .eyebrow {
  margin: 0 0 .25rem 0;
  font-size: .95rem;
  letter-spacing: .08em;
  text-transform: uppercase;
  opacity: .9;
}

${s} h1 {
  margin: 0 0 1rem 0;
  font-weight: 800;
  line-height: 1.05;
  font-size: clamp(1.75rem, 3.6vw, 3rem);
  white-space: pre-line; /* keep the line break in sample title */
}

${s} .cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: .65rem 1rem;
  border-radius: .5rem;
  font-weight: 700;
  text-decoration: none;
  color: #fff;
  background: #d4001a;
  border: 2px solid #d4001a;
  transition: transform .06s ease, background .2s ease, color .2s ease;
}
${s} .cta:hover { background: #ea002c; border-color: #ea002c; }
${s} .cta:active { transform: translateY(1px); }

/* top/bottom white hairline to match your header line */
${s}::after {
  content: "";
  position: absolute; left: 0; right: 0; bottom: 0;
  height: 2px; background: #fff; opacity: .95;
}

/* responsive tweaks */
@media (max-width: 900px){
  ${s} { height: 55vh; min-height: 360px; }
  ${s} .inner { max-width: 90%; }
}
`;
}

export default function decorate(block) {
  const cfg = HERO_CONFIG;
  const id = uid();

  // root
  const root = document.createElement("section");
  root.className = "hero-cp";
  root.dataset.uid = id;

  // media layer
  const media = document.createElement("div");
  media.className = "media";

  // try video; fallback to poster img if video fails
  const vid = document.createElement("video");
  vid.autoplay = !!cfg.media.autoplay;
  vid.loop = !!cfg.media.loop;
  vid.muted = !!cfg.media.muted;
  vid.playsInline = !!cfg.media.playsinline;
  vid.setAttribute("playsinline", ""); // for iOS inline playback
  vid.preload = "metadata";
  if (cfg.media.poster) vid.poster = cfg.media.poster;

  const source = document.createElement("source");
  source.src = cfg.media.src;
  source.type = "video/mp4";
  vid.appendChild(source);

  // if video errors, show poster image
  vid.addEventListener("error", () => {
    const img = document.createElement("img");
    img.src = cfg.media.poster || "";
    img.alt = "";
    img.className = "poster";
    media.innerHTML = "";
    media.appendChild(img);
  });

  media.appendChild(vid);

  // shade gradient
  const shade = document.createElement("div");
  shade.className = "shade";

  // content
  const content = document.createElement("div");
  content.className = "content";
  const inner = document.createElement("div");
  inner.className = "inner";

  if (cfg.content.eyebrow) {
    const e = document.createElement("div");
    e.className = "eyebrow";
    e.textContent = cfg.content.eyebrow;
    inner.appendChild(e);
  }

  if (cfg.content.title) {
    const h1 = document.createElement("h1");
    h1.textContent = cfg.content.title;
    inner.appendChild(h1);
  }

  if (cfg.content.cta?.label) {
    const a = document.createElement("a");
    a.className = "cta";
    a.href = cfg.content.cta.href || "#";
    a.textContent = cfg.content.cta.label;
    inner.appendChild(a);
  }

  content.appendChild(inner);

  // style tag (scoped)
  const style = document.createElement("style");
  style.textContent = css(id, cfg);

  // mount
  block.innerHTML = "";
  block.append(style, root);
  root.append(media, shade, content);

  // autoplay hint: start muted (already true), play asap
  // browsers may block until user gesture; that's fine—poster covers it
  vid.addEventListener("canplay", () => { try { vid.play(); } catch {} });
}
