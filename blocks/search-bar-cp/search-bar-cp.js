export default function decorate(block) {
  const title = block.dataset.title || "Search for what you need";
  const placeholder = block.dataset.placeholder || "Find products, information, news, events.....";
  const buttonIcon = block.dataset.buttonIcon || "🔍";
  const buttonAria = block.dataset.buttonAriaLabel || "Search";

  block.innerHTML = `
    <div class="search-bar-cp-wrapper">
      <h2 class="search-title">${title}</h2>
      <div class="search-box">
        <input type="text" placeholder="${placeholder}" />
        <button aria-label="${buttonAria}">
          ${buttonIcon}
        </button>
      </div>
    </div>
  `;
}
