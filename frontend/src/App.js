import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import InteractiveBackground from './components/InteractiveBackground';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import PatientProfile from './pages/PatientProfile';
import FindTherapist from './pages/FindTherapist';
import BookAppointment from './pages/BookAppointment';
import SupportGroups from './pages/SupportGroups';
import MedicalHistory from './pages/MedicalHistory';
import Assessments from './pages/Assessments';
import AssessmentQuiz from './pages/AssessmentQuiz';
import Games from './pages/Games';
import GameDetail from './pages/GameDetail';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorProfile from './pages/DoctorProfile';
import DoctorAppointments from './pages/DoctorAppointments';
import DoctorPatients from './pages/DoctorPatients';
import DoctorSchedule from './pages/DoctorSchedule';
import DoctorEarnings from './pages/DoctorEarnings';
import DoctorPublicProfile from './pages/DoctorPublicProfile';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminDoctors from './pages/AdminDoctors';
import AdminPatients from './pages/AdminPatients';
import AdminAppointments from './pages/AdminAppointments';
import AdminSalary from './pages/AdminSalary';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <InteractiveBackground />
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Patient Routes */}
              <Route
                path="/patient/dashboard"
                element={
                  <PrivateRoute allowedRoles={['patient']}>
                    <PatientDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/patient/profile"
                element={
                  <PrivateRoute allowedRoles={['patient']}>
                    <PatientProfile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/doctors"
                element={
                  <PrivateRoute allowedRoles={['patient']}>
                    <FindTherapist />
                  </PrivateRoute>
                }
              />
              <Route
                path="/doctors/:id"
                element={
                  <PrivateRoute allowedRoles={['patient']}>
                    <DoctorPublicProfile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/appointments/new"
                element={
                  <PrivateRoute allowedRoles={['patient']}>
                    <BookAppointment />
                  </PrivateRoute>
                }
              />
              <Route
                path="/support-groups"
                element={
                  <PrivateRoute allowedRoles={['patient']}>
                    <SupportGroups />
                  </PrivateRoute>
                }
              />
              <Route
                path="/medical-history"
                element={
                  <PrivateRoute allowedRoles={['patient']}>
                    <MedicalHistory />
                  </PrivateRoute>
                }
              />
              <Route
                path="/assessments"
                element={
                  <PrivateRoute allowedRoles={['patient']}>
                    <Assessments />
                  </PrivateRoute>
                }
              />
              <Route
                path="/assessments/:id"
                element={
                  <PrivateRoute allowedRoles={['patient']}>
                    <AssessmentQuiz />
                  </PrivateRoute>
                }
              />
              <Route
                path="/games"
                element={
                  <PrivateRoute allowedRoles={['patient', 'doctor']}>
                    <Games />
                  </PrivateRoute>
                }
              />
              <Route
                path="/games/:id"
                element={
                  <PrivateRoute allowedRoles={['patient', 'doctor']}>
                    <GameDetail />
                  </PrivateRoute>
                }
              />

              {/* Doctor Routes */}
              <Route
                path="/doctor/dashboard"
                element={
                  <PrivateRoute allowedRoles={['doctor']}>
                    <DoctorDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/doctor/profile"
                element={
                  <PrivateRoute allowedRoles={['doctor']}>
                    <DoctorProfile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/doctor/appointments"
                element={
                  <PrivateRoute allowedRoles={['doctor']}>
                    <DoctorAppointments />
                  </PrivateRoute>
                }
              />
              <Route
                path="/doctor/patients"
                element={
                  <PrivateRoute allowedRoles={['doctor']}>
                    <DoctorPatients />
                  </PrivateRoute>
                }
              />
              <Route
                path="/doctor/schedule"
                element={
                  <PrivateRoute allowedRoles={['doctor']}>
                    <DoctorSchedule />
                  </PrivateRoute>
                }
              />
              <Route
                path="/doctor/earnings"
                element={
                  <PrivateRoute allowedRoles={['doctor']}>
                    <DoctorEarnings />
                  </PrivateRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <AdminUsers />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/doctors"
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <AdminDoctors />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/patients"
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <AdminPatients />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/appointments"
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <AdminAppointments />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/salary"
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <AdminSalary />
                  </PrivateRoute>
                }
              />

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
