const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

// ⚠️ USE SAME URI AS YOUR MAIN BACKEND
mongoose.connect("mongodb+srv://salesadmin:salesadmin123@cluster0.oem9d7n.mongodb.net/?appName=Cluster0");

async function resetAdmin() {
    const plainPassword = "121212";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const result = await User.updateOne(
        { email: "admin@saleserp.com" },
        {
            $set: {
                password: hashedPassword,
                role: "admin",
                isActive: true,
                updatedAt: new Date()
            }
        }
    );

    console.log("✅ Admin password reset result:", result);
    console.log("================================");
    console.log("LOGIN DETAILS");
    console.log("Email: admin@saleserp.com");
    console.log("Password: 121212");
    console.log("================================");

    process.exit();
}

resetAdmin();
