const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100
        }
    },
    { timestamps: true }
);

// to make department name dif
departmentSchema.index({ name: 1}, {unique: true});

const Department = mongoose.model("Department", departmentSchema);

exports.Department = Department;