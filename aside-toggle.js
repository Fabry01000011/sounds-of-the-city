/**
 * aside-toggle.js
 * Oculta y muestra el <aside> al entrar/salir de la sección de compra de tickets con transición suave.
 * - Aplica transición de opacidad y visibilidad.
 * - Oculta el aside cuando la sección de compra está activa.
 * - Restaura el aside al volver a la sección principal.
 */

document.addEventListener('DOMContentLoaded', () => {
  const aside = document.querySelector('aside');
  const compraSection = document.getElementById('compra-tickets');
  const navLinks = document.querySelectorAll('nav.menu a');
  const mainContainer = document.querySelector('.container') || document.querySelector('main');

  if (!aside || !compraSection) return;

  // Agregar transición suave (más lenta)
  aside.style.transition = 'opacity 1.2s cubic-bezier(0.4,0,0.2,1), visibility 1.2s';
  aside.style.willChange = 'opacity, visibility';

  function hideAside() {
    aside.style.opacity = '0';
    aside.style.visibility = 'hidden';
    aside.classList.add('aside-hiding');
    if (mainContainer) mainContainer.classList.add('aside-hidden');
    setTimeout(() => {
      if (aside.style.opacity === '0') {
        aside.style.display = 'none';
        aside.classList.remove('aside-hiding');
      }
    }, 1200);
  }
  function showAside() {
    aside.style.display = '';
    // Forzar reflow para que la transición funcione
    void aside.offsetWidth;
    aside.style.opacity = '1';
    aside.style.visibility = 'visible';
    if (mainContainer) mainContainer.classList.remove('aside-hidden');
  }

  function checkAndToggleAside() {
    // Mostrar el aside solo cuando la sección #inicio es visible en el viewport
    const inicioSection = document.getElementById('inicio');
    if (!inicioSection) return;
    const rect = inicioSection.getBoundingClientRect();
    const visibleHeight = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
    const visibleRatio = visibleHeight / rect.height;
    if (visibleRatio > 0.2) {
      showAside();
    } else {
      hideAside();
    }
  }

  window.addEventListener('scroll', checkAndToggleAside);
  window.addEventListener('resize', checkAndToggleAside);

  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      if (link.getAttribute('href') === '#compra-tickets') {
        hideAside();
        setTimeout(() => window.scrollTo(0, compraSection.offsetTop - 40), 100);
      } else {
        showAside();
      }
    });
  });

  checkAndToggleAside();
});
