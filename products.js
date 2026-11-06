
const products = [
    {
        id: "ST001",
        name: "Botein Mink Marble",
        categories: ["floor", "wall", "bathroom"],
        type: "Marble Look",
        size: "600 × 600 mm",
        finish: "Matte",
        material: "Porcelain",
        image: "images/tiles/Botein Mink Marble.jpeg",
        description: "Beige and grey marble-look porcelain tile."
    },
    {
        id: "ST002",
        name: "Les Bijoux Beige",
        categories: ["floor", "wall"],
        type: "Marble Look",
        size: "800 × 1600 mm",
        finish: "Polished",
        material: "Porcelain",
        image: "images/tiles/Les Bijoux Beige.jpeg",
        description: "Premium marble-inspired tile with natural veining."
    },
    {
        id: "ST003",
        name: "Taj Mahal Grey",
        categories: ["floor", "bathroom"],
        type: "Stone Look",
        size: "600 × 600 mm",
        finish: "Matte",
        material: "Porcelain",
        image: "images/tiles/Taj Mahal Grey.jpeg",
        description: "Soft grey and beige natural stone-inspired surface."
    },
    {
        id: "ST004",
        name: "Opal Yamuna",
        categories: ["floor", "wall", "kitchen"],
        type: "Marble Look",
        size: "600 × 1200 mm",
        finish: "Polished",
        material: "Porcelain",
        image: "images/tiles/Opal Yamuna.jpeg",
        description: "Elegant beige surface with soft natural veining."
    },
    {
        id: "ST005",
        name: "Amico Light",
        categories: ["floor", "wall", "kitchen"],
        type: "Marble Look",
        size: "600 × 1200 mm",
        finish: "Glossy",
        material: "Porcelain",
        image: "images/tiles/Amico Light.jpeg",
        description: "Glossy beige-grey marble-look porcelain tile."
    },
    {
        id: "ST006",
        name: "Avalon White",
        categories: ["floor", "wall", "bathroom"],
        type: "Marble Look",
        size: "600 × 1200 mm",
        finish: "Polished",
        material: "Porcelain",
        image: "images/tiles/Avalon White.jpeg",
        description: "White marble-inspired tile with grey veining."
    },
    {
        id: "ST007",
        name: "Liquorice Dark Grey",
        categories: ["floor", "wall", "outdoor"],
        type: "Concrete Look",
        size: "600 × 600 mm",
        finish: "Matte",
        material: "Porcelain",
        image: "images/tiles/Liquorice Dark Grey.jpeg",
        description: "Deep charcoal grey surface with a subtle texture."
    },
    {
        id: "ST008",
        name: "Blue Lagoon",
        categories: ["wall", "bathroom", "kitchen"],
        type: "Decorative",
        size: "600 × 600 mm",
        finish: "Glossy",
        material: "Ceramic",
        image: "images/tiles/Blue Lagoon.jpeg",
        description: "Blue-green decorative ceramic wall tile."
    },
    {
        id: "ST009",
        name: "Blanc Calacatta",
        categories: ["floor", "wall", "bathroom"],
        type: "Marble Look",
        size: "600 × 1200 mm",
        finish: "Matte",
        material: "Porcelain",
        image: "images/tiles/Blanc Calacatta.jpeg",
        description: "White marble-look porcelain tile with bold grey veining."
    },
    {
        id: "ST010",
        name: "Ergon Dark Grey",
        categories: ["floor", "outdoor"],
        type: "Concrete Look",
        size: "600 × 600 mm",
        finish: "Matte",
        material: "Porcelain",
        image: "images/tiles/Ergon Dark Grey.jpeg",
        description: "Dark grey concrete-inspired porcelain tile."
    },
    {
        id: "ST011",
        name: "Marza Aqua",
        categories: ["wall", "kitchen", "bathroom"],
        type: "Subway",
        size: "600 × 1200 mm",
        finish: "Glossy",
        material: "Ceramic",
        image: "images/tiles/Marza Aqua.jpeg",
        description: "Blue-green glossy subway tiles for feature walls."
    },
    {
        id: "ST012",
        name: "Nilo Decorative",
        categories: ["wall", "bathroom"],
        type: "Decorative",
        size: "600 × 600 mm",
        finish: "Glossy",
        material: "Ceramic",
        image: "images/tiles/Nilo Decorative.jpeg",
        description: "Decorative teal ceramic tile with a raised pattern."
    }
];

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

// URL PARAMETERS

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

// DISPLAY PRODUCTS

function displayProducts(list) {
    productGrid.innerHTML = "";

    list.forEach(function(product) {
        const categoryText = categoryNames[product.categories[0]];

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
                <span class="tile-category">${categoryText}</span>

                <h3>${product.name}</h3>

                <div class="tile-specs">
                    <span>${product.size}</span>
                    <span>${product.finish}</span>
                    <span>${product.material}</span>
                </div>

                <div class="tile-price">Enquire for price</div>

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

// FILTER PRODUCTS

function filterProducts() {
    let filtered = [...products];

    if (activeCategory !== "all") {
        filtered = filtered.filter(function(product) {
            return product.categories.includes(activeCategory);
        });
    }

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
                    return categoryNames[category];
                }).join(" ")
            ].join(" ").toLowerCase();

            return searchableText.includes(searchText);
        });
    }

    if (sizeFilter.value !== "all") {
        filtered = filtered.filter(function(product) {
            return product.size === sizeFilter.value;
        });
    }

    if (finishFilter.value !== "all") {
        filtered = filtered.filter(function(product) {
            return product.finish === finishFilter.value;
        });
    }

    if (sortFilter.value === "az") {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (sortFilter.value === "za") {
        filtered.sort((a, b) => b.name.localeCompare(a.name));
    }

    displayProducts(filtered);
}

// CATEGORY BUTTONS

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

// SEARCH AND FILTER EVENTS

searchInput.addEventListener("input", filterProducts);
sizeFilter.addEventListener("change", filterProducts);
finishFilter.addEventListener("change", filterProducts);
sortFilter.addEventListener("change", filterProducts);

// PRODUCT DETAILS

function openProductDetails(product) {
    productDetails.innerHTML = `
        <img
            class="dialog-product-image"
            src="${product.image}"
            alt="${product.name}"
        >

        <span class="tile-category">${product.id}</span>

        <h2>${product.name}</h2>

        <p>${product.description}</p>

        <p>
            <strong>Category:</strong>
            ${product.categories.map(c => categoryNames[c]).join(", ")}
        </p>

        <p><strong>Tile Type:</strong> ${product.type}</p>
        <p><strong>Size:</strong> ${product.size}</p>
        <p><strong>Finish:</strong> ${product.finish}</p>
        <p><strong>Material:</strong> ${product.material}</p>
        <p><strong>Price:</strong> Enquire for price</p>

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

// ENQUIRY POPUP

function openEnquiry(product) {
    enquiryForm.reset();

    document.getElementById("enquiryProduct").value = product.id;

    document.getElementById("enquiryMessage").value =
        `I am interested in ${product.name} (${product.size}, ${product.finish}).`;

    document.getElementById("enquirySuccess").hidden = true;

    enquiryDialog.showModal();
}

// PRODUCT BUTTON EVENTS

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

// CLOSE POPUPS

document.getElementById("closeProductDialog").addEventListener("click", function() {
    productDialog.close();
});

document.getElementById("closeEnquiryDialog").addEventListener("click", function() {
    enquiryDialog.close();
});

// SAVE ENQUIRIES

enquiryForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const productId = document.getElementById("enquiryProduct").value;

    const selectedProduct = products.find(item => item.id === productId);

    const enquiry = {
        id: Date.now(),

        name: document.getElementById("enquiryName").value.trim(),
        email: document.getElementById("enquiryEmail").value.trim(),
        phone: document.getElementById("enquiryPhone").value.trim(),

        category: selectedProduct
            ? categoryNames[selectedProduct.categories[0]]
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

// RESET FILTERS

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

// INITIAL PAGE SETUP

searchInput.value = initialSearch;
activeCategory = getCategoryFromURL(initialCategory);

document.querySelectorAll(".category-filter").forEach(function(button) {
    button.classList.toggle(
        "active",
        button.dataset.category === activeCategory
    );
});

filterProducts();
