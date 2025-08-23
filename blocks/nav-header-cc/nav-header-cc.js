export default function decorate(block) {
  const logo = block.querySelector('.logo');
  const navItems = block.querySelector('.nav-items');

  // Create logo element
  const logoImg = document.createElement('img');
  logoImg.src = logo.textContent.trim();
  logo.replaceChildren(logoImg);

  // Create nav items list
  const navItemsList = document.createElement('ul');
  navItemsList.classList.add('nav-items');
  navItems.textContent.split(',').forEach((item) => {
    const navItem = document.createElement('li');
    const navLink = document.createElement('a');
    navLink.textContent = item.trim();
    navLink.href = '#'; // Replace with actual link
    navItem.appendChild(navLink);
    navItemsList.appendChild(navItem);
  });
  navItems.replaceChildren(navItemsList);
}
