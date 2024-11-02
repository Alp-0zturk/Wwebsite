document.addEventListener('DOMContentLoaded', function() {
    // Section Navigation
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('data-section');

            sections.forEach(section => {
                section.classList.remove('active');
            });

            document.getElementById(targetSection).classList.add('active');
        });
    });

    // Cart functionality
    let cart = [];
    const cartItemsElement = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const cartCountElement = document.getElementById('cart-count');
    const clearCartButton = document.getElementById('clear-cart');

    const addToCartButtons = document.querySelectorAll('.add-to-cart');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productName = this.getAttribute('data-name');
            const productPrice = parseFloat(this.getAttribute('data-price'));

            // Add product to cart array
            cart.push({name: productName, price: productPrice
            });
            updateCart();
        });
    });

    function updateCart() {
        // Clear existing cart items
        cartItemsElement.innerHTML = '';

        // Calculate total price
        let total = 0;

        cart.forEach(item => {
            total += item.price;
            const li = document.createElement('li');
            li.textContent = `${item.name} - $${item.price.toFixed(2)}`;
            cartItemsElement.appendChild(li);
        });

        // If the cart is empty, show default message
        if (cart.length === 0) {
            cartItemsElement.innerHTML = '<li>No items in cart</li>';
        }

        // Update total and item count
        cartTotalElement.textContent = total.toFixed(2);
        cartCountElement.textContent = cart.length;
    }
    function addToCart(event) {
        const button = event.target;
        const productName = button.getAttribute('data-name');
        const productPrice = parseFloat(button.getAttribute('data-price'));
    
        // Add product to cart array
        cart.push({ name: productName, price: productPrice });
    
        // Update total price
        totalPrice += productPrice;
    
        // Render the cart items and total price
        renderCart();
    }
    
    // Function to render the cart
    function renderCart() {
        // Clear the current cart display
        cartItems.innerHTML = '';
    
        if (cart.length === 0) {
            cartItems.innerHTML = '<li>No items in cart</li>';
        } else {
            // Add each item in the cart to the list
            cart.forEach((item, index) => {
                const li = document.createElement('li');
                li.textContent = `${item.name} - $${item.price.toFixed(2)} `;
                
                // Remove button for each item
                const removeButton = document.createElement('button');
                removeButton.textContent = 'Remove';
                removeButton.setAttribute('data-index', index);
                removeButton.addEventListener('click', removeFromCart);
                li.appendChild(removeButton);
    
                cartItems.appendChild(li);
            });
        }
    
        // Update total price in the DOM
        cartTotal.textContent = totalPrice.toFixed(2);
    }
    
    // Function to remove a product from the cart
    function removeFromCart(event) {
        const button = event.target;
        const index = parseInt(button.getAttribute('data-index'));
    
        // Subtract the price of the removed item from the total
        totalPrice -= cart[index].price;
    
        // Remove the item from the cart array
        cart.splice(index, 1);
    
        // Render the updated cart
        renderCart();
    }
    
    // Function to clear the cart
    function clearCart() {
        cart = [];
        totalPrice = 0;
        renderCart();
    }
    
    // Add event listeners to "Add to Cart" buttons
    addToCartButtons.forEach(button => {
        button.addEventListener('click', addToCart);
    });
    
    // Add event listener to "Clear Cart" button
    clearCartButton.addEventListener('click', clearCart);
    
    // Render the initial empty cart
    renderCart();

    const slideGallery = document.querySelector('.slides');
    const slides = slideGallery.querySelectorAll('div');
    const thumbnailContainer = document.querySelector('.thumbnails');
    const slideCount = slides.length;
    const slideWidth = 540;

    const highlightThumbnail = () => {
        thumbnailContainer
        .querySelectorAll('div.highlighted')
        .forEach(el => el.classList.remove('highlighted'));
    const index = Math.floor(slideGallery.scrollLeft / slideWidth);
        thumbnailContainer
        .querySelector(`div[data-id="${index}"]`)
        .classList.add('highlighted');
    };

    const scrollToElement = el => {
    const index = parseInt(el.dataset.id, 10);
    slideGallery.scrollTo(index * slideWidth, 0);
    };

    thumbnailContainer.innerHTML += [...slides]
    .map((slide, i) => `<div data-id="${i}"></div>`)
    .join('');

    thumbnailContainer.querySelectorAll('div').forEach(el => {
    el.addEventListener('click', () => scrollToElement(el));
    });

slideGallery.addEventListener('scroll', e => highlightThumbnail());

highlightThumbnail();
});

