import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Star, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  note: string;
  prescription?: {
    medicine: string;
    dosage: string;
    frequency: string;
    instructions: string;
  };
  feedback?: {
    rating: number;
    comment: string;
  };
  createdAt: Date;
}

const DoctorDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [prescriptionData, setPrescriptionData] = useState({
    medicine: '',
    dosage: '',
    frequency: '',
    instructions: ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userProfile) return;

    const q = query(
      collection(db, 'appointments'),
      where('doctorId', '==', userProfile.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appointmentData: Appointment[] = [];
      snapshot.forEach((doc) => {
        appointmentData.push({ id: doc.id, ...doc.data() } as Appointment);
      });
      
      // Sort by date and time in JavaScript
      appointmentData.sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateB.getTime() - dateA.getTime();
      });
      
      setAppointments(appointmentData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile]);

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: newStatus
      });
      
      setSuccess(`Appointment ${newStatus === 'confirmed' ? 'accepted' : 'updated'} successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to update appointment status');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handlePrescriptionSubmit = async (appointmentId: string) => {
    if (!prescriptionData.medicine.trim()) {
      setError('Please enter medicine name');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: 'completed',
        prescription: prescriptionData
      });

      setPrescriptionData({
        medicine: '',
        dosage: '',
        frequency: '',
        instructions: ''
      });
      setSelectedAppointment(null);
      setSuccess('Prescription added and appointment completed!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to add prescription');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
  const activeAppointments = appointments.filter(apt => 
    ['confirmed', 'in-progress'].includes(apt.status)
  );
  const completedAppointments = appointments.filter(apt => apt.status === 'completed');
  const appointmentsWithFeedback = appointments.filter(apt => apt.feedback);
  
  const averageRating = appointmentsWithFeedback.length > 0 
    ? appointmentsWithFeedback.reduce((sum, apt) => sum + apt.feedback!.rating, 0) / appointmentsWithFeedback.length
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, Dr. {userProfile?.firstName}!
          </h1>
          <p className="mt-2 text-gray-600">Manage your appointments and patient care</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-800">{success}</span>
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

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{pendingAppointments.length}</p>
                <p className="text-gray-600">Pending Requests</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{activeAppointments.length}</p>
                <p className="text-gray-600">Active Appointments</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{completedAppointments.length}</p>
                <p className="text-gray-600">Completed</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</p>
                <p className="text-gray-600">Average Rating</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Appointments */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Pending Appointment Requests</h2>
          {pendingAppointments.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No pending appointment requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingAppointments.map((appointment) => (
                <div key={appointment.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                      <User className="h-10 w-10 text-blue-600 bg-blue-100 rounded-full p-2" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{appointment.patientName}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{appointment.date}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{appointment.time}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                  {appointment.note && (
                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-sm text-gray-700"><strong>Patient Note:</strong> {appointment.note}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Appointments */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Active Appointments</h2>
          {activeAppointments.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No active appointments</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeAppointments.map((appointment) => (
                <div key={appointment.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                      <User className="h-10 w-10 text-blue-600 bg-blue-100 rounded-full p-2" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{appointment.patientName}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{appointment.date}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{appointment.time}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(appointment.status)}`}>
                        {appointment.status.replace('-', ' ')}
                      </span>
                      {appointment.status === 'confirmed' && (
                        <button
                          onClick={() => updateAppointmentStatus(appointment.id, 'in-progress')}
                          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors text-sm"
                        >
                          Start
                        </button>
                      )}
                      {appointment.status === 'in-progress' && (
                        <button
                          onClick={() => setSelectedAppointment(appointment.id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                        >
                          Add Prescription
                        </button>
                      )}
                    </div>
                  </div>

                  {appointment.note && (
                    <div className="bg-gray-50 rounded p-3 mb-4">
                      <p className="text-sm text-gray-700"><strong>Patient Note:</strong> {appointment.note}</p>
                    </div>
                  )}

                  {/* Prescription Form */}
                  {selectedAppointment === appointment.id && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                      <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Add Prescription
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Medicine *</label>
                          <input
                            type="text"
                            value={prescriptionData.medicine}
                            onChange={(e) => setPrescriptionData({...prescriptionData, medicine: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Medicine name"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                          <input
                            type="text"
                            value={prescriptionData.dosage}
                            onChange={(e) => setPrescriptionData({...prescriptionData, dosage: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., 500mg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                          <input
                            type="text"
                            value={prescriptionData.frequency}
                            onChange={(e) => setPrescriptionData({...prescriptionData, frequency: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Twice daily"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                          <input
                            type="text"
                            value={prescriptionData.instructions}
                            onChange={(e) => setPrescriptionData({...prescriptionData, instructions: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., After meals"
                          />
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handlePrescriptionSubmit(appointment.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                        >
                          Complete Appointment
                        </button>
                        <button
                          onClick={() => setSelectedAppointment(null)}
                          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Patient Feedback */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Patient Feedback</h2>
          {appointmentsWithFeedback.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No feedback received yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointmentsWithFeedback.map((appointment) => (
                <div key={appointment.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                      <User className="h-10 w-10 text-blue-600 bg-blue-100 rounded-full p-2" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{appointment.patientName}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{appointment.date}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-lg ${
                              star <= appointment.feedback!.rating
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                        <span className="text-sm text-gray-600 ml-2">
                          ({appointment.feedback!.rating}/5)
                        </span>
                      </div>
                    </div>
                  </div>
                  {appointment.feedback!.comment && (
                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-sm text-gray-700 italic">"{appointment.feedback!.comment}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;