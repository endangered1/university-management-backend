const mongoose = require("mongoose");

const enrollmentRequestSchema = new mongoose.Schema(
    {
        student: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        course: {type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        semester: {type: String, required: true, trim: true },

        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        },

        decidedSection: {type: mongoose.Schema.Types.ObjectId, ref: "Section"},
        decisionNote: { type: String, trim: true }
        },
        { timestamps: true }
);

enrollmentRequestSchema.index({ student: 1, course: 1, semester: 1}, { unique: true });
const EnrollmentRequest = mongoose.model("EnrollmentRequest", enrollmentRequestSchema);

module.exports = { EnrollmentRequest };