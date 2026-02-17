const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {
        client: { type: String, required: true },

        userMail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        taskType: { type: String, required: true },

        taskDate: { type: String, required: true }, // YYYY-MM-DD

        note: { type: String },

        status: {
            type: String,
            enum: ["Pending", "In Progress", "Completed"],
            default: "Pending",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
