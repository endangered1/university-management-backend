const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        section: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Section",
            required: true
        },
        grade: {
            type: String,
            default: null
        }
    },
    { timestamps: true }
);

enrollmentSchema.index({ student: 1, section: 1}, {unique: true});

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

module.exports = { Enrollment };