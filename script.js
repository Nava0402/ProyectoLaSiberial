(() => {
    // Estado del carrito
    const cartKey = 'ls_shopping_cart';
    let cart = [];
    
    // Funciones para persistencia del carrito
    function saveCart() {
        localStorage.setItem(cartKey, JSON.stringify(cart));
    }
    
    function loadCart() {
        const saved = localStorage.getItem(cartKey);
        return saved ? JSON.parse(saved) : [];
    }

    // Inicialización cuando el documento esté listo
    document.addEventListener('DOMContentLoaded', function() {
        // Cargar carrito guardado
        cart = loadCart();
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
        
        // Renderizar carrito guardado al cargar la página
        updateCart();

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
            
            saveCart();
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
                        saveCart();
                        updateCart();
                    }
                });

                plusBtn.addEventListener('click', () => {
                    item.quantity++;
                    saveCart();
                    updateCart();
                });

                quantityInput.addEventListener('change', (e) => {
                    const newQuantity = parseInt(e.target.value);
                    if (newQuantity >= 1) {
                        item.quantity = newQuantity;
                        saveCart();
                        updateCart();
                    }
                });

                removeBtn.addEventListener('click', () => {
                    cart = cart.filter(i => i !== item);
                    saveCart();
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
            
            // Cargar datos del perfil si existen
            const profileKey = 'ls_user_profile';
            const savedProfile = localStorage.getItem(profileKey);
            if (savedProfile) {
                const profile = JSON.parse(savedProfile);
                if (profile.name) document.getElementById('customerName').value = profile.name;
                if (profile.phone) document.getElementById('customerPhone').value = profile.phone;
                if (profile.email) document.getElementById('customerEmail').value = profile.email;
                if (profile.location) document.getElementById('pickupLocation').value = profile.location;
            }
            
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
            
            // Renderizar carrito al cargar la página
            updateCart();
            
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
                saveCart();
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
        
        // Sistema de perfil de usuario
        const profileIcon = document.getElementById('profileIcon');
        const profileModal = document.getElementById('profileModal');
        const profileForm = document.getElementById('profileForm');
        const closeProfile = document.getElementById('closeProfile');
        const clearProfile = document.getElementById('clearProfile');
        const profileKey = 'ls_user_profile';
        
        function loadProfile() {
            const raw = localStorage.getItem(profileKey);
            return raw ? JSON.parse(raw) : null;
        }
        
        function saveProfile(data) {
            localStorage.setItem(profileKey, JSON.stringify(data));
            updateProfileIcon();
        }
        
        function updateProfileIcon() {
            const profile = loadProfile();
            console.log('Actualizando icono de perfil. Datos:', profile);
            if (profile && (profile.name || profile.phone)) {
                profileIcon.classList.add('filled');
                console.log('Icono marcado como filled');
            } else {
                profileIcon.classList.remove('filled');
                console.log('Icono sin filled');
            }
        }
        
        // Cargar datos del perfil al abrir el modal
        profileIcon.addEventListener('click', () => {
            const profile = loadProfile();
            if (profile) {
                document.getElementById('profileName').value = profile.name || '';
                document.getElementById('profilePhone').value = profile.phone || '';
                document.getElementById('profileEmail').value = profile.email || '';
                document.getElementById('profileLocation').value = profile.location || '';
            }
            profileModal.classList.add('active');
        });
        
        // Cerrar modal de perfil
        closeProfile.addEventListener('click', () => {
            profileModal.classList.remove('active');
        });
        
        // Guardar perfil
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const profileData = {
                name: document.getElementById('profileName').value.trim(),
                phone: document.getElementById('profilePhone').value.trim(),
                email: document.getElementById('profileEmail').value.trim(),
                location: document.getElementById('profileLocation').value
            };
            saveProfile(profileData);
            profileModal.classList.remove('active');
            alert('¡Datos guardados correctamente!');
        });
        
        // Borrar perfil
        clearProfile.addEventListener('click', () => {
            const profile = loadProfile();
            if (!profile || (!profile.name && !profile.phone && !profile.email && !profile.location)) {
                alert('No hay datos guardados para eliminar');
                return;
            }
            if (confirm('¿Estás seguro de que quieres borrar tus datos guardados?')) {
                localStorage.removeItem(profileKey);
                profileForm.reset();
                updateProfileIcon();
                alert('Datos eliminados correctamente');
            }
        });
        
        // Actualizar icono al cargar
        updateProfileIcon();
        
        // Cerrar modal al hacer click fuera
        profileModal.onclick = (e) => {
            if (e.target === profileModal) {
                profileModal.classList.remove('active');
            }
        };
        
        // Prevenir scroll del body cuando los modales están abiertos
        const preventBodyScroll = () => {
            document.body.style.overflow = 'hidden';
        };
        
        const allowBodyScroll = () => {
            document.body.style.overflow = '';
        };
        
        // Observar cambios en los modales
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    const target = mutation.target;
                    if (target.classList.contains('active')) {
                        preventBodyScroll();
                    } else {
                        // Verificar si hay algún otro modal abierto
                        const anyModalOpen = document.querySelector('.order-modal.active, .profile-modal.active');
                        if (!anyModalOpen) {
                            allowBodyScroll();
                        }
                    }
                }
            });
        });
        
        // Observar ambos modales
        if (orderModal) observer.observe(orderModal, { attributes: true });
        if (profileModal) observer.observe(profileModal, { attributes: true });
    });
})();