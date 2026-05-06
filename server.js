const dotenv = require("dotenv");
dotenv.config(); // Load environment variables FIRST

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const appointmentRoutes = require("./routes/appointmentRoutes");
const patientRoutes = require("./routes/patientRoutes");
// app.use("/api/appointments", appointmentRoutes);

connectDB();

// Removed medicine reminder cron job as scheduling is now handled by Resend native scheduling
// const medicineReminderJob = require("./cron/medicineReminderCron");
// medicineReminderJob.start();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
// app.use("/api/patients", require("./routes/patientRoutes"));
app.use("/api/doctors", require("./routes/doctorRoutes"));
app.use("/api/appointments", appointmentRoutes);
app.use("/api/patients", patientRoutes);
// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
