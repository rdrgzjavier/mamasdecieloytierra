const canonicalOrigin = "https://www.mamasdecieloytierra.com";
const legacyGitHubHost = "rdrgzjavier.github.io";
const cloudflarePreviewHost = "mamasdecieloytierra.pages.dev";

if (
  window.location.hostname === legacyGitHubHost ||
  window.location.hostname === cloudflarePreviewHost
) {
  let targetPath = window.location.pathname;

  if (window.location.hostname === legacyGitHubHost) {
    const legacyProjectPath = "/mamasdecieloytierra";
    if (
      targetPath === legacyProjectPath ||
      targetPath.startsWith(`${legacyProjectPath}/`)
    ) {
      targetPath = targetPath.slice(legacyProjectPath.length) || "/";
    }
  }

  window.location.replace(
    `${canonicalOrigin}${targetPath}${window.location.search}${window.location.hash}`
  );
}

const menuButton = document.querySelector("[data-menu-toggle]");
const navLinks = document.querySelector("[data-nav-links]");
let menuScrollY = 0;

const COLABORA_STRIPE_PAYMENT_LINK = "https://buy.stripe.com/14A5kDcvjh1u5vN0Qw67S04";

function trackSiteEvent(eventName, params = {}) {
  if (!eventName) return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...params
  });
}

if (menuButton && navLinks) {
  const setMenuOpen = (isOpen) => {
    const wasOpen = navLinks.classList.contains("open");

    if (isOpen === wasOpen) return;

    if (isOpen) {
      menuScrollY = window.scrollY || window.pageYOffset || 0;
    }

    navLinks.classList.toggle("open", isOpen);
    document.body.classList.toggle("menu-open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));

    if (!isOpen) {
      const previousScrollBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo(0, menuScrollY);
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
    }
  };

  menuButton.addEventListener("click", () => {
    setMenuOpen(!navLinks.classList.contains("open"));
  });

  navLinks.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;

    if (target && target.closest("a")) {
      setMenuOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuOpen(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980) {
      setMenuOpen(false);
    }
  });
}

const hero = document.querySelector("[data-hero]");
const bottomBar = document.querySelector("[data-bottom-bar]");
const reservationSection = document.querySelector("#reserva");

if (hero && bottomBar && "IntersectionObserver" in window) {
  let heroIsVisible = true;
  let reservationIsVisible = false;

  const updateBottomBar = () => {
    bottomBar.classList.toggle(
      "visible",
      !heroIsVisible && !reservationIsVisible
    );
  };

  const heroObserver = new IntersectionObserver(
    ([entry]) => {
      heroIsVisible = entry.isIntersecting;
      updateBottomBar();
    },
    { threshold: 0.1 }
  );
  heroObserver.observe(hero);

  if (reservationSection) {
    const reservationObserver = new IntersectionObserver(
      ([entry]) => {
        reservationIsVisible = entry.isIntersecting;
        updateBottomBar();
      },
      { threshold: 0 }
    );
    reservationObserver.observe(reservationSection);
  }

  updateBottomBar();
}

document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = new Date().getFullYear();
});


const contactForms = document.querySelectorAll('[data-contact-form]');
let formModal;
let formModalScrollY = 0;

function closeFormModal() {
  if (!formModal) return;

  formModal.classList.remove('is-visible');
  document.body.classList.remove('form-modal-open');
  window.scrollTo(0, formModalScrollY);
}

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
        closeFormModal();
      }
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeFormModal();
    });
  }
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
  formModalScrollY = window.scrollY;
  formModal.querySelector('.form-modal__icon').textContent = isError ? '!' : '\u2713';
  formModal.querySelector('h2').textContent = title;
  formModal.querySelector('p').textContent = message;
  document.body.classList.add('form-modal-open');
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
      const formData = new FormData(form);
      const endpoint = form.dataset.ajaxEndpoint || form.action;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: new URLSearchParams(formData),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || !result || result.success === false || result.success === 'false') {
        throw new Error(result && result.message ? result.message : 'No se pudo enviar el formulario.');
      }
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

const colaboraStripeCtas = document.querySelectorAll("[data-colabora-stripe-cta]");

if (colaboraStripeCtas.length) {
  const stripePaymentLink = COLABORA_STRIPE_PAYMENT_LINK.trim();
  const paymentStatus = document.querySelector("[data-colabora-payment-status]");

  if (stripePaymentLink) {
    if (paymentStatus) {
      paymentStatus.textContent = "Proceso seguro y cifrado. Sin sorpresas.";
    }

    colaboraStripeCtas.forEach((cta) => {
      if (cta instanceof HTMLAnchorElement) {
        cta.href = stripePaymentLink;
      }

      if (cta instanceof HTMLButtonElement) {
        cta.disabled = false;
      }

      cta.removeAttribute("aria-disabled");

      cta.addEventListener("click", (event) => {
        event.preventDefault();

        if (cta.dataset.analyticsEvent) {
          trackSiteEvent(cta.dataset.analyticsEvent, {
            event_category: "colabora",
            cta_location: cta.dataset.analyticsSection || "",
            cta_type: cta.dataset.analyticsCta || ""
          });
        }

        trackSiteEvent("colabora_stripe_click", {
          event_category: "colabora",
          cta_location: cta.dataset.analyticsSection || "aportacion",
          cta_type: "colaboracion",
          destination: "stripe_payment_link"
        });

        window.location.assign(stripePaymentLink);
      });
    });
  } else {
    colaboraStripeCtas.forEach((cta) => {
      if (cta instanceof HTMLButtonElement) {
        cta.disabled = true;
      }

      cta.setAttribute("aria-disabled", "true");
    });

    if (paymentStatus) {
      paymentStatus.textContent = "La aportación online no está disponible en este momento.";
    }
  }
}

document.querySelectorAll("[data-analytics-event]:not([data-colabora-stripe-cta])").forEach((node) => {
  node.addEventListener("click", () => {
    trackSiteEvent(node.dataset.analyticsEvent, {
      event_category: "colabora",
      cta_location: node.dataset.analyticsSection || "",
      cta_type: node.dataset.analyticsCta || ""
    });
  });
});
