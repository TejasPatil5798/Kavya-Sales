const mongoose = require("mongoose");

const allocationSchema = new mongoose.Schema(
  {
    project_name: {
      type: String,
      required: true,
    },

    project_id: {
      type: Number,
      required: true,
    },

    it_team: {
      type: String,
      required: true,
    },

    tl_name: {
      type: String,
      required: true,
    },

    start_date: {
      type: String,
      required: true,
    },

    end_date: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Allocation", allocationSchema);
