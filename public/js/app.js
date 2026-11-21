// @ts-check

const store = {
  products: [],
  cart: [],
  wishlist: [],
  activeFilters: {
    category: 'All',
    search: '',
    maxPrice: 600,
    inStockOnly: false,
    sort: 'featured'
  },
  activeCoupon: null,
  selectedPayment: 'Credit Card',

  // Initialize Application
  init() {
    this.loadStorage();
    this.setupListeners();
    this.fetchProducts();
    this.updateCartBadge();
    this.updateWishlistBadge();
  },

  // Load cart and wishlist from localStorage
  loadStorage() {
    try {
      this.cart = JSON.parse(localStorage.getItem('novamart_cart') || '[]');
      this.wishlist = JSON.parse(localStorage.getItem('novamart_wishlist') || '[]');
    } catch (e) {
      this.cart = [];
      this.wishlist = [];
    }
  },

  saveCart() {
    localStorage.setItem('novamart_cart', JSON.stringify(this.cart));
    this.updateCartBadge();
    this.renderCart();
  },

  saveWishlist() {
    localStorage.setItem('novamart_wishlist', JSON.stringify(this.wishlist));
    this.updateWishlistBadge();
  },

  // Setup DOM Event Listeners
  setupListeners() {
    // Search input with debounce
    const searchInput = document.getElementById('search-input');
    const clearSearch = document.getElementById('clear-search');
    let searchDebounce;

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchDebounce);
        const val = e.target.value.trim();
        if (clearSearch) clearSearch.style.display = val ? 'block' : 'none';

        searchDebounce = setTimeout(() => {
          this.activeFilters.search = val;
          this.fetchProducts();
        }, 250);
      });
    }

    if (clearSearch && searchInput) {
      clearSearch.addEventListener('click', () => {
        searchInput.value = '';
        clearSearch.style.display = 'none';
        this.activeFilters.search = '';
        this.fetchProducts();
      });
    }

    // Category pills
    const catContainer = document.getElementById('category-pills');
    if (catContainer) {
      catContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.cat-btn');
        if (!btn) return;

        catContainer.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        this.activeFilters.category = btn.dataset.category || 'All';
        this.fetchProducts();
      });
    }

    // Price Slider
    const priceSlider = document.getElementById('price-slider');
    const priceVal = document.getElementById('price-slider-val');
    if (priceSlider && priceVal) {
      priceSlider.addEventListener('input', (e) => {
        priceVal.textContent = `$${e.target.value}`;
        this.activeFilters.maxPrice = parseFloat(e.target.value);
        this.fetchProducts();
      });
    }

    // In-stock Filter
    const stockCheck = document.getElementById('instock-filter');
    if (stockCheck) {
      stockCheck.addEventListener('change', (e) => {
        this.activeFilters.inStockOnly = e.target.checked;
        this.fetchProducts();
      });
    }

    // Sort Dropdown
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.activeFilters.sort = e.target.value;
        this.fetchProducts();
      });
    }

    // Cart Drawer Open/Close
    const btnCartNav = document.getElementById('btn-cart-nav');
    const btnCloseCart = document.getElementById('close-cart-btn');
    const drawerOverlay = document.getElementById('drawer-overlay');

    if (btnCartNav) btnCartNav.addEventListener('click', () => this.openCart());
    if (btnCloseCart) btnCloseCart.addEventListener('click', () => this.closeCart());
    if (drawerOverlay) drawerOverlay.addEventListener('click', () => {
      this.closeCart();
      this.closeAllModals();
    });

    // Wishlist Nav Button
    const btnWishNav = document.getElementById('btn-wishlist-nav');
    if (btnWishNav) {
      btnWishNav.addEventListener('click', () => {
        if (!this.wishlist.length) {
          this.toast('Your wishlist is empty. Tap the heart on items you love!', 'info');
          return;
        }
        this.toast(`You have ${this.wishlist.length} item(s) in your wishlist.`, 'info');
      });
    }

    // Track Nav Button
    const btnTrackNav = document.getElementById('btn-track-nav');
    if (btnTrackNav) {
      btnTrackNav.addEventListener('click', () => this.openTrackModal());
    }

    // Admin Nav Button
    const btnAdminNav = document.getElementById('btn-admin-nav');
    if (btnAdminNav) {
      btnAdminNav.addEventListener('click', () => this.openAdminModal());
    }

    // Hero deals button
    const btnHeroDeal = document.getElementById('btn-hero-deal');
    if (btnHeroDeal) {
      btnHeroDeal.addEventListener('click', () => {
        const sortSel = document.getElementById('sort-select');
        if (sortSel) sortSel.value = 'price_asc';
        this.activeFilters.sort = 'price_asc';
        this.fetchProducts();
        document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Coupon Apply Button
    const btnCoupon = document.getElementById('apply-coupon-btn');
    if (btnCoupon) {
      btnCoupon.addEventListener('click', () => this.applyCoupon());
    }

    // Proceed to Checkout Button
    const btnProceed = document.getElementById('btn-proceed-checkout');
    if (btnProceed) {
      btnProceed.addEventListener('click', () => this.proceedToCheckout());
    }
  },

  // Fetch Products from API with Active Filters
  async fetchProducts() {
    try {
      const params = new URLSearchParams();
      if (this.activeFilters.category && this.activeFilters.category !== 'All') {
        params.append('category', this.activeFilters.category);
      }
      if (this.activeFilters.search) {
        params.append('search', this.activeFilters.search);
      }
      if (this.activeFilters.maxPrice) {
        params.append('maxPrice', this.activeFilters.maxPrice.toString());
      }
      if (this.activeFilters.sort) {
        params.append('sort', this.activeFilters.sort);
      }

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        let list = data.products;
        if (this.activeFilters.inStockOnly) {
          list = list.filter(p => p.stock > 0);
        }
        this.products = list;
        this.renderProducts();
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      this.toast('Failed to load products. Check server connection.', 'error');
    }
  },

  // Render Product Cards
  renderProducts() {
    const grid = document.getElementById('products-grid');
    const countLabel = document.getElementById('results-count');
    if (!grid) return;

    if (countLabel) {
      countLabel.innerHTML = `Showing <strong>${this.products.length}</strong> items`;
    }

    if (!this.products.length) {
      grid.innerHTML = `
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <h3>No matching products found</h3>
          <p style="margin-top: 0.5rem;">Try adjusting your search terms or expanding the price filter.</p>
          <button class="btn-secondary" style="margin-top: 1rem;" onclick="store.resetFilters()">Reset All Filters</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = this.products.map(p => {
      const isWishlisted = this.wishlist.includes(p.id);
      const discountPct = p.original_price ? Math.round(((p.original_price - p.price) / p.original_price) * 100) : 0;
      const badgeClass = p.badge === 'Best Seller' ? 'bestseller' : (p.badge === 'Premium' ? 'premium' : '');

      return `
        <article class="product-card" data-id="${p.id}">
          <div class="card-img-wrap" onclick="store.openProductModal(${p.id})" style="cursor: pointer;">
            ${p.badge ? `<span class="badge-tag ${badgeClass}">${p.badge}</span>` : ''}
            <button class="wishlist-toggle ${isWishlisted ? 'active' : ''}" 
                    title="${isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}"
                    onclick="event.stopPropagation(); store.toggleWishlist(${p.id}, this)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
            <img src="${p.image}" alt="${p.title}" loading="lazy">
          </div>

          <div class="card-body">
            <span class="card-category">${p.category}</span>
            <h3 class="card-title" onclick="store.openProductModal(${p.id})" style="cursor: pointer;">${p.title}</h3>

            <div class="card-rating">
              <span>★</span> <strong>${p.rating.toFixed(1)}</strong>
              <span>(${p.reviews_count} reviews)</span>
            </div>

            ${p.stock <= 10 && p.stock > 0 
              ? `<div class="stock-indicator">⚡ Hurry, only ${p.stock} left in stock!</div>` 
              : (p.stock === 0 ? `<div class="stock-indicator" style="color: var(--danger);">✕ Currently Out of Stock</div>` : '')
            }

            <div class="card-footer">
              <div class="price-box">
                <div style="display: flex; align-items: baseline; gap: 0.4rem;">
                  <span class="current-price">$${p.price.toFixed(2)}</span>
                  ${p.original_price ? `<span class="original-price">$${p.original_price.toFixed(2)}</span>` : ''}
                </div>
                ${discountPct > 0 ? `<span style="font-size: 0.75rem; color: var(--success); font-weight: 700;">Save ${discountPct}%</span>` : ''}
              </div>

              <button class="btn-add-cart" onclick="store.addToCart(${p.id})" ${p.stock === 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                ${p.stock === 0 ? 'Out of Stock' : 'Add'}
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  },

  // Reset Filters
  resetFilters() {
    this.activeFilters = {
      category: 'All',
      search: '',
      maxPrice: 600,
      inStockOnly: false,
      sort: 'featured'
    };
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
    const slider = document.getElementById('price-slider');
    if (slider) slider.value = '600';
    const sliderVal = document.getElementById('price-slider-val');
    if (sliderVal) sliderVal.textContent = '$600';
    const stockCheck = document.getElementById('instock-filter');
    if (stockCheck) stockCheck.checked = false;
    const catContainer = document.getElementById('category-pills');
    if (catContainer) {
      catContainer.querySelectorAll('.cat-btn').forEach((b, i) => {
        b.classList.toggle('active', i === 0);
      });
    }
    this.fetchProducts();
  },

  // Category Filter Quick link
  filterCategory(catName) {
    this.activeFilters.category = catName;
    const catContainer = document.getElementById('category-pills');
    if (catContainer) {
      catContainer.querySelectorAll('.cat-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.category === catName);
      });
    }
    this.fetchProducts();
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
  },

  // Wishlist Handling
  toggleWishlist(productId, btnElement) {
    const idx = this.wishlist.indexOf(productId);
    if (idx > -1) {
      this.wishlist.splice(idx, 1);
      if (btnElement) {
        btnElement.classList.remove('active');
        btnElement.querySelector('svg')?.setAttribute('fill', 'none');
      }
      this.toast('Item removed from wishlist', 'info');
    } else {
      this.wishlist.push(productId);
      if (btnElement) {
        btnElement.classList.add('active');
        btnElement.querySelector('svg')?.setAttribute('fill', 'currentColor');
      }
      this.toast('Saved to wishlist!', 'success');
    }
    this.saveWishlist();
  },

  updateWishlistBadge() {
    const badge = document.getElementById('wishlist-count-badge');
    if (badge) badge.textContent = this.wishlist.length.toString();
  },

  // Cart Operations
  addToCart(productId, qty = 1) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    if (product.stock < 1) {
      this.toast(`Sorry, "${product.title}" is currently out of stock.`, 'error');
      return;
    }

    const existing = this.cart.find(i => i.id === productId);
    if (existing) {
      if (existing.quantity + qty > product.stock) {
        this.toast(`Only ${product.stock} units available in stock.`, 'error');
        return;
      }
      existing.quantity += qty;
    } else {
      this.cart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        stock: product.stock,
        quantity: qty
      });
    }

    this.saveCart();
    this.toast(`Added "${product.title}" to cart!`, 'success');
    this.openCart();
  },

  updateQty(productId, delta) {
    const item = this.cart.find(i => i.id === productId);
    if (!item) return;

    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      this.removeFromCart(productId);
      return;
    }

    if (newQty > item.stock) {
      this.toast(`Maximum available quantity reached (${item.stock}).`, 'error');
      return;
    }

    item.quantity = newQty;
    this.saveCart();
  },

  removeFromCart(productId) {
    this.cart = this.cart.filter(i => i.id !== productId);
    this.saveCart();
    this.toast('Item removed from cart', 'info');
  },

  clearCart() {
    this.cart = [];
    this.activeCoupon = null;
    this.saveCart();
  },

  // Calculate Cart Totals
  calculateTotals() {
    const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discount = 0;
    let freeShipping = subtotal >= 100;

    if (this.activeCoupon) {
      if (subtotal >= this.activeCoupon.minSpend) {
        if (this.activeCoupon.discountPercent > 0) {
          discount = (subtotal * this.activeCoupon.discountPercent) / 100;
        }
        if (this.activeCoupon.freeShipping) {
          freeShipping = true;
        }
      } else {
        this.activeCoupon = null;
      }
    }

    const shipping = (this.cart.length === 0 || freeShipping) ? 0 : 9.99;
    const taxable = Math.max(0, subtotal - discount);
    const tax = taxable > 0 ? parseFloat((taxable * 0.08).toFixed(2)) : 0;
    const total = parseFloat((taxable + shipping + tax).toFixed(2));

    return { subtotal, discount, shipping, tax, total, freeShipping };
  },

  // Update Cart Badges in Navbar
  updateCartBadge() {
    const countBadge = document.getElementById('cart-count-badge');
    const totalBadge = document.getElementById('cart-total-badge');
    const drawerCount = document.getElementById('cart-drawer-count');

    const totalCount = this.cart.reduce((s, i) => s + i.quantity, 0);
    const totals = this.calculateTotals();

    if (countBadge) countBadge.textContent = totalCount.toString();
    if (drawerCount) drawerCount.textContent = totalCount.toString();
    if (totalBadge) totalBadge.textContent = `$${totals.total.toFixed(2)}`;
  },

  // Render Cart Drawer
  renderCart() {
    const itemsList = document.getElementById('cart-items-list');
    const freeText = document.getElementById('free-shipping-text');
    const freeFill = document.getElementById('shipping-progress-fill');

    const subtotalVal = document.getElementById('cart-subtotal-val');
    const discountVal = document.getElementById('cart-discount-val');
    const discountRow = document.getElementById('discount-row');
    const shippingVal = document.getElementById('cart-shipping-val');
    const taxVal = document.getElementById('cart-tax-val');
    const grandTotalVal = document.getElementById('cart-grand-total-val');
    const couponPill = document.getElementById('applied-coupon-pill');

    if (!itemsList) return;

    if (!this.cart.length) {
      itemsList.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 0.75rem; color: var(--text-dim);">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <h4 style="font-size: 1.1rem; color: #fff; margin-bottom: 0.4rem;">Your cart is empty</h4>
          <p style="font-size: 0.85rem;">Discover our high-performance headphones, keyboards, and gear.</p>
        </div>
      `;
      if (freeFill) freeFill.style.width = '0%';
      if (freeText) freeText.textContent = 'Add $100.00 more to unlock FREE Express Shipping!';
      if (subtotalVal) subtotalVal.textContent = '$0.00';
      if (discountRow) discountRow.style.display = 'none';
      if (shippingVal) shippingVal.textContent = '$0.00';
      if (taxVal) taxVal.textContent = '$0.00';
      if (grandTotalVal) grandTotalVal.textContent = '$0.00';
      if (couponPill) couponPill.style.display = 'none';
      return;
    }

    // Render Items
    itemsList.innerHTML = this.cart.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.title}" class="cart-item-img">
        <div class="cart-item-info">
          <h4 class="cart-item-title">${item.title}</h4>
          <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)} ($${item.price.toFixed(2)} each)</div>
          <div class="cart-qty-ctrl">
            <button class="qty-btn" onclick="store.updateQty(${item.id}, -1)">−</button>
            <span class="qty-val">${item.quantity}</span>
            <button class="qty-btn" onclick="store.updateQty(${item.id}, 1)">+</button>
          </div>
        </div>
        <button class="cart-item-remove" title="Remove" onclick="store.removeFromCart(${item.id})">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    `).join('');

    // Totals calculations
    const totals = this.calculateTotals();

    // Free shipping bar
    const remaining = Math.max(0, 100 - totals.subtotal);
    const progress = Math.min(100, (totals.subtotal / 100) * 100);

    if (freeFill) freeFill.style.width = `${progress}%`;
    if (freeText) {
      if (remaining === 0 || totals.freeShipping) {
        freeText.innerHTML = `🎉 <strong>Congratulations!</strong> You unlocked FREE Express Shipping!`;
      } else {
        freeText.innerHTML = `Add <strong>$${remaining.toFixed(2)}</strong> more to unlock FREE Express Shipping!`;
      }
    }

    if (subtotalVal) subtotalVal.textContent = `$${totals.subtotal.toFixed(2)}`;
    
    if (totals.discount > 0) {
      if (discountRow) discountRow.style.display = 'flex';
      if (discountVal) discountVal.textContent = `-$${totals.discount.toFixed(2)}`;
    } else {
      if (discountRow) discountRow.style.display = 'none';
    }

    if (shippingVal) {
      shippingVal.textContent = totals.shipping === 0 ? 'FREE' : `$${totals.shipping.toFixed(2)}`;
    }

    if (taxVal) taxVal.textContent = `$${totals.tax.toFixed(2)}`;
    if (grandTotalVal) grandTotalVal.textContent = `$${totals.total.toFixed(2)}`;

    // Coupon Pill
    if (this.activeCoupon && couponPill) {
      couponPill.style.display = 'block';
      couponPill.textContent = `✓ Promo "${this.activeCoupon.code}" applied: ${this.activeCoupon.description}`;
    } else if (couponPill) {
      couponPill.style.display = 'none';
    }
  },

  // Apply Promo Coupon
  async applyCoupon() {
    const input = document.getElementById('coupon-code-input');
    const code = input ? input.value.trim().toUpperCase() : '';

    if (!code) {
      this.toast('Please enter a coupon code (e.g. SAVE20)', 'info');
      return;
    }

    const totals = this.calculateTotals();
    if (totals.subtotal === 0) {
      this.toast('Add items to cart before applying coupon.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/coupon/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal: totals.subtotal })
      });
      const data = await res.json();

      if (data.success) {
        this.activeCoupon = {
          code: data.code,
          discountPercent: data.discountPercent,
          discountAmount: data.discountAmount,
          freeShipping: data.freeShipping,
          description: data.description,
          minSpend: data.minSpend || 0
        };
        this.toast(`Coupon "${code}" applied successfully!`, 'success');
        this.renderCart();
      } else {
        this.toast(data.error || 'Invalid promo code', 'error');
      }
    } catch (e) {
      this.toast('Error validating promo code.', 'error');
    }
  },

  // Open & Close Cart
  openCart() {
    this.renderCart();
    document.getElementById('cart-drawer')?.classList.add('open');
    document.getElementById('drawer-overlay')?.classList.add('active');
  },

  closeCart() {
    document.getElementById('cart-drawer')?.classList.remove('open');
    document.getElementById('drawer-overlay')?.classList.remove('active');
  },

  // Open Product Details & Reviews Modal
  async openProductModal(productId) {
    try {
      const res = await fetch(`/api/products/${productId}`);
      const data = await res.json();

      if (!data.success) return;

      const p = data.product;
      const reviews = data.reviews || [];
      const content = document.getElementById('product-modal-content');
      const title = document.getElementById('pmodal-title');

      if (title) title.textContent = p.title;

      const features = (p.features || '').split(',').map(f => f.trim()).filter(Boolean);

      if (content) {
        content.innerHTML = `
          <div class="product-detail-view">
            <div class="detail-img-box">
              <img src="${p.image}" alt="${p.title}">
            </div>

            <div>
              <span class="card-category">${p.category}</span>
              <h2 style="font-size: 1.5rem; font-weight: 800; margin: 0.35rem 0;">${p.title}</h2>

              <div class="card-rating" style="margin-bottom: 1rem;">
                <span style="font-size: 1.1rem;">★</span> <strong>${p.rating.toFixed(1)}</strong>
                <span>(${p.reviews_count} verified reviews)</span>
              </div>

              <div style="display: flex; align-items: baseline; gap: 0.75rem; margin-bottom: 1rem;">
                <span style="font-size: 1.8rem; font-weight: 800; color: #fff;">$${p.price.toFixed(2)}</span>
                ${p.original_price ? `<span style="font-size: 1.1rem; color: var(--text-dim); text-decoration: line-through;">$${p.original_price.toFixed(2)}</span>` : ''}
              </div>

              <p style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.25rem;">
                ${p.description}
              </p>

              <h4 style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--accent);">Key Highlights:</h4>
              <ul class="detail-features-list">
                ${features.map(f => `<li>${f}</li>`).join('')}
              </ul>

              <div style="display: flex; align-items: center; gap: 1rem; margin-top: 1.5rem;">
                <div style="font-size: 0.85rem; color: ${p.stock > 0 ? 'var(--success)' : 'var(--danger)'}; font-weight: 600;">
                  ● ${p.stock > 0 ? `In Stock (${p.stock} available)` : 'Out of Stock'}
                </div>
              </div>

              <div style="display: flex; gap: 0.75rem; margin-top: 1.25rem;">
                <button class="btn-primary" style="flex: 1;" onclick="store.addToCart(${p.id}); store.closeModal('product-modal');" ${p.stock === 0 ? 'disabled' : ''}>
                  Add to Cart • $${p.price.toFixed(2)}
                </button>
                <button class="btn-secondary" onclick="store.toggleWishlist(${p.id})">
                  ♥ Wishlist
                </button>
              </div>
            </div>
          </div>

          <!-- Customer Reviews Section -->
          <div class="reviews-section">
            <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem;">Customer Reviews & Ratings</h3>

            <!-- Review submission form -->
            <form onsubmit="event.preventDefault(); store.submitReview(${p.id});" style="background: var(--bg-card); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1.5rem; border: 1px solid var(--border);">
              <h4 style="font-size: 0.9rem; font-weight: 600; margin-bottom: 0.75rem;">Write a Review</h4>
              <div class="form-grid">
                <div class="form-group">
                  <label>Your Name *</label>
                  <input type="text" id="rev-author" class="form-control" placeholder="Jordan Lee" required>
                </div>
                <div class="form-group">
                  <label>Rating *</label>
                  <select id="rev-rating" class="form-control" style="background: var(--bg-card);">
                    <option value="5">★★★★★ (5 - Excellent)</option>
                    <option value="4">★★★★☆ (4 - Good)</option>
                    <option value="3">★★★☆☆ (3 - Average)</option>
                    <option value="2">★★☆☆☆ (2 - Below Average)</option>
                    <option value="1">★☆☆☆☆ (1 - Poor)</option>
                  </select>
                </div>
              </div>
              <div class="form-group" style="margin-top: 0.75rem;">
                <label>Your Review *</label>
                <textarea id="rev-comment" class="form-control" rows="2" placeholder="Tell us how the product performed..." required></textarea>
              </div>
              <button type="submit" class="btn-primary" style="margin-top: 0.85rem; padding: 0.5rem 1.2rem; font-size: 0.85rem;">
                Submit Review
              </button>
            </form>

            <!-- Reviews list -->
            <div id="reviews-list-container">
              ${reviews.length ? reviews.map(r => `
                <div class="review-item">
                  <div class="review-head">
                    <span>${r.author}</span>
                    <span style="color: var(--warning);">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
                  </div>
                  <p style="color: var(--text-muted); line-height: 1.5;">${r.comment}</p>
                  <small style="color: var(--text-dim); display: block; margin-top: 0.35rem;">${new Date(r.created_at).toLocaleDateString()}</small>
                </div>
              `).join('') : '<p style="color: var(--text-dim); font-size: 0.85rem;">No reviews yet. Be the first to share your thoughts!</p>'}
            </div>
          </div>
        `;
      }

      this.openModal('product-modal');
    } catch (e) {
      console.error(e);
      this.toast('Error loading product details', 'error');
    }
  },

  // Submit Review
  async submitReview(productId) {
    const author = document.getElementById('rev-author')?.value.trim();
    const rating = document.getElementById('rev-rating')?.value;
    const comment = document.getElementById('rev-comment')?.value.trim();

    if (!author || !rating || !comment) {
      this.toast('Please complete all review fields.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, author, rating, comment })
      });
      const data = await res.json();

      if (data.success) {
        this.toast('Thank you! Review posted successfully.', 'success');
        this.openProductModal(productId);
        this.fetchProducts(); // Refresh catalog ratings
      } else {
        this.toast(data.error || 'Failed to submit review.', 'error');
      }
    } catch (e) {
      this.toast('Failed to submit review.', 'error');
    }
  },

  // Checkout flow
  proceedToCheckout() {
    if (!this.cart.length) {
      this.toast('Your cart is empty!', 'error');
      return;
    }

    this.closeCart();
    const totals = this.calculateTotals();
    const amtDisplay = document.getElementById('checkout-amount-display');
    if (amtDisplay) amtDisplay.textContent = `$${totals.total.toFixed(2)}`;

    this.openModal('checkout-modal');
  },

  selectPaymentMethod(elem, method) {
    this.selectedPayment = method;
    document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('active'));
    elem.classList.add('active');

    const cardBox = document.getElementById('card-details-box');
    if (cardBox) {
      cardBox.style.display = method === 'Credit Card' ? 'block' : 'none';
    }
  },

  // Submit Order
  async submitOrder() {
    const name = document.getElementById('cust-name')?.value.trim();
    const email = document.getElementById('cust-email')?.value.trim();
    const phone = document.getElementById('cust-phone')?.value.trim();
    const address = document.getElementById('cust-address')?.value.trim();
    const city = document.getElementById('cust-city')?.value.trim();
    const state = document.getElementById('cust-state')?.value.trim();
    const zip = document.getElementById('cust-zip')?.value.trim();

    if (!name || !email || !address || !city || !zip) {
      this.toast('Please fill out all required shipping fields.', 'error');
      return;
    }

    const btnSubmit = document.getElementById('btn-submit-order');
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.textContent = 'Processing Order...';
    }

    const payload = {
      customer: { name, email, phone, address, city, state, zip },
      items: this.cart.map(i => ({ id: i.id, quantity: i.quantity })),
      paymentMethod: this.selectedPayment,
      couponCode: this.activeCoupon ? this.activeCoupon.code : null
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        this.clearCart();
        this.closeModal('checkout-modal');
        this.showOrderSuccess(data.summary);
        this.fetchProducts(); // Update inventory
      } else {
        this.toast(data.error || 'Failed to place order', 'error');
      }
    } catch (e) {
      console.error(e);
      this.toast('An error occurred during order submission.', 'error');
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Confirm & Place Order';
      }
    }
  },

  // Render Order Confirmation Modal
  showOrderSuccess(summary) {
    const container = document.getElementById('order-success-content');
    if (!container) return;

    container.innerHTML = `
      <div style="text-align: center; margin-bottom: 1.5rem;">
        <span style="font-size: 0.85rem; color: var(--text-muted);">Thank you, <strong>${summary.customerName}</strong>! Your order is being processed.</span>
        <div style="margin-top: 0.75rem;">
          <span style="background: rgba(99, 102, 241, 0.2); color: #c7d2fe; border: 1px solid var(--primary); padding: 0.35rem 0.85rem; border-radius: var(--radius-full); font-weight: 700; font-size: 0.95rem;">
            Order ID: ${summary.orderId}
          </span>
        </div>
      </div>

      <!-- Live Tracking Steps -->
      <div class="tracking-timeline">
        <div class="timeline-step completed">
          <div class="timeline-circle">✓</div>
          <span>Placed</span>
        </div>
        <div class="timeline-step active">
          <div class="timeline-circle">2</div>
          <span>Processing</span>
        </div>
        <div class="timeline-step">
          <div class="timeline-circle">3</div>
          <span>Shipped</span>
        </div>
        <div class="timeline-step">
          <div class="timeline-circle">4</div>
          <span>Delivered</span>
        </div>
      </div>

      <!-- Receipt Breakdown -->
      <div class="receipt-box">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; font-weight: 600;">
          <span>Item</span>
          <span>Subtotal</span>
        </div>
        ${summary.items.map(item => `
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span>${item.title} × ${item.quantity}</span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        `).join('')}
        
        <div style="border-top: 1px dashed var(--border); margin-top: 0.75rem; padding-top: 0.75rem; display: flex; flex-direction: column; gap: 0.35rem;">
          <div style="display: flex; justify-content: space-between; color: var(--text-muted);">
            <span>Subtotal:</span>
            <span>$${summary.subtotal.toFixed(2)}</span>
          </div>
          ${summary.discount > 0 ? `
            <div style="display: flex; justify-content: space-between; color: var(--success);">
              <span>Discount:</span>
              <span>-$${summary.discount.toFixed(2)}</span>
            </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between; color: var(--text-muted);">
            <span>Shipping:</span>
            <span>${summary.shipping === 0 ? 'FREE' : `$${summary.shipping.toFixed(2)}`}</span>
          </div>
          <div style="display: flex; justify-content: space-between; color: var(--text-muted);">
            <span>Tax (8%):</span>
            <span>$${summary.tax.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 1.15rem; color: #fff; margin-top: 0.35rem; border-top: 1px solid var(--border); padding-top: 0.5rem;">
            <span>Grand Total:</span>
            <span style="color: var(--accent);">$${summary.total.toFixed(2)}</span>
          </div>
        </div>

        <div style="margin-top: 1rem; font-size: 0.8rem; color: var(--text-muted); line-height: 1.5;">
          <div><strong>Shipping Address:</strong> ${summary.shippingAddress}</div>
          <div><strong>Payment Method:</strong> ${summary.paymentMethod}</div>
          <div><strong>Confirmation Sent To:</strong> ${summary.email}</div>
        </div>
      </div>

      <div style="display: flex; gap: 0.75rem; margin-top: 1.25rem;">
        <button class="btn-primary" style="flex: 1;" onclick="window.print()">
          Print Receipt
        </button>
        <button class="btn-secondary" onclick="store.openTrackModal('${summary.orderId}')">
          Track Live
        </button>
      </div>
    `;

    this.openModal('order-success-modal');
  },

  // Track Order Lookup
  openTrackModal(orderId = '') {
    const input = document.getElementById('track-order-input');
    if (input && orderId) {
      input.value = orderId;
      this.lookupOrder();
    }
    this.openModal('track-order-modal');
  },

  async lookupOrder() {
    const input = document.getElementById('track-order-input');
    const orderId = input ? input.value.trim().toUpperCase() : '';
    const resBox = document.getElementById('track-order-result');

    if (!orderId) {
      this.toast('Please enter a valid Order ID (e.g. ORD-123456)', 'info');
      return;
    }

    if (resBox) resBox.innerHTML = '<p style="color: var(--text-muted);">Locating shipment records...</p>';

    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();

      if (!data.success) {
        if (resBox) resBox.innerHTML = `<p style="color: var(--danger); font-size: 0.9rem;">✕ ${data.error}</p>`;
        return;
      }

      const o = data.order;
      const items = data.items || [];

      // Determine active steps
      const steps = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
      const currentIdx = steps.indexOf(o.status);

      if (resBox) {
        resBox.innerHTML = `
          <div style="background: var(--bg-card); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <div>
                <h4 style="font-weight: 700; font-size: 1.05rem;">${o.id}</h4>
                <small style="color: var(--text-muted);">${new Date(o.created_at).toLocaleString()}</small>
              </div>
              <span class="status-badge ${o.status.replace(/\s+/g, '')}">${o.status}</span>
            </div>

            <div class="tracking-timeline" style="margin: 1.25rem 0;">
              ${steps.map((st, i) => `
                <div class="timeline-step ${i < currentIdx ? 'completed' : (i === currentIdx ? 'active' : '')}">
                  <div class="timeline-circle">${i < currentIdx ? '✓' : (i + 1)}</div>
                  <span>${st}</span>
                </div>
              `).join('')}
            </div>

            <div style="margin-top: 1rem; border-top: 1px solid var(--border); padding-top: 0.75rem; font-size: 0.85rem;">
              <p><strong>Customer:</strong> ${o.customer_name} (${o.email})</p>
              <p><strong>Destination:</strong> ${o.address}, ${o.city}, ${o.zip}</p>
              <p><strong>Total:</strong> $${o.total.toFixed(2)} (${o.payment_method})</p>
            </div>

            <h5 style="font-size: 0.85rem; font-weight: 700; margin: 0.85rem 0 0.35rem;">Items in Package:</h5>
            <ul style="font-size: 0.85rem; color: var(--text-muted); list-style: square; padding-left: 1.2rem;">
              ${items.map(it => `<li>${it.product_title} × ${it.quantity} ($${(it.price * it.quantity).toFixed(2)})</li>`).join('')}
            </ul>
          </div>
        `;
      }
    } catch (e) {
      if (resBox) resBox.innerHTML = '<p style="color: var(--danger);">Failed to connect to tracking server.</p>';
    }
  },

  // Admin Dashboard Management
  async openAdminModal() {
    this.openModal('admin-modal');
    try {
      // 1. Fetch stats
      const statsRes = await fetch('/api/stats');
      const statsData = await statsRes.json();

      if (statsData.success) {
        const revEl = document.getElementById('admin-revenue');
        const ordEl = document.getElementById('admin-orders-count');
        const lowEl = document.getElementById('admin-low-stock');
        const prodEl = document.getElementById('admin-prod-count');

        if (revEl) revEl.textContent = `$${statsData.revenue.toFixed(2)}`;
        if (ordEl) ordEl.textContent = statsData.ordersCount.toString();
        if (lowEl) lowEl.textContent = statsData.lowStockCount.toString();
        if (prodEl) prodEl.textContent = statsData.productsCount.toString();
      }

      // 2. Fetch orders
      const ordersRes = await fetch('/api/orders');
      const ordersData = await ordersRes.json();

      const tbody = document.getElementById('admin-orders-list');
      if (tbody && ordersData.success) {
        if (!ordersData.orders.length) {
          tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">No orders placed yet. Place a test order in the store!</td></tr>';
          return;
        }

        tbody.innerHTML = ordersData.orders.map(o => `
          <tr>
            <td><strong>${o.id}</strong></td>
            <td>${o.customer_name}<br><small style="color: var(--text-dim);">${o.email}</small></td>
            <td><strong>$${o.total.toFixed(2)}</strong></td>
            <td>${o.payment_method}</td>
            <td><span class="status-badge ${o.status.replace(/\s+/g, '')}">${o.status}</span></td>
            <td>
              <select onchange="store.updateOrderStatus('${o.id}', this.value)" class="sort-select" style="padding: 0.2rem 0.4rem; font-size: 0.75rem;">
                <option value="Processing" ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
                <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                <option value="Out for Delivery" ${o.status === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
                <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
              </select>
            </td>
          </tr>
        `).join('');
      }
    } catch (e) {
      console.error(e);
      this.toast('Failed to load admin orders.', 'error');
    }
  },

  async updateOrderStatus(orderId, newStatus) {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        this.toast(`Order ${orderId} updated to "${newStatus}"`, 'success');
        this.openAdminModal(); // Refresh list
      } else {
        this.toast('Failed to update status', 'error');
      }
    } catch (e) {
      this.toast('Error communicating with server', 'error');
    }
  },

  // Modal helpers
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  },

  closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  },

  // Toast Notifications
  toast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const el = document.createElement('div');
    el.className = `toast ${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✓';
    if (type === 'error') icon = '✕';

    el.innerHTML = `
      <span style="font-weight: bold;">${icon}</span>
      <span>${message}</span>
    `;

    container.appendChild(el);

    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(10px)';
      el.style.transition = 'all 0.25s ease';
      setTimeout(() => el.remove(), 250);
    }, 3200);
  }
};

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  store.init();
});
