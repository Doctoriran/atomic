// ============================================================
//  SHOP PAGE LOGIC
// ============================================================
const grid = document.getElementById('productsGrid');
const filterContainer = document.getElementById('filterContainer');
const searchInput = document.getElementById('searchInput');
let currentFilter = 'all';
let searchQuery = '';

// رندر محصولات برای صفحه shop
function renderShopProducts() {
    if (!grid) return;

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
                <img src="${p.image}" alt="${p.name}" />
                <div class="product-body">
                    ${p.tag ? `<span class="tag" style="background:var(--primary);padding:2px 12px;border-radius:30px;font-size:12px;font-weight:600;display:inline-block;margin-bottom:8px;">${p.tag}</span>` : ''}
                    <h3 class="product-name">${p.name}</h3>
                    <div class="product-category">${p.category}</div>
                    
                    <div class="color-selector" style="display:flex;gap:8px;flex-wrap:wrap;margin:10px 0;">
                        ${p.colors.map((c, idx) => {
                            const hasStock = Object.values(c.sizes).some(s => s > 0);
                            return `
                                <div class="color-option ${idx === 0 && hasStock ? 'active' : ''} ${!hasStock ? 'out-of-stock' : ''}" 
                                     style="display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:30px;border:2px solid ${idx === 0 && hasStock ? 'var(--primary)' : 'transparent'};cursor:${hasStock ? 'pointer' : 'not-allowed'};background:var(--dark-2);opacity:${!hasStock ? '0.5' : '1'};"
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
                    
                    <div class="size-selector" style="display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 12px;" data-product-id="${p.id}">
                        ${defaultColor ? Object.keys(defaultColor.sizes).map(size => {
                            const stock = defaultColor.sizes[size];
                            return `
                                <div class="size-option ${size === defaultSize && stock > 0 ? 'active' : ''} ${stock === 0 ? 'out-of-stock' : ''}" 
                                     style="padding:4px 16px;border-radius:30px;border:2px solid ${size === defaultSize && stock > 0 ? 'var(--primary)' : 'var(--border)'};background:${size === defaultSize && stock > 0 ? 'rgba(255,107,0,0.1)' : 'transparent'};cursor:${stock > 0 ? 'pointer' : 'not-allowed'};opacity:${stock === 0 ? '0.3' : '1'};font-weight:600;transition:var(--transition);"
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

    // ===== رویدادهای انتخاب رنگ و سایز (همانند main.js) =====
    // (اینجا کدهای انتخاب رنگ و سایز که قبلاً در main.js نوشتیم رو کپی کن)
    // چون فضای پیام کمه، ولی در عمل باید همینجا هم تکرار بشن
    // برای جلوگیری از تکرار، می‌تونیم از یک تابع جداگانه استفاده کنیم
    attachProductEvents();
}

function attachProductEvents() {
    // کدهای انتخاب رنگ و سایز که در main.js نوشته شد رو اینجا قرار بده
    // (همون کدی که در renderProducts توی main.js هست)
    // برای اینکه کد تکراری نشه، می‌تونیم اون بخش رو به یک تابع جداگانه ببریم
    // ولی در حال حاضر به خاطر سادگی، همون کد رو اینجا کپی کن
    // من در نسخه نهایی همه رو یکپارچه می‌کنم
}

// فیلترها
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
            renderShopProducts();
        }
    });
}

// جستجو
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        renderShopProducts();
    });
}

// ============================================================
//  INIT
// ============================================================
renderShopProducts();
updateBadge();