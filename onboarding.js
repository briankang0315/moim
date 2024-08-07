document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;
    const nextButton = document.querySelectorAll('.next-button');
    const dots = document.querySelectorAll('.dot');

    const restaurantId = new URLSearchParams(window.location.search).get('restaurantId');

    // Function to show slide based on index
    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
            dots[i].classList.toggle('active', i === index);
        });
    }

    // Automatically move to the next slide after 3 seconds for the first slide
    setTimeout(() => {
        currentSlide = 1;
        showSlide(currentSlide);
    }, 3000);

    // Event listener for the next button
    nextButton.forEach(button => {
        button.addEventListener('click', () => {
            if (currentSlide < slides.length - 1) {
                currentSlide++;
                showSlide(currentSlide);
            } else {
                // Redirect to the main page or menu with the restaurantId
                window.location.href = `main.html?restaurantId=${restaurantId}`; // Redirect to main menu page with restaurant context
            }
        });
    });

    // Initial display
    showSlide(currentSlide);
});
