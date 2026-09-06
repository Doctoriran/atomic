// ============================================================
//  CART FUNCTIONS
// ============================================================
let cart = JSON.parse(localStorage.getItem('atomicCart')) || [];

function saveCart() {
    localStorage.setItem('atomicCart', JSON.stringify(cart));
}

function updateBadge() {
    const badge = document.getElementById('cartBadge');
    if (badge) {
        const total = cart.reduce((sum, item) => sum + item.qty, 0);
        badge.textContent = total;
    }
}

function getTotalPrice() {
    return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function addToCart(productId, colorName, colorHex, price, size) {
    const product = productsData.find(p => p.id === productId);
    if (!product) return;

    const colorData = product.colors.find(c => c.name === colorName);
    if (!colorData) {
        alert('رنگ نامعتبر!');
        return;
    }

    const stock = colorData.sizes[size];
    if (!stock || stock === 0) {
        alert(`سایز ${size} برای رنگ ${colorName} موجود نیست!`);
        return;
    }

    const existing = cart.find(item =>
        item.productId === productId &&
        item.colorName === colorName &&
        item.size === size
    );

    if (existing) {
        if (existing.qty >= stock) {
            alert(`تنها ${stock} عدد از این سایز موجود است!`);
            return;
        }
        existing.qty += 1;
    } else {
        cart.push({
            productId: productId,
            colorName: colorName,
            colorHex: colorHex,
            size: size,
            price: price,
            name: product.name,
            image: product.image,
            qty: 1
        });
    }

    saveCart();
    updateBadge();
    renderProducts();
}

function removeFromCart(productId, colorName, size) {
    const existing = cart.find(item =>
        item.productId === productId &&
        item.colorName === colorName &&
        item.size === size
    );
    if (existing) {
        if (existing.qty > 1) {
            existing.qty -= 1;
        } else {
            cart = cart.filter(item =>
                !(item.productId === productId &&
                    item.colorName === colorName &&
                    item.size === size)
            );
        }
    }
    saveCart();
    updateBadge();
    renderProducts();
}

function deleteItemFromCart(productId, colorName, size) {
    cart = cart.filter(item =>
        !(item.productId === productId &&
            item.colorName === colorName &&
            item.size === size)
    );
    saveCart();
    updateBadge();
    renderProducts();
}