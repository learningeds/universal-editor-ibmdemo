export default function decorate(block) {
  const hr = document.createElement("hr");
  hr.className = "hr-line";
  block.textContent = ""; // clear editor content
  block.appendChild(hr);
}
