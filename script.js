
/* ==================================
   STEVE TILES - WEBSITE JAVASCRIPT
================================== */

// MOBILE NAVIGATION

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", function () {

    const isOpen = navLinks.classList.toggle("active");

    menuToggle.textContent = isOpen ? "✕" : "☰";

    menuToggle.setAttribute("aria-expanded", isOpen);

});


// CLOSE MOBILE MENU AFTER NAVIGATION

document.querySelectorAll(".nav-links a").forEach(function (link) {

    link.addEventListener("click", function () {

        navLinks.classList.remove("active");

        menuToggle.textContent = "☰";

        menuToggle.setAttribute("aria-expanded", "false");

    });

});


// HOMEPAGE SEARCH

const homeSearchForm = document.getElementById("homeSearchForm");

homeSearchForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const searchValue = document
        .getElementById("homeSearch")
        .value.trim();

    if (!searchValue) {
        return;
    }

    window.location.href =
        "products.html?q=" + encodeURIComponent(searchValue);

});


// CUSTOMER ENQUIRY FORM

const enquiryForm = document.getElementById("enquiryForm");

const formMessage = document.getElementById("formMessage");

enquiryForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const enquiry = {

        id: Date.now(),

        name: document
            .getElementById("customerName")
            .value.trim(),

        email: document
            .getElementById("customerEmail")
            .value.trim(),

        phone: document
            .getElementById("customerPhone")
            .value.trim(),

        category: document
            .getElementById("customerCategory")
            .value,

        message: document
            .getElementById("customerMessage")
            .value.trim(),

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

    }

    catch (error) {

        formMessage.textContent =
            "Unable to save your enquiry. Please try again.";

        console.error("Enquiry storage error:", error);

    }

});


// WEBSITE INITIALIZATION

console.log("Steve Tiles website loaded successfully.");
