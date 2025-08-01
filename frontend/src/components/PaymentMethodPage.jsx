import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Button, Grid, Typography } from '@mui/material';
import { TextField, Menu } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Navigation from './Navigation';

const isValidEmail = (email) => {
  if (email === "") {
    return true;  // Correo electrónico vacío se considera válido
  }
  const pattern = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)*(\.[a-zA-Z]{2,})$/;
  
  return pattern.test(email);
};

const sanitizeEmail = (email) => {
  if (email === "") {
    return "";  // Correo electrónico vacío se "sanea" a una cadena vacía
  }
  const sanitizedEmail = email.replace(/[^\w.-]+@[\w.-]+\.[\w.-]+/gi, '');
  return sanitizedEmail;
};

const AuthWrapper = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(null);
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserRole = localStorage.getItem('userRole');

    // Si el token es nulo o el usuario no es propietario, administrador o trabajador, no está autenticado
    if (!token || (storedUserRole !== 'Propietario' && storedUserRole !== 'Administrador' && storedUserRole !== 'Trabajador')) {
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
    }
  }, []);

  // Navegar basado en el estado de autenticación
  useEffect(() => {
    if (isAuthenticated === false) {
      // Borrar la información de sesión
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      
      // Redirigir al inicio de sesión
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Mientras que la autenticación está siendo comprobada, renderiza null
  if (isAuthenticated === null) {
    return null;
  }

  // Si está autenticado, renderiza UserManagement
  if (isAuthenticated === true) {
    return (
      <PaymentMethodPage
        userRole={userRole}
        updateUserRole={updateUserRole}
        toggleDarkMode={toggleDarkMode}
        darkMode={darkMode}
        loggedInUser={loggedInUser}
        updateLoggedInUsername={setLoggedInUser}
        isAuthenticated={isAuthenticated}
      />
    );
  }
};

const PaymentMethodPage = ({ userRole, toggleDarkMode, darkMode, loggedInUser, isAuthenticated }) => {

  // Correo del banco
  const [bankEmail, setBankEmail] = useState('');

  // Validaciones del formulario
  const [emailError, setEmailError] = useState(false);

  // Cargando... y Exito!
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Icono de Error o Exito
  const [alertSeverity, setAlertSeverity] = useState('success');

  const updateUserRole = useCallback((newRole) => {
    localStorage.setItem('userRole', newRole);
  }, []);

  useEffect(() => {
    const storedUserRole = localStorage.getItem('userRole');
    if (storedUserRole && storedUserRole !== userRole) {
      updateUserRole(storedUserRole);
    }
  }, [userRole, updateUserRole]);

  useEffect(() => {
    const fetchBankEmail = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/workers/bankEmail`, { 
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (response.status === 200) {
          setBankEmail(response.data.bankEmail);
          setIsDataLoaded(true);
        } else {
          console.error('Error al obtener el correo del banco');
        }
      } catch (error) {
        console.error('Error al obtener el correo del banco:', error);
      }
    };
  
    fetchBankEmail();
  }, []);  

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setEmailError(false);
    setAlertSeverity('success');
    setLoading(true);

    if (!isValidEmail(bankEmail)) {
      if (bankEmail !== "") {
        // Solo mostrar mensaje de error si el correo electrónico no es válido y no es una cadena vacía
        setMessage('El correo electrónico debe estar en un formato válido y no contener caracteres especiales.');
        setEmailError(true);
        setAlertSeverity('error');
      }
      setLoading(false);
      return;
    }
  
    const sanitizedEmail = sanitizeEmail(bankEmail);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${import.meta.env.VITE_APP_API_URL}/api/workers/bankEmail`, 
      { bankEmail: sanitizedEmail },
      { 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (response.status === 200) {
        setMessage('Correo del banco actualizado con éxito');
        setBankEmail(sanitizedEmail);  // Actualizar el correo del banco en el estado local
      } else {
        setMessage('Error al actualizar el correo del banco');
      }
    } catch (error) {
      console.error('Error al actualizar el correo del banco:', error);
      setMessage('Error al actualizar el correo del banco');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timer;
    // Verificamos que tanto alertSeverity sea 'success' como que message no esté vacío.
    if (alertSeverity === 'success' && message !== '') {
      timer = setTimeout(() => {
        setMessage(''); // Esto hará que la alerta desaparezca.
      }, 2000); // Se va a esperar 2 segundos (2000 milisegundos).
    }
    // Esto se llama cuando el componente se desmonta o cuando alguna de las dependencias cambia.
    // Va a limpiar el temporizador para prevenir errores.
    return () => {
      clearTimeout(timer);
    }
  }, [message, alertSeverity]);

  // Muestra barra de navegación mientras esperamos que carguen los datos
  if (!isDataLoaded) {
    return (
      <div>
        <Navigation 
          toggleDarkMode={toggleDarkMode} 
          darkMode={darkMode} 
          isAuthenticated={isAuthenticated} 
          userRole={userRole}
          loggedInUser={loggedInUser}
        />
      </div>
    );
  }

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
                    <Typography variant="h7" component="h1" gutterBottom align="center">Método de pago</Typography>
                    <form id="updateBankEmailForm" onSubmit={handleSubmit}>
                        <Grid item xs={12}>
                          <TextField 
                            type="email" 
                            id="bankEmail" 
                            label="Ingrese su correo del banco" 
                            value={bankEmail} 
                            onChange={(event) => setBankEmail(event.target.value)}
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

export default AuthWrapper;
