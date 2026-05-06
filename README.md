# 🏥 MediConnect Backend

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-FB015B?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Resend](https://img.shields.io/badge/Resend-000000?style=for-the-badge&logo=mail.ru&logoColor=white)

> A robust RESTful API powering the MediConnect healthcare platform — connecting patients with doctors, managing appointments, prescriptions, and smart medicine reminders with automated email scheduling.

---

## 📁 Project Structure

```
backend/
├── config/
│   └── db.js                    # MongoDB connection setup
├── controllers/
│   ├── authController.js        # Register & Login logic
│   ├── appointmentController.js # Appointment booking & retrieval
│   ├── doctorController.js      # Doctor-specific operations
│   └── patientController.js     # Patient-specific operations
├── middleware/
│   ├── authMiddleware.js        # JWT protect & role-based authorize
│   └── errorHandler.js          # Global error handler
├── models/
│   ├── User.js                  # Unified User schema (patient + doctor)
│   ├── Appointment.js           # Appointment schema
│   ├── Prescription.js          # Prescription schema
│   ├── Problem.js               # Medical problem/case schema
│   └── MedicineReminder.js      # Medicine reminder schema
├── routes/
│   ├── authRoutes.js            # /api/auth
│   ├── appointmentRoutes.js     # /api/appointments
│   ├── doctorRoutes.js          # /api/doctors
│   └── patientRoutes.js         # /api/patients
├── utils/
│   └── reminderScheduler.js     # Resend email scheduling logic
├── .env                         # Environment variables
├── package.json
└── server.js                    # App entry point
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- A [Resend](https://resend.com) account for email scheduling

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd backend

# Install dependencies
npm install

# Start the server
npm start
```

### 🔧 Environment Variables

Create a `.env` file in the `backend/` root:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@yourdomain.com
```

---

## 🛡️ Middleware

### 🔐 `authMiddleware.js`

| Middleware | Description |
|---|---|
| `protect` | Validates the `Bearer` JWT token from the `Authorization` header. Attaches the decoded user to `req.user`. Returns `401` if token is missing or invalid. |
| `authorize(...roles)` | Role-based access control. Accepts one or more roles (e.g., `"doctor"`, `"patient"`). Returns `403` if the authenticated user's role is not permitted. |

### ⚠️ `errorHandler.js`

A global Express error-handling middleware that catches all unhandled errors and returns a clean JSON response with the appropriate HTTP status code and message.

---

## 📡 API Routes

### 🔑 Auth Routes — `/api/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user (patient or doctor) |
| `POST` | `/api/auth/login` | Public | Login and receive a JWT token |

**Register Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "role": "patient",
  "speciality": "general"
}
```

**Login Body:**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

---

### 📅 Appointment Routes — `/api/appointments`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/appointments/book` | 🔒 Protected | Book a new appointment with a doctor |
| `GET` | `/api/appointments/` | 🔒 Protected | Get all appointments for the logged-in patient |

**Book Appointment Body:**
```json
{
  "doctorId": "doctor_object_id",
  "appointmentDate": "2026-06-15",
  "timeSlot": "10:00 AM",
  "notes": "Routine checkup"
}
```

---

### 👨‍⚕️ Doctor Routes — `/api/doctors`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/doctors/` | 🔒 Doctor / Patient | List all doctors (filter by `?speciality=`) |
| `GET` | `/api/doctors/problems` | 🔒 Doctor | Get all pending problems assigned to the doctor |
| `POST` | `/api/doctors/prescribe` | 🔒 Doctor | Submit a prescription for a patient case |
| `GET` | `/api/doctors/prescriptions` | 🔒 Doctor | Get all prescriptions submitted by the doctor |
| `POST` | `/api/doctors/mark-treated` | 🔒 Doctor | Mark a problem/case as treated |
| `GET` | `/api/doctors/appointments` | 🔒 Doctor | Get all appointments assigned to the doctor |
| `PATCH` | `/api/doctors/appointments/:id/status` | 🔒 Doctor | Update appointment status (`pending`, `approved`, `cancelled`, `treated`) |
| `GET` | `/api/doctors/treated-appointments` | 🔒 Doctor | Get all treated appointments |
| `POST` | `/api/doctors/mark-appointment-treated` | 🔒 Doctor | Mark an appointment as treated |
| `GET` | `/api/doctors/profile` | 🔒 Doctor | Get the doctor's profile |
| `PUT` | `/api/doctors/profile` | 🔒 Doctor | Update the doctor's profile |

**Submit Prescription Body:**
```json
{
  "caseId": "problem_object_id",
  "medicines": [
    { "name": "Paracetamol", "dosage": "500mg", "frequency": "Twice a day" }
  ],
  "routines": [
    { "activity": "Morning walk", "timing": "7:00 AM" }
  ]
}
```

---

### 🧑‍💼 Patient Routes — `/api/patients`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/patients/appointments` | 🔒 Patient | Get all appointments for the logged-in patient |
| `POST` | `/api/patients/problems` | 🔒 Patient | Submit a new medical problem/case |
| `GET` | `/api/patients/problems` | 🔒 Patient | Get all problems submitted by the patient |
| `GET` | `/api/patients/prescriptions` | 🔒 Patient | Get all prescriptions for the patient |
| `GET` | `/api/patients/profile` | 🔒 Patient | Get the patient's profile |
| `PUT` | `/api/patients/profile` | 🔒 Patient | Update the patient's profile |
| `POST` | `/api/patients/medicine-reminders` | 🔒 Patient | Create a new medicine reminder (auto-schedules emails) |
| `GET` | `/api/patients/medicine-reminders` | 🔒 Patient | Get all medicine reminders |
| `PUT` | `/api/patients/medicine-reminders/:id` | 🔒 Patient | Update a reminder (reschedules emails if times change) |

**Submit Problem Body:**
```json
{
  "problemType": "ent",
  "description": "Sore throat and ear pain",
  "duration": "3 days",
  "notes": "Worsens at night"
}
```

**Create Medicine Reminder Body:**
```json
{
  "medicineName": "Amoxicillin",
  "dosage": "250mg",
  "times": ["08:00", "14:00", "20:00"],
  "startDate": "2026-05-08",
  "endDate": "2026-05-15"
}
```

---

## 🗄️ Data Models

### 👤 User

Unified schema for both patients and doctors.

| Field | Type | Notes |
|---|---|---|
| `name` | String | Required |
| `email` | String | Required, unique |
| `password` | String | Bcrypt hashed |
| `role` | String | `"patient"` or `"doctor"` |
| `speciality` | String | Required for doctors: `general`, `gyanae`, `ent`, `physiotherapist`, `dentist`, `ortho`, `derma` |
| `age` | Number | Patient field |
| `gender` | String | `male`, `female`, `other` |
| `phone` | String | Patient field |
| `medicalHistory` | Array | Auto-updated on problem submission |
| `qualification` | String | Doctor field |
| `experience` | Number | Doctor field |
| `clinicAddress` | String | Doctor field |
| `availability` | Array | Doctor's available days and time slots |

### 📅 Appointment

| Field | Type | Notes |
|---|---|---|
| `patientId` | ObjectId | Ref: User |
| `doctorId` | ObjectId | Ref: User |
| `appointmentDate` | Date | Required |
| `timeSlot` | String | e.g., `"10:00 AM"` |
| `status` | String | `pending`, `confirmed`, `approved`, `cancelled`, `treated` |
| `notes` | String | Optional |

### 🩺 Problem (Medical Case)

| Field | Type | Notes |
|---|---|---|
| `patientId` | ObjectId | Ref: User |
| `doctorId` | ObjectId | Auto-assigned by speciality |
| `problemType` | String | Matches doctor speciality |
| `description` | String | Required |
| `duration` | String | Required |
| `status` | String | `pending` → `prescribed` → `treated` |

### 💊 Prescription

| Field | Type | Notes |
|---|---|---|
| `caseId` | ObjectId | Ref: Problem |
| `doctorId` | ObjectId | Ref: User |
| `patientId` | ObjectId | Ref: User |
| `medicines` | Array | `{ name, dosage, frequency }` |
| `routines` | Array | `{ activity, timing }` |

### ⏰ MedicineReminder

| Field | Type | Notes |
|---|---|---|
| `patientId` | ObjectId | Ref: User |
| `medicineName` | String | Required |
| `dosage` | String | Required |
| `times` | Array | e.g., `["08:00", "14:00"]` |
| `startDate` | Date | Required |
| `endDate` | Date | Required |
| `status` | String | `Upcoming`, `Missed`, `Completed` |
| `takenDates` | Array | Dates when medicine was taken |
| `scheduledEmails` | Array | `{ emailId, scheduledTime }` — Resend email IDs |

---

## 📧 Email Reminder System

The `reminderScheduler.js` utility integrates with the **Resend** API to automatically schedule medicine reminder emails.

### How it works

1. When a patient creates or updates a medicine reminder, the scheduler calculates all upcoming reminder times within the next **72 hours**.
2. For each upcoming time, a styled HTML email is scheduled via Resend's native scheduling API.
3. The returned email IDs are stored in the `scheduledEmails` field of the reminder document.
4. If a reminder is updated (times/dates changed), existing scheduled emails are **cancelled** and new ones are **rescheduled** automatically.

```
Patient creates reminder
        ↓
calculateNextReminderTimes() → finds all times within 72h
        ↓
scheduleReminderEmail() → sends to Resend with scheduled_at
        ↓
Email IDs saved to MedicineReminder.scheduledEmails
```

---

## 🔒 Authentication Flow

```
Client sends POST /api/auth/login
        ↓
Server validates credentials (bcrypt compare)
        ↓
JWT token generated (expires in 7 days)
        ↓
Client stores token and sends as:
Authorization: Bearer <token>
        ↓
protect middleware verifies token on every protected route
        ↓
authorize middleware checks user role
```

---

## 🩺 Doctor Assignment Logic

When a patient submits a problem, the system automatically finds a doctor whose **speciality matches the problem type**:

```
Patient submits problem (problemType: "ent")
        ↓
System queries: User.findOne({ role: "doctor", speciality: "ent" })
        ↓
Problem is assigned to that doctor
        ↓
Patient's medicalHistory is updated automatically
```

### Supported Specialities

| Speciality | Description |
|---|---|
| `general` | General Physician |
| `gyanae` | Gynaecology |
| `ent` | Ear, Nose & Throat |
| `physiotherapist` | Physiotherapy |
| `dentist` | Dentistry |
| `ortho` | Orthopaedics |
| `derma` | Dermatology |

---

## 📦 Dependencies

| Package | Version | Purpose |
|---|---|---|
| `express` | ^5.1.0 | Web framework |
| `mongoose` | ^8.17.1 | MongoDB ODM |
| `bcryptjs` | ^3.0.2 | Password hashing |
| `jsonwebtoken` | ^9.0.2 | JWT authentication |
| `cors` | ^2.8.5 | Cross-origin resource sharing |
| `dotenv` | ^17.2.1 | Environment variable management |
| `resend` | ^6.0.2 | Email scheduling service |
| `nodemailer` | ^7.0.6 | Email transport |
| `node-cron` | ^4.2.1 | Cron job scheduling |
| `nodemon` | ^3.1.10 | Dev auto-restart (devDependency) |

---

## 🧑‍💻 Scripts

```bash
npm start      # Start the server with Node
```

> For development with auto-reload, run:
> ```bash
> npx nodemon server.js
> ```

---

*Built with ❤️ for MediConnect — Your Health Companion*
