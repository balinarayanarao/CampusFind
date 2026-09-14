document.addEventListener("DOMContentLoaded", function () {
        /* ---------- DASHBOARD LOGIN PROTECTION ---------- */

    if (
        document.querySelector(".dashboard-page") &&
        !localStorage.getItem("campusfind_token")
    ) {
        window.location.href = "login.html";
        return;
    }

    /* =====================================================
   1. BROWSE ITEMS - LOAD, SEARCH & FILTER
   ===================================================== */

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const statusFilter = document.getElementById("statusFilter");
const itemsGrid = document.getElementById("itemsGrid");
const noResults = document.getElementById("noResults");

if (searchInput && categoryFilter && statusFilter && itemsGrid) {

    let allItems = [];

    function escapeHTML(value) {
        const div = document.createElement("div");
        div.textContent = value ?? "";
        return div.innerHTML;
    }

    function formatDate(dateString) {

        if (!dateString) return "";

        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            return dateString;
        }

        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }

    function getItemIcon(category) {

        const icons = {
            electronics: "💻",
            documents: "🪪",
            bags: "🎒",
            clothing: "👕",
            accessories: "👛",
            keys: "🔑",
            books: "📚",
            wallet: "👛",
            other: "📦"
        };

        return icons[category] || "📦";
    }

    function getImageClass(category) {

        const classes = {
            electronics: "electronics-image",
            documents: "document-image",
            bags: "bag-image",
            clothing: "clothing-image",
            accessories: "wallet-image",
            keys: "keys-image",
            books: "books-image"
        };

        return classes[category] || "electronics-image";
    }

    function renderItems(items) {

        itemsGrid.innerHTML = "";

        if (!items || items.length === 0) {
            noResults.style.display = "block";
            return;
        }

        noResults.style.display = "none";

        items.forEach(function (item) {

            const type = (item.type || "lost").toLowerCase();

            const card = document.createElement("article");

            card.className = "item-card";

            card.dataset.category =
                (item.category || "other").toLowerCase();

            card.dataset.status = type;

            card.innerHTML = `
                <div class="item-image ${getImageClass(item.category)}">
                    ${getItemIcon(item.category)}
                </div>

                <div class="item-card-body">

                    <div class="item-card-top">

                        <span class="item-status ${type === "found" ? "found-status" : "lost-status"}">
                            ${escapeHTML(type.toUpperCase())}
                        </span>

                        <span class="item-date">
                            ${escapeHTML(formatDate(item.date))}
                        </span>

                    </div>

                    <h3>
                        ${escapeHTML(item.title)}
                    </h3>

                    <p class="item-description">
                        ${escapeHTML(item.description)}
                    </p>

                    <div class="item-location">
                        📍 ${escapeHTML(item.location)}
                    </div>

                    <a
                        href="item-details.html?id=${encodeURIComponent(item.id)}"
                        class="view-item-btn"
                    >
                        View Details →
                    </a>

                </div>
            `;

            itemsGrid.appendChild(card);
        });
    }

    function filterItems() {

        const searchValue =
            searchInput.value.toLowerCase().trim();

        const categoryValue =
            categoryFilter.value.toLowerCase();

        const statusValue =
            statusFilter.value.toLowerCase();

        const filteredItems = allItems.filter(function (item) {

            const itemText = `
                ${item.title || ""}
                ${item.description || ""}
                ${item.location || ""}
                ${item.category || ""}
            `.toLowerCase();

            const itemCategory =
                (item.category || "other").toLowerCase();

            const itemType =
                (item.type || "").toLowerCase();

            const matchesSearch =
                itemText.includes(searchValue);

            const matchesCategory =
                categoryValue === "all" ||
                itemCategory === categoryValue;

            const matchesStatus =
                statusValue === "all" ||
                itemType === statusValue;

            return (
                matchesSearch &&
                matchesCategory &&
                matchesStatus
            );
        });

        renderItems(filteredItems);
    }

    async function loadItems() {

        try {

            const response = await fetch(
                "http://127.0.0.1:5000/api/items"
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to load items."
                );
            }

            allItems = data.items || [];

            renderItems(allItems);

        } catch (error) {

            console.error("Load items error:", error);

            itemsGrid.innerHTML = "";

            noResults.style.display = "block";

            noResults.querySelector("h3").textContent =
                "Unable to load items";

            noResults.querySelector("p").textContent =
                "Please make sure the CampusFind server is running.";
        }
    }

    searchInput.addEventListener(
        "input",
        filterItems
    );

    categoryFilter.addEventListener(
        "change",
        filterItems
    );

    statusFilter.addEventListener(
        "change",
        filterItems
    );

    loadItems();
}


    /* =====================================================
   2. LOGIN FORM
   ===================================================== */

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email =
            document.getElementById("loginEmail").value.trim();

        const password =
            document.getElementById("loginPassword").value;

        if (!email || !password) {
            alert("Please enter your email and password.");
            return;
        }

        try {

            const response = await fetch(
                "http://127.0.0.1:5000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Login failed.");
                return;
            }

            // Save authentication token
            localStorage.setItem(
                "campusfind_token",
                data.access_token
            );

            localStorage.setItem(
                "campusfind_user",
                JSON.stringify(data.user || {})
            );

            alert("Login successful!");

            window.location.href = "dashboard.html";

        } catch (error) {

            console.error("Login error:", error);

            alert(
                "Unable to connect to the CampusFind server."
            );
        }

    });
}


    /* =====================================================
   3. REGISTER FORM
   ===================================================== */

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const name =
            document.getElementById("name").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;

        if (!name || !email || !password) {
            alert("Please fill in all required fields.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        try {

            const response = await fetch(
                "http://127.0.0.1:5000/api/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Registration failed.");
                return;
            }

            alert("Account created successfully!");

            window.location.href = "login.html";

        } catch (error) {

            console.error("Registration error:", error);

            alert(
                "Unable to connect to the CampusFind server."
            );
        }

    });
}


    /* =====================================================
   4. REPORT ITEM FORM
   ===================================================== */

const reportForm = document.getElementById("reportForm");

if (reportForm) {

    reportForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const itemName =
            document.getElementById("itemName").value.trim();

        const description =
            document.getElementById("description").value.trim();

        const category =
            document.getElementById("category").value;

        const location =
            document.getElementById("location").value.trim();

        const date =
            document.getElementById("date").value;

        const reportType =
            document.querySelector(
                'input[name="reportType"]:checked'
            )?.value;

        if (!itemName || !description || !category || !location || !date) {
            alert("Please fill in all required fields.");
            return;
        }

        if (!reportType) {
            alert("Please select Lost Item or Found Item.");
            return;
        }

        const token =
            localStorage.getItem("campusfind_token");

        if (!token) {
            alert("Please login before reporting an item.");
            window.location.href = "login.html";
            return;
        }

        try {

            const response = await fetch(
                "http://127.0.0.1:5000/api/items",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + token
                    },
                    body: JSON.stringify({
                        type: reportType,
                        title: itemName,
                        description: description,
                        category: category,
                        location: location,
                        date: date
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {

                alert(
                    data.message || "Failed to submit the report."
                );

                return;
            }

            alert("Your item report has been submitted successfully!");

            reportForm.reset();

        } catch (error) {

            console.error("Report error:", error);

            alert(
                "Unable to connect to the CampusFind server."
            );
        }

    });
}


    /* =====================================================
       5. GENERIC FORM SUPPORT
       ===================================================== */

    const forms =
        document.querySelectorAll(
            "form:not(#loginForm):not(#registerForm):not(#reportForm)"
        );

    forms.forEach(function (form) {

        form.addEventListener(
            "submit",
            function (event) {

                /*
                 * Do not interfere with forms that already
                 * have their own submit handler.
                 */
            }
        );

    });


    /* =====================================================
       6. MOBILE NAVIGATION
       ===================================================== */

    const navbar =
        document.querySelector(".navbar");

    const navLinks =
        document.querySelector(".nav-links");


    if (navbar && navLinks) {

        let menuButton =
            navbar.querySelector(".mobile-menu-btn");


        if (!menuButton) {

            menuButton =
                document.createElement("button");

            menuButton.className =
                "mobile-menu-btn";

            menuButton.innerHTML =
                "☰";

            menuButton.setAttribute(
                "aria-label",
                "Open navigation menu"
            );

            navbar.appendChild(menuButton);
        }


        menuButton.addEventListener(
            "click",
            function () {

                navLinks.classList.toggle(
                    "mobile-open"
                );

            }
        );


        const links =
            navLinks.querySelectorAll("a");


        links.forEach(function (link) {

            link.addEventListener(
                "click",
                function () {

                    navLinks.classList.remove(
                        "mobile-open"
                    );

                }
            );

        });

    }


    /* =====================================================
       7. ACTIVE NAVIGATION LINK
       ===================================================== */

    let currentPage =
        window.location.pathname
            .split("/")
            .pop();


    if (
        currentPage === "" ||
        currentPage === "/"
    ) {
        currentPage = "index.html";
    }


    const navigationLinks =
        document.querySelectorAll(
            ".nav-links a"
        );


    navigationLinks.forEach(function (link) {

        const href =
            link.getAttribute("href");


        if (!href) return;


        const linkPage =
            href.split("/").pop();


        if (linkPage === currentPage) {

            link.classList.add("active");

        }

    });


    /* =====================================================
       8. CURRENT YEAR
       ===================================================== */

    const copyright =
        document.querySelector(".copyright");


    if (copyright) {

        copyright.textContent =
            "© " +
            new Date().getFullYear() +
            " CampusFind. All rights reserved.";

    }


    /* =====================================================
       9. ITEM DETAILS - CONTACT BUTTON
       ===================================================== */

    window.showContactMessage =
        function () {

            alert(
                "Contact feature will be connected to the backend soon."
            );

        };


    /* =====================================================
       10. SMOOTH SCROLL
       ===================================================== */

    const smoothLinks =
        document.querySelectorAll(
            'a[href^="#"]'
        );


    smoothLinks.forEach(function (link) {

        link.addEventListener(
            "click",
            function (event) {

                const targetId =
                    link.getAttribute("href");


                if (
                    targetId === "#" ||
                    targetId === ""
                ) {
                    return;
                }


                const target =
                    document.querySelector(targetId);


                if (target) {

                    event.preventDefault();

                    target.scrollIntoView({
                        behavior: "smooth"
                    });

                }

            }
        );

    });
/* =====================================================
   10. ITEM DETAILS - LOAD REAL ITEM
   ===================================================== */

const itemDetailsPage =
    document.querySelector(".details-page");

if (itemDetailsPage) {

    const params = new URLSearchParams(
        window.location.search
    );

    const itemId = params.get("id");

    if (!itemId) {

        alert("Item ID is missing.");

    } else {

        async function loadItemDetails() {

            try {

                const response = await fetch(
                    "http://127.0.0.1:5000/api/items"
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to load item."
                    );
                }

                const item =
                    (data.items || []).find(
                        function (currentItem) {
                            return String(currentItem.id) === String(itemId);
                        }
                    );

                if (!item) {

                    alert("Item not found.");
                    return;
                }
                /* ---------- CATEGORY ---------- */

const category =
    itemDetailsPage.querySelector(".details-category");

if (category) {
    category.textContent =
        formatItemCategory(item.category);
}
/* ---------- ITEM IMAGE / ICON ---------- */

const detailsImage =
    itemDetailsPage.querySelector(".details-image");

if (detailsImage) {

    const icons = {
        electronics: "💻",
        documents: "🪪",
        bags: "🎒",
        clothing: "👕",
        accessories: "👛",
        wallet: "👛",
        keys: "🔑",
        books: "📚",
        other: "📦"
    };

    const categoryKey =
        String(item.category || "other").toLowerCase();

    const icon =
        icons[categoryKey] || "📦";

    const statusClass =
        String(item.type || "lost").toLowerCase();

    const statusText =
        statusClass === "found"
            ? "FOUND ITEM"
            : "LOST ITEM";

    detailsImage.innerHTML = `
        ${icon}
        <span class="details-status ${statusClass}">
            ${statusText}
        </span>
    `;
}

/* ---------- INTRO ---------- */

const intro =
    itemDetailsPage.querySelector(".details-intro");

if (intro) {

    const type =
        String(item.type || "").toLowerCase();

    const action =
        type === "found"
            ? "reported found"
            : "reported missing";

    intro.textContent =
        `${item.title || "Item"} ${action} on campus.`;
}

                /* ---------- TITLE ---------- */

                const title =
                    itemDetailsPage.querySelector("h1");

                if (title) {
                    title.textContent = item.title || "Item";
                }


                /* ---------- INFORMATION ---------- */

                const infoValues =
                    itemDetailsPage.querySelectorAll(
                        ".details-info strong"
                    );

                if (infoValues.length >= 4) {

                    // 1. Location
                    infoValues[0].textContent =
                        item.location || "Not specified";

                    // 2. Date
                    infoValues[1].textContent =
                        formatItemDate(item.date);

                    // 3. Status
                    infoValues[2].textContent =
                        formatItemStatus(item.status);

                    // 4. Category
                    infoValues[3].textContent =
                        formatItemCategory(item.category);
                }


                /* ---------- DESCRIPTION ---------- */

                const sections =
                    itemDetailsPage.querySelectorAll(
                        ".details-section"
                    );

                if (sections.length > 0) {

                    const description =
                        sections[0].querySelector("p");

                    if (description) {
                        description.textContent =
                            item.description || "No description provided.";
                    }
                }


                /* ---------- PAGE TITLE ---------- */

                document.title =
                    `${item.title || "Item Details"} | CampusFind`;

            } catch (error) {

                console.error(
                    "Item details error:",
                    error
                );

                alert(
                    "Unable to load item details."
                );
            }
        }


        function formatItemDate(dateString) {

            if (!dateString) {
                return "Not specified";
            }

            const date =
                new Date(dateString);

            if (isNaN(date.getTime())) {
                return dateString;
            }

            return date.toLocaleDateString(
                "en-IN",
                {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            );
        }


        function formatItemStatus(status) {

            if (!status) {
                return "Still Missing";
            }

            const value =
                String(status).toLowerCase();

            if (value === "returned") {
                return "Returned";
            }

            if (value === "active" || value === "lost" || value === "found") {
                return "Still Missing";
            }

            return String(status);
        }


        function formatItemCategory(category) {

            if (!category) {
                return "Other";
            }

            return String(category)
                .charAt(0)
                .toUpperCase() +
                String(category).slice(1);
        }


        loadItemDetails();
    }
}
/* =====================================================
   CONTACT REPORTER / CLAIM FORM
   ===================================================== */

const contactOwnerBtn =
    document.getElementById("contactOwnerBtn");

const contactPanel =
    document.getElementById("contactPanel");

const contactForm =
    document.getElementById("contactForm");

if (contactOwnerBtn && contactPanel) {

    contactOwnerBtn.addEventListener("click", function () {

        contactPanel.style.display = "block";

        contactOwnerBtn.style.display = "none";

        contactPanel.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    });

}

if (contactForm) {

    contactForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const token =
            localStorage.getItem("campusfind_token");

        if (!token) {
            alert("Please login first to submit a claim.");
            window.location.href = "login.html";
            return;
        }

        const params =
            new URLSearchParams(window.location.search);

        const itemId =
            params.get("id");

        const verificationText =
            contactForm.querySelector("textarea")?.value.trim();

        if (!itemId) {
            alert("Item ID is missing.");
            return;
        }

        if (!verificationText) {
            alert("Please provide verification information.");
            return;
        }

        try {

            const response = await fetch(
                "http://127.0.0.1:5000/api/claims",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        item_id: itemId,
                        verification_text: verificationText
                    })
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                alert(
                    data.message ||
                    "Failed to submit claim."
                );
                return;
            }

            alert(
                "Claim submitted successfully!"
            );

            contactForm.reset();

        } catch (error) {

            console.error(
                "Claim submission error:",
                error
            );

            alert(
                "Unable to connect to the CampusFind server."
            );
        }

    });

}
/* =====================================================
   DASHBOARD - DYNAMIC DATA
   ===================================================== */

const dashboardPage = document.querySelector(".dashboard-page");

if (dashboardPage) {

    const token =
        localStorage.getItem("campusfind_token");

    const savedUser =
        JSON.parse(
            localStorage.getItem("campusfind_user") || "{}"
        );

    function dashboardEscapeHTML(value) {

        const div =
            document.createElement("div");

        div.textContent =
            value ?? "";

        return div.innerHTML;
    }


    function dashboardFormatDate(dateString) {

        if (!dateString) {
            return "";
        }

        const date =
            new Date(dateString);

        if (isNaN(date.getTime())) {
            return dateString;
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );
    }


    function dashboardGetIcon(category) {

        const icons = {

            electronics: "💻",
            documents: "🪪",
            bags: "🎒",
            clothing: "👕",
            accessories: "👛",
            wallet: "👛",
            keys: "🔑",
            books: "📚",
            other: "📦"

        };

        return (
            icons[
                String(
                    category || "other"
                ).toLowerCase()
            ] || "📦"
        );
    }


    function dashboardStatusText(item) {

        const status =
            String(
                item.status || ""
            ).toLowerCase();

        if (status === "returned") {
            return "Recovered";
        }

        const type =
            String(
                item.type || ""
            ).toLowerCase();

        if (type === "found") {
            return "Found";
        }

        return "Lost";
    }


    async function loadDashboard() {

        if (!token) {

            console.warn(
                "No CampusFind login token found."
            );

            return;
        }


        try {

            const response =
                await fetch(
                    "http://127.0.0.1:5000/api/items",
                    {
                        method: "GET",

                        headers: {
                            "Authorization":
                                "Bearer " + token
                        }
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to load dashboard."
                );

            }


            const allItems =
                data.items || [];


            /* =================================================
               ONLY MY REPORTS
               ================================================= */

            const myItems =
                allItems.filter(
                    function (item) {

                        return String(
                            item.user_id || ""
                        ) === String(
                            savedUser.id || ""
                        );

                    }
                );
                        /* =================================================
               PENDING CLAIMS
               ================================================= */

            const pendingClaimsList =
                document.getElementById("pendingClaimsList");

            if (pendingClaimsList) {

                try {

                    const claimsResponse =
                        await fetch(
                            "http://127.0.0.1:5000/api/claims",
                            {
                                method: "GET",

                                headers: {
                                    "Authorization":
                                        "Bearer " + token
                                }
                            }
                        );


                    const claimsData =
                        await claimsResponse.json();


                    if (!claimsResponse.ok) {

                        throw new Error(
                            claimsData.message ||
                            "Unable to load claims."
                        );

                    }


                    const claims =
                        claimsData.claims || [];


                    /*
                     * Only show pending claims for
                     * items reported by the logged-in user.
                     */

                    const myItemIds =
                        myItems.map(
                            function (item) {
                                return String(item.id);
                            }
                        );


                    const pendingClaims =
                        claims.filter(
                            function (claim) {

                                return (
                                    String(claim.status || "").toUpperCase() ===
                                    "PENDING" &&
                                    myItemIds.includes(
                                        String(claim.item_id)
                                    )
                                );

                            }
                        );


                    if (pendingClaims.length === 0) {

                        pendingClaimsList.innerHTML = `
                            <p style="padding: 20px; color: #777;">
                                No pending claims.
                            </p>
                        `;

                    } else {

                        pendingClaimsList.innerHTML = "";

                        pendingClaims.forEach(
                            function (claim) {

                                const claimedItem =
                                    myItems.find(
                                        function (item) {
                                            return String(item.id) ===
                                                String(claim.item_id);
                                        }
                                    );


                                const row =
                                    document.createElement("div");

                                row.className =
                                    "dashboard-claim-item";
                                row.innerHTML = `

                                        <div class="report-item-icon">
                                            🔔
                                        </div>

                                        <div class="report-info">

                                                 <h3>
                                                     ${dashboardEscapeHTML(
                                                           claimedItem
                                                               ? claimedItem.title
                                                               : "Item"
                                                  )}
                                                 </h3>

                                                 <p>
                                                    ${dashboardEscapeHTML(
                                                        claim.verification_text ||
                                                        "No verification message."
                                                   )}
                                                 </p>

                                                 <div style="margin-top: 10px; display: flex; gap: 8px;">

                                                    <button
                                                       type="button"
                                                       class="claim-approve-btn"
                                                       data-claim-id="${claim.id}"
                                                       style="
                                                           padding: 6px 12px;
                                                           border: none;
                                                           border-radius: 6px;
                                                           cursor: pointer;
                                                        "
                                                     >
                                                        Approve
                                                     </button>

                                                     <button
                                                         type="button"
                                                         class="claim-reject-btn"
                                                         data-claim-id="${claim.id}"
                                                         style="
                                                             padding: 6px 12px;
                                                             border: none;
                                                             border-radius: 6px;
                                                             cursor: pointer;
                                                            "
                                                        >
                                                            Reject
                                                        </button>

                                                    </div>

                                                </div>

                                                <span class="dashboard-status lost">
                                                    Pending
                                                </span>

                                            `;


                                pendingClaimsList.appendChild(row);

                            }
                        );
                        /* =================================================
   APPROVE / REJECT CLAIM
   ================================================= */

pendingClaimsList.onclick = async function (event) {

    const approveButton =
        event.target.closest(".claim-approve-btn");

    const rejectButton =
        event.target.closest(".claim-reject-btn");

    if (!approveButton && !rejectButton) {
        return;
    }

    const button =
        approveButton || rejectButton;

    const claimId =
        button.dataset.claimId;

    const newStatus =
        approveButton
            ? "APPROVED"
            : "REJECTED";

    const actionText =
        approveButton
            ? "approve"
            : "reject";

    const confirmed =
        confirm(
            `Are you sure you want to ${actionText} this claim?`
        );

    if (!confirmed) {
        return;
    }

    try {

        button.disabled = true;

        const response =
            await fetch(
                `http://127.0.0.1:5000/api/claims/${claimId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " + token
                    },

                    body: JSON.stringify({
                        status: newStatus
                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                `Failed to ${actionText} claim.`
            );

        }

        alert(
            approveButton
                ? "Claim approved successfully!"
                : "Claim rejected successfully!"
        );

        /*
         * Reload dashboard so the claim disappears
         * from Pending Claims and the item status updates.
         */
        await loadDashboard();

    } catch (error) {

        console.error(
            "Claim update error:",
            error
        );

        alert(
            error.message ||
            `Unable to ${actionText} claim.`
        );

        button.disabled = false;
    }

};
                    }

                } catch (claimError) {

                    console.error(
                        "Claims loading error:",
                        claimError
                    );

                    pendingClaimsList.innerHTML = `
                        <p style="padding: 20px; color: #777;">
                            Unable to load claims.
                        </p>
                    `;

                }

            }
            
            /* =================================================
               STATISTICS
               ================================================= */

            let totalReports =
                myItems.length;

            let lostItems =
                0;

            let foundItems =
                0;

            let recoveredItems =
                0;


            myItems.forEach(
                function (item) {

                    const type =
                        String(
                            item.type || ""
                        ).toLowerCase();

                    const status =
                        String(
                            item.status || ""
                        ).toLowerCase();


                    if (type === "lost") {
                        lostItems++;
                    }


                    if (type === "found") {
                        foundItems++;
                    }


                    if (status === "returned") {
                        recoveredItems++;
                    }

                }
            );


            /* =================================================
               STAT CARDS
               ================================================= */

            const statCards =
                dashboardPage.querySelectorAll(
                    ".stat-card"
                );


            if (statCards.length >= 4) {

                const totalValue =
                    statCards[0].querySelector(
                        "strong"
                    );

                const lostValue =
                    statCards[1].querySelector(
                        "strong"
                    );

                const foundValue =
                    statCards[2].querySelector(
                        "strong"
                    );

                const recoveredValue =
                    statCards[3].querySelector(
                        "strong"
                    );


                if (totalValue) {
                    totalValue.textContent =
                        totalReports;
                }


                if (lostValue) {
                    lostValue.textContent =
                        lostItems;
                }


                if (foundValue) {
                    foundValue.textContent =
                        foundItems;
                }


                if (recoveredValue) {
                    recoveredValue.textContent =
                        recoveredItems;
                }

            }


            /* =================================================
               MY REPORTS
               ================================================= */

            const reportsPanel =
                dashboardPage.querySelector(
                    ".reports-panel"
                );


            if (reportsPanel) {

                const existingRows =
                    reportsPanel.querySelectorAll(
                        ".report-row"
                    );


                existingRows.forEach(
                    function (row) {
                        row.remove();
                    }
                );


                if (myItems.length === 0) {

                    const emptyMessage =
                        document.createElement(
                            "div"
                        );

                    emptyMessage.className =
                        "dashboard-empty";

                    emptyMessage.textContent =
                        "You haven't reported any items yet.";

                    reportsPanel.appendChild(
                        emptyMessage
                    );

                } else {

                    const sortedItems =
                        [...myItems].sort(
                            function (a, b) {

                                return new Date(
                                    b.created_at || b.date
                                ) -
                                new Date(
                                    a.created_at || a.date
                                );

                            }
                        );


                    sortedItems.forEach(
                        function (item) {

                            const row =
                                document.createElement(
                                    "div"
                                );

                            row.className =
                                "report-row";


                            const icon =
                                dashboardGetIcon(
                                    item.category
                                );


                            const statusText =
                                dashboardStatusText(
                                    item
                                );


                            let statusClass =
                                "lost";


                            if (
                                statusText === "Found"
                            ) {

                                statusClass =
                                    "found";

                            }


                            if (
                                statusText === "Recovered"
                            ) {

                                statusClass =
                                    "recovered";

                            }


                            row.innerHTML = `

                                <div class="report-item-icon">
                                    ${icon}
                                </div>

                                <div class="report-info">

                                    <h3>
                                        ${dashboardEscapeHTML(
                                            item.title ||
                                            "Untitled Item"
                                        )}
                                    </h3>

                                    <p>
                                        ${dashboardEscapeHTML(
                                            item.category ||
                                            "Other"
                                        )}
                                        ·
                                        ${dashboardEscapeHTML(
                                            item.location ||
                                            "Unknown location"
                                        )}
                                    </p>

                                </div>

                                <span class="dashboard-status ${statusClass}">
                                    ${statusText}
                                </span>

                                <span class="report-date">
                                    ${dashboardEscapeHTML(
                                        dashboardFormatDate(
                                            item.date ||
                                            item.created_at
                                        )
                                    )}
                                </span>

                            `;


                            reportsPanel.appendChild(
                                row
                            );

                        }
                    );

                }

            }


            /* =================================================
               PROFILE
               ================================================= */

            const profileName =
                dashboardPage.querySelector(
                    ".profile-card h3"
                );


            const profileEmail =
                dashboardPage.querySelector(
                    ".profile-card > p"
                );


            const displayName =
                savedUser.name ||
                (
                    savedUser.email
                        ? savedUser.email
                            .split("@")[0]
                        : "Student"
                );


            if (profileName) {

                profileName.textContent =
                    displayName;

            }


            if (profileEmail) {

                profileEmail.textContent =
                    savedUser.email || "";

            }


            /* =================================================
               WELCOME MESSAGE
               ================================================= */

            const welcomeHeading =
                dashboardPage.querySelector(
                    ".dashboard-intro h1"
                );


            if (welcomeHeading) {

                welcomeHeading.innerHTML = `

                    Welcome back,
                    <span>
                        ${dashboardEscapeHTML(
                            displayName
                        )}.
                    </span>

                `;

            }


        } catch (error) {

            console.error(
                "Dashboard error:",
                error
            );

        }

    }


    loadDashboard();

}
/* =====================================================
   LOGOUT
   ===================================================== */

const logoutBtn =
    document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            localStorage.removeItem(
                "campusfind_token"
            );

            localStorage.removeItem(
                "campusfind_user"
            );

            alert("Logged out successfully!");

            window.location.href =
                "login.html";

        }
    );

}

/* =================================================
   PROFILE PAGE
   ================================================= */

if (document.querySelector(".profile-page")) {

    const token =
        localStorage.getItem("campusfind_token");

    const savedUser =
        JSON.parse(
            localStorage.getItem("campusfind_user") || "{}"
        );

    /* Protect Profile page */

    if (!token) {

        window.location.href =
            "login.html";

    } else {

        const email =
            savedUser.email || "student@college.edu";

        const name =
            savedUser.name ||
            email.split("@")[0];

        /* Basic profile information */

        const profileName =
            document.getElementById("profileName");

        const profileEmail =
            document.getElementById("profileEmail");

        const detailName =
            document.getElementById("detailName");

        const detailEmail =
            document.getElementById("detailEmail");

        const profileAvatar =
            document.getElementById("profileAvatar");

        if (profileName) {
            profileName.textContent = name;
        }

        if (profileEmail) {
            profileEmail.textContent = email;
        }

        if (detailName) {
            detailName.textContent = name;
        }

        if (detailEmail) {
            detailEmail.textContent = email;
        }

        if (profileAvatar) {

            profileAvatar.textContent =
                name.charAt(0).toUpperCase();

        }


        /* Member since */

const memberSince =
    document.getElementById("memberSince");

if (memberSince) {

    const createdAt =
        savedUser.created_at ||
        savedUser.createdAt;

    if (createdAt) {

        const date =
            new Date(createdAt);

        memberSince.textContent =
            date.toLocaleDateString(
                "en-US",
                {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            );

    } else {

        memberSince.textContent =
            "September 2026";

    }

}


        /* Load user's reports */

        fetch(
            "http://127.0.0.1:5000/api/items",
            {
                method: "GET",

                headers: {
                    "Authorization":
                        "Bearer " + token
                }
            }
        )
        .then(function (response) {

            return response.json();

        })
        .then(function (data) {

            const items =
                data.items || [];

            const myItems =
                items.filter(function (item) {

                    return String(item.user_id) ===
                        String(savedUser.id);

                });


            const total =
                myItems.length;

            const lost =
                myItems.filter(function (item) {

                    return String(item.type)
                        .toLowerCase() === "lost";

                }).length;

            const found =
                myItems.filter(function (item) {

                    return String(item.type)
                        .toLowerCase() === "found";

                }).length;

            const recovered =
                myItems.filter(function (item) {

                    return String(item.status)
                        .toLowerCase() === "returned";

                }).length;


            const profileTotal =
                document.getElementById("profileTotal");

            const profileLost =
                document.getElementById("profileLost");

            const profileFound =
                document.getElementById("profileFound");

            const profileRecovered =
                document.getElementById(
                    "profileRecovered"
                );


            if (profileTotal) {
                profileTotal.textContent =
                    total;
            }

            if (profileLost) {
                profileLost.textContent =
                    lost;
            }

            if (profileFound) {
                profileFound.textContent =
                    found;
            }

            if (profileRecovered) {
                profileRecovered.textContent =
                    recovered;
            }

        })
        .catch(function (error) {

            console.error(
                "Profile loading error:",
                error
            );

        });

    }

}

});