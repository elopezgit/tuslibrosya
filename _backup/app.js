// ─── STATE ───────────────────────────────────────────────────────
let cart = {};
let productNotes = {};
let currentCat = 'todos';
let deliveryMode = 'delivery';
let toastTimer;
let paymentMethod = 'cash';
let cashChange = '';
let customBrandName = 'TuPedido';
let activePackSize = 12;
let activePackProduct = null;
let tempPackSelections = {};
let detailActiveProduct = null;
let detailTempQty = 1;
let redirectTimer;

// ─── LANDING PAGE RENDERING ──────────────────────────────────────
function renderLanding() {
  const L = LANDING;
  const T = INDUSTRY_TEMPLATES[CURRENT_INDUSTRY];

  // Hero
  setText('lpHeroTag', L.heroTag);
  setText('lpHeroTitle', L.heroTitle);
  setText('lpHeroDesc', L.heroDesc);
  setText('lpHeroCtaPrimary', L.heroCtaPrimary);
  setText('lpHeroCtaSecondary', L.heroCtaSecondary);

  const uspsEl = document.getElementById('lpHeroUsps');
  if (uspsEl) uspsEl.innerHTML = L.heroUsps.map(u => `<span class="lp-hero-usp">${u}</span>`).join('');

  // Pain points
  setText('lpPainTitle', L.painTitle);
  const painGrid = document.getElementById('lpPainGrid');
  if (painGrid) painGrid.innerHTML = L.painPoints.map(p => `
    <div class="lp-pain-card">
      <div class="lp-pain-icon">${p.icon}</div>
      <h3 class="lp-pain-title">${p.title}</h3>
      <p class="lp-pain-desc">${p.desc}</p>
    </div>
  `).join('');

  // How it works
  setText('lpHowTitle', L.howTitle);
  setText('lpHowSubtitle', L.howSubtitle);
  const howSteps = document.getElementById('lpHowSteps');
  if (howSteps) howSteps.innerHTML = L.howSteps.map(s => `
    <div class="lp-how-step">
      <div class="lp-how-num">${s.num}</div>
      <div class="lp-how-icon">${s.icon}</div>
      <h3 class="lp-how-title">${s.title}</h3>
      <p class="lp-how-desc">${s.desc}</p>
    </div>
  `).join('');

  // Features
  setText('lpFeaturesTitle', L.featuresTitle);
  const featuresGrid = document.getElementById('lpFeaturesGrid');
  if (featuresGrid) featuresGrid.innerHTML = L.features.map(f => `
    <div class="lp-feature-card">
      <div class="lp-feature-icon">${f.icon}</div>
      <h3 class="lp-feature-title">${f.title}</h3>
      <p class="lp-feature-desc">${f.desc}</p>
    </div>
  `).join('');

  // Verticals
  setText('lpVerticalsTitle', L.verticalsTitle);
  const verticalsGrid = document.getElementById('lpVerticalsGrid');
  if (verticalsGrid) verticalsGrid.innerHTML = L.verticals.map(v => `
    <div class="lp-vertical-card">
      <div class="lp-vertical-icon">${v.icon}</div>
      <div>
        <h3 class="lp-vertical-title">${v.title}</h3>
        <p class="lp-vertical-desc">${v.desc}</p>
      </div>
    </div>
  `).join('');

  // Testimonials
  setText('lpTestimonialsTitle', L.testimonialsTitle);
  const testimonialsGrid = document.getElementById('lpTestimonialsGrid');
  if (testimonialsGrid) testimonialsGrid.innerHTML = L.testimonials.map(t => `
    <div class="lp-testimonial-card">
      <p class="lp-testimonial-text">${t.text}</p>
      <div class="lp-testimonial-author">
        <div class="lp-testimonial-avatar">${t.avatar}</div>
        <div>
          <div class="lp-testimonial-name">${t.name}</div>
          <div class="lp-testimonial-business">${t.business}</div>
        </div>
      </div>
    </div>
  `).join('');

  // Pricing
  setText('lpPricingTitle', L.pricingTitle);
  setText('lpPricingSubtitle', L.pricingSubtitle);
  const pricingGrid = document.getElementById('lpPricingGrid');
  if (pricingGrid) pricingGrid.innerHTML = L.plans.map(p => `
    <div class="lp-pricing-card ${p.highlighted ? 'highlighted' : ''}">
      ${p.highlighted ? '<div class="lp-pricing-badge">Más popular</div>' : ''}
      <h3 class="lp-pricing-name">${p.name}</h3>
      <div class="lp-pricing-price">${p.price}</div>
      <div class="lp-pricing-period">${p.period}</div>
      <p class="lp-pricing-desc">${p.desc}</p>
      <ul class="lp-pricing-features">
        ${p.features.map(f => `<li>${f}</li>`).join('')}
      </ul>
      <button class="lp-pricing-cta ${p.highlighted ? 'lp-pricing-cta-primary' : 'lp-pricing-cta-secondary'}">${p.cta}</button>
    </div>
  `).join('');

  // FAQ
  setText('lpFaqTitle', L.faqTitle);
  const faqList = document.getElementById('lpFaqList');
  if (faqList) faqList.innerHTML = L.faq.map((f, i) => `
    <div class="lp-faq-item" onclick="toggleFaq(this)">
      <button class="lp-faq-q">${f.q}</button>
      <div class="lp-faq-a"><div class="lp-faq-a-inner">${f.a}</div></div>
    </div>
  `).join('');

  // Final CTA
  setText('lpFinalCtaTitle', L.finalCtaTitle);
  setText('lpFinalCtaDesc', L.finalCtaDesc);
  setText('lpFinalCtaButton', L.finalCtaButton);

  // Footer
  setText('lpFooterAbout', L.footerAbout);
  setText('lpFooterProductTitle', L.footerProduct);
  setText('lpFooterLegalTitle', L.footerLegal);

  const fpLinks = document.getElementById('lpFooterProductLinks');
  if (fpLinks) fpLinks.innerHTML = L.footerProductLinks.map(l => `<li><a href="#">${l}</a></li>`).join('');
  const flLinks = document.getElementById('lpFooterLegalLinks');
  if (flLinks) flLinks.innerHTML = L.footerLegalLinks.map(l => `<li><a href="#">${l}</a></li>`).join('');

  // Init landing scroll observer
  initLandingScrollObserver();
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function toggleFaq(item) {
  item.classList.toggle('open');
}

function toggleLpMobileMenu() {
  document.getElementById('lpMobileMenu').classList.toggle('open');
}
function closeLpMobileMenu() {
  document.getElementById('lpMobileMenu').classList.remove('open');
}

function initLandingScrollObserver() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.lp-section').forEach(el => observer.observe(el));
}

// ─── VIEW SWITCHING ──────────────────────────────────────────────
function goToLanding() {
  ACTIVE_VIEW = 'landing';
  document.getElementById('landingView').style.display = '';
  document.getElementById('storefrontView').style.display = 'none';
  document.getElementById('bottomBar').style.display = 'none';
  document.body.style.maxWidth = '100%';
  document.body.style.margin = '0';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToStorefront() {
  ACTIVE_VIEW = 'storefront';
  document.getElementById('landingView').style.display = 'none';
  document.getElementById('storefrontView').style.display = '';
  document.getElementById('bottomBar').style.display = '';
  document.body.style.maxWidth = '430px';
  document.body.style.margin = '0 auto';
  window.scrollTo({ top: 0 });
  applyIndustryLabels();
  renderBusinessBar();
  renderHeroBg();
  renderCategories();
  renderMenu(MENU);
  renderFeatured();
}

function showStorefrontDirect() {
  ACTIVE_VIEW = 'storefront';
  document.getElementById('landingView').style.display = 'none';
  document.getElementById('storefrontView').style.display = '';
  document.getElementById('bottomBar').style.display = '';
  document.body.style.maxWidth = '430px';
  document.body.style.margin = '0 auto';
  applyIndustryLabels();
  renderBusinessBar();
  renderHeroBg();
  renderCategories();
  renderMenu(MENU);
  renderFeatured();
}

// ─── STOREFRONT: APPLY INDUSTRY LABELS ───────────────────────────
function applyIndustryLabels() {
  const T = INDUSTRY_TEMPLATES[CURRENT_INDUSTRY];
  if (!T) return;

  setText('sfHeroTag', T.heroTag);
  setText('sfHeroTitle', T.heroTitle);
  setText('sfHeroDesc', T.heroDesc);
  setText('sfCategoriesLabel', T.categoriesLabel);
  setText('menuTitle', T.menuLabel);
  setText('sfFeaturedLabel', T.featuredLabel);
  setText('sfPromoLabel', T.promoLabel);
  setText('cartPanelTitle', T.cartLabel);
  setText('orderBtnLabel', T.cartLabel);
  setText('waBtnLabel', T.checkoutLabel);

  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.placeholder = T.searchPlaceholder;

  const deliveryToggle = document.getElementById('deliveryToggleSection');
  if (deliveryToggle) deliveryToggle.style.display = T.deliveryToggle ? '' : 'none';
}

// ─── STOREFRONT: RENDER CATEGORIES (DYNAMIC) ─────────────────────
function renderCategories() {
  const T = INDUSTRY_TEMPLATES[CURRENT_INDUSTRY];
  if (!T) return;

  const grid = document.getElementById('catsBentoGrid');
  if (!grid) return;

  grid.innerHTML = T.categories.map((cat, i) => {
    let classes = 'bento-card';
    if (cat.span2) classes += ' bento-all';
    if (cat.tall) {
      const catKey = cat.id;
      classes += ` bento-${catKey}`;
    }
    if (cat.id === currentCat) classes += ' active';

    return `
      <div class="${classes}" data-cat="${cat.id}" data-stagger style="--i:${i}"
           onclick="filterCat('${cat.id}')"
           onkeydown="if(event.key==='Enter'||event.key===' ')filterCat('${cat.id}')"
           role="button" tabindex="0" aria-label="Filtrar por ${cat.name}">
        <span class="bento-emoji">${cat.emoji}</span>
        <div class="bento-info">
          <span class="bento-name">${cat.name}</span>
          <span class="bento-count">${cat.subtitle}</span>
        </div>
      </div>
    `;
  }).join('');

  const countEl = document.getElementById('sfCategoriesCount');
  if (countEl) countEl.textContent = `${T.categories.length} secciones`;
}

// ─── RENDER MENU ─────────────────────────────────────────────────
function renderMenu(items) {
  const list = document.getElementById('menuList');
  if (!list) return;
  list.innerHTML = '';

  const T = INDUSTRY_TEMPLATES[CURRENT_INDUSTRY];
  const unitLabel = T ? T.unitLabel : 'unidad';

  items.forEach((item, index) => {
    const qty = cart[item.id] || 0;
    const inCart = qty > 0;

    const controls = inCart
      ? `<button class="qty-btn" onclick="changeQty(${item.id},-1)">−</button>
         <div class="qty-num" id="qn-${item.id}">${qty}</div>
         <button class="qty-btn" onclick="changeQty(${item.id},1)">+</button>`
      : `<button class="qty-add-btn" onclick="addItem(${item.id})">+</button>`;

    const tags = item.tags
      .map(t => `<div class="item-tag ${t === 'spicy' ? 'spicy' : (t === 'popular' || t === 'pop') ? 'pop' : ''}">${tagLabel(t)}</div>`)
      .join('');

    list.innerHTML += `
      <div class="menu-item ${inCart ? 'in-cart' : ''}" id="mi-${item.id}" style="animation-delay: ${index * 0.04}s" onclick="openProductDetail(${item.id})">
        <div class="item-photo">
          ${photoHTML(item.img, item.emoji, item.name)}
        </div>
        <div class="item-info">
          <div class="item-name">${escapeHTML(item.name)}</div>
          <div class="item-desc">${escapeHTML(item.desc)}</div>
          <div class="item-tags">${tags}</div>
          <div class="item-footer">
            <div class="item-price">${formatPrice(item.price)}</div>
            <div class="item-controls" id="ctrl-${item.id}" onclick="event.stopPropagation()">${controls}</div>
          </div>
        </div>
      </div>`;
  });
}

// ─── FEATURED ────────────────────────────────────────────────────
function renderFeatured() {
  const top = MENU.filter(i => i.hot).slice(0, 5);
  const s = document.getElementById('featScroll');
  if (!s) return;

  s.innerHTML = top.map(item => `
    <div class="feat-card" onclick="openProductDetail(${item.id})">
      <div class="feat-img">
        ${item.hot ? '<div class="feat-hot">🔥 TOP</div>' : ''}
        <div class="img-skeleton"></div>
        <img src="${item.img}" alt="${item.name}" loading="lazy"
          onload="this.previousElementSibling.remove()"
          onerror="this.previousElementSibling.remove(); this.style.display='none'; this.nextElementSibling.style.opacity='1';">
        <div class="feat-img-fallback" style="opacity:0">${item.emoji}</div>
      </div>
      <div class="feat-body">
        <div class="feat-name">${escapeHTML(item.name)}</div>
        <div class="feat-desc">${escapeHTML(item.desc.substring(0, 48))}...</div>
        <div class="feat-footer">
          <div class="feat-price">${formatPrice(item.price)}</div>
          <button class="feat-add" onclick="event.stopPropagation();openProductDetail(${item.id})">+</button>
        </div>
      </div>
    </div>`).join('');

  document.getElementById('fsFeat').style.display = 'block';
}

// ─── CATEGORY FILTER ─────────────────────────────────────────────
function filterCat(cat) {
  currentCat = cat;
  document.querySelectorAll('.bento-card').forEach(p => {
    p.classList.toggle('active', p.dataset.cat === cat);
  });

  const T = INDUSTRY_TEMPLATES[CURRENT_INDUSTRY];
  const items = cat === 'todos' ? MENU : MENU.filter(i => i.cat === cat);

  const menuTitle = document.getElementById('menuTitle');
  if (menuTitle) {
    const catDef = T ? T.categories.find(c => c.id === cat) : null;
    menuTitle.textContent = catDef ? `${catDef.emoji} ${catDef.name}` : (T ? T.menuLabel : 'Menú');
  }

  renderMenu(items);
  const fsFeat = document.getElementById('fsFeat');
  if (fsFeat) fsFeat.style.display = cat === 'todos' ? 'block' : 'none';
}

function filterMenu() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  if (!q) { filterCat(currentCat); return; }

  const items = MENU.filter(i =>
    i.name.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q)
  );
  const T = INDUSTRY_TEMPLATES[CURRENT_INDUSTRY];
  document.getElementById('menuTitle').textContent = `🔍 "${q}"`;
  if (items.length === 0) {
    document.getElementById('menuList').innerHTML = `
      <div class="empty-search">
        <div class="empty-search-emoji">🔍</div>
        <div class="empty-search-text">Sin resultados para "${q}"</div>
        <div class="empty-search-sub">Probá con otro término o revisá las categorías</div>
      </div>`;
    return;
  }
  renderMenu(items);
}

// ─── CART ACTIONS ─────────────────────────────────────────────────
function addItem(id) {
  const item = MENU.find(i => i.id === id);
  const T = INDUSTRY_TEMPLATES[CURRENT_INDUSTRY];
  if (item && item.isPack && T && T.hasPackSelector) {
    openEmpanadasSelector(item.packSize, item);
    return;
  }
  cart[id] = (cart[id] || 0) + 1;
  updateAll(id);
  spawnParticle(id);
  showToast(`${item.emoji} ${item.name} agregado`);
}

function changeQty(id, delta) {
  if (cart[id] && typeof cart[id] === 'object') {
    cart[id].qty = Math.max(0, cart[id].qty + delta);
    if (cart[id].qty === 0) delete cart[id];
  } else {
    cart[id] = Math.max(0, (cart[id] || 0) + delta);
    if (cart[id] === 0) delete cart[id];
  }
  updateAll(id);
}

function removeItem(id) {
  delete cart[id];
  delete productNotes[id];
  updateAll(id);
}

function updateAll(changedId) {
  if (typeof changedId === 'string' && changedId.startsWith('pack-')) {
    updateCartBadge();
    if (document.getElementById('cartPanel').classList.contains('open')) renderCartPanel();
    return;
  }

  const qty = cart[changedId] || 0;
  const ctrl = document.getElementById('ctrl-' + changedId);
  const mi = document.getElementById('mi-' + changedId);

  if (ctrl) {
    if (qty > 0) {
      ctrl.innerHTML = `
        <button class="qty-btn" onclick="changeQty(${changedId},-1)">−</button>
        <div class="qty-num" id="qn-${changedId}">${qty}</div>
        <button class="qty-btn" onclick="changeQty(${changedId},1)">+</button>`;
      mi.classList.add('in-cart');
    } else {
      ctrl.innerHTML = `<button class="qty-add-btn" onclick="addItem(${changedId})">+</button>`;
      mi.classList.remove('in-cart');
    }
  }

  updateCartBadge();
  if (document.getElementById('cartPanel').classList.contains('open')) renderCartPanel();
}

function getTotals() {
  let count = 0, total = 0;
  Object.entries(cart).forEach(([id, val]) => {
    if (typeof val === 'object' && val.productId) {
      count += val.qty;
      total += val.price * val.qty;
    } else {
      const item = MENU.find(i => i.id === parseInt(id));
      if (item) { count += val; total += item.price * val; }
    }
  });
  return { count, total };
}

function updateCartBadge() {
  const { count, total } = getTotals();
  document.getElementById('cartCount').textContent = count;
  document.getElementById('btnCount').textContent = count;
  document.getElementById('btnTotal').textContent = formatPrice(total);
  document.getElementById('orderBtn').classList.toggle('active', count > 0);
  const cc = document.getElementById('cartCount');
  cc.classList.remove('bump');
  void cc.offsetWidth;
  cc.classList.add('bump');
}

// ─── CART PANEL ───────────────────────────────────────────────────
function openCart() {
  document.getElementById('cartPanel').classList.add('open');
  document.getElementById('panelOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  renderCartPanel();
}

function closeCart() {
  document.getElementById('cartPanel').classList.remove('open');
  document.getElementById('panelOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function renderCartPanel() {
  const { count, total } = getTotals();
  const content = document.getElementById('cartContent');
  const form = document.getElementById('cartForm');
  const T = INDUSTRY_TEMPLATES[CURRENT_INDUSTRY];

  if (count === 0) {
    content.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-emoji">🛒</div>
        <div class="cart-empty-text">${T ? T.emptyCart : 'Tu carrito está vacío'}</div>
        <div class="cart-empty-sub">${T ? T.emptyCartSub : 'Navegá y agregá productos'}</div>
      </div>`;
    form.style.display = 'none';
    return;
  }

  let rows = '<div class="cart-list">';
  Object.entries(cart).forEach(([id, val]) => {
    const isPack = typeof val === 'object' && val.productId;
    const item = isPack ? MENU.find(i => i.id === val.productId) : MENU.find(i => i.id === parseInt(id));
    if (!item) return;

    const price = isPack ? val.price * val.qty : item.price * val;
    const qty = isPack ? val.qty : val;

    if (isPack) {
      const breakdownText = val.breakdown.map(b => `${b.qty}x ${b.name.split(' ')[0]}`).join(', ');
      rows += `
        <div class="cart-row">
          <div class="cart-row-photo" style="display:flex;align-items:center;justify-content:center;font-size:24px">${val.emoji}</div>
          <div class="cart-row-info">
            <div class="cart-row-name">${escapeHTML(val.name)}</div>
            <div class="cart-row-desc">${breakdownText}</div>
            <div class="cart-row-price">${formatPrice(price)}</div>
          </div>
          <div class="cart-row-controls">
            <button class="qty-btn" onclick="changeQty('${id}',-1)">−</button>
            <div class="qty-num">${qty}</div>
            <button class="qty-btn" onclick="changeQty('${id}',1)">+</button>
            <button class="qty-btn cart-remove-btn" onclick="removeItem('${id}')" title="Eliminar">🗑️</button>
          </div>
        </div>`;
    } else {
      const note = productNotes[id] || '';
      rows += `
        <div class="cart-row">
          <div class="cart-row-photo">
            <img src="${item.img}" alt="${item.name}"
              onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\'display:flex;align-items:center;justify-content:center;height:100%;font-size:24px\'>${item.emoji}</div>'">
          </div>
          <div class="cart-row-info">
            <div class="cart-row-name">${escapeHTML(item.name)}</div>
            ${note ? `<div class="cart-row-desc">📝 ${escapeHTML(note)}</div>` : ''}
            <div class="cart-row-price">${formatPrice(price)}</div>
          </div>
          <div class="cart-row-controls">
            <button class="qty-btn" onclick="changeQty(${id},-1)">−</button>
            <div class="qty-num">${qty}</div>
            <button class="qty-btn" onclick="changeQty(${id},1)">+</button>
            <button class="qty-btn cart-remove-btn" onclick="removeItem(${id})" title="Eliminar">🗑️</button>
          </div>
        </div>`;
    }
  });
  rows += '</div>';

  if (T && T.hasCrossSell) rows += getCrossSellSuggestionsHtml();

  const envio = deliveryMode === 'delivery' ? 500 : 0;
  rows += `<div class="cart-subtotal"><span>Subtotal</span><span>${formatPrice(total)}</span></div>`;
  if (T && T.deliveryToggle) {
    rows += `<div class="cart-subtotal"><span>Envío ${deliveryMode === 'delivery' ? '🛵' : '🏃 Gratis (retiro)'}</span><span>${envio ? formatPrice(envio) : '$0'}</span></div>`;
  }
  rows += `<div class="cart-total"><span>Total</span><span>${formatPrice(total + (T && T.deliveryToggle ? envio : 0))}</span></div>`;
  rows += '<div style="height:14px"></div>';

  content.innerHTML = rows;
  form.style.display = 'block';

  if (T && T.deliveryToggle) {
    document.getElementById('addressSection').style.display = deliveryMode === 'delivery' ? 'block' : 'none';
  } else {
    document.getElementById('addressSection').style.display = 'none';
  }
}

// ─── INFO PANEL ───────────────────────────────────────────────────
function openInfoModal() {
  document.getElementById('infoPanel').classList.add('open');
  document.getElementById('infoOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeInfoModal() {
  document.getElementById('infoPanel').classList.remove('open');
  document.getElementById('infoOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ─── DELIVERY MODE ────────────────────────────────────────────────
function setDelivery(mode) {
  deliveryMode = mode;
  document.getElementById('dBtn1').classList.toggle('active', mode === 'delivery');
  document.getElementById('dBtn2').classList.toggle('active', mode === 'takeaway');
  renderCartPanel();
}

// ─── WHATSAPP ─────────────────────────────────────────────────────
function handleOrderRedirection(redirectUrl, isManual = false) {
  const overlay = document.getElementById('celebrationOverlay');
  if (!overlay || !overlay.classList.contains('open')) return;

  if (isManual) {
    window.open(redirectUrl, '_blank');
    showToast('📲 Abriendo WhatsApp...');
  } else {
    window.location.href = redirectUrl;
  }

  setTimeout(() => {
    cart = {};
    productNotes = {};
    updateCartBadge();
    overlay.classList.remove('open');
    setPaymentMethod('cash');
    ['fNombre', 'fTel', 'fDir', 'fNota'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const phoneInput = document.getElementById('fTel');
    if (phoneInput) phoneInput.classList.remove('valid');
    const status = document.getElementById('phoneValidationStatus');
    if (status) { status.classList.remove('valid'); status.innerHTML = ''; }
  }, 1000);
}

function sendWhatsApp() {
  if (!validateForm()) {
    showToast('⚠️ Corregí los campos marcados en rojo antes de enviar');
    return;
  }

  const T = INDUSTRY_TEMPLATES[CURRENT_INDUSTRY];
  const nombre = document.getElementById('fNombre').value.trim();
  const tel = document.getElementById('fTel').value.trim();
  const dir = document.getElementById('fDir').value.trim();
  const nota = document.getElementById('fNota').value.trim();
  const { total } = getTotals();
  const envio = (T && T.deliveryToggle && deliveryMode === 'delivery') ? 500 : 0;
  const orderID = generateOrderID();
  const prefix = T ? T.orderMsgPrefix : 'PEDIDO';

  let msg = `📋 *${prefix} - ${customBrandName}*\n`;
  msg += `🆔 *ID del Pedido:* ${orderID}\n\n`;
  msg += `👤 *Cliente:* ${escapeHTML(nombre)}\n`;
  msg += `📞 *Tel:* ${escapeHTML(tel)}\n`;

  if (T && T.deliveryToggle) {
    msg += deliveryMode === 'delivery'
      ? `📍 *Dirección:* ${escapeHTML(dir)}\n`
      : `🏃 *Modalidad:* Retiro en local\n`;
  }

  let payLabel = '';
  if (paymentMethod === 'cash') {
    payLabel = '💵 Efectivo';
    if (cashChange) payLabel += ` (Paga con $${cashChange} - Llevar cambio)`;
  } else if (paymentMethod === 'transfer') {
    const alias = document.getElementById('bankAlias')?.value || 'TUPEDIDO.MP';
    const cbu = document.getElementById('bankCbu')?.value || '0000003100054321987654';
    payLabel = '📱 Transferencia\n     Alias: ' + alias + '\n     CBU: ' + cbu;
  }
  msg += `💳 *Método de Pago:* ${payLabel}\n`;
  msg += `\n🛒 *Detalle del pedido:*\n`;

  Object.entries(cart).forEach(([id, val]) => {
    if (typeof val === 'object' && val.productId) {
      const flavors = val.breakdown.map(b => `${b.qty}x ${b.name}`).join(', ');
      msg += `  • ${val.qty}x ${val.name} — ${formatPrice(val.price * val.qty)}\n`;
      msg += `    ↳ Sabores: [${flavors}]\n`;
    } else {
      const item = MENU.find(i => i.id === parseInt(id));
      if (item) {
        msg += `  • ${val}x ${item.name} — ${formatPrice(item.price * val)}\n`;
        if (productNotes[id]) msg += `    ↳ Nota: ${productNotes[id]}\n`;
      }
    }
  });

  if (T && T.deliveryToggle && deliveryMode === 'delivery') msg += `\n🛵 Envío: ${formatPrice(envio)}\n`;
  msg += `💰 *TOTAL: ${formatPrice(total + envio)}*\n`;
  if (nota) msg += `\n📝 *Notas:* ${escapeHTML(nota)}`;

  saveLastOrder();
  const redirectUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;

  const orderIdEl = document.getElementById('celebrationOrderID');
  if (orderIdEl) orderIdEl.textContent = orderID;

  const overlay = document.getElementById('celebrationOverlay');
  if (overlay) { overlay.classList.add('open'); triggerConfetti(); }
  closeCart();

  const manualBtn = document.getElementById('manualRedirectBtn');
  if (manualBtn) {
    manualBtn.onclick = function() {
      clearTimeout(redirectTimer);
      handleOrderRedirection(redirectUrl, true);
    };
  }

  clearTimeout(redirectTimer);
  redirectTimer = setTimeout(() => {
    if (overlay && overlay.classList.contains('open')) handleOrderRedirection(redirectUrl, false);
  }, 3500);
}

// ─── BUSINESS INFO BAR ──────────────────────────────────────────
function renderBusinessBar() {
  const row = document.getElementById('businessInfoRow');
  if (!row) return;
  const tenant = TENANTS.demo;

  const hasAddress = tenant.address && tenant.address.trim();
  const hasHours = tenant.hours && tenant.hours.trim();
  const hasSocial = tenant.social && (tenant.social.instagram || tenant.social.facebook || tenant.social.whatsapp);

  if (!hasAddress && !hasHours && !hasSocial) {
    row.innerHTML = '<span class="biz-placeholder">Acá van los datos y logo de tu negocio — dirección, redes, horarios</span>';
    return;
  }

  const items = [];

  if (hasAddress) {
    items.push(`<span class="biz-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg><span>${escapeHTML(tenant.address)}</span></span>`);
  }

  if (hasHours) {
    if (items.length) items.push('<span class="biz-dot"></span>');
    items.push(`<span class="biz-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span>${escapeHTML(tenant.hours)}</span></span>`);
  }

  if (hasSocial) {
    const links = [];
    if (tenant.social.instagram) {
      links.push(`<a href="${escapeHTML(tenant.social.instagram)}" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg> Instagram</a>`);
    }
    if (tenant.social.facebook) {
      links.push(`<a href="${escapeHTML(tenant.social.facebook)}" target="_blank" rel="noopener" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>`);
    }
    if (links.length) {
      if (items.length) items.push('<span class="biz-dot"></span>');
      items.push(`<span class="biz-item">${links.join(' ')}</span>`);
    }
  }

  row.innerHTML = items.join('');
}

// ─── HERO BACKGROUND IMAGE ─────────────────────────────────────
function renderHeroBg() {
  const bg = document.querySelector('.hero-banner-bg');
  if (!bg) return;
  const img = TENANTS.demo.heroImage;
  if (img && img.trim()) {
    bg.style.setProperty('background-image', `url(${JSON.stringify(img.trim())})`);
    bg.style.setProperty('background-size', 'cover');
    bg.style.setProperty('background-position', 'center');
    bg.style.setProperty('opacity', '0.15');
  } else {
    bg.style.setProperty('background-image', '');
    bg.style.setProperty('background-size', '');
    bg.style.setProperty('background-position', '');
    bg.style.setProperty('opacity', '0.06');
  }
}

// ─── LIVE BRAND CUSTOMIZER ───────────────────────────────────────
function updateLiveBrandName(val) {
  const trimmed = val.trim();
  customBrandName = trimmed || 'TuPedido';
  localStorage.setItem('customBrandName', customBrandName);
  const headerBrand = document.getElementById('headerBrandName');
  if (headerBrand) headerBrand.textContent = customBrandName;
  const adBrand = document.getElementById('adBrandName');
  if (adBrand) adBrand.textContent = customBrandName;
}

function changeTheme(primary, secondary, el, silent = false) {
  document.documentElement.style.setProperty('--brand', primary);
  document.documentElement.style.setProperty('--brand2', secondary);
  const r1 = hexToRgb(primary);
  const r2 = hexToRgb(secondary);
  document.documentElement.style.setProperty('--brand-rgb', `${r1.r}, ${r1.g}, ${r1.b}`);
  document.documentElement.style.setProperty('--brand2-rgb', `${r2.r}, ${r2.g}, ${r2.b}`);
  document.querySelectorAll('.color-pill').forEach(pill => pill.classList.remove('active'));
  if (el) el.classList.add('active');
  if (!silent) showToast('🎨 ¡Estilo visual actualizado!');
}

// ─── INFO POPOVER ──────────────────────────────────────────────
const INFO_MESSAGES = {
  brand: 'Este espacio muestra el <strong>logo y nombre de tu marca</strong>. Se personaliza con tus colores e identidad visual.',
  hero: 'Este es el <strong>módulo principal de presentación</strong>. Acá va tu eslogan, descripción y buscador de productos.',
  promos: 'Estos son <strong>banners publicitarios personalizables</strong>. Cada uno puede redirigir a tu web, Instagram o WhatsApp.',
  categories: 'Acá se muestran las <strong>categorías de tus productos</strong> según tu rubro.',
  featured: 'Esta sección destaca tus <strong>productos más vendidos</strong> o los que quieras promocionar.',
  menu: 'Este es el <strong>catálogo completo de tu negocio</strong>. Cada producto puede incluir foto, descripción y precio.',
};

function toggleInfoPopover(event) {
  event.stopPropagation();
  const btn = event.currentTarget;
  const key = btn.dataset.info;
  const popover = document.getElementById('infoPopover');
  const overlay = document.getElementById('infoPopoverOverlay');
  const content = document.getElementById('infoPopoverContent');
  if (popover.classList.contains('show')) { closeInfoPopover(); return; }
  content.innerHTML = INFO_MESSAGES[key] || '';
  const rect = btn.getBoundingClientRect();
  const popW = 280;
  let left = rect.left + rect.width / 2 - popW / 2;
  if (left < 12) left = 12;
  if (left + popW > window.innerWidth - 12) left = window.innerWidth - popW - 12;
  popover.style.left = left + 'px';
  popover.style.top = (rect.bottom + 10) + 'px';
  popover.style.setProperty('--arrow-left', (rect.left - left + rect.width / 2 - 6) + 'px');
  popover.classList.add('show');
  overlay.classList.add('show');
}

function closeInfoPopover() {
  document.getElementById('infoPopover').classList.remove('show');
  document.getElementById('infoPopoverOverlay').classList.remove('show');
}

// ─── TOAST ───────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

// ─── PARTICLES ───────────────────────────────────────────────────
function spawnParticle(id) {
  const el = document.getElementById('mi-' + id);
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const p = document.createElement('div');
  p.className = 'particle';
  p.textContent = MENU.find(i => i.id === id).emoji;
  p.style.left = (rect.left + rect.width / 2 - 12) + 'px';
  p.style.top = (rect.top + window.scrollY) + 'px';
  document.body.appendChild(p);
  setTimeout(() => p.remove(), 800);
}

// ─── CONFETTI ────────────────────────────────────────────────────
function triggerConfetti() {
  const colors = ['#FF007F', '#00AAFF', '#FFB800', '#25D366', '#FF416C', '#F37335'];
  const card = document.querySelector('.celebration-card');
  if (!card) return;
  const rect = card.getBoundingClientRect();
  const startX = rect.width / 2;
  const startY = 70;
  for (let i = 0; i < 70; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-particle';
    const shapeType = Math.floor(Math.random() * 4);
    if (shapeType === 0) {
      p.style.width = Math.floor(Math.random() * 8 + 6) + 'px';
      p.style.height = Math.floor(Math.random() * 8 + 6) + 'px';
      p.style.borderRadius = '50%';
      p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    } else if (shapeType === 1) {
      p.style.width = Math.floor(Math.random() * 10 + 6) + 'px';
      p.style.height = Math.floor(Math.random() * 6 + 4) + 'px';
      p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    } else if (shapeType === 2) {
      const emojis = ['🎉', '✨', '🥳'];
      p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      p.style.fontSize = Math.floor(Math.random() * 12 + 10) + 'px';
    } else {
      p.style.width = Math.floor(Math.random() * 8 + 5) + 'px';
      p.style.height = Math.floor(Math.random() * 8 + 5) + 'px';
      p.style.transform = 'rotate(45deg)';
      p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    }
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 180 + 50;
    p.style.left = startX + 'px';
    p.style.top = startY + 'px';
    p.style.setProperty('--x-burst', `${Math.cos(angle) * distance}px`);
    p.style.setProperty('--y-burst', `${Math.sin(angle) * distance - 30}px`);
    p.style.setProperty('--x-drift', `${(Math.random() - 0.5) * 80}px`);
    p.style.animationDelay = (Math.random() * 0.25) + 's';
    card.appendChild(p);
    setTimeout(() => p.remove(), 3200);
  }
}

// ─── PROMO CLICK / AUTO-SCROLL ──────────────────────────────────
function handlePromoClick(type) {
  const targets = { web: '🌐 Sitio web', ig: '📸 Instagram', wa: '💬 WhatsApp' };
  showToast(`${targets[type] || '🔗 Enlace'} — Simulación de redirección.`);
}

function initPromoAutoScroll() {
  const scroll = document.getElementById('promoScroll');
  const dots = document.getElementById('promoDots');
  if (!scroll || !dots) return;
  const cards = scroll.querySelectorAll('.promo-card');
  if (cards.length < 2) return;
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'promo-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Ir al banner ' + (i + 1));
    dot.addEventListener('click', () => scroll.scrollTo({ left: i * (cards[0].offsetWidth + 12), behavior: 'smooth' }));
    dots.appendChild(dot);
  });
  cards.forEach(c => { const clone = c.cloneNode(true); clone.setAttribute('aria-hidden', 'true'); scroll.appendChild(clone); });
  function syncDots() {
    const idx = Math.round(scroll.scrollLeft / (cards[0].offsetWidth + 12));
    const clamped = Math.min(Math.max(idx, 0), cards.length - 1);
    dots.querySelectorAll('.promo-dot').forEach((d, i) => d.classList.toggle('active', i === clamped));
  }
  let animId, speed = 0.4, isPaused = false;
  function step() {
    if (!isPaused) {
      scroll.scrollLeft += speed;
      if (scroll.scrollLeft >= cards.length * (cards[0].offsetWidth + 12)) scroll.scrollLeft = 0;
      syncDots();
    }
    animId = requestAnimationFrame(step);
  }
  scroll.addEventListener('mouseenter', () => { isPaused = true; scroll.classList.add('paused'); });
  scroll.addEventListener('mouseleave', () => { isPaused = false; scroll.classList.remove('paused'); });
  scroll.addEventListener('touchstart', () => { isPaused = true; scroll.classList.add('paused'); }, { passive: true });
  scroll.addEventListener('touchend', () => { isPaused = false; scroll.classList.remove('paused'); }, { passive: true });
  animId = requestAnimationFrame(step);
}

// ─── SCROLL TO TOP ──────────────────────────────────────────────
function initScrollToTop() {
  const btn = document.getElementById('scrollTopBtn');
  if (!btn) return;
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => { btn.classList.toggle('show', window.scrollY > 400); ticking = false; });
      ticking = true;
    }
  });
}
function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

// ─── SCROLL OBSERVER ─────────────────────────────────────────────
function initScrollObserver() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-section').forEach(el => observer.observe(el));
}

// ─── SPLASH ──────────────────────────────────────────────────────
function hideSplash() {
  const splash = document.getElementById('splash');
  if (!splash || splash.classList.contains('implode')) return;
  splash.classList.add('implode');
  setTimeout(() => {
    splash.style.display = 'none';
    document.body.style.overflow = '';
  }, 1200);
}

function runSplashSequence() {
  const splashName = document.getElementById('splashBrandName');
  if (splashName) splashName.textContent = customBrandName || 'Tu Marca';

  // Safety: force hide after 8s no matter what
  const safetyTimer = setTimeout(hideSplash, 8000);

  // Click/tap to skip
  const splash = document.getElementById('splash');
  if (splash) splash.addEventListener('click', () => { clearTimeout(safetyTimer); hideSplash(); }, { once: true });

  // Stagger animations
  document.querySelector('.splash-logo-wrap').classList.add('visible');
  setTimeout(() => document.querySelector('.splash-title-wrap').classList.add('visible'), 1200);
  setTimeout(() => document.querySelector('.st-1')?.classList.add('visible'), 2600);
  setTimeout(() => document.querySelector('.st-2')?.classList.add('visible'), 3400);
  setTimeout(() => document.querySelector('.splash-loader')?.classList.add('visible'), 4200);

  // Auto-hide after animation completes
  setTimeout(() => { clearTimeout(safetyTimer); hideSplash(); }, 5400);
}

// ─── PRODUCT DETAIL ──────────────────────────────────────────────
function openProductDetail(id) {
  const product = MENU.find(i => i.id === id);
  if (!product) return;
  detailActiveProduct = product;
  detailTempQty = (cart[id] && typeof cart[id] !== 'object') ? cart[id] : 1;

  const qtyVal = document.getElementById('detailQtyVal');
  if (qtyVal) qtyVal.textContent = detailTempQty;

  const imgContainer = document.getElementById('detailProductImageContainer');
  if (imgContainer) {
    imgContainer.innerHTML = product.img
      ? `<div class="img-skeleton"></div>
         <img src="${product.img}" alt="${product.name}"
           onload="this.previousElementSibling.remove()"
           onerror="this.previousElementSibling.remove(); this.style.display='none'; this.nextElementSibling.style.opacity='1';">
         <div class="detail-header-fallback" style="opacity:0">${product.emoji}</div>`
      : `<div class="detail-header-fallback">${product.emoji}</div>`;
  }

  setText('detailProductTitle', product.name);
  setText('detailProductDesc', product.desc);
  setText('detailProductPrice', formatPrice(product.price));
  setText('detailProductRating', `⭐ ${product.rating || '4.8'}`);

  const tagEl = document.getElementById('detailProductTag');
  if (tagEl) tagEl.textContent = tagLabel(product.cat);

  const badgeEl = document.getElementById('detailProductBadge');
  if (badgeEl) {
    badgeEl.textContent = product.hot ? '🔥 MÁS PEDIDOS' : '⭐ RECOMENDADO';
    badgeEl.style.display = 'block';
  }

  const noteInput = document.getElementById('detailProductNote');
  if (noteInput) noteInput.value = productNotes[product.id] || '';

  const T = INDUSTRY_TEMPLATES[CURRENT_INDUSTRY];
  const packNotice = document.getElementById('detailProductPackNotice');
  const counterWrap = document.getElementById('detailCounterWrapper');
  const confirmBtnLabel = document.getElementById('detailActionLabel');

  if (product.isPack && T && T.hasPackSelector) {
    if (packNotice) packNotice.style.display = 'flex';
    if (counterWrap) counterWrap.style.display = 'none';
    if (confirmBtnLabel) confirmBtnLabel.textContent = 'Armar Pack';
  } else {
    if (packNotice) packNotice.style.display = 'none';
    if (counterWrap) counterWrap.style.display = 'flex';
    if (confirmBtnLabel) confirmBtnLabel.textContent = cart[id] ? 'Actualizar cantidad' : (T ? `Agregar al ${T.unitLabel}` : 'Agregar al pedido');
  }

  updateDetailActionTotal();
  document.getElementById('productDetailPanel').classList.add('open');
  document.getElementById('productDetailOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeProductDetail() {
  document.getElementById('productDetailPanel').classList.remove('open');
  document.getElementById('productDetailOverlay').classList.remove('open');
  document.body.style.overflow = '';
  detailActiveProduct = null;
}

function adjustDetailQty(delta) {
  if (!detailActiveProduct) return;
  detailTempQty = Math.max(1, detailTempQty + delta);
  const qtyVal = document.getElementById('detailQtyVal');
  if (qtyVal) {
    qtyVal.textContent = detailTempQty;
    qtyVal.classList.remove('bump');
    void qtyVal.offsetWidth;
    qtyVal.classList.add('bump');
  }
  updateDetailActionTotal();
}

function updateDetailActionTotal() {
  if (!detailActiveProduct) return;
  const totalEl = document.getElementById('detailActionTotal');
  if (totalEl) totalEl.textContent = formatPrice(detailActiveProduct.price * detailTempQty);
}

function confirmProductDetail() {
  if (!detailActiveProduct) return;
  const product = detailActiveProduct;
  const T = INDUSTRY_TEMPLATES[CURRENT_INDUSTRY];

  if (product.isPack && T && T.hasPackSelector) {
    closeProductDetail();
    openEmpanadasSelector(product.packSize, product);
    return;
  }

  const noteInput = document.getElementById('detailProductNote');
  const note = noteInput ? noteInput.value.trim() : '';
  cart[product.id] = detailTempQty;
  if (note) productNotes[product.id] = note;
  else delete productNotes[product.id];
  updateAll(product.id);
  closeProductDetail();
  spawnParticle(product.id);
  showToast(`🛒 Carrito actualizado: ${product.name}`);
}

// ─── EMPANADAS PACK SELECTOR ────────────────────────────────────
function adjustTempFlavor(flavorId, delta) {
  const total = getTempTotalSelections();
  const currentQty = tempPackSelections[flavorId] || 0;
  if (delta > 0 && total >= activePackSize) { showToast(`⚠️ Ya completaste las ${activePackSize} unidades`); return; }
  if (delta < 0 && currentQty <= 0) return;
  tempPackSelections[flavorId] = currentQty + delta;
  document.getElementById(`tempQty-${flavorId}`).textContent = tempPackSelections[flavorId];
  updateEmpanadasProgress();
}

function getTempTotalSelections() { return Object.values(tempPackSelections).reduce((a, b) => a + b, 0); }

function openEmpanadasSelector(size, item) {
  activePackSize = size;
  activePackProduct = item;
  tempPackSelections = {};
  const T = INDUSTRY_TEMPLATES[CURRENT_INDUSTRY];
  const unitLabel = T ? T.unitLabel : 'unidad';
  const packList = MENU.filter(i => i.cat === item.cat && !i.isPack);

  document.getElementById('empanadasModalTitle').textContent = `Armá tu pack (${size} ${unitLabel}s)`;

  const modalList = document.getElementById('empanadasModalList');
  modalList.innerHTML = packList.map(flavor => {
    tempPackSelections[flavor.id] = 0;
    return `
      <div class="empanadas-modal-row">
        <div class="empanadas-modal-info">
          <div class="empanadas-modal-name">${escapeHTML(flavor.name)}</div>
          <div class="empanadas-modal-desc">${escapeHTML(flavor.desc)}</div>
        </div>
        <div class="empanadas-modal-controls">
          <button class="qty-btn" onclick="adjustTempFlavor(${flavor.id}, -1)">−</button>
          <div class="empanadas-modal-qty" id="tempQty-${flavor.id}">0</div>
          <button class="qty-btn" onclick="adjustTempFlavor(${flavor.id}, 1)">+</button>
        </div>
      </div>`;
  }).join('');

  updateEmpanadasProgress();
  document.getElementById('empanadasModal').classList.add('open');
  document.getElementById('empanadasModalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeEmpanadasSelector() {
  document.getElementById('empanadasModal').classList.remove('open');
  document.getElementById('empanadasModalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function updateEmpanadasProgress() {
  const total = getTempTotalSelections();
  const pct = Math.min(100, Math.round((total / activePackSize) * 100));
  document.getElementById('empanadasProgressText').textContent = `Llevás ${total} de ${activePackSize} unidades`;
  document.getElementById('empanadasProgressPct').textContent = `${pct}%`;
  document.getElementById('empanadasProgressBar').style.width = `${pct}%`;
  const confirmBtn = document.getElementById('empanadasConfirmBtn');
  if (confirmBtn) confirmBtn.disabled = (total !== activePackSize);
}

function confirmEmpanadasPack() {
  if (getTempTotalSelections() !== activePackSize) return;
  const breakdown = Object.entries(tempPackSelections)
    .filter(([id, qty]) => qty > 0)
    .map(([id, qty]) => ({ id: parseInt(id), name: MENU.find(i => i.id === parseInt(id)).name, qty }));
  const packId = `pack-${activePackProduct.id}-${Date.now()}`;
  cart[packId] = { productId: activePackProduct.id, name: activePackProduct.name, price: activePackProduct.price, emoji: activePackProduct.emoji, breakdown, qty: 1 };
  updateCartBadge();
  closeEmpanadasSelector();
  showToast(`📦 Pack agregado`);
}

// ─── CROSS SELLING ──────────────────────────────────────────────
function getCrossSellSuggestionsHtml() {
  let hasFood = false, hasDrinks = false, hasDesserts = false;
  Object.entries(cart).forEach(([id, val]) => {
    let cat = '';
    if (typeof val === 'object' && val.productId) { const item = MENU.find(i => i.id === val.productId); if (item) cat = item.cat; }
    else { const item = MENU.find(i => i.id === parseInt(id)); if (item) cat = item.cat; }
    if (cat === 'pizzas' || cat === 'empanadas') hasFood = true;
    if (cat === 'bebidas') hasDrinks = true;
    if (cat === 'postres') hasDesserts = true;
  });
  if (!hasFood) return '';
  let suggestCat = '', title = '', icon = '';
  if (!hasDrinks) { suggestCat = 'bebidas'; title = '🥤 ¡Completá tu pedido! Agregá una bebida:'; icon = '🥤'; }
  else if (!hasDesserts) { suggestCat = 'postres'; title = '🍰 ¿Un antojo dulce para terminar?'; icon = '🍰'; }
  else return '';

  const suggestedItems = MENU.filter(item => item.cat === suggestCat && !cart[item.id]).slice(0, 3);
  if (suggestedItems.length === 0) return '';

  let html = `<div class="cross-sell-section"><div class="cross-sell-header">${icon} ${title}</div><div class="cross-sell-carousel">`;
  suggestedItems.forEach(item => {
    html += `
      <div class="cross-sell-card">
        <img class="cross-sell-img" src="${item.img}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block'">
        <div style="display:none;font-size:18px;margin-right:4px">${item.emoji}</div>
        <div class="cross-sell-info">
          <div class="cross-sell-title" title="${escapeHTML(item.name)}">${escapeHTML(item.name)}</div>
          <div class="cross-sell-price">${formatPrice(item.price)}</div>
        </div>
        <button class="cross-sell-add" onclick="addItem(${item.id})">+</button>
      </div>`;
  });
  html += `</div></div>`;
  return html;
}

// ─── REPEAT ORDER ────────────────────────────────────────────────
function saveLastOrder() {
  try {
    localStorage.setItem('lastOrder', JSON.stringify({
      cart, nombre: document.getElementById('fNombre').value.trim(),
      tel: document.getElementById('fTel').value.trim(), dir: document.getElementById('fDir').value.trim(),
      nota: document.getElementById('fNota').value.trim(), paymentMethod, deliveryMode
    }));
  } catch(e) { handleError('guardar última orden', e); }
}

function checkLastOrderBanner() {
  const banner = document.getElementById('repeatOrderBanner');
  if (!banner) return;
  const raw = localStorage.getItem('lastOrder');
  if (!raw) { banner.style.display = 'none'; return; }
  try {
    const order = JSON.parse(raw);
    let total = 0;
    Object.entries(order.cart).forEach(([id, val]) => {
      if (typeof val === 'object' && val.productId) total += val.price * val.qty;
      else { const item = MENU.find(i => i.id === parseInt(id)); if (item) total += item.price * val; }
    });
    if (total === 0) { banner.style.display = 'none'; return; }
    const T = INDUSTRY_TEMPLATES[CURRENT_INDUSTRY];
    const envio = (T && T.deliveryToggle && order.deliveryMode === 'delivery') ? 500 : 0;
    banner.innerHTML = `
      <div class="repeat-order-card" onclick="repeatLastOrder()">
        <div class="repeat-order-icon">🔄</div>
        <div class="repeat-order-content">
          <div class="repeat-order-title">¿Pedimos lo mismo de siempre?</div>
          <div class="repeat-order-desc">Reordená al instante tu último pedido.</div>
        </div>
        <div class="repeat-order-price">${formatPrice(total + envio)}</div>
      </div>`;
    banner.style.display = 'block';
  } catch(e) { handleError('recuperar última orden', e); banner.style.display = 'none'; }
}

function repeatLastOrder() {
  const raw = localStorage.getItem('lastOrder');
  if (!raw) return;
  try {
    const order = JSON.parse(raw);
    cart = order.cart;
    deliveryMode = order.deliveryMode || 'delivery';
    paymentMethod = order.paymentMethod || 'cash';
    const fNombre = document.getElementById('fNombre');
    const fTel = document.getElementById('fTel');
    const fDir = document.getElementById('fDir');
    const fNota = document.getElementById('fNota');
    if (fNombre) fNombre.value = order.nombre || '';
    if (fTel) { fTel.value = order.tel || ''; validatePhone(order.tel || ''); }
    if (fDir) fDir.value = order.dir || '';
    if (fNota) fNota.value = order.nota || '';
    setPaymentMethod(paymentMethod);
    updateCartBadge();
    openCart();
    showToast('🔄 ¡Último pedido y datos precargados!');
  } catch(e) { handleError('cargar última orden', e); showToast('⚠️ No pudimos recargar el pedido anterior.'); }
}

// ─── INIT ─────────────────────────────────────────────────────────
function init() {
  try {
    WA_NUMBER = TENANTS.demo.phone;
    MENU = TENANTS.demo.menu;
    CURRENT_INDUSTRY = TENANTS.demo.industry;

    changeTheme(TENANTS.demo.theme.brand, TENANTS.demo.theme.brand2, null, true);
    updateLiveBrandName(TENANTS.demo.name);

    const headerLogo = document.getElementById('headerBrandLogo');
    if (headerLogo) headerLogo.src = TENANTS.demo.logo || 'img/logo/logo.png';

    // Render landing page (hidden by default)
    renderLanding();

    // Default: show storefront directly
    showStorefrontDirect();

    checkLastOrderBanner();
    initScrollObserver();
    initPromoAutoScroll();
    initScrollToTop();
    setPaymentMethod('cash');

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        if (document.getElementById('productDetailPanel')?.classList.contains('open')) closeProductDetail();
        else if (document.getElementById('empanadasModal')?.classList.contains('open')) closeEmpanadasSelector();
        else if (document.getElementById('cartPanel')?.classList.contains('open')) closeCart();
        else if (document.getElementById('infoPanel')?.classList.contains('open')) closeInfoModal();
      }
    });
  } catch (e) {
    console.error('Init error:', e);
  }
  runSplashSequence();
}

init();
