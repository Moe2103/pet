const navSlide = () => {
    const burger = document.querySelector(".burger");
    const nav = document.querySelector(".nav-links");
    const navLinks = document.querySelectorAll(".nav-links li");
    const backdrop = document.getElementById("backdrop");

    // Set nav active status with boolean
    let isActive = false;

    function handleToggle() {
        //Toggle nav
        nav.classList.toggle("nav-active");

        // Toggle nav active status to true/false
        isActive = !isActive;

        //Animate link
        navLinks.forEach((link, index) => {
            if (isActive) {
                link.style.animation = `navLinkFadeIn 0.4s ease forwards ${
                    index / 2 + 0.2
                }s`;
            } else {
                link.style.animation = `navLinkFadeOut 0.2s ease forwards 0s`;
            }
        });

        //Burger animation
        burger.classList.toggle("toggle");

        backdrop.classList.toggle("hidden");
    }

    burger.addEventListener("click", () => {
        handleToggle();
    });

    backdrop.addEventListener("click", () => {
        handleToggle();
    });
};
navSlide();
