const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
    {
        department: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Department",  
          required: true
        },
        code: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
            minlength: 2,
            maxlength: 100
        },
        title: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
            minlength: 2,
            maxlength: 100
        },
        creditHours: {
            type: Number,
            required: true,
            min: 0,
            max: 30
        }
    },
    {timestamps: true}
);

courseSchema.index({department: 1, code: 1}, {unique: true});

const Course = mongoose.model("Course", courseSchema);

module.exports = { Course };