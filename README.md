# MediCare Hospital Appointment System

MediCare is a full-stack MERN hospital appointment and patient management application. It provides separate authenticated workspaces for patients, doctors, and administrators, with JWT authentication and role-based access control.

## Features

### Patients

- Register and log in securely
- Browse doctors, specializations, and departments
- View doctor availability and open 30-minute appointment slots
- Book appointments with reason and date details
- View upcoming and completed appointments
- Upload medical reports as PDF, JPG, or PNG files
- View prescriptions and download generated prescription PDFs

### Doctors

- View a dashboard of assigned appointments and completed consultations
- View patient details and uploaded medical reports
- Configure working days and appointment hours
- Mark appointments as completed and payments as paid
- Create digital prescriptions with diagnosis, medicines, instructions, and follow-up dates
- Generate downloadable prescription PDFs

### Administrators

- View dashboard statistics and appointment status analytics
- Manage doctors, departments, and patients
- Add or remove doctors and reset account passwords
- Configure doctor availability
- Search and inspect patient records
- View all appointments and revenue statistics

## Technology

- Frontend: React 18, React Router, Axios, Recharts, Vite
- Backend: Node.js, Express, Mongoose, MongoDB
- Authentication: JWT and bcryptjs
- File uploads: Multer
- Prescription documents: PDFKit
- Optional email delivery: Nodemailer

## Requirements

- Node.js 18 or newer
- MongoDB 6 or newer, running locally or through MongoDB Atlas
- npm

## Project Structure

```text
backend/
	src/
		auth.js       JWT authentication and role checks
		mailer.js     Optional email notification support
		models.js     MongoDB schemas
		seed.js       Demo data and account setup
		server.js     Express API and file serving
	uploads/        Local report and prescription storage
frontend/
	src/
		api.js        Axios API client
		main.jsx      React application and routes
		style.css     Application styles
```

## Configuration

Create `backend/.env` with values for the local environment:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/hospital_management
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173

# Optional SMTP configuration
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=Hospital <no-reply@hospital.local>
```

Do not commit real database credentials, JWT secrets, or SMTP passwords.

## Run Locally

Start MongoDB first, then open two terminals.

### Backend

```bash
cd backend
npm install
npm run seed
npm run dev
```

The API runs at `http://localhost:5000`. The health endpoint is available at `http://localhost:5000/api/health`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite development server runs at `http://localhost:5173`.

For a production frontend build:

```bash
cd frontend
npm run build
npm run preview
```

## Demo Accounts

The seed script creates these accounts:

| Role | Email | Password |
| --- | --- | --- |
| Administrator | `admin@hospital.com` | `Admin@123` |
| Doctor | `doctor@hospital.com` | `Doctor@123` |
| Patient | `patient@hospital.com` | `Patient@123` |

Change demo passwords before using the application outside local development.

## Data and Uploads

Medical reports and generated prescription PDFs are stored in `backend/uploads` for local development and served through the API. For production, replace local storage with managed object storage and configure a production database.

Appointment conflicts are prevented per doctor and time slot. A doctor’s configured working days and hours determine the slots shown to patients.
