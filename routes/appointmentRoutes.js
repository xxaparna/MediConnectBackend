const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { bookAppointment, getAppointments } = require("../controllers/appointmentController");

router.post("/book", protect, bookAppointment);
router.get("/", protect, getAppointments);

module.exports = router;
