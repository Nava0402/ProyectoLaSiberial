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
        const clearCartBtn = document.querySelector('.clear-cart-btn');
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
        
        // Clear cart button
        clearCartBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('El carrito ya está vacío');
                return;
            }
            if (confirm('¿Quieres vaciar el carrito?')) {
                cart = [];
                saveCart();
                updateCart();
            }
        });
        
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
                if (profile.countryCode) document.getElementById('customerCountryCode').value = profile.countryCode;
                if (profile.phone) document.getElementById('customerPhone').value = profile.phone;
                if (profile.email) document.getElementById('customerEmail').value = profile.email;
                if (profile.address) document.getElementById('customerAddress').value = profile.address;
                if (profile.location) {
                    // Convertir valores antiguos a nuevos
                    let locationValue = profile.location;
                    if (locationValue === 'Sucursal Centro') locationValue = 'Sucursal Escobedo';
                    if (locationValue === 'Sucursal Norte') locationValue = 'Sucursal San Nicolás';
                    
                    document.getElementById('pickupLocation').value = locationValue;
                }
                
                // Load payment method and card data if available
                if (profile.paymentMethod) {
                    const cashBtn = document.getElementById('cashBtn');
                    const cardBtn = document.getElementById('cardBtn');
                    
                    if (cashBtn && cardBtn) {
                        // Set active button based on saved payment method
                        if (profile.paymentMethod === 'Tarjeta') {
                            cardBtn.classList.add('active');
                            cashBtn.classList.remove('active');
                            
                            const customerCardFields = document.getElementById('customerCardFields');
                            if (customerCardFields) {
                                customerCardFields.style.display = 'block';
                                if (profile.cardNumber) document.getElementById('customerCardNumber').value = profile.cardNumber;
                                if (profile.cardExpiry) document.getElementById('customerCardExpiry').value = profile.cardExpiry;
                                if (profile.cardCVV) document.getElementById('customerCardCVV').value = profile.cardCVV;
                                if (profile.cardName) document.getElementById('customerCardName').value = profile.cardName;
                                
                                // Set required fields
                                document.getElementById('customerCardNumber').required = true;
                                document.getElementById('customerCardExpiry').required = true;
                                document.getElementById('customerCardCVV').required = true;
                                document.getElementById('customerCardName').required = true;
                            }
                        } else {
                            cashBtn.classList.add('active');
                            cardBtn.classList.remove('active');
                        }
                    }
                }
                
                // Actualizar bandera si hay código de país
                if (profile.countryCode && window.updateCountryFlag) {
                    setTimeout(() => {
                        const countryInput = document.getElementById('customerCountryCode');
                        if (countryInput) {
                            window.updateCountryFlag(countryInput);
                        }
                    }, 50);
                }
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
            
            // Scroll al inicio del modal después de mostrarlo
            requestAnimationFrame(() => {
                const orderContent = orderModal.querySelector('.order-content');
                if (orderContent) {
                    orderContent.scrollTop = 0;
                }
                // También scroll del modal en sí
                orderModal.scrollTop = 0;
            });
            
            // Manejar cancelación
            cancelOrderBtn.onclick = () => {
                orderModal.classList.remove('active');
                customerForm.reset();
            };
            
            // Controlar botones de tipo de entrega
            const deliveryBtn = document.getElementById('deliveryBtn');
            const pickupBtn = document.getElementById('pickupBtn');
            const deliverySection = document.getElementById('deliverySection');
            const pickupSection = document.getElementById('pickupSection');
            const customerAddress = document.getElementById('customerAddress');
            const pickupLocation = document.getElementById('pickupLocation');
            const cashBtn = document.getElementById('cashBtn');
            const cardBtn = document.getElementById('cardBtn');
            const customerCardFields = document.getElementById('customerCardFields');
            
            // Show/hide card fields based on payment method button selection
            if (cashBtn && cardBtn && customerCardFields) {
                cashBtn.addEventListener('click', () => {
                    cashBtn.classList.add('active');
                    cardBtn.classList.remove('active');
                    customerCardFields.style.display = 'none';
                    document.getElementById('customerCardNumber').required = false;
                    document.getElementById('customerCardExpiry').required = false;
                    document.getElementById('customerCardCVV').required = false;
                    document.getElementById('customerCardName').required = false;
                });
                
                cardBtn.addEventListener('click', () => {
                    cardBtn.classList.add('active');
                    cashBtn.classList.remove('active');
                    customerCardFields.style.display = 'block';
                    document.getElementById('customerCardNumber').required = true;
                    document.getElementById('customerCardExpiry').required = true;
                    document.getElementById('customerCardCVV').required = true;
                    document.getElementById('customerCardName').required = true;
                });
            }
            
            // Format customer card number
            const customerCardNumber = document.getElementById('customerCardNumber');
            if (customerCardNumber) {
                customerCardNumber.addEventListener('input', (e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
                    e.target.value = formattedValue;
                });
            }
            
            // Format customer card expiry
            const customerCardExpiry = document.getElementById('customerCardExpiry');
            if (customerCardExpiry) {
                customerCardExpiry.addEventListener('input', (e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length >= 2) {
                        value = value.slice(0, 2) + '/' + value.slice(2, 4);
                    }
                    e.target.value = value;
                });
            }
            
            // Format customer card CVV
            const customerCardCVV = document.getElementById('customerCardCVV');
            if (customerCardCVV) {
                customerCardCVV.addEventListener('input', (e) => {
                    e.target.value = e.target.value.replace(/\D/g, '');
                });
            }
            
            deliveryBtn.addEventListener('click', () => {
                deliveryBtn.classList.add('active');
                pickupBtn.classList.remove('active');
                deliverySection.style.display = 'block';
                pickupSection.style.display = 'none';
                customerAddress.required = true;
                pickupLocation.required = false;
            });
            
            pickupBtn.addEventListener('click', () => {
                pickupBtn.classList.add('active');
                deliveryBtn.classList.remove('active');
                pickupSection.style.display = 'block';
                deliverySection.style.display = 'none';
                pickupLocation.required = true;
                customerAddress.required = false;
                
                // Cargar sucursal preferida del perfil
                const savedProfile = localStorage.getItem('ls_user_profile');
                if (savedProfile) {
                    const profile = JSON.parse(savedProfile);
                    if (profile.location) {
                        const pickupSelect = document.getElementById('pickupLocation');
                        
                        // Convertir valores antiguos a nuevos
                        let locationValue = profile.location;
                        if (locationValue === 'Sucursal Centro') locationValue = 'Sucursal Escobedo';
                        if (locationValue === 'Sucursal Norte') locationValue = 'Sucursal San Nicolás';
                        
                        pickupSelect.value = locationValue;
                    }
                }
            });
            
            // Renderizar carrito al cargar la página
            updateCart();
            
            // Manejar envío del formulario
            customerForm.onsubmit = (e) => {
                e.preventDefault();
                
                // Obtener valores del formulario
                const name = document.getElementById('customerName').value;
                let countryCode = document.getElementById('customerCountryCode').value;
                const phone = document.getElementById('customerPhone').value;
                
                // Limpiar emoji de bandera del código de país para validación
                const emojiRegex = /[\u{1F1E6}-\u{1F1FF}]{2}/gu;
                countryCode = countryCode.replace(emojiRegex, '').trim();
                
                // Validar que se haya ingresado el código de país
                if (!countryCode || !countryCode.trim()) {
                    alert('Por favor ingresa el código de país');
                    document.getElementById('customerCountryCode').focus();
                    return;
                }
                
                // Validar que el código de país empiece con +
                if (!countryCode.startsWith('+')) {
                    alert('El código de país debe comenzar con +');
                    document.getElementById('customerCountryCode').focus();
                    return;
                }
                
                const fullPhone = countryCode + phone;
                const email = document.getElementById('customerEmail').value;
                const address = document.getElementById('customerAddress').value;
                const pickupLocation = document.getElementById('pickupLocation').value;
                const comments = document.getElementById('comments').value;
                
                // Get payment method from active button
                const cardBtn = document.getElementById('cardBtn');
                const paymentMethod = cardBtn.classList.contains('active') ? 'Tarjeta' : 'Efectivo';
                let cardNumber = '';
                let cardExpiry = '';
                let cardCVV = '';
                let cardName = '';
                
                if (paymentMethod === 'Tarjeta') {
                    cardNumber = document.getElementById('customerCardNumber').value;
                    cardExpiry = document.getElementById('customerCardExpiry').value;
                    cardCVV = document.getElementById('customerCardCVV').value;
                    cardName = document.getElementById('customerCardName').value;
                }
                
                // Determinar tipo de entrega
                const isDelivery = deliveryBtn.classList.contains('active');
                
                // Llenar información de confirmación
                document.getElementById('confirmName').textContent = name;
                
                // Separar el código de país del número
                const phoneFormatted = fullPhone.replace(/(\+\d{2})(\d+)/, '$1 $2');
                document.getElementById('confirmPhone').textContent = phoneFormatted;
                
                // Mostrar dirección o sucursal según el tipo de entrega
                const confirmLocationLabel = document.getElementById('confirmLocationLabel');
                const confirmPaymentMethodItem = document.getElementById('confirmPaymentMethodItem');
                const deliverySteps = document.getElementById('deliverySteps');
                const pickupSteps = document.getElementById('pickupSteps');
                
                if (isDelivery) {
                    confirmLocationLabel.textContent = 'Dirección:';
                    document.getElementById('confirmLocation').textContent = address || 'No especificada';
                    
                    // Show payment method for delivery
                    if (confirmPaymentMethodItem) {
                        confirmPaymentMethodItem.style.display = 'block';
                        document.getElementById('confirmPaymentMethod').textContent = paymentMethod;
                    }
                    
                    // Show delivery steps
                    if (deliverySteps) deliverySteps.style.display = 'block';
                    if (pickupSteps) pickupSteps.style.display = 'none';
                } else {
                    confirmLocationLabel.textContent = 'Sucursal:';
                    document.getElementById('confirmLocation').textContent = pickupLocation;
                    
                    // Hide payment method for pickup
                    if (confirmPaymentMethodItem) {
                        confirmPaymentMethodItem.style.display = 'none';
                    }
                    
                    // Show pickup steps
                    if (deliverySteps) deliverySteps.style.display = 'none';
                    if (pickupSteps) pickupSteps.style.display = 'block';
                }
                
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
                // Codificar el + como %2B para WhatsApp
                const phoneForWhatsApp = phoneFormatted.replace('+', '%2B');
                mensaje += `Teléfono: ${phoneForWhatsApp}%0A`;
                if (email) mensaje += `Email: ${email}%0A`;
                
                if (isDelivery) {
                    mensaje += `%0A*Tipo de entrega:* Entrega a domicilio%0A`;
                    if (address) mensaje += `Dirección: ${address}%0A`;
                    
                    // Add payment method info for delivery
                    if (paymentMethod) {
                        mensaje += `%0A*Método de pago:* ${paymentMethod}%0A`;
                        if (paymentMethod === 'Tarjeta') {
                            mensaje += `Tarjeta: **** **** **** ${cardNumber.slice(-4)}%0A`;
                            mensaje += `Vencimiento: ${cardExpiry}%0A`;
                            mensaje += `Nombre: ${cardName}%0A`;
                        }
                    }
                } else {
                    mensaje += `%0A*Tipo de entrega:* Recoger en sucursal%0A`;
                    mensaje += `Sucursal: ${pickupLocation}%0A`;
                }
                
                if (comments) mensaje += `Comentarios: ${comments}%0A`;
                mensaje += `%0A*Detalles del pedido:*%0A`;
                
                cart.forEach(item => {
                    mensaje += `${item.name} x${item.quantity} - $${item.price * item.quantity}%0A`;
                });
                
                mensaje += `%0A*Total a pagar: ${total}*`;
                
                // Número de WhatsApp del restaurante
                const whatsappNumber = '528125054847';
                const whatsappURL = `https://wa.me/${whatsappNumber}?text=${mensaje}`;
                
                // Cambiar visibilidad
                orderForm.style.display = 'none';
                orderConfirmation.style.display = 'block';
                
                // Agregar clase para posición fija en el tope
                orderConfirmation.classList.add('at-top');
                
                // Scroll a 0
                window.scrollTo(0, 0);
                
                // Forzar scroll después de mostrar
                setTimeout(() => {
                    window.scrollTo(0, 0);
                }, 10);
                
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
                orderConfirmation.classList.remove('at-top');
                orderForm.style.display = 'block';
                orderConfirmation.style.display = 'none';
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
                    orderConfirmation.classList.remove('at-top');
                    orderForm.style.display = 'block';
                    orderConfirmation.style.display = 'none';
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
        const profilePaymentMethod = document.getElementById('profilePaymentMethod');
        const cardFields = document.getElementById('cardFields');
        
        // Show/hide card fields based on payment method
        if (profilePaymentMethod && cardFields) {
            profilePaymentMethod.addEventListener('change', (e) => {
                if (e.target.value === 'Tarjeta') {
                    cardFields.style.display = 'block';
                } else {
                    cardFields.style.display = 'none';
                    // Clear card fields when switching away from Tarjeta
                    const cardNumber = document.getElementById('cardNumber');
                    const cardExpiry = document.getElementById('cardExpiry');
                    const cardCVV = document.getElementById('cardCVV');
                    const cardName = document.getElementById('cardName');
                    if (cardNumber) cardNumber.value = '';
                    if (cardExpiry) cardExpiry.value = '';
                    if (cardCVV) cardCVV.value = '';
                    if (cardName) cardName.value = '';
                }
            });
        }
        
        // Format card number with spaces every 4 digits
        const cardNumberInput = document.getElementById('cardNumber');
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value; // Add space every 4 digits
                e.target.value = formattedValue;
            });
        }
        
        // Format card expiry with auto-slash MM/YY
        const cardExpiryInput = document.getElementById('cardExpiry');
        if (cardExpiryInput) {
            cardExpiryInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                if (value.length >= 2) {
                    value = value.slice(0, 2) + '/' + value.slice(2, 4);
                }
                e.target.value = value;
            });
        }
        
        // Allow only digits in CVV
        const cardCVVInput = document.getElementById('cardCVV');
        if (cardCVVInput) {
            cardCVVInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '');
            });
        }
        
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
            if (profile && (profile.name || profile.phone || profile.email || profile.location || profile.address || profile.paymentMethod)) {
                profileIcon.classList.add('filled');
                console.log('Icono marcado como filled');
            } else {
                profileIcon.classList.remove('filled');
                console.log('Icono sin filled');
            }
        }
        
        // Abrir modal al hacer click en el icono de perfil
        profileIcon.addEventListener('click', () => {
            const profile = loadProfile();
            if (profile) {
                document.getElementById('profileName').value = profile.name || '';
                document.getElementById('profileCountryCode').value = profile.countryCode || '';
                document.getElementById('profilePhone').value = profile.phone || '';
                document.getElementById('profileEmail').value = profile.email || '';
                document.getElementById('profileLocation').value = profile.location || '';
                document.getElementById('profileAddress').value = profile.address || '';
                document.getElementById('profilePaymentMethod').value = profile.paymentMethod || '';
                
                // Load card data if exists
                const cardNumber = document.getElementById('cardNumber');
                const cardExpiry = document.getElementById('cardExpiry');
                const cardCVV = document.getElementById('cardCVV');
                const cardName = document.getElementById('cardName');
                if (cardNumber) cardNumber.value = profile.cardNumber || '';
                if (cardExpiry) cardExpiry.value = profile.cardExpiry || '';
                if (cardCVV) cardCVV.value = profile.cardCVV || '';
                if (cardName) cardName.value = profile.cardName || '';
                
                // Show card fields if payment method is Tarjeta
                if (cardFields && profile.paymentMethod === 'Tarjeta') {
                    cardFields.style.display = 'block';
                } else if (cardFields) {
                    cardFields.style.display = 'none';
                }
                
                // Actualizar bandera si hay código de país
                if (profile.countryCode && window.updateCountryFlag) {
                    setTimeout(() => {
                        const countryInput = document.getElementById('profileCountryCode');
                        if (countryInput) {
                            window.updateCountryFlag(countryInput);
                        }
                    }, 50);
                }
            } else {
                profileForm.reset();
            }
            profileModal.classList.add('active');
        });
        
        // Cargar datos del perfil al iniciar
        document.addEventListener('DOMContentLoaded', () => {
            const profile = loadProfile();
            if (profile) {
                document.getElementById('profileName').value = profile.name || '';
                document.getElementById('profileCountryCode').value = profile.countryCode || '';
                document.getElementById('profilePhone').value = profile.phone || '';
                document.getElementById('profileEmail').value = profile.email || '';
                document.getElementById('profileLocation').value = profile.location || '';
                document.getElementById('profileAddress').value = profile.address || '';
                document.getElementById('profilePaymentMethod').value = profile.paymentMethod || '';
                
                // Actualizar bandera si hay código de país
                if (profile.countryCode && window.updateCountryFlag) {
                    setTimeout(() => {
                        const countryInput = document.getElementById('profileCountryCode');
                        if (countryInput) {
                            window.updateCountryFlag(countryInput);
                        }
                    }, 50);
                }
            }
        });
        
        // Cerrar modal de perfil
        closeProfile.addEventListener('click', () => {
            profileModal.classList.remove('active');
            // Recargar los datos guardados para descartar cambios no guardados
            const profile = loadProfile();
            if (profile) {
                document.getElementById('profileName').value = profile.name || '';
                document.getElementById('profileCountryCode').value = profile.countryCode || '';
                document.getElementById('profilePhone').value = profile.phone || '';
                document.getElementById('profileEmail').value = profile.email || '';
                document.getElementById('profileLocation').value = profile.location || '';
                document.getElementById('profileAddress').value = profile.address || '';
                
                // Actualizar bandera si hay código de país
                if (profile.countryCode && window.updateCountryFlag) {
                    setTimeout(() => {
                        const countryInput = document.getElementById('profileCountryCode');
                        if (countryInput) {
                            window.updateCountryFlag(countryInput);
                        }
                    }, 50);
                }
            } else {
                profileForm.reset();
            }
        });
        
        // Guardar perfil
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Limpiar emoji de bandera del código de país antes de guardar
            let countryCodeValue = document.getElementById('profileCountryCode').value.trim();
            const emojiRegex = /[\u{1F1E6}-\u{1F1FF}]{2}/gu;
            countryCodeValue = countryCodeValue.replace(emojiRegex, '').trim();
            
            const profileData = {
                name: document.getElementById('profileName').value.trim(),
                countryCode: countryCodeValue,
                phone: document.getElementById('profilePhone').value.trim(),
                email: document.getElementById('profileEmail').value.trim(),
                location: document.getElementById('profileLocation').value,
                address: document.getElementById('profileAddress').value.trim(),
                paymentMethod: document.getElementById('profilePaymentMethod').value,
                cardNumber: document.getElementById('cardNumber') ? document.getElementById('cardNumber').value.trim() : '',
                cardExpiry: document.getElementById('cardExpiry') ? document.getElementById('cardExpiry').value.trim() : '',
                cardCVV: document.getElementById('cardCVV') ? document.getElementById('cardCVV').value.trim() : '',
                cardName: document.getElementById('cardName') ? document.getElementById('cardName').value.trim() : ''
            };
            
            if (!profileData.name && !profileData.phone && !profileData.email && !profileData.location && !profileData.address && !profileData.paymentMethod) {
                alert('Por favor completa al menos un campo para guardar tus datos');
                return;
            }
            
            // Si se llena el teléfono, el código de país es obligatorio
            if (profileData.phone && !profileData.countryCode) {
                alert('Por favor ingresa el código de país para tu teléfono');
                document.getElementById('profileCountryCode').focus();
                return;
            }
            
            // Si hay código de país, debe empezar con +
            if (profileData.countryCode && !profileData.countryCode.startsWith('+')) {
                alert('El código de país debe comenzar con +');
                document.getElementById('profileCountryCode').focus();
                return;
            }
            
            saveProfile(profileData);
            profileModal.classList.remove('active');
            alert('¡Datos guardados correctamente!');
        });
        
        // Borrar perfil
        clearProfile.addEventListener('click', () => {
            const profile = loadProfile();
            if (!profile || (!profile.name && !profile.phone && !profile.email && !profile.location && !profile.address && !profile.paymentMethod)) {
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
        
        // Agregar event listeners para actualizar banderas en campos de código de país
        setTimeout(() => {
            const countryCodeInputs = document.querySelectorAll('.country-code-input');
            console.log('Campos de código encontrados:', countryCodeInputs.length);
            countryCodeInputs.forEach(input => {
                input.addEventListener('input', function() {
                    console.log('Input detectado:', this.value);
                    window.updateCountryFlag(this);
                });
            });
        }, 100);
    });
    
    // Función para actualizar emoji de bandera según código de país
    window.updateCountryFlag = function(input) {
        const countryFlags = {
            '+1': '🇺🇸',
            '+7': '🇷🇺',
            '+20': '🇪🇬',
            '+27': '🇿🇦',
            '+30': '🇬🇷',
            '+31': '🇳🇱',
            '+32': '🇧🇪',
            '+33': '🇫🇷',
            '+34': '🇪🇸',
            '+36': '🇭🇺',
            '+39': '🇮🇹',
            '+40': '🇷🇴',
            '+41': '🇨🇭',
            '+43': '🇦🇹',
            '+44': '🇬🇧',
            '+45': '🇩🇰',
            '+46': '🇸🇪',
            '+47': '🇳🇴',
            '+48': '🇵🇱',
            '+49': '🇩🇪',
            '+51': '🇵🇪',
            '+52': '🇲🇽',
            '+53': '🇨🇺',
            '+54': '🇦🇷',
            '+55': '🇧🇷',
            '+56': '🇨🇱',
            '+57': '🇨🇴',
            '+58': '🇻🇪',
            '+60': '🇲🇾',
            '+61': '🇦🇺',
            '+62': '🇮🇩',
            '+63': '🇵🇭',
            '+64': '🇳🇿',
            '+65': '🇸🇬',
            '+66': '🇹🇭',
            '+81': '🇯🇵',
            '+82': '🇰🇷',
            '+84': '🇻🇳',
            '+86': '🇨🇳',
            '+90': '🇹🇷',
            '+91': '🇮🇳',
            '+92': '🇵🇰',
            '+93': '🇦🇫',
            '+94': '🇱🇰',
            '+95': '🇲🇲',
            '+98': '🇮🇷',
            '+212': '🇲🇦',
            '+213': '🇩🇿',
            '+216': '🇹🇳',
            '+218': '🇱🇾',
            '+220': '🇬🇲',
            '+221': '🇸🇳',
            '+222': '🇲🇷',
            '+223': '🇲🇱',
            '+224': '🇬🇳',
            '+225': '🇨🇮',
            '+226': '🇧🇫',
            '+227': '🇳🇪',
            '+228': '🇹🇬',
            '+229': '🇧🇯',
            '+230': '🇲🇺',
            '+231': '🇱🇷',
            '+232': '🇸🇱',
            '+233': '🇬🇭',
            '+234': '🇳🇬',
            '+235': '🇹🇩',
            '+236': '🇨🇫',
            '+237': '🇨🇲',
            '+238': '🇨🇻',
            '+239': '🇸🇹',
            '+240': '🇬🇶',
            '+241': '🇬🇦',
            '+242': '🇨🇬',
            '+243': '🇨🇩',
            '+244': '🇦🇴',
            '+245': '🇬🇼',
            '+246': '🇮🇴',
            '+248': '🇸🇨',
            '+249': '🇸🇩',
            '+250': '🇷🇼',
            '+251': '🇪🇹',
            '+252': '🇸🇴',
            '+253': '🇩🇯',
            '+254': '🇰🇪',
            '+255': '🇹🇿',
            '+256': '🇺🇬',
            '+257': '🇧🇮',
            '+258': '🇲🇿',
            '+260': '🇿🇲',
            '+261': '🇲🇬',
            '+262': '🇷🇪',
            '+263': '🇿🇼',
            '+264': '🇳🇦',
            '+265': '🇲🇼',
            '+266': '🇱🇸',
            '+267': '🇧🇼',
            '+268': '🇸🇿',
            '+269': '🇰🇲',
            '+290': '🇸🇭',
            '+291': '🇪🇷',
            '+297': '🇦🇼',
            '+298': '🇫🇴',
            '+299': '🇬🇱',
            '+350': '🇬🇮',
            '+351': '🇵🇹',
            '+352': '🇱🇺',
            '+353': '🇮🇪',
            '+354': '🇮🇸',
            '+355': '🇦🇱',
            '+356': '🇲🇹',
            '+357': '🇨🇾',
            '+358': '🇫🇮',
            '+359': '🇧🇬',
            '+370': '🇱🇹',
            '+371': '🇱🇻',
            '+372': '🇪🇪',
            '+373': '🇲🇩',
            '+374': '🇦🇲',
            '+375': '🇧🇾',
            '+376': '🇦🇩',
            '+377': '🇲🇨',
            '+378': '🇸🇲',
            '+380': '🇺🇦',
            '+381': '🇷🇸',
            '+382': '🇲🇪',
            '+383': '🇽🇰',
            '+385': '🇭🇷',
            '+386': '🇸🇮',
            '+387': '🇧🇦',
            '+389': '🇲🇰',
            '+420': '🇨🇿',
            '+421': '🇸🇰',
            '+423': '🇱🇮',
            '+500': '🇫🇰',
            '+501': '🇧🇿',
            '+502': '🇬🇹',
            '+503': '🇸🇻',
            '+504': '🇭🇳',
            '+505': '🇳🇮',
            '+506': '🇨🇷',
            '+507': '🇵🇦',
            '+508': '🇵🇲',
            '+509': '🇭🇹',
            '+590': '🇬🇵',
            '+591': '🇧🇴',
            '+592': '🇬🇾',
            '+593': '🇪🇨',
            '+594': '🇬🇫',
            '+595': '🇵🇾',
            '+596': '🇲🇶',
            '+597': '🇸🇷',
            '+598': '🇺🇾',
            '+599': '🇨🇼',
            '+670': '🇹🇱',
            '+672': '🇳🇫',
            '+673': '🇧🇳',
            '+674': '🇳🇷',
            '+675': '🇵🇬',
            '+676': '🇹🇴',
            '+677': '🇸🇧',
            '+678': '🇻🇺',
            '+679': '🇫🇯',
            '+680': '🇵🇼',
            '+681': '🇼🇫',
            '+682': '🇨🇰',
            '+683': '🇳🇺',
            '+685': '🇼🇸',
            '+686': '🇰🇮',
            '+687': '🇳🇨',
            '+688': '🇹🇻',
            '+689': '🇵🇫',
            '+690': '🇹🇰',
            '+691': '🇫🇲',
            '+692': '🇲🇭',
            '+850': '🇰🇵',
            '+852': '🇭🇰',
            '+853': '🇲🇴',
            '+855': '🇰🇭',
            '+856': '🇱🇦',
            '+880': '🇧🇩',
            '+886': '🇹🇼',
            '+960': '🇲🇻',
            '+961': '🇱🇧',
            '+962': '🇯🇴',
            '+963': '🇸🇾',
            '+964': '🇮🇶',
            '+965': '🇰🇼',
            '+966': '🇸🇦',
            '+967': '🇾🇪',
            '+968': '🇴🇲',
            '+970': '🇵🇸',
            '+971': '🇦🇪',
            '+972': '🇮🇱',
            '+973': '🇧🇭',
            '+974': '🇶🇦',
            '+975': '🇧🇹',
            '+976': '🇲🇳',
            '+977': '🇳🇵',
            '+992': '🇹🇯',
            '+993': '🇹🇲',
            '+994': '🇦🇿',
            '+995': '🇬🇪',
            '+996': '🇰🇬',
            '+998': '🇺🇿'
        };
        
        let value = input.value.trim();
        
        // Remover bandera existente si la hay
        const emojiRegex = /[\u{1F1E6}-\u{1F1FF}]{2}/gu;
        value = value.replace(emojiRegex, '').trim();
        
        // Si el usuario empieza a escribir y no tiene +, agregarlo automáticamente
        if (value.length > 0 && !value.startsWith('+')) {
            value = '+' + value;
        }
        
        // Buscar el código de país en el valor
        const codeMatch = value.match(/\+\d{1,4}/);
        if (codeMatch) {
            const code = codeMatch[0];
            const flag = countryFlags[code];
            
            // Solo agregar la bandera si existe en el diccionario
            if (flag) {
                input.value = flag + ' ' + value;
            } else {
                input.value = value;
            }
        } else if (value.length > 0) {
            // Si hay texto pero no coincide con el patrón, mantener el valor
            input.value = value;
        }
    }
    
})();