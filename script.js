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
        const ivaAmount = document.querySelector('.iva-amount');
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
            const subtotalWithDiscount = subtotal - discount;
            
            // Calcular IVA (16%)
            const iva = Math.round(subtotalWithDiscount * 0.16);
            const total = subtotalWithDiscount + iva;
            
            // Actualizar totales
            subtotalAmount.textContent = `$${subtotal}`;
            discountAmount.textContent = `-$${discount}`;
            ivaAmount.textContent = `$${iva}`;
            totalAmount.textContent = `$${total}`;
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
            
            // Obtener elementos del modal
            const orderModal = document.getElementById('orderModal');
            const orderForm = document.getElementById('orderForm');
            const orderConfirmation = document.getElementById('orderConfirmation');
            const orderItemsForm = document.getElementById('orderItemsForm');
            const orderTotalForm = document.getElementById('orderTotalForm');
            const customerForm = document.getElementById('customerForm');
            const cancelOrderBtn = document.getElementById('cancelOrder');
            
            // Mostrar formulario, ocultar confirmación
            orderForm.style.display = 'block';
            orderConfirmation.style.display = 'none';
            
            // Llenar resumen del pedido en el formulario
            orderItemsForm.innerHTML = '';
            cart.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'order-item';
                itemDiv.innerHTML = `
                    <span>${item.name} x${item.quantity}</span>
                    <span>$${item.price * item.quantity}</span>
                `;
                orderItemsForm.appendChild(itemDiv);
            });
            
            // Mostrar total
            const total = totalAmount.textContent;
            orderTotalForm.textContent = total;
            
            // Mostrar modal
            orderModal.classList.add('active');
            cartPanel.classList.remove('active');
            
            // Manejar cancelación
            cancelOrderBtn.onclick = () => {
                orderModal.classList.remove('active');
                customerForm.reset();
            };
            
            // Manejar envío del formulario
            customerForm.onsubmit = (e) => {
                e.preventDefault();
                
                // Obtener valores del formulario
                const name = document.getElementById('customerName').value;
                const phone = document.getElementById('customerPhone').value;
                const email = document.getElementById('customerEmail').value;
                const pickupLocation = document.getElementById('pickupLocation').value;
                const comments = document.getElementById('comments').value;
                
                // Llenar información de confirmación
                document.getElementById('confirmName').textContent = name;
                document.getElementById('confirmPhone').textContent = phone;
                document.getElementById('confirmLocation').textContent = pickupLocation;
                
                // Llenar resumen del pedido en confirmación
                const orderItemsConfirm = document.getElementById('orderItemsConfirm');
                orderItemsConfirm.innerHTML = '';
                cart.forEach(item => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'order-item';
                    itemDiv.innerHTML = `
                        <span>${item.name} x${item.quantity}</span>
                        <span>$${item.price * item.quantity}</span>
                    `;
                    orderItemsConfirm.appendChild(itemDiv);
                });
                
                document.getElementById('orderTotalConfirm').textContent = total;
                
                // Crear mensaje para WhatsApp
                let mensaje = `*NUEVO PEDIDO - La Siberial*%0A%0A`;
                mensaje += `*Datos del cliente:*%0A`;
                mensaje += `Nombre: ${name}%0A`;
                mensaje += `Teléfono: ${phone}%0A`;
                if (email) mensaje += `Email: ${email}%0A`;
                mensaje += `Sucursal: ${pickupLocation}%0A`;
                if (comments) mensaje += `Comentarios: ${comments}%0A`;
                mensaje += `%0A*Detalles del pedido:*%0A`;
                
                cart.forEach(item => {
                    mensaje += `${item.name} x${item.quantity} - $${item.price * item.quantity}%0A`;
                });
                
                mensaje += `%0A*Total a pagar: ${total}*`;
                
                // Número de WhatsApp del restaurante
                const whatsappNumber = '528125054847';
                const whatsappURL = `https://wa.me/${whatsappNumber}?text=${mensaje}`;
                
                // Mostrar confirmación, ocultar formulario
                orderForm.style.display = 'none';
                orderConfirmation.style.display = 'block';
                
                // Hacer scroll al inicio del modal
                const orderContent = document.querySelector('.order-content');
                orderContent.scrollTop = 0;
                
                // Abrir WhatsApp
                window.open(whatsappURL, '_blank');
                
                // Guardar información del pedido (opcional)
                console.log('Pedido confirmado:', {
                    cliente: { name, phone, email, pickupLocation, comments },
                    pedido: cart,
                    total: total
                });
            };
            
            // Botón de finalizar
            document.getElementById('finishOrder').onclick = () => {
                orderModal.classList.remove('active');
                cart = [];
                updateCart();
                totalInput.value = '';
                customerForm.reset();
            };
            
            // Cerrar modal al hacer click fuera (solo si está en confirmación)
            orderModal.onclick = (e) => {
                if (e.target === orderModal && orderConfirmation.style.display === 'block') {
                    orderModal.classList.remove('active');
                    cart = [];
                    updateCart();
                    totalInput.value = '';
                    customerForm.reset();
                }
            };
        }
    });
})();