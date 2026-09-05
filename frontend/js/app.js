/* =========================================================
   CAMPUSFIND - FRONTEND JAVASCRIPT
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       DESCRIPTION CHARACTER COUNTER
       ===================================================== */

    const description = document.getElementById("description");
    const characterCount = document.getElementById("characterCount");

    if (description && characterCount) {

        description.addEventListener("input", function () {

            characterCount.textContent =
                `${description.value.length} / 300`;

        });

    }


    /* =====================================================
       IMAGE UPLOAD
       ===================================================== */

    const imageInput = document.getElementById("itemImage");

    if (imageInput) {

        imageInput.addEventListener("change", function () {

            const uploadBox =
                document.querySelector(".upload-box");

            if (imageInput.files.length > 0) {

                const file = imageInput.files[0];

                uploadBox.querySelector(".upload-icon")
                    .textContent = "✅";

                uploadBox.querySelector("strong")
                    .textContent = file.name;

                uploadBox.querySelector("small")
                    .textContent = "Image selected successfully";

            }

        });

    }


    /* =====================================================
       REPORT FORM
       ===================================================== */

    const reportForm = document.getElementById("reportForm");

    if (reportForm) {

        reportForm.addEventListener("submit", function (event) {

            event.preventDefault();


            const itemName =
                document.getElementById("itemName").value.trim();

            const category =
                document.getElementById("category").value;

            const location =
                document.getElementById("location").value.trim();

            const date =
                document.getElementById("date").value;

            const descriptionValue =
                document.getElementById("description").value.trim();


            /* ---------------------------------------------
               BASIC VALIDATION
               --------------------------------------------- */

            if (!itemName || !category || !location || !date) {

                alert(
                    "Please fill in all required fields."
                );

                return;

            }


            /* ---------------------------------------------
               GET STATUS
               --------------------------------------------- */

            const selectedStatus =
                document.querySelector(
                    'input[name="status"]:checked'
                );

            const status =
                selectedStatus
                    ? selectedStatus.value
                    : "lost";


            /* ---------------------------------------------
               TEMPORARY FRONTEND OBJECT
               --------------------------------------------- */

            const report = {

                id: Date.now(),

                status: status,

                itemName: itemName,

                category: category,

                location: location,

                date: date,

                description: descriptionValue

            };


            /* ---------------------------------------------
               SAVE TEMPORARILY IN BROWSER
               --------------------------------------------- */

            let reports =
                JSON.parse(
                    localStorage.getItem("campusFindReports")
                ) || [];

            reports.push(report);

            localStorage.setItem(
                "campusFindReports",
                JSON.stringify(reports)
            );


            /* ---------------------------------------------
               SUCCESS MESSAGE
               --------------------------------------------- */

            alert(
                "🎉 Your item report has been submitted successfully!"
            );


            /* ---------------------------------------------
               CLEAR FORM
               --------------------------------------------- */

            reportForm.reset();


            if (characterCount) {

                characterCount.textContent =
                    "0 / 300";

            }


            if (imageInput) {

                const uploadBox =
                    document.querySelector(".upload-box");

                uploadBox.querySelector(".upload-icon")
                    .textContent = "📷";

                uploadBox.querySelector("strong")
                    .textContent =
                    "Click to upload an image";

                uploadBox.querySelector("small")
                    .textContent =
                    "JPG, PNG or JPEG";

            }

        });

    }


    /* =====================================================
       NAVIGATION ACTIVE LINK
       ===================================================== */

    const currentPage =
        window.location.pathname
            .split("/")
            .pop();

    const navLinks =
        document.querySelectorAll(".nav-links a");

    navLinks.forEach(function (link) {

        const linkPage =
            link.getAttribute("href");

        if (linkPage === currentPage) {

            link.classList.add("active");

        }

    });

});
/* =====================================================
   ITEMS PAGE - SEARCH
   ===================================================== */

function searchItems() {

    const searchInput =
        document.getElementById("searchInput");

    if (!searchInput) return;

    const searchText =
        searchInput.value.toLowerCase().trim();

    const items =
        document.querySelectorAll(".item-card");

    let visibleCount = 0;

    items.forEach(function (item) {

        const itemText =
            item.dataset.search.toLowerCase();

        if (itemText.includes(searchText)) {

            item.style.display = "";

            visibleCount++;

        } else {

            item.style.display = "none";

        }

    });

    const noResults =
        document.getElementById("noResults");

    if (noResults) {

        noResults.style.display =
            visibleCount === 0
                ? "block"
                : "none";

    }

}


/* =====================================================
   ITEMS PAGE - FILTER
   ===================================================== */

function filterItems(status, button) {

    const items =
        document.querySelectorAll(".item-card");

    let visibleCount = 0;

    items.forEach(function (item) {

        const itemStatus =
            item.dataset.status;

        if (
            status === "all" ||
            itemStatus === status
        ) {

            item.style.display = "";

            visibleCount++;

        } else {

            item.style.display = "none";

        }

    });


    /* Update active filter */

    document
        .querySelectorAll(".filter-btn")
        .forEach(function (btn) {

            btn.classList.remove("active-filter");

        });

    button.classList.add("active-filter");


    /* No results */

    const noResults =
        document.getElementById("noResults");

    if (noResults) {

        noResults.style.display =
            visibleCount === 0
                ? "block"
                : "none";

    }

}
/* =====================================================
   DASHBOARD
   ===================================================== */

function loadDashboard() {

    const totalReports =
        document.getElementById("totalReports");

    if (!totalReports) return;

    const reports =
        JSON.parse(
            localStorage.getItem("campusFindReports")
        ) || [];

    const lostReports =
        reports.filter(
            report => report.status === "lost"
        );

    const foundReports =
        reports.filter(
            report => report.status === "found"
        );

    document.getElementById("totalReports").textContent =
        reports.length;

    document.getElementById("lostReports").textContent =
        lostReports.length;

    document.getElementById("foundReports").textContent =
        foundReports.length;


    const recentReports =
        document.getElementById("recentReports");

    if (!recentReports || reports.length === 0) return;


    recentReports.innerHTML = "";


    reports
        .slice(-5)
        .reverse()
        .forEach(function (report) {

            const card =
                document.createElement("div");

            card.className = "recent-report-card";

            card.innerHTML = `

                <div class="recent-report-icon">
                    ${report.status === "lost" ? "🔴" : "🟢"}
                </div>

                <div class="recent-report-info">

                    <h3>${report.itemName}</h3>

                    <p>
                        ${report.category} • ${report.location}
                    </p>

                </div>

                <span class="recent-status">
                    ${report.status.toUpperCase()}
                </span>

            `;

            recentReports.appendChild(card);

        });

}


/* Load dashboard */

loadDashboard();