// hero-cp — full-bleed video hero with left red gradient and overlay text/CTA.
// Supports MP4 (local / CDN) OR YouTube background.
// No UE models required. Tweak the HERO_CONFIG below.

const HERO_CONFIG = {
  media: {
    // For MP4
    src: "/media/hero-cp-mp.mp4",
    poster:
      "https://marcem.com.au/app/uploads/2024/04/Marcem-Social-Media-Planning-2024-1.jpg.avif",

    // For YouTube (use either youtube:"id" OR youtubeUrl:"https://youtube.com/watch?v=...")
    youtube: "", // e.g. "U0LHLqKTRJs"
    youtubeUrl: "https://www.youtube.com/watch?v=U0LHLqKTRJs",

    autoplay: true,
    loop: true,
    muted: true,
    playsinline: true,
  },
  layout: {
    height: "70vh",
    minHeight: 420,
    gradient: true,
  },
  content: {
    eyebrow: "",
    title: "Chicago Pneumatic\nCompressors",
    cta: { label: "Request A Quote", href: "/contact" },
  },
};

// small uid without crypto
function uid(prefix = "eds-hero") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

// --- helper: YouTube id extraction ---
function extractYouTubeId(urlOrId = "") {
  if (!urlOrId) return "";
  if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) return urlOrId;
  try {
    const u = new URL(urlOrId);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    const parts = u.pathname.split("/");
    const i = parts.indexOf("embed");
    if (i !== -1 && parts[i + 1]) return parts[i + 1];
  } catch {}
  return "";
}

function buildYouTubeIframe(id) {
  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    controls: "0",
    playsinline: "1",
    loop: "1",
    playlist: id,
    modestbranding: "1",
    rel: "0",
  });
  const src = `https://www.youtube.com/embed/${id}?${params.toString()}`;
  const iframe = document.createElement("iframe");
  iframe.src = src;
  iframe.title = "YouTube video player";
  iframe.allow =
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
  iframe.setAttribute("allowfullscreen", "");
  iframe.setAttribute("tabindex", "-1");
  iframe.setAttribute("aria-hidden", "true");
  iframe.className = "yt-bg";
  return iframe;
}

// --- css ---
function css(u, cfg) {
  const s = `[data-uid="${u}"]`;
  return `
${s} {
  position: relative;
  width: 100%;
  height: 85vh;   /* fallback */
  height: 85lvh;  /* modern browsers */
  min-height: ${cfg.layout.minHeight}px;
  color: #fff;
  overflow: hidden;
  background: #000;
}

/* video/iframe layer */
${s} .media {
  position: absolute; inset: 0;
}
${s} .media video, ${s} .media img.poster, ${s} .media .yt-bg {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  border: 0;
  pointer-events: none;
}

/* gradient overlay */
${s} .shade {
  position: absolute; inset: 0;
  pointer-events: none;
  ${
    cfg.layout.gradient
      ? `
    background: linear-gradient(
      to right,
      rgba(212, 0, 26, .65) 0%,
      rgba(212, 0, 26, .45) 28%,
      rgba(212, 0, 26, .15) 52%,
      rgba(0, 0, 0, 0) 70%
    );`
      : `background: none;`
  }
}

/* content overlay */
${s} .content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  align-items: flex-end;
  padding: 1.25rem 1.25rem 1.75rem 1.25rem;
}
${s} .inner {
  margin-bottom: 7rem;
  padding-left: 5rem;
  max-width: 560px;
  font-family: "Arial Black", "Arial Bold", Arial, sans-serif;
}
${s} h1 {
  font-family: "Arial Black", "Arial Bold", Arial, sans-serif;
  margin: 0 0 1rem 0;
  font-weight: 800;
  line-height: 1.05;
  font-size: clamp(1.75rem, 3.6vw, 3rem);
  white-space: pre-line;
}

/* CTA */
${s} .cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: .65rem 1.25rem;
  font-weight: 700;
  text-decoration: none;
  color: #fff;
  background: transparent;
  border: 2px solid #fff;
  transition: all .2s ease;
}
${s} .cta:hover { background:#fff; color:#d4001a; }
${s} .cta:active { transform: translateY(1px); }

/* bottom white line */
${s}::after {
  content: "";
  position: absolute; left: 0; right: 0; bottom: 0;
  height: 2px; background: #fff; opacity: .95;
}
`;
}

export default function decorate(block) {
  const cfg = HERO_CONFIG;
  const id = uid();

  const root = document.createElement("section");
  root.className = "hero-cp";
  root.dataset.uid = id;

  // lock height at load
  function lockHeroHeight() {
    const h = window.innerHeight * 0.85;
    root.style.height = `${h}px`;
  }
  lockHeroHeight();

  // --- media layer ---
  const media = document.createElement("div");
  media.className = "media";

  const ytId =
    extractYouTubeId(cfg.media.youtube) ||
    extractYouTubeId(cfg.media.youtubeUrl);

  if (ytId) {
    const iframe = buildYouTubeIframe(ytId);
    media.appendChild(iframe);
  } else {
    const vid = document.createElement("video");
    vid.autoplay = !!cfg.media.autoplay;
    vid.loop = !!cfg.media.loop;
    vid.muted = !!cfg.media.muted;
    vid.playsInline = !!cfg.media.playsinline;
    vid.setAttribute("playsinline", "");
    vid.preload = "metadata";
    if (cfg.media.poster) vid.poster = cfg.media.poster;

    const source = document.createElement("source");
    source.src = cfg.media.src;
    source.type = "video/mp4";
    vid.appendChild(source);

    vid.addEventListener("canplay", () => {
      try {
        vid.play();
      } catch {}
    });
    vid.addEventListener("error", () => {
      const img = document.createElement("img");
      img.src = cfg.media.poster || "";
      img.alt = "";
      img.className = "poster";
      media.innerHTML = "";
      media.appendChild(img);
    });

    media.appendChild(vid);
  }

  // shade
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

  // style
  const style = document.createElement("style");
  style.textContent = css(id, cfg);

  // mount
  block.innerHTML = "";
  block.append(style, root);
  root.append(media, shade, content);
}
