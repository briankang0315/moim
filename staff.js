document.addEventListener('DOMContentLoaded', () => {
    const notificationSound = document.getElementById('notificationSound');
    const orderModal = document.getElementById('orderModal');
    const orderDetails = document.getElementById('orderDetails');
    const closeModal = document.getElementsByClassName('close')[0];
    fetchOrders();

    // Refresh orders every 10 seconds
    setInterval(fetchOrders, 10000);

    let previousOrders = {}; // Store previous orders for comparison

    function fetchOrders() {
        fetch('https://f1f8-2001-e68-5427-ebe1-60d7-764-a40d-b23a.ngrok-free.app/api/orders')
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
        tablesContainer.innerHTML = ''; // Clear previous tables

        // Create a map of orders by table number
        const ordersByTable = orders.reduce((acc, order) => {
            acc[order.tableNumber] = order;
            return acc;
        }, {});

        // Create 33 tables
        for (let i = 1; i <= 33; i++) {
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

            // Check if there's an order for the table
            if (ordersByTable[tableNumber]) {
                const orderTimestamp = new Date(ordersByTable[tableNumber].timestamp);
                const formattedTime = orderTimestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                const timestamp = document.createElement('div');
                timestamp.className = 'timestamp';
                timestamp.textContent = `Ordered at: ${formattedTime}`;
                tableDiv.appendChild(timestamp);

                // Highlight new orders
                tableDiv.classList.add('new-order');
                notification.style.display = 'block'; // Show notification

                // Play sound if a new order comes in
                if (!previousOrders[tableNumber] || previousOrders[tableNumber].timestamp !== ordersByTable[tableNumber].timestamp) {
                    notificationSound.play();
                }
            }

            // Add click event to show order details in a modal
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
        fetch(`https://f1f8-2001-e68-5427-ebe1-60d7-764-a40d-b23a.ngrok-free.app/api/orders/${tableNumber}`, {
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
            fetchOrders(); // Refresh orders after resetting
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
