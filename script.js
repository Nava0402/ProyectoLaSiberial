(() => {
    // Estado del carrito
    let cart = [];

    // Inicialización cuando el documento esté listo
    document.addEventListener('DOMContentLoaded', function() {
        // Elementos del DOM
        const cartIcon = document.querySelector('.cart-icon');
        const cartPanel = document.querySelector('.cart-panel');
        const cartClose = document.querySelector('.cart-close');
        const cartItems = document.querySelector('.cart-items');
        const summaryItems = document.querySelector('.summary-items');
        const subtotalAmount = document.querySelector('.subtotal-amount');
        const discountAmount = document.querySelector('.discount-amount');
        const totalAmount = document.querySelector('.total-amount');
        const cartCount = document.querySelector('.cart-count');
        const checkoutBtn = document.querySelector('.checkout-btn');

        // Event Listeners
        cartIcon.addEventListener('click', () => cartPanel.classList.add('active'));
        cartClose.addEventListener('click', () => cartPanel.classList.remove('active'));
        checkoutBtn.addEventListener('click', handleCheckout);

        // Agregar botones a los productos
        document.querySelectorAll('.combo').forEach(combo => {
            const addButton = document.createElement('button');
            addButton.className = 'add-to-cart';
            addButton.innerHTML = '<i class="fas fa-plus"></i>';
            combo.appendChild(addButton);

            addButton.addEventListener('click', () => {
                const name = combo.querySelector('.meta strong').textContent;
                const price = parseInt(combo.querySelector('.price').textContent.replace('$', ''));
                addToCart(name, price);
            });
        });

        function addToCart(name, price) {
            const existingItem = cart.find(item => item.name === name);
            
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({
                    name: name,
                    price: price,
                    quantity: 1
                });
            }
            
            updateCart();
            cartPanel.classList.add('active');
        }

        function updateCart() {
            cartItems.innerHTML = '';
            summaryItems.innerHTML = '';
            let subtotal = 0;
            let itemCount = 0;

            cart.forEach(item => {
                // Agregar item al carrito
                const itemElement = document.createElement('div');
                itemElement.className = 'cart-item';
                itemElement.innerHTML = `
                    <div class="cart-item-info">
                        <div>${item.name}</div>
                        <div>$${item.price} c/u</div>
                    </div>
                    <div class="cart-controls">
                        <button class="quantity-btn minus"><i class="fas fa-minus"></i></button>
                        <input type="number" class="cart-quantity" value="${item.quantity}" min="1">
                        <button class="quantity-btn plus"><i class="fas fa-plus"></i></button>
                        <button class="remove-btn"><i class="fas fa-trash"></i></button>
                    </div>
                `;

                // Agregar item al resumen
                const summaryElement = document.createElement('div');
                summaryElement.className = 'summary-row';
                summaryElement.innerHTML = `
                    <span>${item.name} × ${item.quantity}</span>
                    <span>$${item.price * item.quantity}</span>
                `;

                // Configurar controles
                const minusBtn = itemElement.querySelector('.minus');
                const plusBtn = itemElement.querySelector('.plus');
                const quantityInput = itemElement.querySelector('.cart-quantity');
                const removeBtn = itemElement.querySelector('.remove-btn');

                minusBtn.addEventListener('click', () => {
                    if (item.quantity > 1) {
                        item.quantity--;
                        updateCart();
                    }
                });

                plusBtn.addEventListener('click', () => {
                    item.quantity++;
                    updateCart();
                });

                quantityInput.addEventListener('change', (e) => {
                    const newQuantity = parseInt(e.target.value);
                    if (newQuantity >= 1) {
                        item.quantity = newQuantity;
                        updateCart();
                    }
                });

                removeBtn.addEventListener('click', () => {
                    cart = cart.filter(i => i !== item);
                    updateCart();
                });

                cartItems.appendChild(itemElement);
                summaryItems.appendChild(summaryElement);

                subtotal += item.price * item.quantity;
                itemCount += item.quantity;
            });

            // Calcular descuento (10% en compras mayores a $200)
            const discount = subtotal >= 200 ? Math.round(subtotal * 0.1) : 0;
            
            // Actualizar totales
            subtotalAmount.textContent = `$${subtotal}`;
            discountAmount.textContent = `-$${discount}`;
            totalAmount.textContent = `$${subtotal - discount}`;
            cartCount.textContent = itemCount;
        }

        // Manejar el botón de calcular precio
        const calcBtn = document.querySelector('.calc-btn');
        const totalInput = document.querySelector('.total-input');
        
        if (calcBtn) {
            calcBtn.addEventListener('click', () => {
                const total = parseInt(totalAmount.textContent.replace('$', ''));
                totalInput.value = `$${total}`;
            });
        }

        function handleCheckout() {
            if (cart.length === 0) {
                alert('Tu carrito está vacío');
                return;
            }
            
            const total = parseInt(totalAmount.textContent.replace('$', ''));
            alert(`¡Gracias por tu pedido!\nTotal a pagar: $${total}\nTe contactaremos pronto para confirmar tu pedido.`);
            cart = [];
            updateCart();
            totalInput.value = '';
            cartPanel.classList.remove('active');
        }
    });
})();