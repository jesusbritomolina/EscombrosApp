import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Button, CircularProgress, Grid, Modal, Paper, Select, MenuItem, Table, TableBody, TableCell, Typography } from '@mui/material';
import { TableContainer, TableHead, TableRow, TextField, InputLabel, FormControl, TablePagination, TableFooter, Alert, IconButton } from '@mui/material';
import TablePaginationActions from './TablePaginationActions';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from "@mui/icons-material/Check";
import Navigation from './Navigation';

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

    // Si el token es nulo o el usuario no es propietario, no está autenticado
    if (!token || storedUserRole !== 'Propietario') {
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
      <UserManagement
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

const UserManagement = ({ userRole, toggleDarkMode, darkMode, loggedInUser, isAuthenticated }) => {
  const navigate = useNavigate();

  // Datos de los usuarios
  const [users, setUsers] = useState([]);

  // Búsqueda
  const [search, setSearch] = useState('');

  // Filtra los registros antes de renderizarlos en la tabla
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Editar usuario
  const [currentUser, setCurrentUser] = useState(null);
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState('');
  
  // Cargando... y Exito!
  const [loading, setLoading] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [message] = useState('');

  // Paginación
  const [activePage, setActivePage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showAllUsers, setShowAllUsers] = useState(false);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      const storedUserRole = localStorage.getItem('userRole');

      // Check if the token is null
      if (!token) {
        alert('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/', { replace: true });
        return;
      }
      
      // Check if the user is not an owner
      if (storedUserRole !== 'Propietario') {
        alert('No tienes los permisos necesarios para realizar esta acción.');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/', { replace: true });
        return;
      }

      // Proceed with the API call
      try {
        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/owners`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          setUsers(response.data);
          setIsDataLoaded(true);
        } else {
          console.error('Error al obtener los usuarios');
        }
      } catch (error) {
        if (error.response) {
          if (error.response.status === 401) {
            alert('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            navigate('/', { replace: true });
            return;
          } else if (error.response.status === 404) {
            alert('No hay datos registrados');
          }
        } else {
          console.error('Error al obtener los usuarios:', error);
        }
      }
    };

    fetchUsers();
  }, [userRole, navigate]);

  useEffect(() => {
    setFilteredUsers(
      users.filter((user) =>
        search === ''
          ? true
          : user.id.toString().includes(search) ||
            user.username.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase()) ||
            user.rol.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, users]);

  // Restablecer la página activa a 1 si se realiza una búsqueda y la página activa no es 1
  useEffect(() => {
    if (search !== '' && activePage !== 1) {
      setActivePage(1);
    }
  }, [search, activePage]);

  const handleEdit = (user) => {
    setCurrentUser(user);
    setUserId(user.id);
    setUsername(user.username);
    setEmail(user.email);
    setRol(user.rol);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!username || !email || !rol) {
      alert('Todos los campos son obligatorios');
      return;
    }

    if (!isValidUsername(username)) {
      alert('El nombre de usuario debe tener entre 3 y 30 caracteres y solo puede contener letras y números.');
      return;
    }
  
    if (!isValidEmail(email)) {
      alert('El correo electrónico debe estar en un formato válido y no contener caracteres especiales.');
      return;
    }

    const sanitizedEmail = sanitizeEmail(email);

    const confirmUpdate = window.confirm('¿Está seguro de que desea actualizar este usuario?');
    if (!confirmUpdate) {
      return;
    }

    setLoading(true);
  
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${import.meta.env.VITE_APP_API_URL}/api/owners/update/${userId}`, {
        id: userId,
        username,
        email: sanitizedEmail,
        rol,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (response.status === 200) {
        setUsers(
          users.map((user) => (user.id === currentUser.id ? { ...currentUser, ...response.data.user } : user))
        );
        setCurrentUser(null);
        setUserId('');
        setUsername('');
        setEmail('');
        setRol('');
        setNotificationMessage('Usuario actualizado con éxito');
        setTimeout(() => setNotificationMessage(null), 1000);
      } else {
        console.error('Error al actualizar el usuario');
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          alert('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          localStorage.removeItem('username');
          navigate('/', { replace: true });
        } else if (error.response.status === 400) {
          alert('Usuario o Correo ya existe.');
        } else {
          console.error('Error al actualizar el usuario:', error);
        }
      } else {
        console.error('Error al actualizar el usuario:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {

    if (userId === 1 || userId === 2) {
      alert('No se puede eliminar los dos primeros propietarios');
      return;
    }

    const confirmDelete = window.confirm('¿Está seguro de que desea eliminar este usuario?');
    if (!confirmDelete) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${import.meta.env.VITE_APP_API_URL}/api/owners/delete/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (response.status === 200) {
        setUsers(users.filter((user) => user.id !== userId));
        setNotificationMessage('Usuario eliminado con éxito');
        setTimeout(() => setNotificationMessage(null), 1000);
      } else {
        console.error('Error al eliminar el usuario');
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/', { replace: true });
      } else {
        console.error('Error al eliminar el usuario:', error);
      }
    } finally {
      setLoading(false);
    }
  };  

  const handleCancel = () => {
    setCurrentUser(null);
    setUserId('');
    setUsername('');
    setEmail('');
    setRol('');
  };

  const paginate = (items, currentPage, itemsPerPage, showAll) => {
    if (showAll) {
      return items;
    } else {
      const startIndex = (currentPage - 1) * itemsPerPage;
      return items.slice(startIndex, startIndex + itemsPerPage);
    }
  };

  const displayedUsers = paginate(filteredUsers, activePage, itemsPerPage, showAllUsers);

  const handleKeyDown = (event, formType) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (formType === 'user') {
        handleSubmit(event);
      } 
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    handleCancel();
  };

  //Modal.setAppElement('#root');
  
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
          <Grid item xs={12} md={6} style={{textAlign: "center", maxWidth: "100%", margin: "0 auto", flexBasis: "100%"}}>
            <Typography variant="h7" component="h1" gutterBottom align="center" style={{ marginBottom: '11.20px' }}>Gestión de usuarios</Typography>
  
            {loading && (
              <Box className="modal" style={{ position: 'fixed', zIndex: 9999 }}>
                <CircularProgress />
              </Box>
            )}

            {notificationMessage && (
              <Box className="modal">
                <Alert severity={message && message.startsWith('Error') ? 'error' : 'success'}>{notificationMessage}</Alert>
              </Box>
            )}
  
            <Box component="div" className="input-container-buscador" style={{ position: 'relative' }}>
              <TextField
                type="text"
                placeholder="🔍ID, Usuario, Correo o Rol"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  style: {
                    width: '210px',
                    maxHeight: '40px',
                    fontSize: '14px',
                  },
                  className: 'buscador'
                }}
              />
              {search && (
                <IconButton 
                  title="Borrar"
                  onClick={() => setSearch('')}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '10px',
                    transform: 'translateY(-50%)',
                  }}
                >
                  <CloseIcon />
                </IconButton>
              )}
            </Box>
  
            <TableContainer component={Paper}>
              <Table className="centered-table">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Usuario</TableCell>
                    <TableCell>Correo</TableCell>
                    <TableCell>Rol</TableCell>
                    <TableCell>Opcs</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.isArray(displayedUsers) && displayedUsers.map((user, index) => {
                    return (
                      <TableRow key={index}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.rol}</TableCell>
                        <TableCell>
                          <Box display="flex" flexDirection="row" justifyContent="center">
                            <Button title="Editar usuario" className='button-table' onClick={() => handleEdit(user)}>✏️</Button>
                            <Button title="Eliminar usuario" className='button-table' onClick={() => handleDelete(user.id)}>🗑️</Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      ActionsComponent={TablePaginationActions}
                      count={filteredUsers.length}
                      page={activePage - 1}
                      onPageChange={(event, newPage) => setActivePage(newPage + 1)}
                      rowsPerPage={itemsPerPage}
                      onRowsPerPageChange={(event) => {
                        const newValue = parseInt(event.target.value, 10);
                        if (newValue === -1) {
                          setShowAllUsers(true);
                        } else {
                          setShowAllUsers(false);
                          setItemsPerPage(newValue);
                        }
                      }}
                      rowsPerPageOptions={[5, 10, 15, 20, 25, { label: 'Todo', value: -1 }]}
                      labelRowsPerPage="N° Filas"
                      labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>

            {currentUser && (
              <Modal
                open={isModalOpen}
                onClose={closeModal}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'fixed',
                  top: '0',
                  bottom: '0',
                  left: '0',
                  right: '0',
                }}
              >
                <Box 
                  className="form-container"
                  style={{
                    border: '1px solid rgb(204, 204, 204)',
                    background: 'rgb(255, 255, 255)',
                    overflow: 'auto',
                    outline: 'none',
                    padding: '20px',
                    width: '65%',
                    height: '65%',
                    backgroundColor: 'white',
                    margin: 'auto',
                  }}
                >
                  <form onSubmit={handleSubmit} onKeyDown={(event) => handleKeyDown(event, 'user')}>
                    <Typography 
                      variant="h5" 
                      component="h2"
                      sx={{ marginBlockEnd: '10px' }}
                    >
                      Editar usuario
                    </Typography>

                    {message && <Alert severity="error">{message}</Alert>}

                    <TextField
                      label="ID"
                      value={userId}
                      InputLabelProps={{
                        className: 'labels'
                      }}
                      InputProps={{
                        readOnly: true,
                        className: 'textfields-readonly'
                      }}
                      style={{
                      backgroundColor: darkMode ? undefined : 'lightgray',
                      marginBottom: '10px',
                      }}
                    />
                    <br />
                    <TextField
                      label="Usuario"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      InputLabelProps={{
                        className: 'labels'
                      }}
                      InputProps={{
                        className: 'textfields'
                      }}
                      style={{
                      marginBottom: '10px',
                      }}
                    />
                    <br />
                    <TextField
                      label="Correo"
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      InputLabelProps={{
                        className: 'labels'
                      }}
                      InputProps={{
                        className: 'textfields'
                      }}
                      style={{
                      marginBottom: '10px',
                      }}
                    />
                    <br />
                    <FormControl style={{ marginBottom: '10px', width: '100%' }}>
                      <InputLabel id="rol-label" className="labels" style={{ marginBottom: '10px' }}>Rol</InputLabel>
                      <Select
                        labelId="rol-label"
                        id="rol"
                        value={rol}
                        onChange={(e) => setRol(e.target.value)}
                        className='select'
                      >
                        <MenuItem value="" disabled>
                          <em>Selecciona un rol</em>
                        </MenuItem>
                        <MenuItem value="Propietario">Propietario</MenuItem>
                        <MenuItem value="Administrador">Administrador</MenuItem>
                        <MenuItem value="Trabajador">Trabajador</MenuItem>
                      </Select>
                    </FormControl>
                    <br />
                    <Button startIcon={<CloseIcon />} title="Cancelar" type="button" variant="contained" color="secondary" onClick={closeModal}></Button>
                    <Button startIcon={<CheckIcon />} title="Guardar" type="submit" variant="contained" color="primary"></Button>
                  </form>
                </Box>
              </Modal>
            )}
          </Grid>
        </Grid>
      </Box>
    </div>
  );
};

export default AuthWrapper;
