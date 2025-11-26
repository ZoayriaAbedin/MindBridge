import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import FindTherapist from './pages/FindTherapist';
import BookAppointment from './pages/BookAppointment';
import SupportGroups from './pages/SupportGroups';
import MedicalHistory from './pages/MedicalHistory';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorProfile from './pages/DoctorProfile';
import DoctorAppointments from './pages/DoctorAppointments';
import DoctorEarnings from './pages/DoctorEarnings';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminDoctors from './pages/AdminDoctors';
import AdminAppointments from './pages/AdminAppointments';
import AdminSalary from './pages/AdminSalary';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
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
                path="/doctors"
                element={
                  <PrivateRoute allowedRoles={['patient']}>
                    <FindTherapist />
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
