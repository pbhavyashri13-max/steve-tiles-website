// STEVE TILES - PRODUCT COLLECTIONS

const products = [
    {
        id: "ST001",
        name: "Calacatta Beige",
        categories: ["floor", "wall"],
        type: "Marble Look",
        size: "600 × 1200 mm",
        finish: "Glossy",
        material: "Vitrified",
        image: "https://www.artwalktile.com/images/OhU6Nm/c50a_1000w/IM.MU.BGY.2424.MT.jpg",
        description: "A beige and grey marble-look design for elegant floors and walls. Its soft veining gives spaces a refined appearance."
    },
    {
        id: "ST002",
        name: "Urban Grey Stone",
        categories: ["floor", "bathroom", "outdoor"],
        type: "Stone Look",
        size: "600 × 600 mm",
        finish: "Matte",
        material: "Porcelain",
        image: "https://03.cdn37.se/eOD/images/2.404077/klinker-tenfors-pulpis-mid-grey-marmor-matt-60x60-cm.jpeg",
        description: "A modern grey stone-look surface suitable for contemporary interiors and selected outdoor applications."
    },
    {
        id: "ST003",
        name: "Muse Beige",
        categories: ["floor", "wall", "kitchen"],
        type: "Marble Look",
        size: "800 × 1600 mm",
        finish: "Polished",
        material: "Porcelain",
        image: "https://www.banyo.pl/hpeciai/7fb500629198d312c208411a64f1292b/pol_pl_Imola-Ceramica-Muse-Beige-Grigio-120-x-120-cm-plytka-gresowa-naturalna-mat-MACCHIAAP-1BGLP-38459_1.webp",
        description: "A warm beige and grey stone-inspired design for customers looking for a subtle premium finish."
    },
    {
        id: "ST004",
        name: "River Beige",
        categories: ["floor", "bathroom", "kitchen"],
        type: "Natural Stone Look",
        size: "600 × 600 mm",
        finish: "Matte",
        material: "Porcelain",
        image: "https://a.allegroimg.com/original/116c3f/98444e8a4537953ce166158e96e1/TaniGres-Plytki-Gres-Marmurek-Kamien-RIVER-BEIGE-REKT-MATT-60X60-GAT-1",
        description: "A neutral beige stone-look design that can complement a range of home interiors."
    },
    {
        id: "ST005",
        name: "Verona Grey",
        categories: ["floor", "bathroom", "outdoor"],
        type: "Stone Look",
        size: "600 × 600 mm",
        finish: "Matte",
        material: "Porcelain",
        image: "https://www.nationaltiles.com.au/media/catalog/product/n/t/nt19-2905fl-macro.jpg?bg-color=&optimize=medium",
        description: "A soft grey stone-look tile with a matte surface for a simple and contemporary appearance."
    }
];

const categoryNames = {
    floor: "Floor Tiles",
    wall: "Wall Tiles",
    bathroom: "Bathroom Tiles",
    kitchen: "Kitchen Tiles",
    outdoor: "Outdoor Tiles"
};

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


// Read category and search text from the homepage URL.

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


// Display product cards.

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
                    alt="${product.name} tile design"
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
            this.parentElement.style.background =
                "linear-gradient(135deg, #e9e2d6, #c9bba4)";
        });

        productGrid.appendChild(card);
    });

    productCount.textContent =
        `Showing ${list.length} of ${products.length} tile designs`;

    emptyProducts.hidden = list.length !== 0;
    productGrid.hidden = list.length === 0;
}


// Apply category, search and other filters.

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

    const selectedSize = sizeFilter.value;

    if (selectedSize !== "all") {
        filtered = filtered.filter(function(product) {
            return product.size === selectedSize;
        });
    }

    const selectedFinish = finishFilter.value;

    if (selectedFinish !== "all") {
        filtered = filtered.filter(function(product) {
            return product.finish === selectedFinish;
        });
    }

    if (sortFilter.value === "az") {
        filtered.sort(function(a, b) {
            return a.name.localeCompare(b.name);
        });
    }

    if (sortFilter.value === "za") {
        filtered.sort(function(a, b) {
            return b.name.localeCompare(a.name);
        });
    }

    displayProducts(filtered);
}


// Category buttons.

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


// Search and filter events.

searchInput.addEventListener("input", filterProducts);
sizeFilter.addEventListener("change", filterProducts);
finishFilter.addEventListener("change", filterProducts);
sortFilter.addEventListener("change", filterProducts);


// Product details popup.

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

        <p><strong>Category:</strong>
            ${product.categories.map(category => categoryNames[category]).join(", ")}
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

    productDialog.showModal();

    document.getElementById("detailsEnquire").addEventListener("click", function() {
        productDialog.close();
        openEnquiry(product);
    });
}


// Open enquiry popup.

function openEnquiry(product) {

    enquiryForm.reset();

    document.getElementById("enquiryProduct").value = product.id;

    document.getElementById("enquiryMessage").value =
        `I am interested in ${product.name} (${product.size}, ${product.finish}).`;

    document.getElementById("enquirySuccess").hidden = true;

    enquiryDialog.showModal();
}


// Product card button events.

productGrid.addEventListener("click", function(event) {

    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const product = products.find(function(item) {
        return item.id === button.dataset.id;
    });

    if (!product) return;

    if (button.dataset.action === "details") {
        openProductDetails(product);
    }

    if (button.dataset.action === "enquire") {
        openEnquiry(product);
    }
});


// Close popups.

document.getElementById("closeProductDialog").addEventListener("click", function() {
    productDialog.close();
});

document.getElementById("closeEnquiryDialog").addEventListener("click", function() {
    enquiryDialog.close();
});


// Save enquiries in this browser.

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
        alert("Unable to save this enquiry in your browser. Please try again.");
        console.error("Enquiry save error:", error);
    }
});


// Reset all filters.

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


// Initial page setup.

searchInput.value = initialSearch;
activeCategory = getCategoryFromURL(initialCategory);

document.querySelectorAll(".category-filter").forEach(function(button) {
    button.classList.toggle(
        "active",
        button.dataset.category === activeCategory
    );
});

filterProducts();