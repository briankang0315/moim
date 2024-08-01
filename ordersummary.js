document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const cartData = urlParams.get('cart');
    const orderSummary = document.getElementById('orderSummary');
    
    let totalPrice = 0;

    // Check if cart data is present
    if (cartData) {
        try {
            // Decode and parse the cart data safely
            const decodedCartData = decodeURIComponent(cartData);
            const cart = JSON.parse(decodedCartData);

            cart.forEach(dish => {
                const item = document.createElement('div');
                item.className = 'order-item';
                
                const name = document.createElement('p');
                name.className = 'dish-name';
                name.textContent = dish.name;

                // Display all selected options
                const selectedOptions = document.createElement('ul');
                selectedOptions.className = 'selected-options';
                dish.selectedOptions.forEach(option => {
                    const optionItem = document.createElement('li');
                    optionItem.textContent = option.isDiscount
                        ? `${option.name} (10% Off)`
                        : `${option.name} (+RM ${Number(option.priceIncrement).toFixed(2)})`;
                    selectedOptions.appendChild(optionItem);
                });

                // Calculate the total price including options
                const finalPrice = parseFloat(dish.price) || 0; // Ensure default value
                
                const price = document.createElement('p');
                price.className = 'dish-price';
                price.textContent = `RM ${finalPrice.toFixed(2)}`;
                
                totalPrice += finalPrice;
                
                item.appendChild(name);
                item.appendChild(selectedOptions); // Display selected options in order summary
                item.appendChild(price);
                orderSummary.appendChild(item);
            });

            const total = document.createElement('p');
            total.className = 'total-price';
            total.textContent = `Total: RM ${totalPrice.toFixed(2)}`;
            orderSummary.appendChild(total);

        } catch (error) {
            console.error('Error parsing cart data:', error);
            const errorMessage = document.createElement('p');
            errorMessage.className = 'error-message';
            errorMessage.textContent = 'There was an error processing your order. Please try again.';
            orderSummary.appendChild(errorMessage);
        }
    } else {
        // Display message if cart is empty
        const message = document.createElement('p');
        message.className = 'empty-cart-message';
        message.textContent = 'Your cart is empty.';
        orderSummary.appendChild(message);
    }
});

function confirmOrder() {
    alert('Order confirmed!');
    // Add further logic for order confirmation
}
