document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const cart = JSON.parse(decodeURIComponent(urlParams.get('cart')));
    const orderSummary = document.getElementById('orderSummary');
    
    let totalPrice = 0;
    
    cart.forEach(dish => {
        const item = document.createElement('div');
        item.className = 'order-item';
        
        const name = document.createElement('p');
        name.textContent = dish.name;

        const selectedOption = document.createElement('p');
        selectedOption.textContent = `Option: ${dish.selectedOption || 'None'}`;

        // Calculate the price with the option increment
        const finalPrice = dish.price;
        
        const price = document.createElement('p');
        price.textContent = `RM ${finalPrice.toFixed(2)}`;
        
        totalPrice += finalPrice;
        
        item.appendChild(name);
        item.appendChild(selectedOption); // Add selected option to order summary
        item.appendChild(price);
        orderSummary.appendChild(item);
    });
    
    const total = document.createElement('p');
    total.className = 'total-price';
    total.textContent = `Total: RM ${totalPrice.toFixed(2)}`;
    orderSummary.appendChild(total);
});

function confirmOrder() {
    alert('Order confirmed!');
    // Add further logic for order confirmation
}
