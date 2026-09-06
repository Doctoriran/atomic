// ============================================================
//  PRODUCT DETAIL PAGE LOGIC
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('productDetailContainer');
    if (!container) return;

    // دریافت ID محصول از URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    
    if (!productId) {
        container.innerHTML = `<p style="text-align:center;color:#888;padding:40px;">محصولی یافت نشد</p>`;
        return;
    }

    const product = productsData.find(p => p.id === productId);
    if (!product) {
        container.innerHTML = `<p style="text-align:center;color:#888;padding:40px;">محصول مورد نظر یافت نشد</p>`;
        return;
    }

    // ===== رندر جزییات محصول =====
    const defaultColor = product.colors.find(c => Object.values(c.sizes).some(s => s > 0)) || product.colors[0];
    const defaultSize = defaultColor ? Object.keys(defaultColor.sizes).find(s => defaultColor.sizes[s] > 0) : 'S';

    container.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:50px;align-items:start;">
            <!-- تصویر -->
            <div style="background:var(--dark-3);border-radius:var(--radius-lg);overflow:hidden;border:1px solid var(--border);">
                <img src="${product.image}" alt="${product.name}" style="width:100%;height:500px;object-fit:cover;" />
            </div>
            
            <!-- اطلاعات -->
            <div>
                ${product.tag ? `<span style="display:inline-block;background:var(--primary);padding:4px 16px;border-radius:30px;font-size:13px;font-weight:600;margin-bottom:12px;">${product.tag}</span>` : ''}
                <h1 style="font-size:32px;font-weight:900;margin-bottom:8px;">${product.name}</h1>
                <p style="color:var(--text-muted);margin-bottom:16px;">${product.category}</p>
                
                <div style="font-size:28px;font-weight:800;color:var(--primary);margin-bottom:24px;">
                    ${defaultColor ? defaultColor.price.toLocaleString() : '۰'} <small style="font-size:16px;font-weight:400;color:var(--text-muted);">تومان</small>
                </div>
                
                <!-- انتخاب رنگ -->
                <div style="margin-bottom:16px;">
                    <h3 style="font-size:16px;font-weight:700;margin-bottom:8px;">انتخاب رنگ</h3>
                    <div class="color-selector" id="detailColorSelector" style="display:flex;gap:10px;flex-wrap:wrap;">
                        ${product.colors.map((c, idx) => {
                            const hasStock = Object.values(c.sizes).some(s => s > 0);
                            return `
                                <div class="color-option ${idx === 0 && hasStock ? 'active' : ''} ${!hasStock ? 'out-of-stock' : ''}" 
                                     style="display:flex;align-items:center;gap:6px;padding:6px 14px 6px 10px;border-radius:30px;border:2px solid ${idx === 0 && hasStock ? 'var(--primary)' : 'transparent'};cursor:${hasStock ? 'pointer' : 'not-allowed'};background:var(--dark-2);opacity:${!hasStock ? '0.5' : '1'};transition:var(--transition);"
                                     data-color-name="${c.name}"
                                     data-color-hex="${c.hex}"
                                     data-price="${c.price}"
                                     data-has-stock="${hasStock}"
                                     data-product-id="${product.id}">
                                    <span style="display:inline-block;width:24px;height:24px;border-radius:50%;background:${c.hex};border:2px solid #444;"></span>
                                    ${c.name}
                                    <span style="font-size:11px;color:#888;">(${hasStock ? Object.values(c.sizes).reduce((a,b) => a+b, 0) : 'ناموجود'})</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <!-- انتخاب سایز -->
                <div style="margin-bottom:24px;">
                    <h3 style="font-size:16px;font-weight:700;margin-bottom:8px;">انتخاب سایز</h3>
                    <div class="size-selector" id="detailSizeSelector" style="display:flex;gap:10px;flex-wrap:wrap;">
                        ${defaultColor ? Object.keys(defaultColor.sizes).map(size => {
                            const stock = defaultColor.sizes[size];
                            return `
                                <div class="size-option ${size === defaultSize && stock > 0 ? 'active' : ''} ${stock === 0 ? 'out-of-stock' : ''}" 
                                     style="padding:8px 20px;border-radius:30px;border:2px solid ${size === defaultSize && stock > 0 ? 'var(--primary)' : 'var(--border)'};background:${size === defaultSize && stock > 0 ? 'rgba(255,107,0,0.1)' : 'transparent'};cursor:${stock > 0 ? 'pointer' : 'not-allowed'};opacity:${stock === 0 ? '0.3' : '1'};font-weight:600;transition:var(--transition);font-size:15px;"
                                     data-size="${size}"
                                     data-stock="${stock}">
                                    ${size}
                                    ${stock === 0 ? '(ناموجود)' : ''}
                                </div>
                            `;
                        }).join('') : ''}
                    </div>
                </div>
                
                <!-- دکمه افزودن به سبد -->
                <button class="add-btn" 
                        id="detailAddBtn"
                        data-id="${product.id}"
                        data-color-name="${defaultColor ? defaultColor.name : ''}"
                        data-color-hex="${defaultColor ? defaultColor.hex : ''}"
                        data-price="${defaultColor ? defaultColor.price : 0}"
                        data-size="${defaultSize || 'S'}"
                        style="width:100%;padding:16px;font-size:18px;border-radius:var(--radius);"
                        ${(!defaultColor || defaultColor.sizes[defaultSize] === 0) ? 'disabled' : ''}>
                    ${(!defaultColor || defaultColor.sizes[defaultSize] === 0) ? 'ناموجود' : '🛒 افزودن به سبد خرید'}
                </button>
                
                <!-- توضیحات -->
                <div style="margin-top:30px;padding-top:20px;border-top:1px solid var(--border);">
                    <h3 style="font-size:16px;font-weight:700;margin-bottom:8px;">توضیحات محصول</h3>
                    <p style="color:var(--text-muted);line-height:1.8;">
                        این محصول با بهترین مواد اولیه و با دقت بالا طراحی شده است.
                        کیفیت بی‌نظیر و دوام بالا، انتخابی عالی برای استایل روزمره شما.
                    </p>
                </div>
            </div>
        </div>
    `;

    // ============================================================
    //  EVENT: انتخاب رنگ
    // ============================================================
    document.querySelectorAll('#detailColorSelector .color-option').forEach(el => {
        el.addEventListener('click', function() {
            const productId = parseInt(this.dataset.productId);
            const product = productsData.find(p => p.id === productId);
            if (!product) return;

            const colorName = this.dataset.colorName;
            const colorHex = this.dataset.colorHex;
            const price = parseInt(this.dataset.price);
            const hasStock = this.dataset.hasStock === 'true';

            // آپدیت کلاس active
            const colorSelector = this.closest('#detailColorSelector');
            colorSelector.querySelectorAll('.color-option').forEach(opt => {
                opt.classList.remove('active');
                opt.style.borderColor = 'transparent';
            });
            if (hasStock) {
                this.classList.add('active');
                this.style.borderColor = 'var(--primary)';
            }

            // آپدیت قیمت
            const priceEl = document.querySelector('#productDetailContainer .product-price') || 
                           document.querySelector('#productDetailContainer div[style*="font-size:28px"]');
            if (priceEl) {
                priceEl.innerHTML = `${price.toLocaleString()} <small style="font-size:16px;font-weight:400;color:var(--text-muted);">تومان</small>`;
            }

            // ===== آپدیت سایزها =====
            const sizeSelector = document.getElementById('detailSizeSelector');
            const selectedColor = product.colors.find(c => c.name === colorName);
            
            if (selectedColor && sizeSelector) {
                const sizesHtml = Object.keys(selectedColor.sizes).map(size => {
                    const stock = selectedColor.sizes[size];
                    return `
                        <div class="size-option ${stock > 0 ? '' : 'out-of-stock'}" 
                             style="padding:8px 20px;border-radius:30px;border:2px solid var(--border);background:transparent;cursor:${stock > 0 ? 'pointer' : 'not-allowed'};opacity:${stock === 0 ? '0.3' : '1'};font-weight:600;transition:var(--transition);font-size:15px;"
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
                        
                        const sizeSelectorParent = this.closest('#detailSizeSelector');
                        sizeSelectorParent.querySelectorAll('.size-option').forEach(opt => {
                            opt.classList.remove('active');
                            opt.style.borderColor = 'var(--border)';
                            opt.style.background = 'transparent';
                        });
                        this.classList.add('active');
                        this.style.borderColor = 'var(--primary)';
                        this.style.background = 'rgba(255,107,0,0.1)';

                        // آپدیت دکمه خرید
                        const btn = document.getElementById('detailAddBtn');
                        const activeColor = document.querySelector('#detailColorSelector .color-option.active');
                        if (btn && activeColor) {
                            btn.dataset.colorName = activeColor.dataset.colorName;
                            btn.dataset.colorHex = activeColor.dataset.colorHex;
                            btn.dataset.price = activeColor.dataset.price;
                            btn.dataset.size = this.dataset.size;
                            btn.disabled = false;
                            btn.textContent = '🛒 افزودن به سبد خرید';
                        }
                    });
                });
            }

            // آپدیت دکمه خرید
            const btn = document.getElementById('detailAddBtn');
            const activeColor = document.querySelector('#detailColorSelector .color-option.active');
            const activeSize = document.querySelector('#detailSizeSelector .size-option.active');

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
                    btn.textContent = '🛒 افزودن به سبد خرید';
                }
            }
        });
    });

    // ============================================================
    //  EVENT: انتخاب سایز (برای سایزهای اولیه)
    // ============================================================
    document.querySelectorAll('#detailSizeSelector .size-option').forEach(el => {
        el.addEventListener('click', function() {
            const stock = parseInt(this.dataset.stock);
            if (stock === 0) {
                alert('این سایز موجود نیست!');
                return;
            }

            const sizeSelector = this.closest('#detailSizeSelector');
            sizeSelector.querySelectorAll('.size-option').forEach(opt => {
                opt.classList.remove('active');
                opt.style.borderColor = 'var(--border)';
                opt.style.background = 'transparent';
            });
            this.classList.add('active');
            this.style.borderColor = 'var(--primary)';
            this.style.background = 'rgba(255,107,0,0.1)';

            const btn = document.getElementById('detailAddBtn');
            const activeColor = document.querySelector('#detailColorSelector .color-option.active');
            if (btn && activeColor) {
                btn.dataset.colorName = activeColor.dataset.colorName;
                btn.dataset.colorHex = activeColor.dataset.colorHex;
                btn.dataset.price = activeColor.dataset.price;
                btn.dataset.size = this.dataset.size;
                btn.disabled = false;
                btn.textContent = '🛒 افزودن به سبد خرید';
            }
        });
    });

    // ============================================================
    //  EVENT: افزودن به سبد
    // ============================================================
    document.getElementById('detailAddBtn').addEventListener('click', function() {
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
        alert('✅ محصول به سبد خرید اضافه شد!');
    });
});