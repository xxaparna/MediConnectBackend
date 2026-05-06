const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
     problemType: { 
    type: String, 
    required: true, 
    enum: [ "general", "gyanae", "ent", "physiotherapist", "dentist", "ortho", "derma" ]
  },
    description: { type: String, required: true },
    duration: { type: String, required: true },
    notes: String,
    status: { type: String, enum: ["pending", "prescribed", "treated"], default: "pending" }
}, { timestamps: true });

module.exports = mongoose.model("Problem", problemSchema);
