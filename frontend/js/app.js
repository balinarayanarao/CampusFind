document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       1. BROWSE ITEMS - SEARCH & FILTER
       ===================================================== */

    const searchInput = document.getElementById("searchInput");
    const categoryFilter = document.getElementById("categoryFilter");
    const statusFilter = document.getElementById("statusFilter");
    const itemsGrid = document.getElementById("itemsGrid");
    const noResults = document.getElementById("noResults");

    if (searchInput && categoryFilter && statusFilter && itemsGrid) {

        const items = itemsGrid.querySelectorAll(".item-card");

        function filterItems() {

            const searchValue =
                searchInput.value.toLowerCase().trim();

            const categoryValue =
                categoryFilter.value;

            const statusValue =
                statusFilter.value;

            let visibleCount = 0;

            items.forEach(function (item) {

                const itemText =
                    item.textContent.toLowerCase();

                const itemCategory =
                    item.dataset.category || "all";

                const itemStatus =
                    item.dataset.status || "all";

                const matchesSearch =
                    itemText.includes(searchValue);

                const matchesCategory =
                    categoryValue === "all" ||
                    itemCategory === categoryValue;

                const matchesStatus =
                    statusValue === "all" ||
                    itemStatus === statusValue;

                if (
                    matchesSearch &&
                    matchesCategory &&
                    matchesStatus
                ) {
                    item.style.display = "";
                    visibleCount++;
                } else {
                    item.style.display = "none";
                }

            });

            if (noResults) {
                noResults.style.display =
                    visibleCount === 0 ? "block" : "none";
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
    }


    /* =====================================================
       2. LOGIN FORM
       ===================================================== */

    const loginForm =
        document.getElementById("loginForm");

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                const email =
                    document.getElementById("email").value.trim();

                const password =
                    document.getElementById("password").value.trim();

                if (!email || !password) {
                    alert(
                        "Please enter your email and password."
                    );
                    return;
                }

                alert("Login successful!");

                window.location.href =
                    "dashboard.html";
            }
        );
    }


    /* =====================================================
       3. REGISTER FORM
       ===================================================== */

    const registerForm =
        document.getElementById("registerForm");

    if (registerForm) {

        registerForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                const name =
                    document.getElementById("name")?.value.trim();

                const email =
                    document.getElementById("email")?.value.trim();

                const password =
                    document.getElementById("password")?.value.trim();

                const confirmPassword =
                    document.getElementById("confirmPassword")?.value.trim();


                if (!name || !email || !password) {

                    alert(
                        "Please fill in all required fields."
                    );

                    return;
                }


                if (
                    confirmPassword &&
                    password !== confirmPassword
                ) {

                    alert(
                        "Passwords do not match."
                    );

                    return;
                }


                alert(
                    "Account created successfully!"
                );

                window.location.href =
                    "login.html";

            }
        );
    }


    /* =====================================================
       4. REPORT ITEM FORM
       ===================================================== */

    const reportForm =
        document.getElementById("reportForm");

    if (reportForm) {

        reportForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                const itemName =
                    document.getElementById("itemName")?.value.trim();

                const description =
                    document.getElementById("description")?.value.trim();


                if (!itemName) {

                    alert(
                        "Please enter the item name."
                    );

                    return;
                }


                if (!description) {

                    alert(
                        "Please enter a description."
                    );

                    return;
                }


                alert(
                    "Your item report has been submitted successfully!"
                );

                reportForm.reset();

            }
        );
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

});