// =================================================
// ADMIN LOGIN
// =================================================

const loginForm =
    document.getElementById("loginForm");

const loginButton =
    document.getElementById("loginButton");

const loginMessage =
    document.getElementById("loginMessage");


// =================================================
// LOGIN FORM SUBMIT
// =================================================

loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        // =========================
        // Get form data
        // =========================

        const username =
            document
                .getElementById("username")
                .value
                .trim();


        const password =
            document
                .getElementById("password")
                .value;


        // =========================
        // Clear old message
        // =========================

        loginMessage.textContent = "";

        loginMessage.className =
            "login-message";


        // =========================
        // Disable button
        // =========================

        loginButton.disabled = true;

        loginButton.textContent =
            "جاري تسجيل الدخول...";


        try {

            // =========================
            // Send login request
            // =========================

            const response =
                await fetch(
                    "http://localhost:3000/api/admin/login",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            username,
                            password

                        })

                    }
                );


            // =========================
            // Get response
            // =========================

            const data =
                await response.json();


            // =========================
            // Login failed
            // =========================

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "فشل تسجيل الدخول"
                );

            }


            // =========================
            // Save JWT
            // =========================

            localStorage.setItem(
                "adminToken",
                data.token
            );


            // =========================
            // Save admin data
            // =========================

            localStorage.setItem(
                "adminData",
                JSON.stringify(data.admin)
            );


            // =========================
            // Success message
            // =========================

            loginMessage.textContent =
                "تم تسجيل الدخول بنجاح";

            loginMessage.className =
                "login-message success";


            // =========================
            // Redirect
            // =========================

            setTimeout(() => {

                window.location.href =
                    "dashboard.html";

            }, 700);


        } catch (error) {

            console.error(
                "Login error:",
                error
            );


            loginMessage.textContent =
                error.message ||
                "حدث خطأ أثناء تسجيل الدخول";

            loginMessage.className =
                "login-message error";


            loginButton.disabled = false;

            loginButton.textContent =
                "تسجيل الدخول";

        }

    }
);