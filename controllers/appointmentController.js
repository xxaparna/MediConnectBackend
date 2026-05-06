const Appointment = require("../models/Appointment");

exports.bookAppointment = async (req, res) => {
  const { doctorId, appointmentDate, timeSlot, notes } = req.body;
  try {
    // Optional: Add logic here to check if doctor is available on the date/timeSlot

    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      notes,
    });

    res.status(201).json({ message: "Appointment booked successfully", appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user._id }).populate("doctorId", "name speciality email");
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
