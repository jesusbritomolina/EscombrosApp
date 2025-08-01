import React from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = ({ onLogout, updateUserRole }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    updateUserRole('');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  return (
    <button onClick={handleLogout}>
      Cerrar sesión
    </button>
  );
};

export default Logout;
