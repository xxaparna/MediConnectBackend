const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  appointmentDate: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  status: { type: String, enum: ["pending", "confirmed", "cancelled","approved", "treated"], default: "pending" },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Appointment", appointmentSchema);
