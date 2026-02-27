const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: true,
      minlength: 3,
    },

    clientCompany: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email"],
    },

    mobile: {
      type: String,
      required: true,
      match: [/^[0-9]{10}$/, "Mobile must be 10 digits"],
    },

    projectName: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "Follow Up",
        "Interested",
        "Not Interested",
        "Open",
        "Closed",
        "Pending",
        "Done",
      ],
      default: "Follow Up",
    },

    followUpDate: {
      type: Date,
    },

    timeline: {
      startDate: Date,
      endDate: Date,
    },

    budget: {
      type: Number,
      min: 0,
    },

    reference: {
      type: String,
    },
    assignedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", leadSchema);
