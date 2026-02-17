const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/User");

const createAdmin = async () => {
    try {
        // Connect DB
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");

        // Check if admin already exists
        const adminExists = await User.findOne({ role: "admin" });
        if (adminExists) {
            console.log("❌ Admin already exists");
            process.exit();
        }

        // Admin credentials (CHANGE THESE)
        const adminData = {
            name: "Super Admin",
            email: "admin@sales.com",
            password: "Admin@123",
            role: "admin",
            isActive: true
        };

        // Hash password
        const salt = await bcrypt.genSalt(10);
        adminData.password = await bcrypt.hash(adminData.password, salt);

        // Create admin
        await User.create(adminData);

        console.log("✅ Admin created successfully");
        console.log("📧 Email: admin@sales.com");
        console.log("🔑 Password: Admin@123");

        process.exit();
    } catch (error) {
        console.error("❌ Error creating admin:", error);
        process.exit(1);
    }
};

createAdmin();
