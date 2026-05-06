const express = require("express");
const { submitProblem, getPrescriptions, getProblems, createMedicineReminder, getMedicineReminders, updateMedicineReminder } = require("../controllers/patientController");
const { protect, authorize } = require("../middleware/authMiddleware");
const Appointment = require("../models/Appointment");
const User = require("../models/User");

const router = express.Router();

// Get all appointments for the logged-in patient
router.get("/appointments", protect, authorize("patient"), async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user.id })
      .populate("doctorId", "name speciality")
      .exec();
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
});

router.post("/problems", protect, authorize("patient"), submitProblem);
router.get("/problems", protect, authorize("patient"), getProblems);
router.get("/prescriptions", protect, authorize("patient"), getPrescriptions);

router.get("/profile", protect, authorize("patient"), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

// Edit profile
router.put("/profile", protect, authorize("patient"), async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// Medicine Reminder routes
router.post("/medicine-reminders", protect, authorize("patient"), createMedicineReminder);
router.get("/medicine-reminders", protect, authorize("patient"), getMedicineReminders);
router.put("/medicine-reminders/:id", protect, authorize("patient"), updateMedicineReminder);

module.exports = router;
