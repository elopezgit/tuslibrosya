// ─── SECURITY & ERROR HELPERS ────────────────────────────────────
function escapeHTML(str) {
  if (typeof str !== 'string') return str;
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return str.replace(/[&<>"']/g, c => map[c]);
}

function handleError(context, err) {
  const msg = err ? err.message : 'Error desconocido';
  console.error(`[TuPedido] ${context}:`, err || '');
  showToast(`⚠️ Error: ${context}`);
}

// ─── HELPERS ─────────────────────────────────────────────────────
function tagLabel(t) {
  const map = {
    vegetariana: '🌿 Veggie',
    spicy: '🌶️ Picante',
    popular: '🔥 Popular',
    pop: '⭐ Estrella'
  };
  return map[t] || t;
}

function formatPrice(n) {
  return '$' + n.toLocaleString('es-AR');
}

function generateOrderID() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TP-${code}`;
}

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  const num = parseInt(hex, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function photoHTML(src, emoji, alt = '') {
  return `
    <div class="img-skeleton"></div>
    <img
      src="${src}"
      alt="${alt}"
      loading="lazy"
      onload="this.previousElementSibling.remove()"
      onerror="this.previousElementSibling.remove(); this.style.display='none'; this.nextElementSibling.style.opacity='1';"
    >
    <div class="item-photo-fallback" style="opacity:0">${emoji}</div>
  `;
}
