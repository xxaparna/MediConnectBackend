const mongoose = require("mongoose");

const medicineReminderSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    medicineName: { type: String, required: true },
    dosage: { type: String, required: true },
    times: [{ type: String, required: true }], // Array of times, e.g., ["08:00", "14:00", "20:00"]
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ["Upcoming", "Missed", "Completed"], default: "Upcoming" },
    takenDates: [{ type: Date }], // Array of dates when the medicine was taken
    scheduledEmails: [{
        emailId: { type: String, required: true },
        scheduledTime: { type: Date, required: true }
    }]
}, { timestamps: true });

module.exports = mongoose.model("MedicineReminder", medicineReminderSchema);
