const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: true,
      minlength: 3,
      trim: true,
    },

    clientCompany: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true, // ❗ NO DUPLICATE EMAIL
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

    sourceLeadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
