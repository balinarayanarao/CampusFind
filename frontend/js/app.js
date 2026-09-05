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