// ============================================
// CART MANAGEMENT SYSTEM
// Bigg Mini Cafe - Shopping Cart
// ============================================

// Product Database
const PRODUCTS = {
    'yirgacheffe': {
        id: 'yirgacheffe',
        name: 'Ethiopian Yirgacheffe - Whole Bean Coffee',
        category: 'Whole Bean Coffee',
        price: 18.00,
        description: 'Bright and aromatic cup with floral depth and citrus lift.',
        image: 'images/coffee.png',
        badge: 'SPECIALTY SINGLE ORIGIN'
    },
    'oolong': {
        id: 'oolong',
        name: 'Spring Oolong - Loose Leaf Tea',
        category: 'Loose Leaf Tea',
        price: 16.00,
        description: 'Elegant floral body with silky sweetness and long finish.',
        image: 'images/oolong-tea.jpg',
        badge: 'HERBAL INFUSION'
    },
    'matcha': {
        id: 'matcha',
        name: 'Ceremonial Matcha - Premium Green Tea',
        category: 'Stone Ground Green Tea',
        price: 24.00,
        description: 'Creamy umami profile designed for clean focus and smooth energy.',
        image: 'images/green-tea.webp',
        badge: 'CEREMONIAL GRADE'
    },
    'herbal': {
        id: 'herbal',
        name: 'Forest Herbal Blend - Evening Tea',
        category: 'Botanical Tea Blend',
        price: 14.00,
        description: 'Soft floral comfort for slower evenings and deep relaxation.',
        image: 'images/herbal-tea.webp',
        badge: 'CAFFEINE FREE'
    },
    'blacktea': {
        id: 'blacktea',
        name: 'Aged Black Tea - Estate Reserve',
        category: 'Aged Black Tea',
        price: 17.00,
        description: 'Bold malty cup with dark cocoa character and rich finish.',
        image: 'images/black-tea.jpg',
        badge: 'ESTATE RESERVE'
    },
    'espresso': {
        id: 'espresso',
        name: 'Artisanal Espresso - House Roast',
        category: 'Espresso Whole Bean',
        price: 18.00,
        description: 'Dense crema, caramel body, and a clean cocoa finish.',
        image: 'images/coffee.png',
        badge: 'HOUSE BLEND'
    }
};

// ============================================
// CART OPERATIONS
// ============================================

/**
 * Initialize cart from localStorage or create empty cart
 * @returns {Array}
 */
function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

/**
 * Save cart to localStorage
 * @param {Array} cart - Cart items array
 */
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

/**
 * Add item to cart
 * @param {string} productId - Product ID
 * @param {number} quantity - Quantity (default: 1)
 * @returns {Object} Result with success status
 */
function addToCart(productId, quantity = 1) {
    // Check auth state from the rendered profile element on pages with auth UI
    const welcomeTextElement = document.querySelector('.welcome-text');
    const isLoggedIn = !!(welcomeTextElement && welcomeTextElement.textContent.trim() !== '');
    
    if (!isLoggedIn) {
        alert('Please sign in to add items to your cart');
        window.location.href = 'SignIn.html';
        return {
            success: false,
            message: 'User must be logged in'
        };
    }

    const product = PRODUCTS[productId];
    if (!product) {
        return {
            success: false,
            message: 'Product not found'
        };
    }

    const cart = getCart();
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity
        });
    }

    saveCart(cart);
    updateCartUI();

    return {
        success: true,
        message: `${product.name} added to cart!`
    };
}

/**
 * Remove item from cart
 * @param {string} productId - Product ID
 * @returns {Object} Result with success status
 */
function removeFromCart(productId) {
    const cart = getCart();
    const index = cart.findIndex(item => item.id === productId);

    if (index > -1) {
        const item = cart[index];
        cart.splice(index, 1);
        saveCart(cart);
        updateCartUI();

        return {
            success: true,
            message: `${item.name} removed from cart`
        };
    }

    return {
        success: false,
        message: 'Item not found in cart'
    };
}

/**
 * Update item quantity
 * @param {string} productId - Product ID
 * @param {number} quantity - New quantity
 * @returns {Object} Result with success status
 */
function updateCartItemQuantity(productId, quantity) {
    const cart = getCart();
    const item = cart.find(item => item.id === productId);

    if (item) {
        if (quantity <= 0) {
            return removeFromCart(productId);
        }
        item.quantity = quantity;
        saveCart(cart);
        updateCartUI();

        return {
            success: true,
            message: 'Quantity updated'
        };
    }

    return {
        success: false,
        message: 'Item not found in cart'
    };
}

/**
 * Get cart totals
 * @returns {Object} Totals including subtotal, tax, and total
 */
function getCartTotals() {
    const cart = getCart();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.15; // 15% tax
    const total = subtotal + tax;

    return {
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        itemCount: cart.reduce((sum, item) => sum + item.quantity, 0)
    };
}

/**
 * Clear cart
 * @returns {Object} Result with success status
 */
function clearCart() {
    localStorage.removeItem('cart');
    updateCartUI();

    return {
        success: true,
        message: 'Cart cleared'
    };
}

/**
 * Get cart item count for display
 * @returns {number}
 */
function getCartItemCount() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Update cart UI elements (like badge count, cart summary)
 */
function updateCartUI() {
    const itemCount = getCartItemCount();
    
    // Update cart badge count in header if element exists
    const cartBadge = document.getElementById('cartBadge');
    if (cartBadge) {
        if (itemCount > 0) {
            cartBadge.textContent = itemCount;
            cartBadge.style.display = 'block';
        } else {
            cartBadge.style.display = 'none';
        }
    }

    // Dispatch custom event for other listeners
    window.dispatchEvent(new CustomEvent('cartUpdated', {
        detail: {
            itemCount: itemCount,
            cart: getCart(),
            totals: getCartTotals()
        }
    }));
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize cart event listeners
 * Called on page load
 */
function initCartListeners() {
    // Add event listeners to all "Add to Cart" buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-buy')) {
            const productArticle = e.target.closest('article.product, .product');
            if (productArticle) {
                const productId = productArticle.getAttribute('data-product');
                if (productId) {
                    const result = addToCart(productId);
                    // Show feedback
                    showNotification(result.message, result.success ? 'success' : 'error');
                }
            }
        }
    });

    // Update cart UI on page load
    updateCartUI();
}

/**
 * Show notification to user
 * @param {string} message - Message to display
 * @param {string} type - Notification type ('success', 'error', 'info')
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 16px 24px;
        border-radius: 4px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideIn 0.3s ease-in-out;
    `;

    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Initialize on DOM ready
 */
document.addEventListener('DOMContentLoaded', function() {
    initCartListeners();
    
    // Add animation styles to head
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});

// ============================================
// CHECKOUT (For future integration)
// ============================================

/**
 * Save order to Firestore
 * @param {string} userId - User ID
 * @param {Array} cart - Cart items
 * @param {Object} totals - Cart totals
 * @returns {Promise<Object>}
 */
async function saveOrder(userId, cart, totals) {
    try {
        // This function should be called from a checkout page
        // It will save the order to Firestore using the auth.js functions
        console.log('Order saved for user:', userId);
        console.log('Order details:', { cart, totals });
        return {
            success: true,
            message: 'Order saved successfully'
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}
