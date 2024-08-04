document.addEventListener('DOMContentLoaded', () => {
    const cartData = sessionStorage.getItem('cart'); // Retrieve cart data from session storage
    const orderSummary = document.getElementById('orderSummary');

    let totalPrice = 0;

    if (cartData) {
        try {
            const cart = JSON.parse(cartData);
            console.log('Parsed Cart:', cart); // Debug: Log parsed cart

            // Group dishes by name and options to calculate quantities
            const groupedDishes = {};

            cart.forEach((dish, index) => {
                const key = `${dish.name}::${dish.selectedOptions.map(option => option.name).join('|')}`;

                if (!groupedDishes[key]) {
                    groupedDishes[key] = { ...dish, quantity: 1, index };
                } else {
                    groupedDishes[key].quantity++;
                }
            });

            // Iterate over the grouped dishes to display them
            Object.values(groupedDishes).forEach(dish => {
                const item = document.createElement('div');
                item.className = 'order-item o';

                const name = document.createElement('p');
                name.className = 'dish-name o';
                name.textContent = dish.name;

                // Display all selected options
                const selectedOptions = document.createElement('ul');
                selectedOptions.className = 'selected-options';
                dish.selectedOptions.forEach(option => {
                    const optionItem = document.createElement('li');
                    optionItem.textContent = option.isDiscount
                        ? `${option.name} (10% Off)`
                        : `${option.name}`;
                    selectedOptions.appendChild(optionItem);
                });

                // Quantity display
                const quantityDisplay = document.createElement('span');
                quantityDisplay.textContent = `Quantity: ${dish.quantity}`;
                quantityDisplay.className = 'quantity-display';

                // Remove button
                const removeButton = document.createElement('button');
                removeButton.textContent = 'Remove from Cart';
                removeButton.className = 'remove-button';
                removeButton.onclick = () => removeFromCart(dish, item, cart);

                const price = document.createElement('p');
                price.className = 'dish-price';
                price.textContent = `RM ${(dish.price * dish.quantity).toFixed(2)}`;

                totalPrice += dish.price * dish.quantity;

                item.appendChild(name);
                item.appendChild(selectedOptions); // Display selected options in order summary
                item.appendChild(quantityDisplay);
                item.appendChild(removeButton);
                item.appendChild(price);

                orderSummary.appendChild(item);
            });

            const taxAmount = totalPrice * 0.10; // Calculate 10% tax
            const finalTotal = totalPrice + taxAmount;

            // Display total price and tax
            const totalPriceContainer = document.createElement('div');
            totalPriceContainer.className = 'total-price-container';

            const totalElement = document.createElement('p');
            totalElement.className = 'total-price';
            totalElement.textContent = `Total: RM ${totalPrice.toFixed(2)}`;

            const taxElement = document.createElement('p');
            taxElement.className = 'tax-info';
            taxElement.textContent = `Tax (10%): RM ${taxAmount.toFixed(2)}`;

            const finalTotalElement = document.createElement('p');
            finalTotalElement.className = 'total-price';
            finalTotalElement.textContent = `Final Total: RM ${finalTotal.toFixed(2)}`;

            totalPriceContainer.appendChild(totalElement);
            totalPriceContainer.appendChild(taxElement);
            totalPriceContainer.appendChild(finalTotalElement);
            orderSummary.appendChild(totalPriceContainer);

            // Add comment section next to the confirm order button
            const commentSection = document.createElement('div');
            commentSection.className = 'comment-section';

            const commentLabel = document.createElement('label');
            commentLabel.textContent = 'Additional Comments:';

            const commentInput = document.createElement('textarea');
            commentInput.className = 'comment-input';
            commentInput.placeholder = 'Enter any special instructions or requests here...';

            commentSection.appendChild(commentLabel);
            commentSection.appendChild(commentInput);

            orderSummary.appendChild(commentSection);

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

function removeFromCart(dish, itemElement, cart) {
    // Find the index of the dish to remove from the cart
    const indexToRemove = cart.findIndex((item, idx) => {
        const key = `${item.name}::${item.selectedOptions.map(option => option.name).join('|')}`;
        const dishKey = `${dish.name}::${dish.selectedOptions.map(option => option.name).join('|')}`;
        return key === dishKey && idx === dish.index;
    });

    if (indexToRemove !== -1) {
        // Remove the dish from the cart
        cart.splice(indexToRemove, 1);

        // Update the cart in session storage
        sessionStorage.setItem('cart', JSON.stringify(cart));

        // Remove the item from the DOM
        itemElement.remove();

        // Update total price
        const updatedTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const updatedTax = updatedTotal * 0.10; // Recalculate 10% tax
        const updatedFinalTotal = updatedTotal + updatedTax;
        updateTotalPrice(updatedTotal, updatedTax, updatedFinalTotal);

        // If the cart is empty after removal, display the empty message
        if (cart.length === 0) {
            const orderSummary = document.getElementById('orderSummary');
            orderSummary.innerHTML = '<p class="empty-cart-message">Your cart is empty.</p>';
        }
    }
}

function updateTotalPrice(newTotal, newTax, newFinalTotal) {
    const totalElement = document.querySelector('.total-price');
    const taxElement = document.querySelector('.tax-info');
    const finalTotalElement = document.querySelector('.total-price:last-of-type');

    if (totalElement && taxElement && finalTotalElement) {
        totalElement.textContent = `Total: RM ${newTotal.toFixed(2)}`;
        taxElement.textContent = `Tax (10%): RM ${newTax.toFixed(2)}`;
        finalTotalElement.textContent = `Final Total: RM ${newFinalTotal.toFixed(2)}`;
    }
}

function confirmOrder() {
    const tableNumber = sessionStorage.getItem('tableNumber');
    const cart = JSON.parse(sessionStorage.getItem('cart') || '[]');
    const comments = document.querySelector('.comment-input').value; // Get comments from the input

    // Order details to be sent to the server
    const orderDetails = {
        tableNumber,
        cart,
        comments,
        timestamp: new Date().toISOString() // Add timestamp for order
    };

    // Send the order to the server using Ngrok URL
    fetch('https://f1f8-2001-e68-5427-ebe1-60d7-764-a40d-b23a.ngrok-free.app/api/orders', { // Use Ngrok URL
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderDetails)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        alert('Order confirmed and sent to the kitchen!');
        // Clear session storage after order confirmation
        sessionStorage.removeItem('cart');
        sessionStorage.removeItem('tableNumber');
        // Redirect or perform any additional actions after order confirmation
        window.location.href = 'main.html'; // Redirect back to main page
    })
    .catch(error => {
        console.error('Error sending order:', error);
        alert('There was an error sending your order. Please try again.');
    });
}
