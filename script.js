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
    menuContainer.scrollLeft = 0; // Ensure it starts from the very beginning
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
    const price = parseFloat(document.getElementById('addToCartButton').dataset.price);
    const totalPrice = (price * quantity).toFixed(2);
    document.getElementById('addToCartButton').textContent = `Add to cart RM ${totalPrice}`;
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
        const price = parseFloat(urlParams.get('price')).toFixed(2);

        document.getElementById('dishName').textContent = dishName;
        document.getElementById('dishImage').src = imageUrl;
        document.getElementById('dishImage').alt = dishName;
        document.getElementById('allergens').textContent = `ALLERGENS: ${allergens}`;
        document.getElementById('description').textContent = description;
        document.getElementById('addToCartButton').textContent = `Add to cart RM ${price}`;
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

    const allergens = document.createElement('p');
    allergens.className = 'allergens';
    allergens.textContent = `ALLERGENS: ${dish.allergens.join(', ')}`;

    const menuType = document.createElement('p');
    menuType.className = 'menu-type';
    menuType.textContent = dish.menuType;

    const priceAdd = document.createElement('div');
    priceAdd.className = 'price-add';

    const price = document.createElement('span');
    price.className = 'price';
    price.textContent = `RM ${dish.price.toFixed(2)}`;

    const addToCart = document.createElement('button');
    addToCart.className = 'add-to-cart';
    addToCart.textContent = 'Add to cart';
    addToCart.onclick = (event) => {
        event.preventDefault(); // Prevent the link from navigating
        addToCartHandler(dish);
    };

    priceAdd.appendChild(price);
    priceAdd.appendChild(addToCart);

    card.appendChild(image);
    card.appendChild(name);
    card.appendChild(tags);
    card.appendChild(allergens);
    card.appendChild(menuType);
    card.appendChild(priceAdd);

    cardLink.appendChild(card);
    return cardLink;
}

function addToCartHandler(dish) {
    cart.push(dish);
    console.log('Cart:', cart);
    updateCartButton();
}

function updateCartButton() {
    const proceedToOrderButton = document.getElementById('proceedToOrderButton');
    proceedToOrderButton.disabled = false;
    proceedToOrderButton.classList.add('enabled');
    proceedToOrderButton.classList.remove('disabled');
    proceedToOrderButton.innerHTML = `Proceed to Order <span class="cart-count">${cart.length}</span>`;
}

function proceedToOrder() {
    const urlParams = new URLSearchParams(window.location.search);
    const tableNumber = urlParams.get('table');
    window.location.href = `ordersummary.html?cart=${encodeURIComponent(JSON.stringify(cart))}&table=${encodeURIComponent(tableNumber)}`;
}
