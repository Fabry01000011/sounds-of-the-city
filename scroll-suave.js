/**
 * scroll-suave.js
 * Implementa desplazamiento suave para todos los enlaces internos (anclas) de la página.
 * - Al hacer clic en un enlace interno, realiza scroll animado hasta el destino.
 * - Actualiza el hash de la URL para accesibilidad y navegación.
 */

// Desplazamiento suave para anclas internas
// Compatible con todos los navegadores modernos

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Opcional: actualizar el hash en la URL
        history.pushState(null, '', '#' + targetId);
      }
    });
  });
});
