
/* =========================================
   STEVE TILES - 25 PRODUCT COLLECTIONS
   WITH PROFESSIONAL POPUPS & NOTIFICATIONS
========================================= */

const IMAGE_FOLDER = "images/Tiles/";

const allProducts = [
    { code: "ST001", name: "Botein Mink Marble", categories: ["wall"], size: "600 × 600 mm", finish: "Matte", material: "Porcelain", type: "Marble Look", description: "Elegant beige and grey marble-look tile." },
    { code: "ST002", name: "Les Bijoux Beige", categories: ["floor", "wall"], size: "800 × 1600 mm", finish: "Polished", material: "Porcelain", type: "Marble Look", description: "Premium beige marble-inspired tile with natural veining." },
    { code: "ST003", name: "Taj Mahal Grey", categories: ["floor", "bathroom"], size: "600 × 600 mm", finish: "Matte", material: "Porcelain", type: "Stone Look", description: "Soft grey and beige natural stone-inspired surface." },
    { code: "ST004", name: "Opal Yamuna", categories: ["floor", "wall", "kitchen"], size: "600 × 1200 mm", finish: "Polished", material: "Porcelain", type: "Marble Look", description: "Elegant beige surface with soft natural veining." },
    { code: "ST005", name: "Amico Light", categories: ["floor", "wall", "kitchen"], size: "600 × 1200 mm", finish: "Glossy", material: "Porcelain", type: "Marble Look", description: "Glossy beige-grey marble-look tile." },
    { code: "ST006", name: "Avalon White", categories: ["floor", "wall", "bathroom"], size: "600 × 1200 mm", finish: "Polished", material: "Porcelain", type: "Marble Look", description: "White marble-inspired tile with grey veining." },
    { code: "ST007", name: "Liquorice Dark Grey", categories: ["floor", "wall", "outdoor"], size: "600 × 600 mm", finish: "Matte", material: "Porcelain", type: "Concrete Look", description: "Deep charcoal grey surface with subtle texture." },
    { code: "ST008", name: "Blue Lagoon", categories: ["wall", "bathroom", "kitchen"], size: "600 × 600 mm", finish: "Glossy", material: "Ceramic", type: "Decorative", description: "Blue-green decorative ceramic wall tile." },
    { code: "ST009", name: "Blanc Calacatta", categories: ["floor", "wall", "bathroom"], size: "600 × 1200 mm", finish: "Matte", material: "Porcelain", type: "Marble Look", description: "White marble-look porcelain tile with bold grey veining." },
    { code: "ST010", name: "Ergon Dark Grey", categories: ["floor", "outdoor"], size: "600 × 600 mm", finish: "Matte", material: "Porcelain", type: "Concrete Look", description: "Dark grey concrete-inspired porcelain tile." },
    { code: "ST011", name: "Marza Aqua", categories: ["wall", "bathroom"], size: "600 × 1200 mm", finish: "Glossy", material: "Ceramic", type: "Subway", description: "Blue-green glossy tile for feature walls." },
    { code: "ST012", name: "Nilo Decorative", categories: ["wall"], size: "600 × 600 mm", finish: "Glossy", material: "Ceramic", type: "Decorative", description: "Decorative teal ceramic tile with a raised pattern." },
    { code: "ST013", name: "Premium White Marble", categories: ["floor", "wall"], size: "600 × 1200 mm", finish: "Glossy", material: "Porcelain", type: "Marble Look", description: "Premium white marble-look tile." },
    { code: "ST014", name: "Premium Beige Marble", categories: ["floor", "wall"], size: "600 × 1200 mm", finish: "Glossy", material: "Porcelain", type: "Marble Look", description: "Warm beige marble-look tile for elegant interiors." },
    { code: "ST015", name: "Wooden Oak Floor", categories: ["floor"], size: "600 × 1200 mm", finish: "Matte", material: "Porcelain", type: "Wood Look", description: "Natural oak wood-inspired floor tile." },
    { code: "ST016", name: "Premium Beige Marble Large", categories: ["floor", "wall"], size: "800 × 1600 mm", finish: "Polished", material: "Porcelain", type: "Marble Look", description: "Large-format premium beige marble-look tile." },
    { code: "ST017", name: "Walnut Wood Floor", categories: ["floor"], size: "600 × 1200 mm", finish: "Matte", material: "Porcelain", type: "Wood Look", description: "Rich walnut wood-inspired tile." },
    { code: "ST018", name: "Emerald Zellige", categories: ["kitchen", "wall"], size: "600 × 600 mm", finish: "Glossy", material: "Ceramic", type: "Decorative", description: "Emerald green decorative tile for statement walls." },
    { code: "ST019", name: "Navy Subway", categories: ["kitchen", "wall"], size: "600 × 600 mm", finish: "Glossy", material: "Ceramic", type: "Subway", description: "Modern navy blue subway-style wall tile." },
    { code: "ST020", name: "Sage Green Decorative", categories: ["bathroom", "wall"], size: "600 × 600 mm", finish: "Matte", material: "Ceramic", type: "Decorative", description: "Soft sage green decorative tile." },
    { code: "ST021", name: "White Fluted Decor", categories: ["wall", "bathroom"], size: "600 × 1200 mm", finish: "Matte", material: "Ceramic", type: "Decorative", description: "Modern white fluted tile for feature walls." },
    { code: "ST022", name: "Terrazzo White", categories: ["floor", "wall"], size: "600 × 600 mm", finish: "Matte", material: "Porcelain", type: "Terrazzo Look", description: "Contemporary white terrazzo-inspired tile." },
    { code: "ST023", name: "Black Granite", categories: ["floor", "outdoor"], size: "600 × 600 mm", finish: "Polished", material: "Porcelain", type: "Granite Look", description: "Bold black granite-inspired tile." },
    { code: "ST024", name: "Ivory Limestone", categories: ["floor", "outdoor"], size: "600 × 1200 mm", finish: "Matte", material: "Porcelain", type: "Stone Look", description: "Natural ivory limestone-inspired tile." },
    { code: "ST025", name: "Beige Sandstone", categories: ["floor", "outdoor"], size: "600 × 600 mm", finish: "Matte", material: "Porcelain", type: "Stone Look", description: "Warm beige sandstone-inspired tile." }
].map((product, index) => ({
    ...product,
    id: index + 1,
    image: `${IMAGE_FOLDER}${product.code}.jpg`
}));

let filteredProducts = [...allProducts];

const productGrid = document.getElementById("productGrid");
const productCount = document.getElementById("productCount");
const catalogSearch = document.getElementById("catalogSearch");
const sizeFilter = document.getElementById("sizeFilter");
const finishFilter = document.getElementById("finishFilter");
const sortFilter = document.getElementById("sortFilter");
const emptyProducts = document.getElementById("emptyProducts");

/* SAFE HTML */

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

/* PROFESSIONAL TOAST NOTIFICATIONS */

function showSteveToast(message, type = "success") {
    let container = document.getElementById("toastContainer");

    if (!container) {
        container = document.createElement("div");
        container.id = "toastContainer";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `steve-toast ${type}`;

    const icon = type === "error" ? "!" :
                 type === "info" ? "i" : "✓";

    toast.innerHTML = `
        <strong>${icon}</strong>
        <span>${escapeHTML(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("hide");
        setTimeout(() => toast.remove(), 350);
    }, 3000);
}

/* FILTER OPTIONS */

function populateFilterOptions() {
    const sizes = [...new Set(allProducts.map(p => p.size))].sort();
    const finishes = [...new Set(allProducts.map(p => p.finish))].sort();

    if (sizeFilter) {
        sizeFilter.innerHTML = '<option value="all">All Sizes</option>';

        sizes.forEach(size => {
            sizeFilter.innerHTML +=
                `<option value="${escapeHTML(size)}">${escapeHTML(size)}</option>`;
        });
    }

    if (finishFilter) {
        finishFilter.innerHTML = '<option value="all">All Finishes</option>';

        finishes.forEach(finish => {
            finishFilter.innerHTML +=
                `<option value="${escapeHTML(finish)}">${escapeHTML(finish)}</option>`;
        });
    }
}

/* CATEGORY TEXT */

function getCategoryText(product) {
    return product.categories.join(", ");
}

/* FILTER PRODUCTS */

function applyFilters() {
    const search = catalogSearch?.value.trim().toLowerCase() || "";
    const selectedSize = sizeFilter?.value || "all";
    const selectedFinish = finishFilter?.value || "all";

    const activeButton = document.querySelector(".category-filter.active");
    const selectedCategory = activeButton?.dataset.category || "all";

    filteredProducts = allProducts.filter(product => {
        const searchableText = [
            product.code,
            product.name,
            product.type,
            product.material,
            product.description,
            getCategoryText(product)
        ].join(" ").toLowerCase();

        return searchableText.includes(search) &&
            (selectedSize === "all" || product.size === selectedSize) &&
            (selectedFinish === "all" || product.finish === selectedFinish) &&
            (selectedCategory === "all" || product.categories.includes(selectedCategory));
    });

    applySorting();
    renderProducts();
}

/* SORT PRODUCTS */

function applySorting() {
    const sortValue = sortFilter?.value || "featured";

    if (sortValue === "az") {
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortValue === "za") {
        filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
    } else {
        filteredProducts.sort((a, b) => a.id - b.id);
    }
}

/* IMAGE FALLBACK */

function showImageFallback(container) {
    if (!container) return;

    container.innerHTML = `
        <div class="product-image-fallback">
            <span>Tile image unavailable</span>
        </div>
    `;
}

/* DISPLAY PRODUCTS */

function renderProducts() {
    if (!productGrid) return;

    if (productCount) {
        productCount.textContent =
            `Showing ${filteredProducts.length} of 25 tile collections`;
    }

    if (filteredProducts.length === 0) {
        productGrid.innerHTML = "";
        if (emptyProducts) emptyProducts.hidden = false;
        return;
    }

    if (emptyProducts) emptyProducts.hidden = true;

    productGrid.innerHTML = filteredProducts.map(product => `
        <article class="product-card">
            <div class="product-image-wrap">
                <img
                    src="${escapeHTML(product.image)}"
                    alt="${escapeHTML(product.name)}"
                    class="product-image"
                    loading="lazy"
                    onerror="showImageFallback(this.parentElement)"
                >
            </div>

            <div class="product-card-content">
                <p class="product-code">${escapeHTML(product.code)}</p>
                <h3>${escapeHTML(product.name)}</h3>
                <p class="product-category">${escapeHTML(product.type)}</p>

                <div class="product-specifications">
                    <span>${escapeHTML(product.size)}</span>
                    <span>${escapeHTML(product.finish)}</span>
                </div>

                <div class="product-card-actions">
                    <button type="button" data-action="details"
                        data-code="${product.code}">
                        View Details
                    </button>

                    <button type="button" data-action="enquire"
                        data-code="${product.code}">
                        Enquire Now
                    </button>
                </div>
            </div>
        </article>
    `).join("");
}

/* CENTRE PRODUCT DETAILS POPUP */

function openProductDetails(code) {
    const product = allProducts.find(p => p.code === code);
    const details = document.getElementById("productDetails");
    const dialog = document.getElementById("productDialog");

    if (!product || !details || !dialog) return;

    details.innerHTML = `
        <div class="product-detail-layout">
            <div class="product-detail-image">
                <img
                    src="${escapeHTML(product.image)}"
                    alt="${escapeHTML(product.name)}"
                    onerror="showImageFallback(this.parentElement)"
                >
            </div>

            <div class="product-detail-info">
                <p class="product-code">${escapeHTML(product.code)}</p>
                <h2>${escapeHTML(product.name)}</h2>

                <p><strong>Product Code:</strong> ${escapeHTML(product.code)}</p>
                <p><strong>Category:</strong> ${escapeHTML(getCategoryText(product))}</p>
                <p><strong>Size:</strong> ${escapeHTML(product.size)}</p>
                <p><strong>Finish:</strong> ${escapeHTML(product.finish)}</p>
                <p><strong>Material:</strong> ${escapeHTML(product.material)}</p>
                <p><strong>Type:</strong> ${escapeHTML(product.type)}</p>
                <p>${escapeHTML(product.description)}</p>

                <button type="button" id="detailEnquiryButton">
                    Enquire Now
                </button>
            </div>
        </div>
    `;

    if (!dialog.open) dialog.showModal();

    document.getElementById("detailEnquiryButton")
        ?.addEventListener("click", () => openEnquiry(code));
}

/* CENTRE ENQUIRY POPUP */

function openEnquiry(code) {
    const product = allProducts.find(p => p.code === code);
    const enquiryProduct = document.getElementById("enquiryProduct");
    const enquiryDialog = document.getElementById("enquiryDialog");
    const productDialog = document.getElementById("productDialog");

    if (!product || !enquiryDialog) return;

    if (enquiryProduct) {
        enquiryProduct.value = `${product.code} - ${product.name}`;
    }

    if (productDialog?.open) {
        productDialog.close();
    }

    if (!enquiryDialog.open) {
        enquiryDialog.showModal();
    }
}

/* CLOSE DIALOG */

function closeDialog(id) {
    const dialog = document.getElementById(id);

    if (dialog?.open) {
        dialog.close();
    }
}

/* CLOSE WHEN CLICKING OUTSIDE */

["productDialog", "enquiryDialog"].forEach(id => {
    const dialog = document.getElementById(id);

    dialog?.addEventListener("click", event => {
        if (event.target === dialog) {
            dialog.close();
        }
    });
});

/* PRODUCT BUTTON EVENTS */

productGrid?.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const code = button.dataset.code;

    if (button.dataset.action === "details") {
        openProductDetails(code);
    }

    if (button.dataset.action === "enquire") {
        openEnquiry(code);
    }
});

/* SEARCH AND FILTER EVENTS */

catalogSearch?.addEventListener("input", applyFilters);
sizeFilter?.addEventListener("change", applyFilters);
finishFilter?.addEventListener("change", applyFilters);
sortFilter?.addEventListener("change", applyFilters);

/* CATEGORY BUTTONS */

document.querySelectorAll(".category-filter").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".category-filter").forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");
        applyFilters();
    });
});

/* RESET FILTERS */

document.getElementById("resetFilters")?.addEventListener("click", () => {
    if (catalogSearch) catalogSearch.value = "";
    if (sizeFilter) sizeFilter.value = "all";
    if (finishFilter) finishFilter.value = "all";
    if (sortFilter) sortFilter.value = "featured";

    document.querySelectorAll(".category-filter").forEach(item => {
        item.classList.remove("active");
    });

    document.querySelector('.category-filter[data-category="all"]')
        ?.classList.add("active");

    applyFilters();
});

/* CLOSE BUTTONS */

document.getElementById("closeProductDialog")
    ?.addEventListener("click", () => closeDialog("productDialog"));

document.getElementById("closeEnquiryDialog")
    ?.addEventListener("click", () => closeDialog("enquiryDialog"));

/* ENQUIRY FORM */

document.getElementById("productEnquiryForm")?.addEventListener(
    "submit",
    event => {
        event.preventDefault();

        const enquiry = {
            product: document.getElementById("enquiryProduct")?.value || "",
            name: document.getElementById("enquiryName")?.value.trim() || "",
            email: document.getElementById("enquiryEmail")?.value.trim() || "",
            phone: document.getElementById("enquiryPhone")?.value.trim() || "",
            message: document.getElementById("enquiryMessage")?.value.trim() || "",
            date: new Date().toISOString()
        };

        const enquiries = JSON.parse(
            localStorage.getItem("steveTilesEnquiries") || "[]"
        );

        enquiries.push(enquiry);

        localStorage.setItem(
            "steveTilesEnquiries",
            JSON.stringify(enquiries)
        );

        const success = document.getElementById("enquirySuccess");

        if (success) {
            success.hidden = false;
            success.textContent = "Your enquiry has been saved successfully!";
        }

        event.target.reset();

        showSteveToast("Your enquiry has been saved successfully!", "success");

        setTimeout(() => {
            closeDialog("enquiryDialog");

            if (success) success.hidden = true;
        }, 1800);
    }
);

/* INITIALIZE CATALOGUE */

populateFilterOptions();
applyFilters();

console.log("Steve Tiles: 25 products loaded successfully.");
