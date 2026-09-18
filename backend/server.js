const express = require("express");
const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const MenuItem = require("./models/MenuItem");
const Order = require("./models/Order");
const Admin = require("./models/Admin");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const authMiddleware = require("./middleware/authMiddleware");

const app = express();

const PORT = process.env.PORT || 3000;

// =================================================
// MIDDLEWARE
// =================================================

app.use(cors());

app.use(express.json());


// =================================================
// CONNECT TO MONGODB
// =================================================

mongoose.connect(process.env.MONGO_URI)
    .then(() => {

        console.log("MongoDB connected successfully!");

        app.listen(PORT, () => {

            console.log(
                `Server is running on http://localhost:${PORT}`
            );

        });

    })
    .catch((error) => {

        console.error(
            "MongoDB connection failed:",
            error.message
        );

    });


// =================================================
// ADMIN LOGIN
// =================================================

app.post("/api/admin/login", async (req, res) => {

    try {

        const {
            username,
            password
        } = req.body;


        if (!username || !password) {

            return res.status(400).json({

                message:
                    "Username and password are required"

            });

        }


        const admin = await Admin.findOne({
            username: username.trim()
        });


        if (!admin) {

            return res.status(401).json({

                message:
                    "Invalid username or password"

            });

        }


        const isPasswordCorrect =
            await bcrypt.compare(
                password,
                admin.password
            );


        if (!isPasswordCorrect) {

            return res.status(401).json({

                message:
                    "Invalid username or password"

            });

        }


        const token = jwt.sign(

            {
                adminId: admin._id,
                username: admin.username
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "1d"
            }

        );


        res.json({

            message: "Login successful",

            token,

            admin: {

                id: admin._id,

                username: admin.username

            }

        });


    } catch (error) {

        console.error(
            "Admin login error:",
            error
        );

        res.status(500).json({

            message:
                "Server error during login"

        });

    }

});


// =================================================
// GET MENU
// =================================================

app.get("/api/menu", async (req, res) => {

    try {

        const menuItems =
            await MenuItem.find();

        res.json(menuItems);

    } catch (error) {

        console.error(
            "Get menu error:",
            error
        );

        res.status(500).json({

            message:
                "Failed to fetch menu items",

            error:
                error.message

        });

    }

});


// =================================================
// ADD MENU ITEM - PROTECTED
// =================================================

app.post(
    "/api/menu",
    authMiddleware,
    async (req, res) => {

    try {

        const {
            name,
            description,
            price,
            image,
            category
        } = req.body;


        if (
            !name ||
            !description ||
            !price ||
            !image ||
            !category
        ) {

            return res.status(400).json({

                message:
                    "All menu item fields are required"

            });

        }


        const newMenuItem =
            new MenuItem({

                name,
                description,
                price,
                image,
                category

            });


        const savedMenuItem =
            await newMenuItem.save();


        res.status(201).json(
            savedMenuItem
        );


    } catch (error) {

        console.error(
            "Create menu item error:",
            error
        );

        res.status(500).json({

            message:
                "Failed to create menu item",

            error:
                error.message

        });

    }

});


// =================================================
// UPDATE MENU ITEM - PROTECTED
// =================================================

app.put(
    "/api/menu/:id",
    authMiddleware,
    async (req, res) => {

    try {

        const { id } = req.params;

        const {
            name,
            description,
            price,
            image,
            category
        } = req.body;


        if (
            !name ||
            !description ||
            !price ||
            !image ||
            !category
        ) {

            return res.status(400).json({

                message:
                    "All menu item fields are required"

            });

        }


        const updatedMenuItem =
            await MenuItem.findByIdAndUpdate(

                id,

                {
                    name,
                    description,
                    price,
                    image,
                    category
                },

                {
                    new: true,
                    runValidators: true
                }

            );


        if (!updatedMenuItem) {

            return res.status(404).json({

                message:
                    "Menu item not found"

            });

        }


        res.json(updatedMenuItem);


    } catch (error) {

        console.error(
            "Update menu item error:",
            error
        );

        res.status(500).json({

            message:
                "Failed to update menu item",

            error:
                error.message

        });

    }

});


// =================================================
// DELETE MENU ITEM - PROTECTED
// =================================================

app.delete(
    "/api/menu/:id",
    authMiddleware,
    async (req, res) => {

    try {

        const { id } = req.params;


        const deletedMenuItem =
            await MenuItem.findByIdAndDelete(id);


        if (!deletedMenuItem) {

            return res.status(404).json({

                message:
                    "Menu item not found"

            });

        }


        res.json({

            message:
                "Menu item deleted successfully",

            deletedItem:
                deletedMenuItem

        });


    } catch (error) {

        console.error(
            "Delete menu item error:",
            error
        );

        res.status(500).json({

            message:
                "Failed to delete menu item",

            error:
                error.message

        });

    }

});


// =================================================
// CREATE ORDER
// =================================================

app.post("/api/orders", async (req, res) => {

    try {

        const {
            customerName,
            phone,
            address,
            items
        } = req.body;


        if (
            !customerName ||
            !phone ||
            !address ||
            !Array.isArray(items) ||
            items.length === 0
        ) {

            return res.status(400).json({

                message:
                    "Missing required order data"

            });

        }
        const invalidQuantity = items.some(item => {
            return !Number.isInteger(item.quantity) || item.quantity < 1;
        });

        if (invalidQuantity) {
            return res.status(400).json({
                message: "Each item quantity must be a positive integer"
            });
        }




        const menuItemIds =
            items.map(
                item => item.menuItemId
            );


        const menuItems =
            await MenuItem.find({

                _id: {
                    $in: menuItemIds
                }

            });


        if (
            menuItems.length !== items.length
        ) {

            return res.status(400).json({

                message:
                    "One or more menu items were not found"

            });

        }


        const orderItems =
            items.map(item => {

                const menuItem =
                    menuItems.find(
                        menu =>
                            menu._id.toString() ===
                            item.menuItemId
                    );


                return {

                    menuItemId:
                        menuItem._id,

                    name:
                        menuItem.name,

                    price:
                        menuItem.price,

                    quantity:
                        item.quantity

                };

            });


        const total =
            orderItems.reduce(

                (sum, item) => {

                    return sum +
                        (
                            item.price *
                            item.quantity
                        );

                },

                0

            );


        const newOrder =
            new Order({

                customerName,

                phone,

                address,

                items:
                    orderItems,

                total

            });


        const savedOrder =
            await newOrder.save();


        res.status(201).json(
            savedOrder
        );


    } catch (error) {

        console.error(
            "Create order error:",
            error
        );

        res.status(500).json({

            message:
                "Failed to create order",

            error:
                error.message

        });

    }

});


// =================================================
// GET ALL ORDERS - PROTECTED
// =================================================

app.get(
    "/api/orders",
    authMiddleware,
    async (req, res) => {

    try {

        const orders =
            await Order.find()
                .sort({
                    createdAt: -1
                });


        res.json(orders);


    } catch (error) {

        console.error(
            "Get orders error:",
            error
        );

        res.status(500).json({

            message:
                "Failed to fetch orders",

            error:
                error.message

        });

    }

});


// =================================================
// GET SINGLE ORDER - PROTECTED
// =================================================

app.get(
    "/api/orders/:id",
    authMiddleware,
    async (req, res) => {

    try {

        const { id } = req.params;


        const order =
            await Order.findById(id);


        // =========================
        // Order not found
        // =========================

        if (!order) {

            return res.status(404).json({

                message:
                    "Order not found"

            });

        }


        // =========================
        // Response
        // =========================

        res.json(order);


    } catch (error) {

        console.error(
            "Get single order error:",
            error
        );


        // =========================
        // Invalid MongoDB ID
        // =========================

        if (error.name === "CastError") {

            return res.status(400).json({

                message:
                    "Invalid order ID"

            });

        }


        res.status(500).json({

            message:
                "Failed to fetch order",

            error:
                error.message

        });

    }

});


// =================================================
// UPDATE ORDER STATUS - PROTECTED
// =================================================

app.patch(
    "/api/orders/:id/status",
    authMiddleware,
    async (req, res) => {

    try {

        const { id } = req.params;

        const { status } = req.body;


        // =========================
        // Allowed statuses
        // =========================

        const allowedStatuses = [

            "pending",

            "confirmed",

            "preparing",

            "out_for_delivery",

            "delivered",

            "cancelled"

        ];


        // =========================
        // Check status
        // =========================

        if (
            !status ||
            !allowedStatuses.includes(status)
        ) {

            return res.status(400).json({

                message:
                    "Invalid order status",

                allowedStatuses

            });

        }


        // =========================
        // Update order
        // =========================

        const updatedOrder =
            await Order.findByIdAndUpdate(

                id,

                {
                    status
                },

                {
                    new: true,
                    runValidators: true
                }

            );


        // =========================
        // Order not found
        // =========================

        if (!updatedOrder) {

            return res.status(404).json({

                message:
                    "Order not found"

            });

        }


        // =========================
        // Response
        // =========================

        res.json({

            message:
                "Order status updated successfully",

            order:
                updatedOrder

        });


    } catch (error) {

        console.error(
            "Update order status error:",
            error
        );


        if (error.name === "CastError") {

            return res.status(400).json({

                message:
                    "Invalid order ID"

            });

        }


        res.status(500).json({

            message:
                "Failed to update order status",

            error:
                error.message

        });

    }

});
