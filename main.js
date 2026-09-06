// ============================================================
//  MAIN APP LOGIC - COMPLETE VERSION
// ============================================================

// ============================================================
//  STATE
// ============================================================
let currentFilter = 'all';
let searchQuery = '';

// ============================================================
//  DOM REFS
// ============================================================
const grid = document.getElementById('featuredGrid') || document.getElementById('productsGrid');
const badge = document.getElementById('cartBadge');
const searchToggle = document.getElementById('searchToggle');
const searchBar = document.getElementById('searchBar');
const searchClose = document.getElementById('searchClose');
const searchInput = document.getElementById('searchInput');
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
const header = document.getElementById('header');
const filterContainer = document.getElementById('filterContainer');

// ============================================================
//  RENDER PRODUCTS
// ============================================================
function renderProducts() {
    if (!grid) return;
    
    // فیلتر محصولات
    const filtered = productsData.filter(p => {
        const matchFilter = currentFilter === 'all' || p.category === currentFilter;
        const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.includes(searchQuery);
        return matchFilter && matchSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:#888; padding:40px;">هیچ محصولی یافت نشد</p>`;
        return;
    }

    grid.innerHTML = filtered.map(p => {
        const defaultColor = p.colors.find(c => Object.values(c.sizes).some(s => s > 0)) || p.colors[0];
        const defaultSize = defaultColor ? Object.keys(defaultColor.sizes).find(s => defaultColor.sizes[s] > 0) : 'S';

        return `
            <div class="product-card" data-id="${p.id}">
                <a href="/product-detail.html?id=${p.id}" style="display:block;text-decoration:none;color:inherit;">
                    <img src="${p.image}" alt="${p.name}" />
                </a>
                <div class="product-body">
                    ${p.tag ? `<span class="tag" style="background:var(--primary);padding:2px 12px;border-radius:30px;font-size:12px;font-weight:600;display:inline-block;margin-bottom:8px;">${p.tag}</span>` : ''}
                    <a href="/product-detail.html?id=${p.id}" style="text-decoration:none;color:inherit;">
                        <h3 class="product-name">${p.name}</h3>
                    </a>
                    <div class="product-category">${p.category}</div>
                    
                    <!-- Color Selector -->
                    <div class="color-selector" style="display:flex;gap:8px;flex-wrap:wrap;margin:10px 0;">
                        ${p.colors.map((c, idx) => {
                            const hasStock = Object.values(c.sizes).some(s => s > 0);
                            return `
                                <div class="color-option ${idx === 0 && hasStock ? 'active' : ''} ${!hasStock ? 'out-of-stock' : ''}" 
                                     style="display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:30px;border:2px solid ${idx === 0 && hasStock ? 'var(--primary)' : 'transparent'};cursor:${hasStock ? 'pointer' : 'not-allowed'};background:var(--dark-2);opacity:${!hasStock ? '0.5' : '1'};transition:var(--transition);"
                                     data-color-name="${c.name}"
                                     data-color-hex="${c.hex}"
                                     data-price="${c.price}"
                                     data-has-stock="${hasStock}"
                                     data-product-id="${p.id}">
                                    <span style="display:inline-block;width:20px;height:20px;border-radius:50%;background:${c.hex};border:1px solid #444;"></span>
                                    ${c.name}
                                    <span style="font-size:10px;color:#888;">(${hasStock ? Object.values(c.sizes).reduce((a,b) => a+b, 0) : 'ناموجود'})</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <!-- Size Selector -->
                    <div class="size-selector" style="display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 12px;" data-product-id="${p.id}">
                        ${defaultColor ? Object.keys(defaultColor.sizes).map(size => {
                            const stock = defaultColor.sizes[size];
                            return `
                                <div class="size-option ${size === defaultSize && stock > 0 ? 'active' : ''} ${stock === 0 ? 'out-of-stock' : ''}" 
                                     style="padding:4px 16px;border-radius:30px;border:2px solid ${size === defaultSize && stock > 0 ? 'var(--primary)' : 'var(--border)'};background:${size === defaultSize && stock > 0 ? 'rgba(255,107,0,0.1)' : 'transparent'};cursor:${stock > 0 ? 'pointer' : 'not-allowed'};opacity:${stock === 0 ? '0.3' : '1'};font-weight:600;transition:var(--transition);font-size:13px;"
                                     data-size="${size}"
                                     data-stock="${stock}">
                                    ${size}
                                    ${stock === 0 ? '(ناموجود)' : ''}
                                </div>
                            `;
                        }).join('') : ''}
                    </div>
                    
                    <div class="product-price">${defaultColor ? defaultColor.price.toLocaleString() : '۰'} <small>تومان</small></div>
                    <button class="add-btn" 
                            data-id="${p.id}"
                            data-color-name="${defaultColor ? defaultColor.name : ''}"
                            data-color-hex="${defaultColor ? defaultColor.hex : ''}"
                            data-price="${defaultColor ? defaultColor.price : 0}"
                            data-size="${defaultSize || 'S'}"
                            ${(!defaultColor || defaultColor.sizes[defaultSize] === 0) ? 'disabled' : ''}>
                        ${(!defaultColor || defaultColor.sizes[defaultSize] === 0) ? 'ناموجود' : '🛒 افزودن به سبد'}
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // ===== ATTACH EVENTS =====
    attachProductEvents();
}

// ============================================================
//  ATTACH PRODUCT EVENTS
// ============================================================
function attachProductEvents() {
    // ===== EVENT: انتخاب رنگ =====
    document.querySelectorAll('.color-option').forEach(el => {
        el.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            if (!productCard) return;
            
            const productId = parseInt(productCard.dataset.id);
            const product = productsData.find(p => p.id === productId);
            if (!product) return;

            const colorName = this.dataset.colorName;
            const colorHex = this.dataset.colorHex;
            const price = parseInt(this.dataset.price);
            const hasStock = this.dataset.hasStock === 'true';

            // آپدیت کلاس active
            const colorSelector = this.closest('.color-selector');
            colorSelector.querySelectorAll('.color-option').forEach(opt => {
                opt.classList.remove('active');
                opt.style.borderColor = 'transparent';
            });
            if (hasStock) {
                this.classList.add('active');
                this.style.borderColor = 'var(--primary)';
            }

            // آپدیت قیمت
            const priceEl = productCard.querySelector('.product-price');
            if (priceEl) {
                priceEl.innerHTML = `${price.toLocaleString()} <small>تومان</small>`;
            }

            // ===== آپدیت سایزها =====
            const sizeSelector = productCard.querySelector('.size-selector');
            const selectedColor = product.colors.find(c => c.name === colorName);
            
            if (selectedColor && sizeSelector) {
                const sizesHtml = Object.keys(selectedColor.sizes).map(size => {
                    const stock = selectedColor.sizes[size];
                    return `
                        <div class="size-option ${stock > 0 ? '' : 'out-of-stock'}" 
                             style="padding:4px 16px;border-radius:30px;border:2px solid var(--border);background:transparent;cursor:${stock > 0 ? 'pointer' : 'not-allowed'};opacity:${stock === 0 ? '0.3' : '1'};font-weight:600;transition:var(--transition);font-size:13px;"
                             data-size="${size}"
                             data-stock="${stock}">
                            ${size}
                            ${stock === 0 ? '(ناموجود)' : ''}
                        </div>
                    `;
                }).join('');
                
                sizeSelector.innerHTML = sizesHtml;

                // فعال کردن اولین سایز موجود
                const firstAvailable = sizeSelector.querySelector('.size-option:not(.out-of-stock)');
                if (firstAvailable) {
                    sizeSelector.querySelectorAll('.size-option').forEach(opt => {
                        opt.classList.remove('active');
                        opt.style.borderColor = 'var(--border)';
                        opt.style.background = 'transparent';
                    });
                    firstAvailable.classList.add('active');
                    firstAvailable.style.borderColor = 'var(--primary)';
                    firstAvailable.style.background = 'rgba(255,107,0,0.1)';
                }

                // ===== اتصال رویداد به سایزهای جدید =====
                sizeSelector.querySelectorAll('.size-option').forEach(sizeEl => {
                    sizeEl.addEventListener('click', function() {
                        const stock = parseInt(this.dataset.stock);
                        if (stock === 0) {
                            alert('این سایز موجود نیست!');
                            return;
                        }
                        
                        const sizeSelectorParent = this.closest('.size-selector');
                        sizeSelectorParent.querySelectorAll('.size-option').forEach(opt => {
                            opt.classList.remove('active');
                            opt.style.borderColor = 'var(--border)';
                            opt.style.background = 'transparent';
                        });
                        this.classList.add('active');
                        this.style.borderColor = 'var(--primary)';
                        this.style.background = 'rgba(255,107,0,0.1)';

                        // آپدیت دکمه خرید
                        const btn = productCard.querySelector('.add-btn');
                        const activeColor = productCard.querySelector('.color-option.active');
                        if (btn && activeColor) {
                            btn.dataset.colorName = activeColor.dataset.colorName;
                            btn.dataset.colorHex = activeColor.dataset.colorHex;
                            btn.dataset.price = activeColor.dataset.price;
                            btn.dataset.size = this.dataset.size;
                            btn.disabled = false;
                            btn.textContent = '🛒 افزودن به سبد';
                        }
                    });
                });
            }

            // آپدیت دکمه خرید
            const btn = productCard.querySelector('.add-btn');
            const activeColor = productCard.querySelector('.color-option.active');
            const activeSize = productCard.querySelector('.size-option.active');

            if (btn && activeColor && activeSize) {
                const sizeStock = parseInt(activeSize.dataset.stock);
                btn.dataset.colorName = activeColor.dataset.colorName;
                btn.dataset.colorHex = activeColor.dataset.colorHex;
                btn.dataset.price = activeColor.dataset.price;
                btn.dataset.size = activeSize.dataset.size;

                if (sizeStock === 0) {
                    btn.disabled = true;
                    btn.textContent = 'ناموجود';
                } else {
                    btn.disabled = false;
                    btn.textContent = '🛒 افزودن به سبد';
                }
            }
        });
    });

    // ===== EVENT: انتخاب سایز (برای سایزهای اولیه) =====
    document.querySelectorAll('.size-option').forEach(el => {
        if (!el.dataset.listener) {
            el.dataset.listener = 'true';
            el.addEventListener('click', function() {
                const productCard = this.closest('.product-card');
                if (!productCard) return;
                
                const stock = parseInt(this.dataset.stock);
                if (stock === 0) {
                    alert('این سایز موجود نیست!');
                    return;
                }

                const sizeSelector = this.closest('.size-selector');
                sizeSelector.querySelectorAll('.size-option').forEach(opt => {
                    opt.classList.remove('active');
                    opt.style.borderColor = 'var(--border)';
                    opt.style.background = 'transparent';
                });
                this.classList.add('active');
                this.style.borderColor = 'var(--primary)';
                this.style.background = 'rgba(255,107,0,0.1)';

                const btn = productCard.querySelector('.add-btn');
                const activeColor = productCard.querySelector('.color-option.active');
                if (btn && activeColor) {
                    btn.dataset.colorName = activeColor.dataset.colorName;
                    btn.dataset.colorHex = activeColor.dataset.colorHex;
                    btn.dataset.price = activeColor.dataset.price;
                    btn.dataset.size = this.dataset.size;
                    btn.disabled = false;
                    btn.textContent = '🛒 افزودن به سبد';
                }
            });
        }
    });

    // ===== EVENT: افزودن به سبد =====
    document.querySelectorAll('.add-btn').forEach(btn => {
        if (!btn.dataset.listener) {
            btn.dataset.listener = 'true';
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const productId = parseInt(this.dataset.id);
                const colorName = this.dataset.colorName;
                const colorHex = this.dataset.colorHex;
                const price = parseInt(this.dataset.price);
                const size = this.dataset.size;

                if (!colorName || !size || price === 0) {
                    alert('لطفاً یک رنگ و سایز موجود را انتخاب کنید.');
                    return;
                }

                addToCart(productId, colorName, colorHex, price, size);
                
                // انیمیشن دکمه
                this.textContent = '✅ اضافه شد';
                this.style.background = '#27ae60';
                setTimeout(() => {
                    this.textContent = '🛒 افزودن به سبد';
                    this.style.background = 'var(--primary)';
                }, 1500);
            });
        }
    });
}

// ============================================================
//  UI HELPERS
// ============================================================
// Toggle Search
if (searchToggle && searchBar) {
    searchToggle.addEventListener('click', () => searchBar.classList.toggle('open'));
    if (searchClose) {
        searchClose.addEventListener('click', () => searchBar.classList.remove('open'));
    }
}

// Toggle Mobile Menu
if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => navMenu.classList.toggle('open'));
}

// Sticky Header
if (header) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Search Input (برای صفحه اصلی)
if (searchInput && grid) {
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        renderProducts();
    });
}

// Close mobile menu on link click
document.querySelectorAll('.nav-list a').forEach(link => {
    link.addEventListener('click', () => {
        if (navMenu && window.innerWidth <= 768) {
            navMenu.classList.remove('open');
        }
    });
});

// ===== فیلترها (برای صفحه محصولات) =====
if (filterContainer) {
    filterContainer.addEventListener('click', (e) => {
        if (e.target.dataset.filter) {
            document.querySelectorAll('.filters button').forEach(b => {
                b.style.background = 'var(--dark-3)';
                b.style.color = 'var(--text)';
                b.style.border = '1px solid var(--border)';
            });
            e.target.style.background = 'var(--primary)';
            e.target.style.color = '#fff';
            e.target.style.border = 'none';
            currentFilter = e.target.dataset.filter;
            renderProducts();
        }
    });
}

// ============================================================
//  INIT
// ============================================================
updateBadge();
renderProducts();

// Close Cart with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const overlay = document.getElementById('cartOverlay');
        if (overlay && overlay.classList.contains('open')) {
            overlay.classList.remove('open');
            document.body.style.overflow = '';
        }
    }
});