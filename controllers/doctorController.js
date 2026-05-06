const Problem = require("../models/Problem");
const Prescription = require("../models/Prescription");
const Appointment = require("../models/Appointment");

// View assigned problems
exports.getAssignedProblems = async (req, res) => {
    try {
        const problems = await Problem.find({ doctorId: req.user._id, status: "pending" })
            .populate("patientId", "name email");
        res.json(problems);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Submit prescription
exports.submitPrescription = async (req, res) => {
    const { caseId, medicines, routines } = req.body;
    try {
        const problem = await Problem.findById(caseId);
        if (!problem) return res.status(404).json({ message: "Problem not found" });

        const prescription = await Prescription.create({
            caseId,
            doctorId: req.user._id,
            patientId: problem.patientId,
            medicines,
            routines
        });

        problem.status = "prescribed";
        await problem.save();

        res.status(201).json(prescription);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// View prescriptions submitted by the doctor
exports.getDoctorPrescriptions = async (req, res) => {
    try {
        const prescriptions = await Prescription.find({ doctorId: req.user._id })
            .populate('caseId', 'description problemType')
            .populate('patientId', 'name email')
            .sort({ createdAt: -1 });
        res.json(prescriptions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all problems treated by the doctor (for profile page)
exports.getTreatedProblems = async (req, res) => {
    try {
        const problems = await Problem.find({ doctorId: req.user._id, status: "treated" })
            .populate("patientId", "name email")
            .sort({ createdAt: -1 });

        // Transform the data to include patient name
        const treatedProblems = problems.map(problem => ({
            ...problem.toObject(),
            patientName: problem.patientId ? problem.patientId.name : "Unknown Patient"
        }));

        res.json(treatedProblems);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Mark a problem as treated
exports.markProblemAsTreated = async (req, res) => {
    const { caseId } = req.body;
    try {
        const problem = await Problem.findById(caseId);
        if (!problem) return res.status(404).json({ message: "Problem not found" });

        // Verify the logged-in doctor owns this problem
        if (problem.doctorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this problem" });
        }

        // Only allow marking as treated if status is prescribed
        if (problem.status !== "prescribed") {
            return res.status(400).json({ message: "Can only mark prescribed problems as treated" });
        }

        problem.status = "treated";
        await problem.save();

        res.json({ message: "Problem marked as treated", problem });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all treated appointments for the doctor
exports.getTreatedAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ doctorId: req.user._id, status: "treated" })
            .populate("patientId", "name email")
            .sort({ updatedAt: -1 });

        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Mark an appointment as treated
exports.markAppointmentAsTreated = async (req, res) => {
    const { appointmentId } = req.body;
    try {
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) return res.status(404).json({ message: "Appointment not found" });

        // Verify the logged-in doctor owns this appointment
        if (appointment.doctorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this appointment" });
        }

        // Only allow marking as treated if status is approved
        if (appointment.status !== "approved") {
            return res.status(400).json({ message: "Can only mark approved appointments as treated" });
        }

        appointment.status = "treated";
        await appointment.save();

        res.json({ message: "Appointment marked as treated", appointment });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
