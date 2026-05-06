// Existing imports
const Problem = require("../models/Problem");
const Prescription = require("../models/Prescription");
const User = require("../models/User");

// New import
const MedicineReminder = require("../models/MedicineReminder");
const { scheduleReminderEmails, cancelScheduledEmails } = require("../utils/reminderScheduler");

// Submit problem
exports.submitProblem = async (req, res) => {
    const { problemType, description, duration, notes } = req.body;
    try {
        const doctor = await User.findOne({ role: "doctor",speciality: problemType }); // Simple doctor assignment logic
        if (!doctor) return res.status(404).json({ message: "No doctor available" });

        const problem = await Problem.create({
            patientId: req.user._id,
            doctorId: doctor._id,
            problemType,
            description,
            duration,
            notes
        });

        // After creating problem, update user's medicalHistory
        await User.findByIdAndUpdate(req.user._id, {
            $push: {
                medicalHistory: {
                    description,
                    date: new Date()
                }
            }
        });

        res.status(201).json(problem);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// View own problems
exports.getProblems = async (req, res) => {
    try {
        const problems = await Problem.find({ patientId: req.user._id }).sort({ createdAt: -1 });
        res.json(problems);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// View own prescriptions
exports.getPrescriptions = async (req, res) => {
    try {
        const prescriptions = await Prescription.find({ patientId: req.user._id }).populate('caseId', 'description problemType');
        res.json(prescriptions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a new medicine reminder
exports.createMedicineReminder = async (req, res) => {
    const { medicineName, dosage, times, startDate, endDate } = req.body;
    try {
        const reminder = await MedicineReminder.create({
            patientId: req.user._id,
            medicineName,
            dosage,
            times,
            startDate,
            endDate,
            status: "Upcoming",
            takenDates: []
        });

        // Schedule emails for upcoming reminders within 72 hours
        const user = req.user;
        const scheduledEmails = await scheduleReminderEmails(reminder, user);

        // Update reminder with scheduled email IDs
        if (scheduledEmails.length > 0) {
            reminder.scheduledEmails = scheduledEmails;
            await reminder.save();
        }

        res.status(201).json(reminder);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all medicine reminders for the logged-in patient
exports.getMedicineReminders = async (req, res) => {
    try {
        const reminders = await MedicineReminder.find({ patientId: req.user._id }).sort({ startDate: 1 });
        res.json(reminders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update a medicine reminder (e.g., mark as taken or update status)
exports.updateMedicineReminder = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
        // Get the current reminder before updating
        const currentReminder = await MedicineReminder.findOne({ _id: id, patientId: req.user._id });
        if (!currentReminder) return res.status(404).json({ message: "Reminder not found" });

        const reminder = await MedicineReminder.findOneAndUpdate(
            { _id: id, patientId: req.user._id },
            updates,
            { new: true }
        );

        // Check if times, startDate, or endDate changed - if so, reschedule emails
        const timeFieldsChanged = updates.times || updates.startDate || updates.endDate;
        if (timeFieldsChanged && reminder.status === "Upcoming") {
            // Cancel existing scheduled emails
            if (currentReminder.scheduledEmails && currentReminder.scheduledEmails.length > 0) {
                const emailIds = currentReminder.scheduledEmails.map(se => se.emailId);
                await cancelScheduledEmails(emailIds);
            }

            // Schedule new emails
            const user = req.user;
            const scheduledEmails = await scheduleReminderEmails(reminder, user);

            // Update reminder with new scheduled email IDs
            reminder.scheduledEmails = scheduledEmails;
            await reminder.save();
        }

        res.json(reminder);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
