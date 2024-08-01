let cart = [];
let currentCategory = '구이 Grilled';

// Function to check input and enable the button
function checkInput() {
    const tableNumber = document.getElementById('tableNumber').value;
    const viewMenuButton = document.getElementById('viewMenuButton');

    if (tableNumber.trim() !== "") {
        viewMenuButton.disabled = false;
        viewMenuButton.classList.add('enabled');
        viewMenuButton.classList.remove('disabled');
    } else {
        viewMenuButton.disabled = true;
        viewMenuButton.classList.remove('enabled');
        viewMenuButton.classList.add('disabled');
    }
}

// Function to store the table number and redirect to the menu page
function storeTableNumber() {
    const tableNumber = document.getElementById('tableNumber').value;
    if (tableNumber.trim() !== "") {
        sessionStorage.setItem('tableNumber', tableNumber);
        window.location.href = 'recommendation.html';
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const menuContainer = document.querySelector(".menu-container");
    if (menuContainer) {
        menuContainer.scrollLeft = 0; // Ensure it starts from the very beginning
    }

    // Restore cart from sessionStorage if available
    const storedCart = sessionStorage.getItem('cart');
    if (storedCart) {
        cart = JSON.parse(storedCart);
        updateCartButton();
    }
});

function goBack() {
    window.history.back();
}

let quantity = 1;

function decreaseQuantity() {
    if (quantity > 1) {
        quantity--;
        document.getElementById('quantityValue').textContent = quantity;
        updateAddToCartButton();
    }
}

function increaseQuantity() {
    quantity++;
    document.getElementById('quantityValue').textContent = quantity;
    updateAddToCartButton();
}

function updateAddToCartButton() {
    const price = parseFloat(document.getElementById('addToCartButton').dataset.price) || 0; // Ensure default value
    const totalPrice = price * quantity;
    document.getElementById('addToCartButton').textContent = `Add to cart RM ${totalPrice.toFixed(2)}`;
}

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const tableNumber = sessionStorage.getItem('tableNumber');

    if (document.getElementById('tableNumber')) {
        document.getElementById('tableNumber').textContent = `Table No: ${tableNumber}`;
    }

    if (document.getElementById('recommendation')) {
        fetch('menu.json')
            .then(response => response.json())
            .then(data => {
                const recommendation = document.getElementById('recommendation');
                const recommendedDish = data.flatMap(category => category.dishes).find(dish => dish.recommended);
                if (recommendedDish) {
                    recommendation.appendChild(createMenuCard(recommendedDish));
                }
            })
            .catch(error => console.error('Error loading menu data:', error));
    }

    if (document.getElementById('categoryTabs') && document.getElementById('menuCards')) {
        fetch('menu.json')
            .then(response => response.json())
            .then(data => {
                loadCategories(data);
                loadMenuCards(data, currentCategory);
            })
            .catch(error => console.error('Error loading menu data:', error));
    }

    if (document.getElementById('detailCard')) {
        const dishName = urlParams.get('name');
        const imageUrl = urlParams.get('image');
        const tags = urlParams.get('tags').split(',');
        const allergens = urlParams.get('allergens');
        const description = urlParams.get('description');
        const price = parseFloat(urlParams.get('price')) || 0; // Ensure default value

        document.getElementById('dishName').textContent = dishName;
        document.getElementById('dishImage').src = imageUrl;
        document.getElementById('dishImage').alt = dishName;
        document.getElementById('allergens').textContent = `ALLERGENS: ${allergens}`;
        document.getElementById('description').textContent = description;
        document.getElementById('addToCartButton').textContent = `Add to cart RM ${price.toFixed(2)}`;
        document.getElementById('addToCartButton').dataset.price = price;

        const tagsContainer = document.getElementById('tags');
        tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = `tag ${tag.toLowerCase()}`;
            tagElement.textContent = tag;
            tagsContainer.appendChild(tagElement);
        });

        updateAddToCartButton();
    }
});

function loadCategories(data) {
    const categoryTabs = document.getElementById('categoryTabs');
    if (categoryTabs) {
        categoryTabs.innerHTML = '';
        data.forEach(category => {
            const tab = document.createElement('div');
            tab.className = 'tab';
            tab.textContent = category.category;
            tab.onclick = () => {
                currentCategory = category.category;
                loadMenuCards(data, currentCategory);
                document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
                tab.classList.add('active');
            };
            categoryTabs.appendChild(tab);
        });
        document.querySelector('.tab').classList.add('active'); // Set the first tab as active
    }
}

function loadMenuCards(data, category) {
    const menuCards = document.getElementById('menuCards');
    if (menuCards) {
        menuCards.innerHTML = '';
        const selectedCategory = data.find(cat => cat.category === category);

        selectedCategory.dishes.forEach(dish => {
            menuCards.appendChild(createMenuCard(dish));
        });
    }
}
function createMenuCard(dish) {
    const cardLink = document.createElement('a');
    cardLink.href = `detailedmenu.html?name=${encodeURIComponent(dish.name)}&image=${encodeURIComponent(dish.image)}&tags=${encodeURIComponent(dish.tags.join(','))}&allergens=${encodeURIComponent(dish.allergens.join(','))}&description=${encodeURIComponent(dish.description)}&price=${dish.price}`;
    cardLink.className = 'card-link';

    const card = document.createElement('div');
    card.className = 'card';

    const image = document.createElement('img');
    image.src = dish.image;
    image.alt = dish.name;
    image.className = 'dish-image';

    const name = document.createElement('h3');
    name.className = 'dish-name';
    name.textContent = dish.name;

    const tags = document.createElement('div');
    tags.className = 'tags';
    dish.tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = `tag ${tag.toLowerCase()}`;
        tagElement.textContent = tag;
        tags.appendChild(tagElement);
    });

    cardLink.appendChild(image);
    cardLink.appendChild(name);
    cardLink.appendChild(tags);

    card.appendChild(cardLink);

    // Conditionally add allergens below tags if they exist
    if (dish.allergens && dish.allergens.length > 0) {
        const allergens = document.createElement('p');
        allergens.className = 'allergens';
        allergens.textContent = `ALLERGENS: ${dish.allergens.join(', ')}`;
        card.appendChild(allergens); // Append allergens to the card, not the link
    }

    // Add options as buttons below allergens if available
    if (dish.options && dish.options.length > 0) {
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'options-container';

        dish.options.forEach((option, index) => {
            const optionButton = document.createElement('button');
            optionButton.className = 'option-button';
            optionButton.textContent = option.isDiscount
                ? `${option.name} (10% Off)`
                : `${option.name} (+RM ${Number(option.priceIncrement).toFixed(2)})`;

            // Store price increment and multiple selection flag as data attributes
            optionButton.dataset.priceIncrement = Number(option.priceIncrement) || 0;
            optionButton.dataset.multiple = option.multiple;
            optionButton.dataset.isDiscount = option.isDiscount || false;

            optionButton.onclick = (event) => {
                event.stopPropagation(); // Prevent card click event

                if (option.multiple === true) {
                    // Allow multiple selections
                    optionButton.classList.toggle('selected');
                } else {
                    // Allow only one option to be selected at a time
                    // This also handles mutually exclusive options
                    optionsContainer.querySelectorAll('.option-button').forEach(btn => {
                        if (btn !== optionButton) {
                            btn.classList.remove('selected'); // Deselect other options
                        }
                    });
                    optionButton.classList.toggle('selected'); // Toggle the selected state
                }

                // Calculate total price with selected options and apply discount if needed
                calculateFinalPrice(dish, optionsContainer, card);
            };

            optionsContainer.appendChild(optionButton);
        });

        card.appendChild(optionsContainer); // Append options after allergens
    }

    const priceAdd = document.createElement('div');
    priceAdd.className = 'price-add';

    const price = document.createElement('span');
    price.className = 'price';
    price.textContent = `RM ${Number(dish.price).toFixed(2)}`; // Ensure number format

    const addToCart = document.createElement('button');
    addToCart.className = 'add-to-cart';
    addToCart.textContent = 'Add to cart';

    // Prevent link navigation on add-to-cart button click
    addToCart.onclick = (event) => {
        event.preventDefault(); // Prevent the link from navigating

        // Capture all selected options
        const selectedOptions = Array.from(card.querySelectorAll('.option-button.selected')).map(btn => ({
            name: btn.textContent,
            priceIncrement: parseFloat(btn.dataset.priceIncrement || 0),
            isDiscount: btn.dataset.isDiscount === 'true'
        }));

        addToCartHandler(dish, selectedOptions);
    };

    priceAdd.appendChild(price);
    priceAdd.appendChild(addToCart);

    card.appendChild(priceAdd);

    return card;
}



function calculateFinalPrice(dish, optionsContainer, card) {
    const selectedOptions = optionsContainer.querySelectorAll('.option-button.selected');
    let totalIncrement = 0;
    let isDiscountApplied = false;

    selectedOptions.forEach(btn => {
        if (btn.dataset.isDiscount === 'true') {
            isDiscountApplied = true;
        } else {
            totalIncrement += parseFloat(btn.dataset.priceIncrement || 0);
        }
    });

    // Calculate the final price including any increments
    let finalPrice = Number(dish.price) + totalIncrement;

    // Apply the discount after adding all increments
    if (isDiscountApplied) {
        finalPrice *= 0.90; // Apply 10% discount
    }

    updatePrice(finalPrice, card);
}

function updatePrice(finalPrice, card) {
    const priceElement = card.querySelector('.price');
    priceElement.textContent = `RM ${Number(finalPrice).toFixed(2)}`; // Ensure number formatting
}
function addToCartHandler(dish, selectedOptions) {
    // Calculate total price increment from selected options
    let totalPriceIncrement = 0;
    let isDiscountApplied = false;

    selectedOptions.forEach(option => {
        if (option.isDiscount) {
            isDiscountApplied = true;
        } else {
            totalPriceIncrement += Number(option.priceIncrement) || 0; // Ensure number format
        }
    });

    // Calculate the final price with increments
    let finalPrice = Number(dish.price) + totalPriceIncrement;

    // Apply the discount if applicable
    if (isDiscountApplied) {
        finalPrice *= 0.90; // Apply 10% discount
    }

    const dishWithOptions = {
        ...dish,
        selectedOptions: selectedOptions.map(option => ({
            ...option,
            name: option.name.replace(/ \(\d+% Off\)$/, '')
        })), // Ensure clean option names
        price: Number(finalPrice).toFixed(2) // Set the final price after discounts and increments
    };

    cart.push(dishWithOptions);
    console.log('Cart:', cart);
    // Save cart to sessionStorage
    sessionStorage.setItem('cart', JSON.stringify(cart));
    updateCartButton();
}

function updateCartButton() {
    const proceedToOrderButton = document.getElementById('proceedToOrderButton');
    const cartCount = document.querySelector('.cart-count');

    if (cartCount) {
        cartCount.textContent = cart.length;
    }

    if (cart.length > 0) {
        proceedToOrderButton.disabled = false;
        proceedToOrderButton.classList.add('enabled');
        proceedToOrderButton.classList.remove('disabled');
    } else {
        proceedToOrderButton.disabled = true;
        proceedToOrderButton.classList.remove('enabled');
        proceedToOrderButton.classList.add('disabled');
    }
}
function proceedToOrder() {
    const tableNumber = sessionStorage.getItem('tableNumber') || ''; // Retrieve table number
    sessionStorage.setItem('cart', JSON.stringify(cart)); // Store cart data in session storage

    // Redirect to order summary without cart data in the URL
    window.location.href = `ordersummary.html?table=${encodeURIComponent(tableNumber)}`;
}


