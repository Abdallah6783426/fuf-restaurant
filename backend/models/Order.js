const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: true,
        trim: true
    },

    phone: {
        type: String,
        required: true,
        trim: true
    },

    address: {
        type: String,
        required: true,
        trim: true
    },

    items: [
        {
            menuItemId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "MenuItem",
                required: true
            },

            name: {
                type: String,
                required: true
            },

            price: {
                type: Number,
                required: true
            },

            quantity: {
                type: Number,
                required: true,
                min: 1
            }
        }
    ],

    total: {
        type: Number,
        required: true,
        min: 0
    },

    status: {
        type: String,
        enum: [
            "pending",
            "confirmed",
            "preparing",
            "out_for_delivery",
            "delivered",
            "cancelled"
        ],
        default: "pending"
    }

}, {
    timestamps: true
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;