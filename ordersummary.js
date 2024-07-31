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
        
        const price = document.createElement('p');
        price.textContent = `RM ${dish.price.toFixed(2)}`;
        
        totalPrice += dish.price;
        
        item.appendChild(name);
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
