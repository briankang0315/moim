document.addEventListener('DOMContentLoaded', () => {
    const notificationSound = document.getElementById('notificationSound');
    const orderModal = document.getElementById('orderModal');
    const orderDetails = document.getElementById('orderDetails');
    const closeModal = document.getElementsByClassName('close')[0];
    const restaurantId = new URLSearchParams(window.location.search).get('restaurantId') || sessionStorage.getItem('restaurantId');
    sessionStorage.setItem('restaurantId', restaurantId); // Store or update it

    fetchOrders(restaurantId);

    // Refresh orders every 10 seconds
    setInterval(() => fetchOrders(restaurantId), 10000);


    let previousOrders = {}; // Store previous orders for comparison
    function fetchOrders(restaurantId) {
        fetch(`https://moim.ngrok.app/api/orders/${restaurantId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(orders => {
                displayTables(orders);
            })
            .catch(error => {
                console.error('Error fetching orders:', error);
                displayErrorMessage('Failed to fetch orders. Please try again later.');
            });
    }
    function displayTables(orders) {
        const tablesContainer = document.getElementById('tablesContainer');
        tablesContainer.innerHTML = '';
    
        const ordersByTable = orders.reduce((acc, order) => {
            acc[order.tableNumber] = order;
            return acc;
        }, {});
    
        const totalTables = restaurantId === 'Atria' ? 33 : 31; // Adjust based on restaurant
    
        for (let i = 1; i <= totalTables; i++) {
            const tableNumber = i.toString();
            const tableDiv = document.createElement('div');
            tableDiv.className = 'table';
            tableDiv.dataset.tableNumber = tableNumber;
    
            const tableHeader = document.createElement('div');
            tableHeader.className = 'table-header';
            tableHeader.textContent = `Table ${tableNumber}`;
    
            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.textContent = '!';
    
            if (ordersByTable[tableNumber]) {
                const orderTimestamp = new Date(ordersByTable[tableNumber].timestamp);
                const formattedTime = orderTimestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
                const timestamp = document.createElement('div');
                timestamp.className = 'timestamp';
                timestamp.textContent = `Ordered at: ${formattedTime}`;
                tableDiv.appendChild(timestamp);
    
                // Check for new orders
                if (!previousOrders[tableNumber] || previousOrders[tableNumber].timestamp !== ordersByTable[tableNumber].timestamp) {
                    notificationSound.play();
                }
    
                tableDiv.classList.add('new-order');
                notification.style.display = 'block';
            }
    
            tableDiv.addEventListener('click', () => {
                showOrderDetails(ordersByTable[tableNumber]);
            });
    
            tableDiv.appendChild(tableHeader);
            tableDiv.appendChild(notification);
            tablesContainer.appendChild(tableDiv);
        }
    
        // Update previous orders
        previousOrders = ordersByTable;
    }

    function showOrderDetails(order) {
        if (!order) {
            alert('No orders for this table.');
            return;
        }

        orderDetails.innerHTML = ''; // Clear previous order details

        // Display each dish in the order
        order.cart.forEach(dish => {
            const dishDiv = document.createElement('div');

            const dishName = document.createElement('p');
            dishName.className = 'dish-name';
            dishName.textContent = dish.name;
            dishDiv.appendChild(dishName);

            const optionsText = dish.selectedOptions && dish.selectedOptions.length > 0 ? dish.selectedOptions.map(option => option.name).join(', ') : 'No options';
            const options = document.createElement('p');
            options.className = optionsText !== 'No options' ? 'options' : 'no-options';
            options.textContent = `Options: ${optionsText}`;
            dishDiv.appendChild(options);

            orderDetails.appendChild(dishDiv);
        });

        // Display additional comments if any
        if (order.comments) {
            const commentsDiv = document.createElement('div');
            commentsDiv.className = 'comments';
            commentsDiv.innerHTML = `<strong>Comments:</strong> ${order.comments}`;
            orderDetails.appendChild(commentsDiv);
        }

        // Add Reset Table button for individual orders
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset Table';
        resetButton.className = 'reset-button';
        resetButton.onclick = () => resetTable(order.tableNumber);
        orderDetails.appendChild(resetButton);

        // Show modal
        orderModal.style.display = 'block';
    }

    // Close modal functionality
    closeModal.onclick = () => {
        orderModal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target === orderModal) {
            orderModal.style.display = 'none';
        }
    };
    function resetTable(tableNumber) {
        fetch(`https://moim.ngrok.app/api/orders/${restaurantId}/${tableNumber}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to reset table');
            }
            return response.json();
        })
        .then(data => {
            alert(`Orders for Table ${tableNumber} have been reset!`);
            fetchOrders(restaurantId); // Refresh orders after resetting
        })
        .catch(error => {
            console.error('Error resetting table orders:', error);
        });
    }

    function displayErrorMessage(message) {
        const tablesContainer = document.getElementById('tablesContainer');
        tablesContainer.innerHTML = `<p class="error-message">${message}</p>`;
    }
});
