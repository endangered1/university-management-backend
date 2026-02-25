const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
    {
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true
        },
        instructor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        sectionName: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
            minlength: 1,
            maxlength: 100
        },
        semester: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 60
        },
        capacity: {
            type: Number,
            required: true,
            min: 1,
            max: 200
        },
        enrollmentDeadline: {
            type: Date,
            required: true
        }
    },
    { timestamps: true }    
);

sectionSchema.index({ course: 1, semester: 1, sectionName: 1 }, {unique: true});

const Section = mongoose.model("Section", sectionSchema);

module.exports = { Section };