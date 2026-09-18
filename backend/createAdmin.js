const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const Admin = require("./models/Admin");

async function createAdmin() {
    try {

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected!");

        const username = "admin";
        const password = "Admin123456";

        const existingAdmin = await Admin.findOne({
            username
        });

        if (existingAdmin) {

            console.log("Admin already exists!");

            process.exit();

        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = new Admin({
            username,
            password: hashedPassword
        });

        await admin.save();

        console.log("Admin created successfully!");

        console.log("Username:", username);
        console.log("Password:", password);

        process.exit();

    } catch (error) {

        console.error(
            "Failed to create admin:",
            error.message
        );

        process.exit(1);

    }
}

createAdmin();