document.addEventListener('DOMContentLoaded', () => {
    const cartData = sessionStorage.getItem('cart'); // Retrieve cart data from session storage
    const orderSummary = document.getElementById('orderSummary');

    if (cartData) {
        try {
            const cart = JSON.parse(cartData);
            console.log('Parsed Cart:', cart); // Debug: Log parsed cart

            // Group dishes by name and options to calculate quantities
            const groupedDishes = {};

            cart.forEach((dish, index) => {
                const key = `${dish.name}::${dish.selectedOptions.map(option => option.name).join('|')}`;

                if (!groupedDishes[key]) {
                    groupedDishes[key] = { ...dish, quantity: dish.quantity || 1, index }; // Ensure quantity is at least 1
                } else {
                    groupedDishes[key].quantity += dish.quantity || 1; // Add quantity from stored data
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
                removeButton.onclick = () => removeFromCart(dish, item);

                const price = document.createElement('p');
                price.className = 'dish-price';
                price.textContent = `RM ${(parseFloat(dish.price) * dish.quantity).toFixed(2)}`;

                item.appendChild(name);
                item.appendChild(selectedOptions); // Display selected options in order summary
                item.appendChild(quantityDisplay);
                item.appendChild(removeButton);
                item.appendChild(price);

                orderSummary.appendChild(item);
            });

            // Calculate and display the total price
            updateTotalPrice(Object.values(groupedDishes));

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

            // Add a back button to return to the menu
            const backButton = document.createElement('button');
            backButton.textContent = 'Back to Menu';
            backButton.className = 'back-button';
            backButton.onclick = goBackToMenu;
            orderSummary.appendChild(backButton);

        } catch (error) {
            console.error('Error parsing cart data:', error);
            displayEmptyCartMessage();
        }
    } else {
        // Display message if cart is empty
        displayEmptyCartMessage();
    }
});

function removeFromCart(dish, itemElement) {
    // Retrieve the current cart from session storage
    let cart = JSON.parse(sessionStorage.getItem('cart')) || [];

    // Find and remove all instances of the dish from the cart
    cart = cart.filter(item => {
        const itemKey = `${item.name}::${item.selectedOptions.map(option => option.name).join('|')}`;
        const dishKey = `${dish.name}::${dish.selectedOptions.map(option => option.name).join('|')}`;
        return itemKey !== dishKey;
    });

    // Log the updated cart to verify removal
    console.log('Updated Cart after removal:', cart);

    // Update the cart in session storage immediately
    sessionStorage.setItem('cart', JSON.stringify(cart));

    // Remove the item from the DOM
    itemElement.remove();

    // Update total price immediately after updating the cart
    updateTotalPrice(cart);

    // If the cart is empty after removal, display the empty message
    if (cart.length === 0) {
        displayEmptyCartMessage();
    }
}

function updateTotalPrice(cart) {
    let total = 0;

    cart.forEach(item => {
        // Ensure both price and quantity are numbers before performing calculations
        const itemPrice = parseFloat(item.price);
        const itemQuantity = parseInt(item.quantity || 1, 10); // Default to 1 if quantity is undefined

        console.log(`Calculating Price: ${item.name}, Price: ${itemPrice}, Quantity: ${itemQuantity}`); // Debug: Log calculation details

        // Check if itemPrice and itemQuantity are valid numbers
        if (!isNaN(itemPrice) && !isNaN(itemQuantity)) {
            total += itemPrice * itemQuantity;
            console.log(`Current Total after ${item.name}: ${total.toFixed(2)}`); // Debug: Log current total
        }
    });

    const taxAmount = total * 0.10; // Calculate 10% tax
    const finalTotal = total + taxAmount;

    console.log(`Final Calculations - Total: RM ${total.toFixed(2)}, Tax: RM ${taxAmount.toFixed(2)}, Final Total: RM ${finalTotal.toFixed(2)}`); // Debug: Log final calculations

    const totalElement = document.querySelector('.total-price');
    const taxElement = document.querySelector('.tax-info');
    const finalTotalElement = document.querySelector('.final-total-price');

    if (totalElement && taxElement && finalTotalElement) {
        totalElement.textContent = `Total: RM ${total.toFixed(2)}`;
        taxElement.textContent = `Service Charge (10%): RM ${taxAmount.toFixed(2)}`;
        finalTotalElement.textContent = `Final Total: RM ${finalTotal.toFixed(2)}`;
    } else {
        // If these elements don't exist, create them
        const totalPriceContainer = document.createElement('div');
        totalPriceContainer.className = 'total-price-container';

        const totalElement = document.createElement('p');
        totalElement.className = 'total-price';
        totalElement.textContent = `Total: RM ${total.toFixed(2)}`;

        const taxElement = document.createElement('p');
        taxElement.className = 'tax-info';
        taxElement.textContent = `Service Charge (10%): RM ${taxAmount.toFixed(2)}`;

        const finalTotalElement = document.createElement('p');
        finalTotalElement.className = 'final-total-price';
        finalTotalElement.textContent = `Final Total: RM ${finalTotal.toFixed(2)}`;

        totalPriceContainer.appendChild(totalElement);
        totalPriceContainer.appendChild(taxElement);
        totalPriceContainer.appendChild(finalTotalElement);

        document.getElementById('orderSummary').appendChild(totalPriceContainer);
    }
}

function displayEmptyCartMessage() {
    const orderSummary = document.getElementById('orderSummary');
    orderSummary.innerHTML = '<p class="empty-cart-message">Your cart is empty.</p>';
}

function confirmOrder() {
    const tableNumber = sessionStorage.getItem('tableNumber') || '';
    const restaurantId = new URLSearchParams(window.location.search).get('restaurantId') || sessionStorage.getItem('restaurantId'); // Default to DPC if not set
    const cart = JSON.parse(sessionStorage.getItem('cart') || '[]');

    const commentsElement = document.querySelector('.comment-input');
    const comments = commentsElement ? commentsElement.value : ''; // Default to an empty string if element doesn't exist

    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const orderData = {
        tableNumber,
        cart,
        comments,
        timestamp: new Date().toISOString(),
        restaurantId // Include restaurantId in order
    };

    fetch(`https://moim.ngrok.app/api/orders/${restaurantId}`, { // Use restaurantId here
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        alert(`Order for Table ${tableNumber} has been placed successfully!`);
        sessionStorage.removeItem('cart');
        window.location.href = `main.html?restaurantId=${restaurantId}`; // Ensure redirection maintains restaurantId
    })
    .catch(error => {
        console.error('Error placing order:', error);
        alert('Failed to place order. Please try again later.');
    });
}

function goBackToMenu() {
    const restaurantId = sessionStorage.getItem('restaurantId');
    window.location.href = `mainmenu.html?restaurantId=${restaurantId}`;
}
