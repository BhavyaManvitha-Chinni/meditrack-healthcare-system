import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

interface Doctor {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
}

const BookAppointment: React.FC = () => {
  const { userProfile } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [todayAppointments, setTodayAppointments] = useState(0);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Generate time slots
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  useEffect(() => {
    // Fetch doctors
    const fetchDoctors = async () => {
      const q = query(collection(db, 'users'), where('role', '==', 'doctor'));
      const snapshot = await getDocs(q);
      const doctorData: Doctor[] = [];
      snapshot.forEach((doc) => {
        doctorData.push(doc.data() as Doctor);
      });
      setDoctors(doctorData);
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    if (!userProfile) return;

    // Monitor today's appointments for this patient
    const q = query(
      collection(db, 'appointments'),
      where('patientId', '==', userProfile.uid),
      where('date', '==', today)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTodayAppointments(snapshot.size);
    });

    return () => unsubscribe();
  }, [userProfile, today]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (todayAppointments >= 2) {
      setError('You can only book a maximum of 2 appointments per day.');
      return;
    }

    if (!selectedDoctor || !date || !time) {
      setError('Please fill in all required fields.');
      return;
    }

    // Check if selected date is not in the past
    if (date < today) {
      setError('Please select a future date.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const selectedDoctorData = doctors.find(doc => doc.uid === selectedDoctor);
      
      await addDoc(collection(db, 'appointments'), {
        patientId: userProfile!.uid,
        patientName: `${userProfile!.firstName} ${userProfile!.lastName}`,
        doctorId: selectedDoctor,
        doctorName: `${selectedDoctorData!.firstName} ${selectedDoctorData!.lastName}`,
        date,
        time,
        note: note.trim(),
        status: 'pending',
        createdAt: new Date()
      });

      setSuccess(true);
      
      // Reset form
      setSelectedDoctor('');
      setDate('');
      setTime('');
      setNote('');

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError('Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Book an Appointment</h1>
          <p className="mt-2 text-gray-600">Schedule your visit with one of our doctors</p>
        </div>

        {/* Daily Limit Warning */}
        {todayAppointments > 0 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="text-yellow-800">
                You have {todayAppointments} appointment(s) booked for today. 
                You can book {2 - todayAppointments} more appointment(s) today.
              </span>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6">
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-800">Appointment booked successfully!</span>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="doctor" className="block text-sm font-medium text-gray-700 mb-2">
                Select Doctor *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <select
                  id="doctor"
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  required
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.uid} value={doctor.uid}>
                      Dr. {doctor.firstName} {doctor.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={today}
                    required
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Time *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <select
                    id="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select time</option>
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Please describe your symptoms or reason for visit..."
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setSelectedDoctor('');
                  setDate('');
                  setTime('');
                  setNote('');
                  setError('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Clear Form
              </button>
              <button
                type="submit"
                disabled={loading || todayAppointments >= 2}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Booking...' : 'Book Appointment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;