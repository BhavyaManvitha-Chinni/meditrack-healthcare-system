# MediTrack – Real-Time Clinic Appointment and Prescription Tracker

MediTrack is a modern web application built to streamline appointment scheduling and prescription tracking for small clinics. It provides dedicated access for both doctors and patients, ensuring a seamless digital experience for managing healthcare interactions.

## Features

## Role-Based Access
- Secure login and registration using Firebase Authentication
- Patients and doctors access different interfaces with appropriate permissions

## Appointment Scheduling
- Patients can schedule appointments with available doctors
- Time slots are limited to standard clinic hours
- Restrictions in place to prevent overbooking

## Appointment Management
- Doctors can view and accept appointment requests
- Appointments follow a defined status flow: Pending → Confirmed → In Progress → Completed

## Prescription Handling
- After completing an appointment, doctors can enter prescription details including medicines and dosage
- Patients can access their prescriptions only after the appointment is marked as completed

## Feedback System
- Patients may submit one-time feedback for completed appointments
- Doctors can view all feedback along with an aggregated rating

## Clean User Interface
- Fully responsive layout built using Tailwind CSS
- Navigation adapts based on login state and role
- Visual cues and messages provided to improve user experience

## Tech Stack

- Frontend: React, Tailwind CSS
- Backend: Firebase Authentication and Firestore Database
- Optional Hosting: Vercel or Firebase Hosting
