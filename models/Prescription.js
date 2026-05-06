const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema({
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    medicines: [{ name: String, dosage: String, frequency: String }],
    routines: [{ activity: String, timing: String }]
}, { timestamps: true });

module.exports = mongoose.model("Prescription", prescriptionSchema);
