import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import { useNavigate, useLocation } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { Typography, Box, Button } from '@mui/material';
import Navigation from './Navigation';

const isValidEmail = (email) => {
  const pattern = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)*(\.[a-zA-Z]{2,})$/;
  return pattern.test(email);
};

const sanitizeEmail = (email) => {
  const sanitizedEmail = email.replace(/[^\w.-]+@[\w.-]+\.[\w.-]+/gi, '');
  return sanitizedEmail;
};

const EmailConfirmationForm = ({ toggleDarkMode, darkMode }) => {

  // Correo para enviar link de confirmar correo
  const [email, setEmail] = useState('');

  // Validaciones del formulario
  const [emailError, setEmailError] = useState(false);

  // Para mostrar msj de link enviado al correo
  const location = useLocation();

  // Cargando... y Exito!
  const [message, setMessage] = useState(location.state?.message || '');
  const [loading, setLoading] = useState(false);

  // Icono de Error o Exito
  const [alertSeverity, setAlertSeverity] = useState('success');

  // Redirige a /
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError(false);
    setMessage('');
    setLoading(true);

    if (!email) {
      setMessage('El correo electrónico no puede estar vacío.');
      setEmailError(true);
      setAlertSeverity('error');
      setLoading(false);
      return;
    }

    if (!isValidEmail(email)) {
      setMessage('El correo electrónico debe estar en un formato válido y no contener caracteres especiales.');
      setEmailError(true);
      setAlertSeverity('error');
      setLoading(false);
      return;
    }

    const sanitizedEmail = sanitizeEmail(email);

    try {
      setMessage('');
      await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/auth/resend-verify-email`, {
        email: sanitizedEmail,
      });

      setEmail('');
      // Redirección después de reenviar el link para confirmar correo
      navigate('/login', { state: { message: 'Link de confirmación reenviado. Por favor, verifica tu correo electrónico', alertSeverity: 'success' } });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setMessage('Usuario no encontrado o correo electrónico ya verificado.');
        setAlertSeverity('error');
      } else if (error.response.status === 500 && error.response.data.error === 'Error de conexión. Por favor verifica tu conexión a Internet y vuelve a intentarlo.') {
        setMessage('Error de conexión. Por favor verifica tu conexión a Internet y vuelve a intentarlo.');
        setAlertSeverity('error');
      } else {
        setMessage('Error al reenviar el link de confirmación. Por favor, verifica el correo e intenta nuevamente.');
        setAlertSeverity('error');
      }
    } finally {
      setLoading(false);
    }
  };

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
            <Typography variant="h7" component="h1" gutterBottom align="center">Confirmar correo</Typography>
            <form id="emailConfirmationForm" onSubmit={handleSubmit}>
              <Grid item xs={12}>
                <TextField 
                type="email" 
                id="confirm-email" 
                required 
                label="Correo" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                fullWidth 
                error={emailError} 
                InputProps={{
                  className: 'inputs'
                }}
                />
              </Grid>
              <Grid item xs={12}>
                <Box marginBottom={2}>
                  <Button variant="contained" color="primary" type="submit" fullWidth disabled={loading}>
                    {loading ? <CircularProgress color={darkMode ? "primary" : "inherit"} size={20} /> : 'Reenviar link de confirmación'}
                  </Button>
                  {message && (
                    <Alert severity={alertSeverity}>{message}</Alert>
                  )}
                </Box>
              </Grid>
            </form>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
};

export default EmailConfirmationForm;
