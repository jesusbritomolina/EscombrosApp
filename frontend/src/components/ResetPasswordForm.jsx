import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import { useNavigate } from 'react-router-dom';
import { Typography, Box, Button } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Navigation from './Navigation';

const isValidPassword = (password) => {
  const pattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,64}$/;
  return pattern.test(password);
};

const ResetPasswordForm = ({ toggleDarkMode, darkMode }) => {

  // Nueva contraseña
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Cargando... y Exito!
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Obtén los parámetros de consulta del URL
  const query = new URLSearchParams(location.search);
  
  // Extrae el token del parámetro de consulta
  const token = query.get('token');

  // Redirige a /login
  const navigate = useNavigate();

  // Validaciones del formulario
  const [passwordError, setPasswordError] = useState(false);

  // Icono de Error o Exito
  const [alertSeverity, setAlertSeverity] = useState('success');

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
    setPasswordError(false);
    setMessage('');
    setLoading(true);

    if (!isValidPassword(password)) {
      setMessage('La contraseña debe tener entre 6 y 64 caracteres, incluir al menos una letra mayúscula, una letra minúscula, un número y un carácter especial (@$!%*#?&).');
      setPasswordError(true);
      setAlertSeverity('error');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Las contraseñas no coinciden.');
      setPasswordError(true);
      setAlertSeverity('error');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.put(`${import.meta.env.VITE_APP_API_URL}/api/auth/reset-password`, {
        token,
        newPassword: password
      });

      if (response.status === 200) {
        setPassword('');
        setConfirmPassword('');
        // Redirección después de actualizar contraseña
        navigate('/login', { state: { message: 'Contraseña actualizada con éxito', alertSeverity: 'success' } });
      } else {
        throw new Error('No se pudo actualizar la contraseña');
      }
    } catch (error) {
      console.error(error);
      setMessage('Hubo un error al intentar actualizar la contraseña');
      setAlertSeverity('error');
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
                <Typography variant="h7" component="h1" gutterBottom align="center">Actualizar contraseña</Typography>
                <form id="updatePasswordForm" onSubmit={handleSubmit}>
                  <Grid item xs={12}>
                    <TextField 
                      type="password" 
                      id="password" 
                      required 
                      label="Ingrese su nueva contraseña" 
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
                      id="confirmPassword" 
                      required 
                      label="Confirmar nueva contraseña" 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                        {loading ? <CircularProgress color={darkMode ? "primary" : "inherit"} size={20} /> : 'Actualizar'}
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

export default ResetPasswordForm;
