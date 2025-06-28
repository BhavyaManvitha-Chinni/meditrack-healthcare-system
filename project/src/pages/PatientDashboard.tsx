import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Star, FileText, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
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

const PatientDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackData, setFeedbackData] = useState<{ [key: string]: { rating: number; comment: string } }>({});

  useEffect(() => {
    if (!userProfile) return;

    const q = query(
      collection(db, 'appointments'),
      where('patientId', '==', userProfile.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appointmentData: Appointment[] = [];
      snapshot.forEach((doc) => {
        appointmentData.push({ id: doc.id, ...doc.data() } as Appointment);
      });
      
      // Sort by date and time
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

  const handleFeedbackSubmit = async (appointmentId: string) => {
    const feedback = feedbackData[appointmentId];
    if (!feedback || feedback.rating === 0) return;

    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        feedback: feedback
      });

      // Clear feedback form
      setFeedbackData(prev => {
        const newData = { ...prev };
        delete newData[appointmentId];
        return newData;
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const updateFeedback = (appointmentId: string, field: 'rating' | 'comment', value: number | string) => {
    setFeedbackData(prev => ({
      ...prev,
      [appointmentId]: {
        ...prev[appointmentId],
        [field]: value,
        rating: prev[appointmentId]?.rating || 0,
        comment: prev[appointmentId]?.comment || ''
      }
    }));
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

  const upcomingAppointments = appointments.filter(apt => 
    ['pending', 'confirmed', 'in-progress'].includes(apt.status)
  );
  const pastAppointments = appointments.filter(apt => 
    ['completed', 'cancelled'].includes(apt.status)
  );

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
            Welcome back, {userProfile?.firstName}!
          </h1>
          <p className="mt-2 text-gray-600">Manage your appointments and view your medical records</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</p>
                <p className="text-gray-600">Upcoming Appointments</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.filter(apt => apt.prescription).length}
                </p>
                <p className="text-gray-600">Prescriptions</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{pastAppointments.length}</p>
                <p className="text-gray-600">Completed Visits</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Upcoming Appointments</h2>
          {upcomingAppointments.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No upcoming appointments</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                      <User className="h-10 w-10 text-blue-600 bg-blue-100 rounded-full p-2" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Dr. {appointment.doctorName}</h3>
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
                    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(appointment.status)}`}>
                      {appointment.status.replace('-', ' ')}
                    </span>
                  </div>
                  {appointment.note && (
                    <div className="bg-gray-50 rounded p-3 mb-4">
                      <p className="text-sm text-gray-700"><strong>Note:</strong> {appointment.note}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Appointments */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Past Appointments</h2>
          {pastAppointments.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No past appointments</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pastAppointments.map((appointment) => (
                <div key={appointment.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                      <User className="h-10 w-10 text-blue-600 bg-blue-100 rounded-full p-2" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Dr. {appointment.doctorName}</h3>
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
                    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(appointment.status)}`}>
                      {appointment.status.replace('-', ' ')}
                    </span>
                  </div>

                  {/* Prescription Details */}
                  {appointment.prescription && appointment.status === 'completed' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Prescription
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p><strong>Medicine:</strong> {appointment.prescription.medicine}</p>
                          <p><strong>Dosage:</strong> {appointment.prescription.dosage}</p>
                        </div>
                        <div>
                          <p><strong>Frequency:</strong> {appointment.prescription.frequency}</p>
                          <p><strong>Instructions:</strong> {appointment.prescription.instructions}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Feedback Section */}
                  {appointment.status === 'completed' && !appointment.feedback && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-3">Rate Your Experience</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => updateFeedback(appointment.id, 'rating', star)}
                                className={`text-2xl ${
                                  star <= (feedbackData[appointment.id]?.rating || 0)
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                } hover:text-yellow-400 transition-colors`}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Comment (Optional)</label>
                          <textarea
                            value={feedbackData[appointment.id]?.comment || ''}
                            onChange={(e) => updateFeedback(appointment.id, 'comment', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="Share your experience..."
                          />
                        </div>
                        <button
                          onClick={() => handleFeedbackSubmit(appointment.id)}
                          disabled={!feedbackData[appointment.id]?.rating}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Submit Feedback
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Display Existing Feedback */}
                  {appointment.feedback && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <Star className="h-4 w-4 mr-2" />
                        Your Feedback
                      </h4>
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex">
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
                        </div>
                        <span className="text-sm text-gray-600">
                          ({appointment.feedback.rating}/5)
                        </span>
                      </div>
                      {appointment.feedback.comment && (
                        <p className="text-sm text-gray-700">"{appointment.feedback.comment}"</p>
                      )}
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

export default PatientDashboard;