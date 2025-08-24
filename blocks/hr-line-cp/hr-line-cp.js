function render(block) {
  const style = block.dataset.style || "default";
  const thickness = Number(block.dataset.thickness || 1);
  const bleed = (block.dataset.bleed || "false") === "true";

  // build/replace hr
  const hr = document.createElement("hr");
  hr.className = `hr-line hr-line-${style}${bleed ? " hr-line--bleed" : ""}`;
  hr.style.borderTopWidth = `${thickness}px`;
  hr.style.borderColor = "#ccc";

  block.innerHTML = "";
  block.appendChild(hr);
}

export default function decorate(block) {
  render(block);

  // Reflect authoring changes live (style/thickness/bleed)
  const mo = new MutationObserver((muts) => {
    if (muts.some(m => m.type === "attributes" && m.attributeName?.startsWith("data-"))) {
      render(block);
    }
  });
  mo.observe(block, { attributes: true });
}
