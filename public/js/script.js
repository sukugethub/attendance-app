document.addEventListener("DOMContentLoaded", function () {
    // Function to handle role selection and redirect
    function redirectTo(role) {
        let url = "";
        switch (role) {
            case "student":
                url = "pages/student-login.html";
                break;
            case "teacher":
                url = "pages/teacher-login.html";
                break;
            case "admin":
                url = "pages/admin-login.html";
                break;
            default:
                alert("Invalid Role");
                return;
        }
        window.location.href = url; // Redirect to respective login page
    }

    // Attach event listeners to buttons
    document.getElementById("student-btn").addEventListener("click", function () {
        redirectTo("student");
    });

    document.getElementById("teacher-btn").addEventListener("click", function () {
        redirectTo("teacher");
    });

    document.getElementById("admin-btn").addEventListener("click", function () {
        redirectTo("admin");
    });
});













