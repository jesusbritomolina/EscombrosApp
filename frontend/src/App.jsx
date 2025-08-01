import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import React, { useEffect, useState } from "react";
import './App.css';
import Home from "./components/Home";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import WorkerDashboard from './components/WorkerDashboard';
import UserManagement from './components/UserManagement';
import AdminDashboard from './components/AdminDashboard';
import EmailConfirmation from './components/EmailConfirmation'
import ForgotPasswordForm from './components/ForgotPasswordForm';
import ResetPasswordForm from './components/ResetPasswordForm';
import VerifyEmail from './components/VerifyEmail';
import PaymentMethodPage from './components/PaymentMethodPage';
import ServiceRequest from './components/ServiceRequest';

function App() {
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || '');
  const [darkMode, setDarkMode] = useState(JSON.parse(localStorage.getItem('darkMode')) || false);
  const [loggedInUser, setLoggedInUser] = useState(localStorage.getItem('username') || '');

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername && storedUsername !== loggedInUser) {
      setLoggedInUser(storedUsername);
    }
  }, [loggedInUser]);

  const updateUserRole = (newRole) => {
    setUserRole(newRole);
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
  };

  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : 'light-mode';
  }, [darkMode]);

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route
            exact path="/"
            element={
              <Home 
                updateUserRole={updateUserRole} 
                toggleDarkMode={toggleDarkMode} 
                darkMode={darkMode} 
              />
            }
          />
          <Route
            path="/register"
            element={
              <RegisterForm 
                toggleDarkMode={toggleDarkMode} 
                darkMode={darkMode} 
              />
            }
          />
          <Route
            path="/confirm-email"
            element={
              <EmailConfirmation 
                toggleDarkMode={toggleDarkMode} 
                darkMode={darkMode} 
              />
            }
          />
          <Route
            path="/verify-email"
            element={
              <VerifyEmail 
                toggleDarkMode={toggleDarkMode} 
                darkMode={darkMode} 
              />
            }
          />
          <Route
            path="/login"
            element={
              <LoginForm 
                userRole={userRole} 
                updateUserRole={updateUserRole} 
                toggleDarkMode={toggleDarkMode} 
                darkMode={darkMode} 
              />
            }
          />
          <Route
            path="/forgot"
            element={
              <ForgotPasswordForm 
                toggleDarkMode={toggleDarkMode} 
                darkMode={darkMode} 
              />
            }
          />
          <Route
            path="/reset-password"
            element={
              <ResetPasswordForm 
                toggleDarkMode={toggleDarkMode} 
                darkMode={darkMode} 
              />
            }
          />
          <Route
            path="/worker-dashboard"
            element={
              <WorkerDashboard 
                userRole={userRole} 
                updateUserRole={updateUserRole} 
                toggleDarkMode={toggleDarkMode} 
                darkMode={darkMode} 
                loggedInUser={loggedInUser} 
                updateLoggedInUsername={setLoggedInUser}
              />
            }
          />
          <Route
            path="/owner-dashboard"
            element={
              <UserManagement 
                userRole={userRole} 
                updateUserRole={updateUserRole} 
                toggleDarkMode={toggleDarkMode} 
                darkMode={darkMode} 
                loggedInUser={loggedInUser} 
                updateLoggedInUsername={setLoggedInUser}
              />
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <AdminDashboard 
                userRole={userRole} 
                updateUserRole={updateUserRole} 
                toggleDarkMode={toggleDarkMode} 
                darkMode={darkMode} 
                loggedInUser={loggedInUser} 
                updateLoggedInUsername={setLoggedInUser}
              />
            }
          />
          <Route
            path="/payment-method"
            element={
              <PaymentMethodPage 
                userRole={userRole} 
                updateUserRole={updateUserRole} 
                toggleDarkMode={toggleDarkMode} 
                darkMode={darkMode} 
                loggedInUser={loggedInUser} 
                updateLoggedInUsername={setLoggedInUser}
              />
            }
          />
          <Route
            path="/service-request"
            element={
              <ServiceRequest 
                toggleDarkMode={toggleDarkMode} 
                darkMode={darkMode} 
              />
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
