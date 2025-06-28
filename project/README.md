# MediTrack - Healthcare Appointment & Prescription Tracking System

A comprehensive, professional healthcare management platform built with React, TypeScript, Tailwind CSS, and Firebase, designed to streamline appointment booking and prescription management between patients and doctors.

## 🌟 Features

### User Authentication & Role Management
- **Secure Email/Password Authentication** via Firebase Auth
- **Role-based Access Control** (Doctor/Patient)
- **Email Validation** - Only accepts emails ending with @meditrack.local
- **Protected Routes** based on authentication status and user roles

### Patient Features
- **Dashboard Overview** - View upcoming and past appointments with comprehensive statistics
- **Appointment Booking** - Schedule appointments with available doctors
- **Daily Booking Limits** - Maximum 2 appointments per patient per day
- **Appointment Management** - Track appointment status (pending, confirmed, in-progress, completed)
- **Prescription Viewing** - Access detailed prescription information after appointment completion
- **Feedback System** - Rate and review completed appointments (1-5 star rating with optional comments)
- **Real-time Updates** - Live appointment status updates via Firebase

### Doctor Features
- **Professional Dashboard** - Manage appointments and view performance metrics
- **Appointment Management** - Accept/decline pending appointment requests
- **Status Control** - Update appointment status from confirmed → in-progress → completed
- **Prescription Management** - Add detailed prescriptions (medicine, dosage, frequency, instructions)
- **Feedback Analytics** - View patient ratings and comments with average rating calculation
- **Patient Care Tracking** - Monitor appointment history and patient interactions

### Design & User Experience
- **Modern UI/UX** - Clean, professional design inspired by leading healthcare platforms
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Medical Color Palette** - Professional blues, greens, and healthcare-appropriate styling
- **Loading States** - Smooth loading indicators and transitions
- **Success/Error Notifications** - Clear feedback for all user actions
- **Intuitive Navigation** - Role-aware navigation with logout functionality

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS for modern, utility-first styling
- **Icons**: Lucide React for consistent, professional icons
- **Routing**: React Router DOM for client-side navigation
- **Authentication**: Firebase Authentication
- **Database**: Cloud Firestore for real-time data synchronization
- **Build Tool**: Vite for fast development and optimized builds
- **State Management**: React Context API for authentication state

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Firebase project with Authentication and Firestore enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd meditrack-healthcare-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Configuration**
   The Firebase configuration is already set up in `src/config/firebase.ts` with the provided credentials.

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open your browser and navigate to `http://localhost:5173`

### Test Accounts
Create test accounts using the registration form with emails ending in @meditrack.local:

**Sample Doctor Account:**
- Email: doctor@meditrack.local
- Password: password123
- Role: Doctor

**Sample Patient Account:**
- Email: patient@meditrack.local
- Password: password123
- Role: Patient

## 📱 Usage Guide

### For Patients
1. **Register/Login** with an email ending in @meditrack.local
2. **Book Appointments** - Select doctor, date, time, and add notes
3. **Track Status** - Monitor appointment progress in real-time
4. **View Prescriptions** - Access detailed prescription information after completion
5. **Provide Feedback** - Rate and review your healthcare experience

### For Doctors
1. **Register/Login** with doctor role
2. **Manage Requests** - Accept or decline pending appointment requests
3. **Update Status** - Progress appointments through different stages
4. **Add Prescriptions** - Provide detailed medication instructions
5. **Monitor Feedback** - View patient ratings and improve service quality

## 🔒 Security Features

- **Firebase Security Rules** - Secure data access based on user authentication
- **Role-based Authorization** - Users can only access appropriate features
- **Email Domain Validation** - Restricts registration to @meditrack.local emails
- **Real-time Security** - Firebase handles authentication state management
- **Protected Routes** - Unauthorized access prevention

## 📊 Key Metrics Dashboard

### Patient Dashboard
- Upcoming appointments count
- Total prescriptions received
- Completed visits history
- Appointment status tracking

### Doctor Dashboard
- Pending appointment requests
- Active appointments in progress
- Total completed appointments
- Average patient rating

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase hosting
firebase init hosting

# Deploy
firebase deploy
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

## 🔧 Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint for code quality

## 🎯 Core Business Logic

### Appointment Workflow
1. **Patient Books** → Status: "pending"
2. **Doctor Accepts** → Status: "confirmed"
3. **Doctor Starts** → Status: "in-progress"
4. **Doctor Completes + Adds Prescription** → Status: "completed"
5. **Patient Provides Feedback** → Appointment fully processed

### Daily Booking Limits
- Maximum 2 appointments per patient per day
- Real-time validation prevents over-booking
- Clear messaging about remaining booking capacity

### Prescription Access Control
- Prescriptions visible only after appointment completion
- Secure data linking between appointments and prescriptions
- Read-only access for patients to prevent tampering

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@meditrack.local or open an issue in the repository.

## 🏥 About MediTrack

MediTrack is designed to bridge the gap between patients and healthcare providers through a seamless digital platform. Built with modern web technologies and following healthcare industry best practices, it provides a secure, efficient, and user-friendly solution for appointment management and prescription tracking.

---

**Built with ❤️ for better healthcare management**