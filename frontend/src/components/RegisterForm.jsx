import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Box, Button } from '@mui/material';
import axios from 'axios';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Navigation from './Navigation';

const isValidPassword = (password) => {
  const pattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,64}$/;
  return pattern.test(password);
};

const isValidUsername = (username) => {
  const pattern = /^[A-Za-z0-9\sÁÉÍÓÚáéíóúÑñ]{3,30}$/;
  return pattern.test(username);
};

const isValidEmail = (email) => {
  const pattern = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)*(\.[a-zA-Z]{2,})$/;
  return pattern.test(email);
};

const sanitizeEmail = (email) => {
  const sanitizedEmail = email.replace(/[^\w.-]+@[\w.-]+\.[\w.-]+/gi, '');
  return sanitizedEmail;
};

const RegisterForm = ({ toggleDarkMode, darkMode }) => {

  // Formulario
  const [email, setEmail] = useState('');
  const [emailConfirmation, setEmailConfirmation] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [username, setUsername] = useState('');

  // Validaciones del formulario
  const [usernameError, setUsernameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  // Cargando... y Exito!
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Icono de Error o Exito
  const [alertSeverity, setAlertSeverity] = useState('success');

  // Redirige a /login
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
    setMessage('');
    setUsernameError(false);
    setEmailError(false);
    setPasswordError(false);
    setAlertSeverity('success');
    setLoading(true);

    if (!isValidPassword(password)) {
      setMessage('La contraseña debe tener entre 6 y 64 caracteres, incluir al menos una letra mayúscula, una letra minúscula, un número y un carácter especial (@$!%*#?&).');
      setPasswordError(true);
      setAlertSeverity('error');
      setLoading(false);
      return;
    }

    if (password !== passwordConfirmation) {
      setMessage('Las contraseñas no coinciden.');
      setPasswordError(true);
      setAlertSeverity('error');
      setLoading(false);
      return;
    }

    if (!isValidUsername(username)) {
      setMessage('El nombre de usuario debe tener entre 3 y 30 caracteres y solo puede contener letras y números.');
      setUsernameError(true);
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

    if (email !== emailConfirmation) {
      setMessage('Los correos electrónicos no coinciden.');
      setEmailError(true);
      setAlertSeverity('error');
      setLoading(false);
      return;
    }

    const sanitizedEmail = sanitizeEmail(email);
    const rol = 'Trabajador';

    grecaptcha.ready(async () => {
      try {
        const captchaToken = await grecaptcha.execute(import.meta.env.VITE_RECAPTCHA_SITE_KEY, { action: 'register' });
        setMessage('');
        await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/auth/register`, {
          email: sanitizedEmail,
          password,
          username,
          rol,
          captcha: captchaToken
        });
        setEmail('');
        setEmailConfirmation('');
        setPassword('');
        setPasswordConfirmation('');
        setUsername('');

        // Redirección después de un registro exitoso
        navigate('/confirm-email', { state: { message: 'Registro exitoso. Verifique su correo, sino llegó, reenvie el link ingresando su correo nuevamente', alertSeverity: 'success' } });
      } catch (err) {
        if (err.response && err.response.status === 400) {
          setMessage(err.response.data.error);
          setUsernameError(true);
          setAlertSeverity('error');
          return;
        } else {
          setMessage('Error al registrar el usuario. Intente nuevamente.');
          setAlertSeverity('error');
        }
      } finally {
        setLoading(false);
      }
    });
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
          <Grid item xs={12} sm={6} text-align="center" max-width="1200px" margin="0 auto">  
            <Typography variant="h7" component="h1" gutterBottom align="center">Registro</Typography>
            <form id="registerForm" onSubmit={handleSubmit}>
              <Grid item xs={12}>
                <TextField
                  type="text"
                  id="register-username"
                  required
                  label="Usuario (Nombre y Apellido)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  fullWidth
                  error={usernameError}
                  InputProps={{
                    className: 'inputs'
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  type="email"
                  id="register-email"
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
                <TextField
                  type="email"
                  id="register-emailConfirmation"
                  required
                  label="Confirmar correo"
                  value={emailConfirmation}
                  onChange={(e) => setEmailConfirmation(e.target.value)}
                  fullWidth
                  error={emailError}
                  InputProps={{
                    className: 'inputs'
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  type="password"
                  id="register-password"
                  required
                  label="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  error={passwordError}
                  InputProps={{
                    className: 'inputs'
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  type="password"
                  id="register-passwordConfirmation"
                  required
                  label="Confirmar contraseña"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  fullWidth
                  error={passwordError}
                  InputProps={{
                    className: 'inputs'
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Box marginBottom={2}>
                  <Button variant="contained" color="primary" type="submit" fullWidth disabled={loading}>
                    {loading ? <CircularProgress color={darkMode ? "primary" : "inherit"} size={20} /> : 'Registrarse'}
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

export default RegisterForm;
