const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const Admin = require("./models/Admin");

async function resetAdmin() {

    try {

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected!");

        // =========================
        // البيانات الجديدة
        // =========================

        const newUsername = "admin";

        const newPassword = "Admin123456";


        // =========================
        // تشفير الباسورد
        // =========================

        const hashedPassword =
            await bcrypt.hash(newPassword, 10);


        // =========================
        // تحديث حساب الأدمن
        // =========================

        const admin =
            await Admin.findOneAndUpdate(

                {},

                {
                    username: newUsername,
                    password: hashedPassword
                },

                {
                    new: true
                }

            );


        // =========================
        // لو مفيش Admin
        // =========================

        if (!admin) {

            console.log("No admin account found.");

            process.exit();

        }


        console.log(
            "Admin account reset successfully!"
        );

        console.log(
            "Username:",
            newUsername
        );

        console.log(
            "Password:",
            newPassword
        );


        process.exit();

    } catch (error) {

        console.error(
            "Failed to reset admin:",
            error.message
        );

        process.exit(1);

    }

}

resetAdmin();