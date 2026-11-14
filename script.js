/* ==================================
   STEVE TILES - WEBSITE JAVASCRIPT
================================== */

const API_BASE_URL = "https://steve-tiles-website-1.onrender.com";



// ==================================
// MOBILE NAVIGATION
// ==================================

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {

    menuToggle.addEventListener("click", function () {

        const isOpen = navLinks.classList.toggle("active");

        menuToggle.textContent = isOpen ? "✕" : "☰";

        menuToggle.setAttribute(
            "aria-expanded",
            isOpen ? "true" : "false"
        );
    });

    document.querySelectorAll(".nav-links a").forEach(function (link) {

        link.addEventListener("click", function () {

            navLinks.classList.remove("active");

            menuToggle.textContent = "☰";

            menuToggle.setAttribute("aria-expanded", "false");
        });
    });
}


// ==================================
// HOMEPAGE SEARCH
// ==================================

const homeSearchForm = document.getElementById("homeSearchForm");

if (homeSearchForm) {

    homeSearchForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const searchInput = document.getElementById("homeSearch");

        const searchValue = searchInput
            ? searchInput.value.trim()
            : "";

        if (!searchValue) {
            return;
        }

        window.location.href =
            "products.html?q=" + encodeURIComponent(searchValue);
    });
}


// ==================================
// HOMEPAGE PRODUCTS FROM MYSQL
// ==================================

const homeProductsGrid =
    document.getElementById("homeProductsGrid");

const homeProductsMessage =
    document.getElementById("homeProductsMessage");


// Convert database image paths into usable image URLs.
function getHomeProductImage(imagePath) {

    if (!imagePath) {
        return "";
    }

    imagePath = String(imagePath).replace(/\\/g, "/");

    // Uploaded images are stored in the Flask backend.
    if (imagePath.startsWith("uploads/")) {
        return API_BASE_URL + "/" + imagePath;
    }

    if (imagePath.startsWith("/uploads/")) {
        return API_BASE_URL + imagePath;
    }

    // Existing website images remain relative paths.
    return imagePath;
}


// Create one product card.
function createHomeProductCard(product) {

    const card = document.createElement("article");

    card.className = "home-product-card";


    // PRODUCT IMAGE
    const imageWrapper = document.createElement("div");

    imageWrapper.className = "home-product-image";

    const image = document.createElement("img");

    image.alt = product.name || "Tile product";

    image.loading = "lazy";

    const imageUrl = getHomeProductImage(product.image);

    if (imageUrl) {

        image.src = imageUrl;

        image.onerror = function () {

            imageWrapper.style.display = "none";
        };

    } else {

        imageWrapper.style.display = "none";
    }

    imageWrapper.appendChild(image);


    // PRODUCT INFORMATION
    const info = document.createElement("div");

    info.className = "home-product-info";


    // CATEGORY
    const category = document.createElement("span");

    category.className = "home-product-category";

    const categories = Array.isArray(product.categories)
        ? product.categories
        : [];

    const categoryNames = categories.map(function (item) {

        return String(item).replace(/[-_]/g, " ");
    });

    category.textContent = categoryNames.length
        ? categoryNames.slice(0, 2).join(" / ")
        : "Tile Collection";


    // PRODUCT NAME
    const name = document.createElement("h3");

    name.textContent = product.name || "Unnamed Product";


    // PRODUCT SPECIFICATIONS
    const specs = document.createElement("div");

    specs.className = "home-product-specs";

    if (product.size) {

        const size = document.createElement("span");

        size.textContent = "Size: " + product.size;

        specs.appendChild(size);
    }

    if (product.finish) {

        const finish = document.createElement("span");

        finish.textContent = "Finish: " + product.finish;

        specs.appendChild(finish);
    }


    // VIEW PRODUCT LINK
    const link = document.createElement("a");

    link.className = "home-product-link";

    link.href =
        "products.html?q=" + encodeURIComponent(product.name || "");

    link.textContent = "View Product ↗";


    // ADD ELEMENTS TO CARD
    info.appendChild(category);

    info.appendChild(name);

    if (specs.children.length > 0) {

        info.appendChild(specs);
    }

    info.appendChild(link);

    card.appendChild(imageWrapper);

    card.appendChild(info);

    return card;
}


// LOAD PRODUCTS FROM FLASK API
async function loadHomepageProducts() {

    if (!homeProductsGrid || !homeProductsMessage) {
        return;
    }

    try {

        homeProductsMessage.textContent =
            "Loading our latest tile collections...";

        homeProductsMessage.classList.remove("error");

        const response = await fetch(
            API_BASE_URL + "/api/products"
        );

        if (!response.ok) {

            throw new Error(
                "Unable to retrieve products from the server."
            );
        }

        const result = await response.json();

        if (
            result.status !== "success" ||
            !Array.isArray(result.products)
        ) {

            throw new Error(
                "The product information could not be loaded."
            );
        }

        // The API already returns active products.
        const products = result.products;

        homeProductsGrid.replaceChildren();

        if (products.length === 0) {

            homeProductsMessage.textContent =
                "No products are currently available. Please check again soon.";

            return;
        }

        // Show up to six products from the database.
        const latestProducts = products.slice(0, 6);

        latestProducts.forEach(function (product) {

            const productCard = createHomeProductCard(product);

            homeProductsGrid.appendChild(productCard);
        });

        homeProductsMessage.textContent =
            "Showing " + latestProducts.length +
            " products from our collection.";

    } catch (error) {

        console.error(
            "Homepage product loading error:",
            error
        );

        homeProductsGrid.replaceChildren();

        homeProductsMessage.textContent =
            "Unable to load products right now. Please try again later.";

        homeProductsMessage.classList.add("error");
    }
}


// Load homepage products when the page opens.
loadHomepageProducts();


// ==================================
// CUSTOMER ENQUIRY FORM
// ==================================

const enquiryForm = document.getElementById("enquiryForm");

const formMessage = document.getElementById("formMessage");

if (enquiryForm && formMessage) {

    enquiryForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const enquiry = {

            id: Date.now(),

            name: document.getElementById("customerName").value.trim(),

            email: document.getElementById("customerEmail").value.trim(),

            phone: document.getElementById("customerPhone").value.trim(),

            category: document.getElementById("customerCategory").value,

            message: document.getElementById("customerMessage").value.trim(),

            status: "New",

            date: new Date().toLocaleString()
        };


        if (
            !enquiry.name ||
            !enquiry.email ||
            !enquiry.phone ||
            !enquiry.category ||
            !enquiry.message
        ) {

            formMessage.textContent =
                "Please complete all the fields.";

            return;
        }


        try {

            const savedEnquiries = JSON.parse(

                localStorage.getItem("steveTilesEnquiries") || "[]"

            );

            savedEnquiries.push(enquiry);

            localStorage.setItem(

                "steveTilesEnquiries",

                JSON.stringify(savedEnquiries)

            );

            formMessage.textContent =
                "Thank you! Your enquiry has been submitted successfully.";

            enquiryForm.reset();

        } catch (error) {

            formMessage.textContent =
                "Unable to save your enquiry. Please try again.";

            console.error(
                "Enquiry storage error:",
                error
            );
        }
    });
}


console.log("Steve Tiles website loaded successfully.");

/* STEVE TILES - REUSABLE POPUP SYSTEM */

(function () {

    if (document.getElementById("stevePopupSystem")) return;

    const style = document.createElement("style");
    style.id = "stevePopupSystem";

    style.textContent = `
        .steve-modal-overlay {
            position: fixed;
            inset: 0;
            z-index: 999998;
            background: rgba(0,0,0,0.65);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            opacity: 0;
            visibility: hidden;
            transition: 0.25s ease;
        }

        .steve-modal-overlay.open {
            opacity: 1;
            visibility: visible;
        }

        .steve-modal {
            position: relative;
            width: min(550px, 100%);
            max-height: 85vh;
            overflow-y: auto;
            padding: 30px;
            background: #fff;
            border-radius: 16px;
            transform: translateY(20px) scale(.97);
            transition: 0.25s ease;
        }

        .steve-modal-overlay.open .steve-modal {
            transform: translateY(0) scale(1);
        }

        .steve-modal-close {
            position: absolute;
            top: 12px;
            right: 16px;
            border: none;
            background: transparent;
            font-size: 28px;
            cursor: pointer;
        }

        .steve-modal h2 {
            font-family: 'Playfair Display', serif;
            margin: 0 35px 15px 0;
        }

        .steve-modal img {
            width: 100%;
            max-height: 300px;
            object-fit: contain;
            border-radius: 10px;
            margin-bottom: 15px;
        }

        .steve-modal p {
            line-height: 1.7;
            color: #666;
        }

        @media(max-width:480px) {
            .steve-modal {
                padding: 22px;
            }
        }
    `;

    document.head.appendChild(style);

    const overlay = document.createElement("div");
    overlay.className = "steve-modal-overlay";
    overlay.id = "steveModalOverlay";

    overlay.innerHTML = `
        <div class="steve-modal" role="dialog" aria-modal="true">
            <button class="steve-modal-close"
                    type="button"
                    aria-label="Close">&times;</button>
            <div id="steveModalContent"></div>
        </div>
    `;

    document.body.appendChild(overlay);

    const content = document.getElementById("steveModalContent");

    window.showStevePopup = function (html) {
        content.innerHTML = html;
        overlay.classList.add("open");
        document.body.style.overflow = "hidden";
    };

    window.closeStevePopup = function () {
        overlay.classList.remove("open");
        document.body.style.overflow = "";
    };

    overlay.querySelector(".steve-modal-close")
        .addEventListener("click", window.closeStevePopup);

    overlay.addEventListener("click", function (event) {
        if (event.target === overlay) {
            window.closeStevePopup();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            window.closeStevePopup();
        }
    });

})();
// ================= ADMIN LOGIN POPUP =================

document.addEventListener("DOMContentLoaded", function () {

    const loginBtn = document.getElementById("adminLoginBtn");
    const loginModal = document.getElementById("adminLoginModal");
    const closeBtn = document.getElementById("closeAdminLogin");
    const loginForm = document.getElementById("adminLoginForm");
    const message = document.getElementById("adminLoginMessage");

    if (!loginBtn || !loginModal || !closeBtn || !loginForm) {
        return;
    }

    loginBtn.addEventListener("click", function (event) {
        event.preventDefault();
        loginModal.classList.add("show");
        message.textContent = "";
    });

    closeBtn.addEventListener("click", function () {
        loginModal.classList.remove("show");
    });

    loginModal.addEventListener("click", function (event) {
        if (event.target === loginModal) {
            loginModal.classList.remove("show");
        }
    });

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        message.textContent = "Checking login details...";

        const username = document.getElementById("adminUsername").value.trim();
        const password = document.getElementById("adminPassword").value;

        try {
            
const response = await fetch(
    "https://steve-tiles-website-1.onrender.com/api/admin/login",

                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ username, password })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                message.textContent = result.message || "Login failed.";
                return;
            }

            window.location.href = "admin-dashboard.html";

        } catch (error) {
            message.textContent = "Cannot connect to the server. Please try again.";
            console.error(error);
        }
    });

});