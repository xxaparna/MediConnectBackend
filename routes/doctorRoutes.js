// const User = require("../models/User");

// const express = require("express");
// const { getAssignedProblems, submitPrescription } = require("../controllers/doctorController");
// const { protect, authorize } = require("../middleware/authMiddleware");

// const router = express.Router();

// router.get("/problems", protect, authorize("doctor"), getAssignedProblems);
// router.post("/prescribe", protect, authorize("doctor"), submitPrescription);

// // Add this code before 'module.exports = router;'

// router.get("/", protect, authorize("doctor", "patient"), async (req, res) => {
//   const specialityFilter = req.query.speciality;
//   const filter = { role: "doctor" };

//   if (specialityFilter) {
//     filter.speciality = specialityFilter;
//   }

//   try {
//     const doctors = await User.find(filter).select("-password");
//     res.json(doctors);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch doctors" });
//   }
// });


// module.exports = router;


const express = require("express");
const User = require("../models/User");
const Appointment = require("../models/Appointment");
const { getAssignedProblems, submitPrescription, getDoctorPrescriptions, getTreatedProblems, markProblemAsTreated, getTreatedAppointments, markAppointmentAsTreated } = require("../controllers/doctorController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Get assigned problems for doctor
router.get("/problems", protect, authorize("doctor"), getAssignedProblems);

// Submit a prescription by doctor
router.post("/prescribe", protect, authorize("doctor"), submitPrescription);

// Get prescriptions submitted by the doctor
router.get("/prescriptions", protect, authorize("doctor"), getDoctorPrescriptions);

// Mark a problem as treated
router.post("/mark-treated", protect, authorize("doctor"), markProblemAsTreated);

// Get the list of doctors (with optional speciality filter)
router.get("/", protect, authorize("doctor", "patient"), async (req, res) => {
  const specialityFilter = req.query.speciality;
  const filter = { role: "doctor" };

  if (specialityFilter) {
    filter.speciality = specialityFilter;
  }

  try {
    const doctors = await User.find(filter).select("-password");
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch doctors" });
  }
});

// Get appointments assigned to the logged-in doctor
router.get("/appointments", protect, authorize("doctor"), async (req, res) => {
  try {
    const doctorId = req.user.id;
    const appointments = await Appointment.find({ doctorId })
      .populate("patientId", "name email") // populate patient name and email
      .exec();

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
});

// Update appointment status (approve or others)
router.patch("/appointments/:id/status", protect, authorize("doctor"), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["pending", "approved", "cancelled", "treated"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Verify the logged-in doctor owns this appointment
    if (appointment.doctorId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this appointment" });
    }

    appointment.status = status;
    await appointment.save();

    res.json({ message: "Appointment status updated", appointment });
  } catch (err) {
    res.status(500).json({ message: "Failed to update appointment status" });
  }
});

// Get doctor profile
router.get("/profile", protect, authorize("doctor"), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

// Update doctor profile
router.put("/profile", protect, authorize("doctor"), async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// Get treated appointments for the doctor
router.get("/treated-appointments", protect, authorize("doctor"), getTreatedAppointments);

// Mark an appointment as treated
router.post("/mark-appointment-treated", protect, authorize("doctor"), markAppointmentAsTreated);

module.exports = router;

