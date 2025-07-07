/**
 * scroll-logo-top.js
 * Al hacer clic en el logo, fuerza el scroll al tope de la página con animación suave.
 * Además, actualiza el hash de la URL a #inicio para mantener la navegación accesible.
 */
document.addEventListener('DOMContentLoaded', function() {
  var logo = document.getElementById('logo');
  if (logo) {
    logo.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      history.pushState(null, '', '#inicio');
    });
  }
});
