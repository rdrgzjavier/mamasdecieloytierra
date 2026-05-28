const menuButton = document.querySelector("[data-menu-toggle]");
const navLinks = document.querySelector("[data-nav-links]");

if (menuButton && navLinks) {
  menuButton.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    document.body.classList.toggle("menu-open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });
}

const hero = document.querySelector("[data-hero]");
const bottomBar = document.querySelector("[data-bottom-bar]");

if (hero && bottomBar && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    ([entry]) => {
      bottomBar.classList.toggle("visible", !entry.isIntersecting);
    },
    { threshold: 0.1 }
  );
  observer.observe(hero);
}

document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = new Date().getFullYear();
});
