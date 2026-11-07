
let products = [];

const categoryNames = {
    floor: "Floor Tiles",
    wall: "Wall Tiles",
    bathroom: "Bathroom Tiles",
    kitchen: "Kitchen Tiles",
    outdoor: "Outdoor Tiles"
};

// HTML ELEMENTS

const productGrid = document.getElementById("productGrid");
const productCount = document.getElementById("productCount");
const searchInput = document.getElementById("catalogSearch");
const sizeFilter = document.getElementById("sizeFilter");
const finishFilter = document.getElementById("finishFilter");
const sortFilter = document.getElementById("sortFilter");
const emptyProducts = document.getElementById("emptyProducts");

const productDialog = document.getElementById("productDialog");
const productDetails = document.getElementById("productDetails");
const enquiryDialog = document.getElementById("enquiryDialog");
const enquiryForm = document.getElementById("productEnquiryForm");

let activeCategory = "all";


// ========================================
// LOAD PRODUCTS FROM FLASK API
// ========================================

async function loadProducts() {
    try {
        const response = await fetch("http://127.0.0.1:5000/api/products");

        if (!response.ok) {
            throw new Error(`Products API returned ${response.status}`);
        }

        const data = await response.json();

        if (data.status !== "success" || !Array.isArray(data.products)) {
            throw new Error("The products API returned an unexpected response.");
        }

        products = data.products.map(function(item) {
            return {
                // Keep existing ST001-style product IDs.
                id: item.code || String(item.id),
                dbId: item.id,

                name: item.name || "",
                categories: Array.isArray(item.categories)
                    ? item.categories
                    : [],

                type: item.type || "",
                size: item.size || "",
                finish: item.finish || "",
                material: item.material || "",
                image: item.image || "",
                description: item.description || "",
                price: item.price
            };
        });

        console.log(`Loaded ${products.length} products from the database.`);

    } catch (error) {
        console.error("Unable to load products from the backend:", error);

        productGrid.innerHTML = "";
        productGrid.hidden = true;

        emptyProducts.hidden = false;

        emptyProducts.textContent =
            "Unable to load tile products. Please make sure the Steve Tiles backend is running and try again.";

        productCount.textContent = "Products could not be loaded.";

        throw error;
    }
}


// ========================================
// URL PARAMETERS
// ========================================

const pageParams = new URLSearchParams(window.location.search);

const initialCategory = pageParams.get("category") || "";
const initialSearch = pageParams.get("q") || "";

function getCategoryFromURL(value) {
    const text = value.toLowerCase();

    if (text.includes("bath")) return "bathroom";
    if (text.includes("kitchen")) return "kitchen";
    if (text.includes("wall")) return "wall";
    if (text.includes("outdoor")) return "outdoor";
    if (text.includes("floor")) return "floor";

    return "all";
}


// ========================================
// DISPLAY PRODUCTS
// ========================================

function displayProducts(list) {

    productGrid.innerHTML = "";

    list.forEach(function(product) {

        const categoryText =
            categoryNames[product.categories[0]] || "Tiles";

        const card = document.createElement("article");

        card.className = "tile-card";

        card.innerHTML = `
            <div class="tile-image-wrap">

                <img
                    src="${product.image}"
                    alt="${product.name} tile sample"
                    loading="lazy"
                >

            </div>

            <div class="tile-card-content">

                <span class="tile-category">
                    ${categoryText}
                </span>

                <h3>${product.name}</h3>

                <div class="tile-specs">

                    <span>${product.size}</span>

                    <span>${product.finish}</span>

                    <span>${product.material}</span>

                </div>

                <div class="tile-price">
                    Enquire for price
                </div>

                <div class="tile-actions">

                    <button
                        class="view-details"
                        data-action="details"
                        data-id="${product.id}">

                        View Details

                    </button>

                    <button
                        class="enquire-tile"
                        data-action="enquire"
                        data-id="${product.id}">

                        Enquire Now

                    </button>

                </div>

            </div>
        `;

        const image = card.querySelector("img");

        image.addEventListener("error", function() {

            this.style.display = "none";

            this.parentElement.innerHTML =
                '<span class="image-fallback">Image unavailable</span>';

        });

        productGrid.appendChild(card);

    });

    productCount.textContent =
        `Showing ${list.length} of ${products.length} tile designs`;

    emptyProducts.hidden = list.length !== 0;

    productGrid.hidden = list.length === 0;

}


// ========================================
// FILTER PRODUCTS
// ========================================

function filterProducts() {

    let filtered = [...products];

    // CATEGORY FILTER

    if (activeCategory !== "all") {

        filtered = filtered.filter(function(product) {

            return product.categories.includes(activeCategory);

        });

    }

    // SEARCH FILTER

    const searchText = searchInput.value.trim().toLowerCase();

    if (searchText) {

        filtered = filtered.filter(function(product) {

            const searchableText = [

                product.name,
                product.type,
                product.size,
                product.finish,
                product.material,
                product.description,

                product.categories.map(function(category) {

                    return categoryNames[category] || category;

                }).join(" ")

            ].join(" ").toLowerCase();

            return searchableText.includes(searchText);

        });

    }

    // SIZE FILTER

    if (sizeFilter.value !== "all") {

        filtered = filtered.filter(function(product) {

            return product.size === sizeFilter.value;

        });

    }

    // FINISH FILTER

    if (finishFilter.value !== "all") {

        filtered = filtered.filter(function(product) {

            return product.finish === finishFilter.value;

        });

    }

    // SORTING

    if (sortFilter.value === "az") {

        filtered.sort((a, b) =>
            a.name.localeCompare(b.name)
        );

    }

    if (sortFilter.value === "za") {

        filtered.sort((a, b) =>
            b.name.localeCompare(a.name)
        );

    }

    displayProducts(filtered);

}


// ========================================
// CATEGORY BUTTONS
// ========================================

document.querySelectorAll(".category-filter").forEach(function(button) {

    button.addEventListener("click", function() {

        document.querySelectorAll(".category-filter").forEach(function(item) {

            item.classList.remove("active");

        });

        button.classList.add("active");

        activeCategory = button.dataset.category;

        filterProducts();

    });

});


// ========================================
// SEARCH AND FILTER EVENTS
// ========================================

searchInput.addEventListener("input", filterProducts);

sizeFilter.addEventListener("change", filterProducts);

finishFilter.addEventListener("change", filterProducts);

sortFilter.addEventListener("change", filterProducts);


// ========================================
// PRODUCT DETAILS
// ========================================

function openProductDetails(product) {

    productDetails.innerHTML = `

        <img
            class="dialog-product-image"
            src="${product.image}"
            alt="${product.name}"
        >

        <span class="tile-category">
            ${product.id}
        </span>

        <h2>${product.name}</h2>

        <p>${product.description}</p>

        <p>

            <strong>Category:</strong>

            ${product.categories.map(c => categoryNames[c] || c).join(", ")}

        </p>

        <p>
            <strong>Tile Type:</strong>
            ${product.type}
        </p>

        <p>
            <strong>Size:</strong>
            ${product.size}
        </p>

        <p>
            <strong>Finish:</strong>
            ${product.finish}
        </p>

        <p>
            <strong>Material:</strong>
            ${product.material}
        </p>

        <p>
            <strong>Price:</strong>
            Enquire for price
        </p>

        <button class="dialog-enquire-button" id="detailsEnquire">

            Enquire About This Tile

        </button>

    `;

    productDetails.querySelector("img").addEventListener("error", function() {

        this.style.display = "none";

    });

    productDialog.showModal();

    document.getElementById("detailsEnquire").addEventListener("click", function() {

        productDialog.close();

        openEnquiry(product);

    });

}


// ========================================
// ENQUIRY POPUP
// ========================================

function openEnquiry(product) {

    enquiryForm.reset();

    document.getElementById("enquiryProduct").value = product.id;

    document.getElementById("enquiryMessage").value =
        `I am interested in ${product.name} (${product.size}, ${product.finish}).`;

    document.getElementById("enquirySuccess").hidden = true;

    enquiryDialog.showModal();

}


// ========================================
// PRODUCT BUTTON EVENTS
// ========================================

productGrid.addEventListener("click", function(event) {

    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const product = products.find(item => item.id === button.dataset.id);

    if (!product) return;

    if (button.dataset.action === "details") {

        openProductDetails(product);

    }

    if (button.dataset.action === "enquire") {

        openEnquiry(product);

    }

});


// ========================================
// CLOSE POPUPS
// ========================================

document.getElementById("closeProductDialog").addEventListener("click", function() {

    productDialog.close();

});


document.getElementById("closeEnquiryDialog").addEventListener("click", function() {

    enquiryDialog.close();

});


// ========================================
// SAVE ENQUIRIES
// ========================================

enquiryForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const productId =
        document.getElementById("enquiryProduct").value;

    const selectedProduct =
        products.find(item => item.id === productId);

    const enquiry = {

        id: Date.now(),

        name: document.getElementById("enquiryName").value.trim(),

        email: document.getElementById("enquiryEmail").value.trim(),

        phone: document.getElementById("enquiryPhone").value.trim(),

        category: selectedProduct
            ? categoryNames[selectedProduct.categories[0]] || "General Enquiry"
            : "General Enquiry",

        message: document.getElementById("enquiryMessage").value.trim(),

        product: selectedProduct ? selectedProduct.name : "",

        status: "New",

        date: new Date().toLocaleString()

    };

    try {

        const savedEnquiries = JSON.parse(

            localStorage.getItem("steveTilesEnquiries") || "[]"

        );

        savedEnquiries.unshift(enquiry);

        localStorage.setItem(

            "steveTilesEnquiries",

            JSON.stringify(savedEnquiries)

        );

        document.getElementById("enquirySuccess").hidden = false;

        enquiryForm.reset();

    } catch (error) {

        alert("Unable to save this enquiry. Please try again.");

        console.error(error);

    }

});


// ========================================
// RESET FILTERS
// ========================================

document.getElementById("resetFilters").addEventListener("click", function() {

    activeCategory = "all";

    searchInput.value = "";

    sizeFilter.value = "all";

    finishFilter.value = "all";

    sortFilter.value = "featured";

    document.querySelectorAll(".category-filter").forEach(function(button) {

        button.classList.toggle(

            "active",

            button.dataset.category === "all"

        );

    });

    filterProducts();

});


// ========================================
// INITIAL PAGE SETUP
// ========================================

async function initializeProductsPage() {

    try {

        // First load products from MySQL through Flask.

        await loadProducts();

        // Apply URL search and category settings.

        searchInput.value = initialSearch;

        activeCategory = getCategoryFromURL(initialCategory);

        document.querySelectorAll(".category-filter").forEach(function(button) {

            button.classList.toggle(

                "active",

                button.dataset.category === activeCategory

            );

        });

        // Display products.

        filterProducts();

    } catch (error) {

        // loadProducts already displays an error message.

    }

}

initializeProductsPage();
