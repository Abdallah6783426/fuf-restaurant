const API_URL = "http://localhost:3000";


/* ================================================= */
/* ================= ESCAPE HTML =================== */
/* ================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* ================================================= */
/* ================= CART ========================== */
/* ================================================= */

let cart = JSON.parse(
    localStorage.getItem("fufCart")
) || [];


/* ================= SAVE CART ===================== */

function saveCart() {

    localStorage.setItem(
        "fufCart",
        JSON.stringify(cart)
    );

}


/* ================= ADD TO CART =================== */

function addToCart(
    menuItemId,
    name,
    price,
    image
) {

    if (!menuItemId) {

        console.error(
            "معرف المنتج غير صالح"
        );

        return;

    }


    const existingItem = cart.find(
        item =>
            item.menuItemId === menuItemId
    );


    if (existingItem) {

        existingItem.quantity++;

    } else {

        cart.push({

            menuItemId:
                menuItemId,

            name:
                name,

            price:
                Number(price),

            image:
                image,

            quantity:
                1

        });

    }


    saveCart();

    updateCart();

    showNotification(
        `${name} اتضاف للسلة 🛒`
    );

}


/* ================================================= */
/* ================= UPDATE CART =================== */
/* ================================================= */

function updateCart() {

    const cartItems =
        document.getElementById(
            "cartItems"
        );

    const cartCount =
        document.getElementById(
            "cartCount"
        );

    const cartTotal =
        document.getElementById(
            "cartTotal"
        );


    if (!cartItems) {
        return;
    }


    cartItems.innerHTML = "";


    let total = 0;

    let count = 0;


    /* ================= EMPTY CART ================= */

    if (cart.length === 0) {

        cartItems.innerHTML = `

            <div class="empty-cart">

                <div>
                    🛒
                </div>

                <p>
                    طلبك فارغ
                </p>

            </div>

        `;

    }


    /* ================= CART ITEMS ================ */

    cart.forEach(
        (product, index) => {

            const price =
                Number(product.price) || 0;

            const quantity =
                Number(product.quantity) || 1;


            total +=
                price * quantity;

            count += quantity;


            const cartItem =
                document.createElement(
                    "div"
                );

            cartItem.className =
                "cart-item";


            cartItem.innerHTML = `

                <div class="cart-item-info">

                    <h3>
                        ${escapeHTML(
                            product.name
                        )}
                    </h3>

                    <p>
                        ${price} جنيه
                    </p>

                </div>


                <div class="quantity-controls">

                    <button
                        type="button"
                        class="quantity-btn"
                        data-action="increase"
                    >
                        +
                    </button>

                    <span>
                        ${quantity}
                    </span>

                    <button
                        type="button"
                        class="quantity-btn"
                        data-action="decrease"
                    >
                        -
                    </button>

                </div>


                <button
                    type="button"
                    class="remove-item"
                >
                    ✕
                </button>

            `;


            const increaseButton =
                cartItem.querySelector(
                    '[data-action="increase"]'
                );


            const decreaseButton =
                cartItem.querySelector(
                    '[data-action="decrease"]'
                );


            const removeButton =
                cartItem.querySelector(
                    ".remove-item"
                );


            increaseButton.addEventListener(
                "click",
                function () {

                    changeQuantity(
                        index,
                        1
                    );

                }
            );


            decreaseButton.addEventListener(
                "click",
                function () {

                    changeQuantity(
                        index,
                        -1
                    );

                }
            );


            removeButton.addEventListener(
                "click",
                function () {

                    removeFromCart(
                        index
                    );

                }
            );


            cartItems.appendChild(
                cartItem
            );

        }
    );


    /* ================= COUNT ===================== */

    if (cartCount) {

        cartCount.textContent =
            count;

    }


    /* ================= TOTAL ===================== */

    if (cartTotal) {

        cartTotal.textContent =
            `${total} جنيه`;

    }

}


/* ================================================= */
/* ================= QUANTITY ====================== */
/* ================================================= */

function changeQuantity(
    index,
    amount
) {

    if (!cart[index]) {
        return;
    }


    cart[index].quantity =
        Number(
            cart[index].quantity
        ) + amount;


    if (
        cart[index].quantity <= 0
    ) {

        cart.splice(
            index,
            1
        );

    }


    saveCart();

    updateCart();

}


/* ================================================= */
/* ================= REMOVE ======================== */
/* ================================================= */

function removeFromCart(index) {

    if (!cart[index]) {
        return;
    }


    cart.splice(
        index,
        1
    );


    saveCart();

    updateCart();

}


/* ================================================= */
/* ================= OPEN CART ==================== */
/* ================================================= */

function openCart() {

    const cartPopup =
        document.getElementById(
            "cartPopup"
        );

    const cartOverlay =
        document.getElementById(
            "cartOverlay"
        );


    if (cartPopup) {

        cartPopup.classList.add(
            "open"
        );

    }


    if (cartOverlay) {

        cartOverlay.classList.add(
            "active"
        );

    }


    updateCart();

}


/* ================================================= */
/* ================= CLOSE CART =================== */
/* ================================================= */

function closeCart() {

    const cartPopup =
        document.getElementById(
            "cartPopup"
        );

    const cartOverlay =
        document.getElementById(
            "cartOverlay"
        );


    if (cartPopup) {

        cartPopup.classList.remove(
            "open"
        );

    }


    if (cartOverlay) {

        cartOverlay.classList.remove(
            "active"
        );

    }

}


/* ================================================= */
/* ================= NOTIFICATION ================== */
/* ================================================= */

function showNotification(
    message = "تمت الإضافة للسلة"
) {

    const notification =
        document.getElementById(
            "notification"
        );


    if (!notification) {
        return;
    }


    notification.textContent =
        message;


    notification.classList.add(
        "show"
    );


    setTimeout(
        function () {

            notification.classList.remove(
                "show"
            );

        },
        2000
    );

}


/* ================================================= */
/* ================= LOAD MENU ===================== */
/* ================================================= */

async function loadMenu() {

    const productsGrid =
        document.getElementById(
            "productsGrid"
        );


    if (!productsGrid) {
        return;
    }


    try {

        productsGrid.innerHTML = `

            <div class="loading-menu">

                <p>
                    جاري تحميل قائمة الطعام...
                </p>

            </div>

        `;


        const response =
            await fetch(
                `${API_URL}/api/menu`
            );


        if (!response.ok) {

            throw new Error(
                `HTTP Error: ${response.status}`
            );

        }


        const menuItems =
            await response.json();


        console.log(
            "Menu loaded:",
            menuItems
        );


        /* ================= EMPTY MENU ============= */

        if (
            !Array.isArray(menuItems) ||
            menuItems.length === 0
        ) {

            productsGrid.innerHTML = `

                <div class="empty-menu">

                    <h3>
                        لا توجد أطباق حالياً
                    </h3>

                    <p>
                        سيتم إضافة الأطباق قريباً.
                    </p>

                </div>

            `;

            return;

        }


        productsGrid.innerHTML = "";


        /* ================= CREATE CARDS =========== */

        menuItems.forEach(
            function (item) {

                const card =
                    document.createElement(
                        "div"
                    );

                card.className =
                    "product-card";


                card.dataset.name =
                    item.name || "";

                card.dataset.description =
                    item.description || "";

                card.dataset.category =
                    item.category || "";


                /* ================= IMAGE =========== */

                const imageContainer =
                    document.createElement(
                        "div"
                    );

                imageContainer.className =
                    "product-image";


                const image =
                    document.createElement(
                        "img"
                    );

                image.src =
                    item.image || "";

                image.alt =
                    item.name || "Dish";


                image.onerror =
                    function () {

                        this.style.display =
                            "none";

                    };


                const badge =
                    document.createElement(
                        "span"
                    );

                badge.className =
                    "product-badge";

                badge.textContent =
                    item.category || "";


                imageContainer.appendChild(
                    image
                );

                imageContainer.appendChild(
                    badge
                );


                /* ================= INFO ============ */

                const info =
                    document.createElement(
                        "div"
                    );

                info.className =
                    "product-info";


                const title =
                    document.createElement(
                        "h3"
                    );

                title.textContent =
                    item.name || "";


                const description =
                    document.createElement(
                        "p"
                    );

                description.textContent =
                    item.description || "";


                /* ================= BOTTOM ========== */

                const bottom =
                    document.createElement(
                        "div"
                    );

                bottom.className =
                    "product-bottom";


                const price =
                    document.createElement(
                        "span"
                    );

                price.className =
                    "price";

                price.textContent =
                    `${item.price} جنيه`;


                const addButton =
                    document.createElement(
                        "button"
                    );

                addButton.type =
                    "button";

                addButton.className =
                    "add-cart";

                addButton.textContent =
                    "أضف للطلب";


                addButton.addEventListener(
                    "click",
                    function () {

                        addToCart(
                            item._id,
                            item.name,
                            Number(item.price),
                            item.image
                        );

                    }
                );


                bottom.appendChild(
                    price
                );

                bottom.appendChild(
                    addButton
                );


                info.appendChild(
                    title
                );

                info.appendChild(
                    description
                );

                info.appendChild(
                    bottom
                );


                card.appendChild(
                    imageContainer
                );

                card.appendChild(
                    info
                );


                productsGrid.appendChild(
                    card
                );

            }
        );


    } catch (error) {

        console.error(
            "Menu loading error:",
            error
        );


        productsGrid.innerHTML = `

            <div class="empty-menu">

                <h3>
                    حدث خطأ أثناء تحميل القائمة
                </h3>

                <p>
                    ${escapeHTML(
                        error.message
                    )}
                </p>

                <button
                    type="button"
                    onclick="loadMenu()"
                >
                    إعادة المحاولة
                </button>

            </div>

        `;

    }

}


/* ================================================= */
/* ================= SEARCH ======================== */
/* ================================================= */

function searchProducts() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    if (!searchInput) {
        return;
    }


    const search =
        searchInput.value
            .toLowerCase()
            .trim();


    const products =
        document.querySelectorAll(
            ".product-card"
        );


    products.forEach(
        function (product) {

            const name =
                (
                    product.dataset.name ||
                    ""
                ).toLowerCase();


            const description =
                (
                    product.dataset.description ||
                    ""
                ).toLowerCase();


            const category =
                (
                    product.dataset.category ||
                    ""
                ).toLowerCase();


            const found =
                name.includes(search) ||
                description.includes(search) ||
                category.includes(search);


            product.style.display =
                found
                    ? ""
                    : "none";

        }
    );

}


/* ================================================= */
/* ================= SLIDER ======================== */
/* ================================================= */

let currentSlide = 0;

let slides = [];

let dots = [];


function refreshSliderElements() {

    slides =
        document.querySelectorAll(
            ".slide"
        );


    dots =
        document.querySelectorAll(
            ".dot"
        );

}


/* ================= SHOW SLIDE =================== */

function showSlide(index) {

    refreshSliderElements();


    if (
        slides.length === 0
    ) {
        return;
    }


    if (
        index >= slides.length
    ) {

        currentSlide = 0;

    } else if (
        index < 0
    ) {

        currentSlide =
            slides.length - 1;

    } else {

        currentSlide =
            index;

    }


    slides.forEach(
        function (slide) {

            slide.classList.remove(
                "active"
            );

        }
    );


    dots.forEach(
        function (dot) {

            dot.classList.remove(
                "active"
            );

        }
    );


    slides[currentSlide]
        .classList.add(
            "active"
        );


    if (dots[currentSlide]) {

        dots[currentSlide]
            .classList.add(
                "active"
            );

    }

}


/* ================= CHANGE SLIDE ================ */

function changeSlide(direction) {

    showSlide(
        currentSlide + direction
    );

}


/* ================= GO TO SLIDE ================= */

function goToSlide(index) {

    showSlide(index);

}


/* ================= AUTO SLIDER ================== */

setInterval(
    function () {

        changeSlide(1);

    },
    5000
);


/* ================================================= */
/* ================= CHECKOUT ====================== */
/* ================================================= */

function checkout() {

    if (
        cart.length === 0
    ) {

        alert(
            "الطلب فارغ"
        );

        return;

    }


    const oldModal =
        document.getElementById(
            "checkoutModal"
        );


    if (oldModal) {
        oldModal.remove();
    }


    const checkoutHTML = `

        <div
            id="checkoutModal"
            class="checkout-modal"
        >

            <div class="checkout-box">

                <button
                    type="button"
                    class="checkout-close"
                    id="checkoutCloseButton"
                >
                    ✕
                </button>


                <h2>
                    تأكيد الطلب
                </h2>


                <p class="checkout-subtitle">
                    من فضلك أدخل بيانات التوصيل
                </p>


                <form id="checkoutForm">

                    <div class="form-group">

                        <label for="customerName">
                            الاسم
                        </label>

                        <input
                            type="text"
                            id="customerName"
                            placeholder="اكتب اسمك"
                            autocomplete="name"
                            required
                        >

                    </div>


                    <div class="form-group">

                        <label for="customerPhone">
                            رقم الهاتف
                        </label>

                        <input
                            type="tel"
                            id="customerPhone"
                            placeholder="01xxxxxxxxx"
                            autocomplete="tel"
                            required
                        >

                    </div>


                    <div class="form-group">

                        <label for="customerAddress">
                            العنوان
                        </label>

                        <textarea
                            id="customerAddress"
                            placeholder="اكتب عنوان التوصيل بالتفصيل"
                            required
                        ></textarea>

                    </div>


                    <div class="checkout-total">

                        <span>
                            إجمالي الطلب
                        </span>

                        <strong>
                            ${calculateCartTotal()} جنيه
                        </strong>

                    </div>


                    <button
                        type="submit"
                        class="confirm-order-btn"
                    >
                        تأكيد الطلب
                    </button>

                </form>

            </div>

        </div>

    `;


    document.body.insertAdjacentHTML(
        "beforeend",
        checkoutHTML
    );


    const closeButton =
        document.getElementById(
            "checkoutCloseButton"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeCheckout
        );

    }


    const form =
        document.getElementById(
            "checkoutForm"
        );


    if (form) {

        form.addEventListener(
            "submit",
            submitOrder
        );

    }

}


/* ================================================= */
/* ================= CALCULATE TOTAL ============== */
/* ================================================= */

function calculateCartTotal() {

    return cart.reduce(
        function (
            total,
            item
        ) {

            const price =
                Number(item.price) || 0;

            const quantity =
                Number(item.quantity) || 0;


            return total +
                (
                    price *
                    quantity
                );

        },
        0
    );

}


/* ================================================= */
/* ================= SUBMIT ORDER ================== */
/* ================================================= */

async function submitOrder(event) {

    event.preventDefault();


    const nameInput =
        document.getElementById(
            "customerName"
        );

    const phoneInput =
        document.getElementById(
            "customerPhone"
        );

    const addressInput =
        document.getElementById(
            "customerAddress"
        );


    if (
        !nameInput ||
        !phoneInput ||
        !addressInput
    ) {

        alert(
            "بيانات الطلب غير مكتملة"
        );

        return;

    }


    const customerName =
        nameInput.value.trim();


    const phone =
        phoneInput.value.trim();


    const address =
        addressInput.value.trim();


    if (
        !customerName ||
        !phone ||
        !address
    ) {

        alert(
            "من فضلك املأ جميع البيانات"
        );

        return;

    }


    if (
        cart.length === 0
    ) {

        alert(
            "الطلب فارغ"
        );

        closeCheckout();

        return;

    }


    const orderItems =
        cart.map(
            function (item) {

                return {

                    menuItemId:
                        item.menuItemId,

                    quantity:
                        Number(
                            item.quantity
                        )

                };

            }
        );


    const invalidItem =
        orderItems.some(
            function (item) {

                return (
                    !item.menuItemId ||
                    !Number.isInteger(
                        item.quantity
                    ) ||
                    item.quantity < 1
                );

            }
        );


    if (invalidItem) {

        alert(
            "يوجد خطأ في محتويات الطلب"
        );

        return;

    }


    const confirmButton =
        document.querySelector(
            ".confirm-order-btn"
        );


    if (confirmButton) {

        confirmButton.disabled =
            true;

        confirmButton.textContent =
            "جاري إرسال الطلب...";

    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/orders`,
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            customerName,

                            phone,

                            address,

                            items:
                                orderItems

                        })

                }
            );


        let data = null;


        try {

            data =
                await response.json();

        } catch {

            data = null;

        }


        if (
            !response.ok
        ) {

            throw new Error(

                data?.message ||
                `فشل إرسال الطلب (${response.status})`

            );

        }


        /* ================= SUCCESS ================= */

        cart = [];


        saveCart();

        updateCart();


        closeCheckout();


        alert(
            `تم تأكيد طلبك بنجاح 🎉

رقم الطلب:
${data._id}

الإجمالي:
${data.total} جنيه`
        );


    } catch (error) {

        console.error(
            "Order error:",
            error
        );


        alert(
            `حدث خطأ أثناء إرسال الطلب.

${error.message}`
        );


        if (confirmButton) {

            confirmButton.disabled =
                false;

            confirmButton.textContent =
                "تأكيد الطلب";

        }

    }

}


/* ================================================= */
/* ================= CLOSE CHECKOUT =============== */
/* ================================================= */

function closeCheckout() {

    const modal =
        document.getElementById(
            "checkoutModal"
        );


    if (modal) {

        modal.remove();

    }

}


/* ================================================= */
/* ================= START ========================= */
/* ================================================= */



document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateCart();

        loadMenu();

        showSlide(0);

    }
);