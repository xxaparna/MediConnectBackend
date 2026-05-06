const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["patient", "doctor"], required: true },
    speciality: {
    type: String,
    required: function() { return this.role === "doctor"; },
    enum: [ "general", "gyanae", "ent", "physiotherapist", "dentist", "ortho", "derma" ]
  },
      // Patient profile fields
    age: { type: Number, min: 0 },
    gender: { type: String, enum: ["male", "female", "other"] },
    phone: { type: String },
    medicalHistory: [
      {
        description: { type: String },
        date: { type: Date, default: Date.now },
      }
    ],
    // You can add doctor-specific fields here or create a separate schema if preferred
    qualification: { type: String },
    experience: { type: Number, min: 0 },
    clinicAddress: { type: String },
    availability: [
      {
        day: String, 
        slots: [String]
      }
    ],
}, { timestamps: true });

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
