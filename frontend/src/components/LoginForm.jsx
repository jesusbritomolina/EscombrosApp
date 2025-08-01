import React, { useEffect, useState } from 'react';
import { Typography, Box, Button } from '@mui/material';
import axios from 'axios';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import ForgotPasswordForm from './ForgotPasswordForm';
import Navigation from './Navigation';
import { getCorrectRole, NEW_ROLES } from '../utils/roleMapping';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const LoginForm = ({ updateUserRole, toggleDarkMode, darkMode }) => {

  const navigate = useNavigate();
  const location = useLocation();

  // Login
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');

  // Msj de validacion y cargando...
  const [message, setMessage] = useState(location.state?.message || '');
  const [alertSeverity, setAlertSeverity] = useState(location.state?.alertSeverity || 'success');
  const [loading, setLoading] = useState(false);

  // Redirige a Recuperar contraseña
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Msj correo verificado
  const [submitted, setSubmitted] = useState(false);
  let query = useQuery();

  // Parámetros para la barra de navegación
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const userRole = localStorage.getItem('userRole') || '';
  const loggedInUser = localStorage.getItem('username') || '';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserRole = localStorage.getItem('userRole');

    if (!token || !storedUserRole) {
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
    }
  }, []);

  const resetForm = () => {
    setUsernameOrEmail('');
    setPassword('');
  };

  useEffect(() => {
    if (query.get('emailVerified') && !submitted) {
      setMessage('Correo electrónico verificado con éxito');
      setAlertSeverity('success');
    }
  }, [query, submitted]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitted(true);
  
    if (!usernameOrEmail || !password) {
      setMessage('El correo o usuario y la contraseña no pueden estar vacíos.');
      setAlertSeverity('error');
      resetForm();
      setLoading(false);
      return false;
    }
  
    grecaptcha.ready(async () => {
      try {
        const captchaToken = await grecaptcha.execute(import.meta.env.VITE_RECAPTCHA_SITE_KEY, { action: 'login' });
  
        const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/auth/login`, {
          usernameOrEmail: usernameOrEmail,
          password: password,
          captcha: captchaToken
        });
  
        const token = response.data.token;
        const rol = response.data.rol;
        const username = response.data.username;
        const correctRole = getCorrectRole(rol);
    
        localStorage.setItem('token', token);
        updateUserRole(correctRole);
        localStorage.setItem('userRole', correctRole);
        localStorage.setItem('username', username);
    
        setMessage('Inicio de sesión exitoso');
        setAlertSeverity('success');
        setTimeout(() => {
          setMessage('');
        }, 3000);
        resetForm();
    
        setTimeout(() => {
          const correctRole = getCorrectRole(rol);
          if (correctRole === NEW_ROLES.TRANSPORTISTA) {
            navigate('/worker-dashboard');
          } else if (correctRole === NEW_ROLES.ADMINISTRADOR) {
            navigate('/admin-dashboard');
          } else if (correctRole === NEW_ROLES.CLIENTE) {
            navigate('/owner-dashboard');
          } else {
            setMessage('Error al redirigir. Rol desconocido.');
            setAlertSeverity('error');
          }
        }, 500);
    
      } catch (error) {
        resetForm();
        if (error.response) {
          switch (error.response.status) {
            case 401:
              setMessage('Usuario/Correo o contraseña incorrectos.');
              setAlertSeverity('error');
              break;
            case 403:
              navigate('/confirm-email');
              break;
            default:
              setMessage('Error al iniciar sesión. Por favor, verifica tus credenciales e intenta nuevamente.');
              console.log(error);
              setAlertSeverity('error');
          }
        } else {
          setMessage('Error al iniciar sesión. Por favor, verifica tus credenciales e intenta nuevamente.');
          console.log(error);
          setAlertSeverity('error');
        }
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
            <Typography variant="h7" component="h1" gutterBottom align="center">Iniciar sesión</Typography>
            <form id="loginForm" onSubmit={handleSubmit}>
              <Grid item xs={12}>
                <TextField
                  type="text"
                  id="login-usernameOrEmail"
                  required
                  label="Usuario/Correo"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  fullWidth
                  InputProps={{
                    className: 'inputs'
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  type="password"
                  id="login-password"
                  required
                  label="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  InputProps={{
                    className: 'inputs'
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Box marginBottom={2}>
                  <Button variant="contained" color="primary" type="submit" fullWidth disabled={loading}>
                    {loading ? <CircularProgress color={darkMode ? "primary" : "inherit"} size={20} /> : 'Iniciar sesión'}
                  </Button>
                  <Link
                    to="/forgot"
                    className="forgot-password"
                    style={{ color: 'rgb(43, 153, 216)' }}
                    onClick={() => setShowForgotPassword(true)}
                  >
                    ¿Has olvidado tu contraseña?
                  </Link>
                  {message && (
                    <Alert severity={alertSeverity}>{message}</Alert>
                  )}
                </Box>
              </Grid>
            </form>
            {showForgotPassword && <ForgotPasswordForm />}
          </Grid>
        </Grid>
      </Box>
    </div>
  );
};

export default LoginForm;
