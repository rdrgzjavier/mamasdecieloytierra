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


const contactForms = document.querySelectorAll('[data-contact-form]');
let formModal;

function showFormModal(title, message, isError = false) {
  if (!formModal) {
    formModal = document.createElement('div');
    formModal.className = 'form-modal';
    formModal.setAttribute('role', 'dialog');
    formModal.setAttribute('aria-modal', 'true');
    formModal.innerHTML = '<div class="form-modal__panel"><div class="form-modal__icon" aria-hidden="true">&#10003;</div><h2></h2><p></p><button class="button" type="button">Cerrar</button></div>';
    document.body.appendChild(formModal);
    formModal.addEventListener('click', (event) => {
      if (event.target === formModal || event.target.matches('button')) {
        formModal.classList.remove('is-visible');
      }
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') formModal.classList.remove('is-visible');
    });
  }
  formModal.querySelector('.form-modal__icon').textContent = isError ? '!' : '\u2713';
  formModal.querySelector('h2').textContent = title;
  formModal.querySelector('p').textContent = message;
  formModal.classList.add('is-visible');
}

contactForms.forEach((form) => {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const submitButton = form.querySelector('button[type="submit"]');
    const originalLabel = submitButton ? submitButton.textContent : '';
    form.classList.add('is-sending');
    if (submitButton) submitButton.textContent = 'Enviando...';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });

      if (!response.ok) throw new Error('No se pudo enviar el formulario.');
      form.reset();
      showFormModal('Solicitud enviada', 'Gracias. Hemos recibido tu mensaje y responderemos con cuidado lo antes posible.');
    } catch (error) {
      showFormModal('No se ha podido enviar', 'Por favor, int\u00e9ntalo de nuevo en unos minutos. Si el problema contin\u00faa, vuelve a cargar la p\u00e1gina.', true);
    } finally {
      form.classList.remove('is-sending');
      if (submitButton) submitButton.textContent = originalLabel;
    }
  });
});
