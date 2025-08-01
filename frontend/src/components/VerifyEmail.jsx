import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import Grid from '@mui/material/Grid';
import { Typography, Box } from '@mui/material';
import Navigation from './Navigation';

const VerifyEmail = ({ toggleDarkMode, darkMode }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Parámetros para la barra de navegación
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const userRole = localStorage.getItem('userRole') || '';
  const loggedInUser = localStorage.getItem('username') || '';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserRole = localStorage.getItem('userRole');

    if (!token || (storedUserRole !== 'Propietario' && storedUserRole !== 'Administrador' && storedUserRole !== 'Trabajador')) {
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    // Obtén los parámetros de consulta del URL
    const query = new URLSearchParams(location.search);
    
    // Extrae el token del parámetro de consulta
    const token = query.get('token');

    const verifyEmail = async () => {
      try {
        await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/auth/verify-email`, null, { params: { token } });
  
        navigate('/login', { state: { message: 'Correo electrónico verificado con éxito', alertSeverity: 'success' } });
      } catch (error) {
        console.error('Error verifying email:', error);
        navigate('/login', { state: { message: 'Error al verificar el correo electrónico', alertSeverity: 'error' } });
      }
    };
  
    if (token) {
      verifyEmail();
    }
  }, [navigate, location]);

  return (
    <div>
      <Navigation 
        toggleDarkMode={toggleDarkMode} 
        darkMode={darkMode} 
        isAuthenticated={isAuthenticated} 
        userRole={userRole}
        loggedInUser={loggedInUser}
      />
      <Box m={4}>
        <Grid container>
          <Grid item xs={12} sm={6} style={{textAlign: "center", maxWidth: "1200px", margin: "0 auto"}}>
            <Typography variant="h7" component="h1" gutterBottom align="center">
              Verificando correo electrónico...
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </div>
  );  
};

export default VerifyEmail;
