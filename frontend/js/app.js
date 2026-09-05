document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       CAMPUSFIND - MAIN JAVASCRIPT
       ===================================================== */


    /* =====================================================
       1. BROWSE ITEMS - SEARCH & FILTER
       ===================================================== */

    const searchInput = document.getElementById("searchInput");
    const categoryFilter = document.getElementById("categoryFilter");
    const statusFilter = document.getElementById("statusFilter");
    const itemsGrid = document.getElementById("itemsGrid");
    const noResults = document.getElementById("noResults");


    // Run only when the Browse Items page is present
    if (
        searchInput &&
        categoryFilter &&
        statusFilter &&
        itemsGrid
    ) {

        const items =
            itemsGrid.querySelectorAll(".item-card");


        function filterItems() {

            const searchValue =
                searchInput.value
                    .toLowerCase()
                    .trim();

            const categoryValue =
                categoryFilter.value;

            const statusValue =
                statusFilter.value;

            let visibleCount = 0;


            items.forEach(function (item) {

                const itemText =
                    item.textContent.toLowerCase();

                const itemCategory =
                    item.dataset.category;

                const itemStatus =
                    item.dataset.status;


                // Search match
                const matchesSearch =
                    itemText.includes(searchValue);


                // Category match
                const matchesCategory =
                    categoryValue === "all" ||
                    itemCategory === categoryValue;


                // Status match
                const matchesStatus =
                    statusValue === "all" ||
                    itemStatus === statusValue;


                // Show / hide item
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


            // Show "No items found"
            if (noResults) {

                if (visibleCount === 0) {

                    noResults.style.display = "block";

                } else {

                    noResults.style.display = "none";

                }

            }

        }


        // Search while typing
        searchInput.addEventListener(
            "input",
            filterItems
        );


        // Category filter
        categoryFilter.addEventListener(
            "change",
            filterItems
        );


        // Lost / Found filter
        statusFilter.addEventListener(
            "change",
            filterItems
        );

    }



    /* =====================================================
       2. REPORT FORM
       ===================================================== */

    const reportForm =
        document.querySelector(
            'form[action="#"]'
        );


    if (reportForm) {

        reportForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const itemName =
                    document.getElementById(
                        "item-name"
                    );


                if (
                    itemName &&
                    itemName.value.trim() === ""
                ) {

                    alert(
                        "Please enter the item name."
                    );

                    itemName.focus();

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
       3. MOBILE NAVIGATION
       ===================================================== */

    const navbar =
        document.querySelector(".navbar");

    const navLinks =
        document.querySelector(".nav-links");


    if (navbar && navLinks) {

        // Create mobile menu button
        const menuButton =
            document.createElement("button");

        menuButton.className =
            "mobile-menu-btn";

        menuButton.innerHTML = "☰";

        menuButton.setAttribute(
            "aria-label",
            "Open navigation menu"
        );


        navbar.appendChild(menuButton);


        menuButton.addEventListener(
            "click",
            function () {

                navLinks.classList.toggle(
                    "mobile-open"
                );

            }
        );


        // Close menu after clicking a link
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
       4. SET CURRENT YEAR
       ===================================================== */

    const copyright =
        document.querySelector(
            ".copyright"
        );


    if (copyright) {

        copyright.textContent =
            "© " +
            new Date().getFullYear() +
            " CampusFind. All rights reserved.";

    }



    /* =====================================================
       5. ACTIVE NAVIGATION LINK
       ===================================================== */

    const currentPage =
        window.location.pathname
            .split("/")
            .pop();


    const navigationLinks =
        document.querySelectorAll(
            ".nav-links a"
        );


    navigationLinks.forEach(function (link) {

        const linkPage =
            link
                .getAttribute("href")
                ?.split("/")
                .pop();


        if (
            linkPage === currentPage
        ) {

            link.classList.add("active");

        }

    });

});