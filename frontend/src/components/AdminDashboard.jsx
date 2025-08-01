import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress, Grid, Modal, Paper, Select, MenuItem, Table, TableBody, TableCell, Typography, InputAdornment } from '@mui/material';
import { TableContainer, TableHead, TableRow, TextField, InputLabel, FormControlLabel, FormControl, TablePagination, TableFooter, Alert, IconButton } from '@mui/material';
import TablePaginationActions from './TablePaginationActions';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from "@mui/icons-material/Check";
import BlockIcon from "@mui/icons-material/Block";
import OutlinedInput from '@mui/material/OutlinedInput';
import Checkbox from '@mui/material/Checkbox';
import Autocomplete from '@mui/material/Autocomplete';
import Navigation from './Navigation';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

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

    // Si el token es nulo o el usuario no es propietario o administrador, no está autenticado
    if (!token || (storedUserRole !== 'Propietario' && storedUserRole !== 'Administrador')) {
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
      <AdminDashboard
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

const AdminDashboard = ({ userRole, toggleDarkMode, darkMode, loggedInUser, isAuthenticated }) => {
  const navigate = useNavigate();

  // Datos de los usuarios
  const [users, setUsers] = useState([]);
  const [phones, setPhones] = useState([]);
  const [calls, setCalls] = useState([]);
  const [payments, setPayments] = useState([]);
  const [weeks, setWeeks] = useState([]);

  // Fecha
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('');
  const [loadingWeek, setLoadingWeek] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  // Añadir Fecha
  const [addYear, setAddYear] = useState('');
  const [addMonth, setAddMonth] = useState('');
  const [addWeek, setAddWeek] = useState('');
  const [addWeekStart, setAddWeekStart] = useState('');
  const [addWeekEnd, setAddWeekEnd] = useState('');

  // Editar Fecha
  const [updateId, setUpdateId] = useState('');
  const [updateYear, setUpdateYear] = useState('');
  const [updateMonth, setUpdateMonth] = useState('');
  const [updateWeek, setUpdateWeek] = useState('');
  const [updateWeekStart, setUpdateWeekStart] = useState('');
  const [updateWeekEnd, setUpdateWeekEnd] = useState('');

  // Paginación
  const [callsPage, setCallsPage] = useState(1);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [callsItemsPerPage, setCallsItemsPerPage] = useState(10);
  const [paymentsItemsPerPage, setPaymentsItemsPerPage] = useState(10);
  const [showAllCalls, setShowAllCalls] = useState(false);
  const [showAllPayments, setShowAllPayments] = useState(false);

  // Búsqueda
  const [callSearch, setCallSearch] = useState('');
  const [paymentSearch, setPaymentSearch] = useState('');

  // Cargando... y Exito!
  const [loading, setLoading] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [message] = useState('');

  // Ocultar/desocultar llamadas y pagos
  const [showCalls, setShowCalls] = useState(true);
  const [showPayments, setShowPayments] = useState(true);

  // Editar llamada
  const [editingCell, setEditingCell] = useState({ rowId: null, field: null });
  const [editingCall, setEditingCall] = useState({
    id: '',
    username: '',
    phoneNumber: '',
    firstCut: 0,
    secondCut: 0,
    finalCut: 0,
    totalAmount: 0,
  });
  const inputRefs = useRef({});

  // Editar pago
  const [currentPayment, setCurrentPayment] = useState(null);
  const [idUserPayment, setIdUserPayment] = useState('');
  const [usernamePayment, setUsernamePayment] = useState('');
  const [bankEmailPayment, setBankEmailPayment] = useState('');
  const [totalAmountSum, setTotalAmountSum] = useState('');
  const [pago, setPago] = useState('');
  const [estatus, setEstatus] = useState('');
  const [banco, setBanco] = useState('');
  const [captura, setCaptura] = useState('');
  const [deleteImage, setDeleteImage] = useState(false);
  const [fileSelected, setFileSelected] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [imageURL, setImageURL] = useState('');

  // Añadir Teléfono
  const [idUserPhone, setIdUserPhone] = useState('');
  const [usernamePhone, setUsernamePhone] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Editar Teléfono
  const [updateUserIdPhone, setUpdateUserIdPhone] = useState('');
  const [updateUsernamePhone, setUpdateUsernamePhone] = useState('');
  const [updateIdPhone, setUpdateIdPhone] = useState('');
  const [updatePhoneNumberOld, setUpdatePhoneNumberOld] = useState('');
  const [updatePhoneNumberNew, setUpdatePhoneNumberNew] = useState('');
  // Focus en campos del modal de Editar Teléfono
  const [isFocusedUpdateUserIdPhone, setIsFocusedUpdateUserIdPhone] = React.useState(false);
  const [isFocusedUpdateIdPhone, setIsFocusedUpdateIdPhone] = React.useState(false);

  // Desactivar Teléfono
  const [deactivateUserId, setDeactivateUserId] = useState('');
  const [deactivateUsername, setDeactivateUsername] = useState('');
  const [deactivatePhone, setDeactivatePhone] = useState('');
  const [deactivateUserPhones, setDeactivateUserPhones] = useState([]);

  // Activar Teléfono
  const [activateUserId, setActivateUserId] = useState('');
  const [activateUsername, setActivateUsername] = useState('');
  const [activatePhone, setActivatePhone] = useState('');
  const [activateUserPhones, setActivateUserPhones] = useState([]);

  // Añadir Llamada
  const [callUserId, setCallUserId] = useState('');
  const [callUsername, setCallUsername] = useState('');
  const [callPhone, setCallPhone] = useState('');
  const [callUserPhones, setCallUserPhones] = useState([]);

  // Eliminar Teléfono
  const [deleteUserIdPhone, setDeleteUserIdPhone] = useState('');
  const [deleteUsernamePhone, setDeleteUsernamePhone] = useState('');
  const [deleteIdPhone, setDeleteIdPhone] = useState('');
  const [deletePhoneNumber, setDeletePhoneNumber] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(null);

  // Pasar de fila a columna Fecha, Teléfono y Exportar
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Función para formatear la cantidad antes de mostrarla
  const formatAmount = (amount) => {
    const number = parseFloat(amount);
    return Number.isInteger(number) ? number.toFixed(0) : number.toFixed(2);
  };

  const updateUserRole = useCallback((newRole) => {
    localStorage.setItem('userRole', newRole);
  }, []);

  useEffect(() => {
    const storedUserRole = localStorage.getItem('userRole');
    if (storedUserRole && storedUserRole !== userRole) {
      updateUserRole(storedUserRole);
    }
  }, [userRole, updateUserRole]);

  // Actualiza setSelectedYear setSelectedMonth y setSelectedWeek después de la actualización de fetchWeekData
  const updateStatesAfterDataRefresh = useCallback((updatedWeeksData) => {
    // Actualizar los estados aquí similarmente a como lo haces en los useEffect
    if (updatedWeeksData && updatedWeeksData.length > 0) {
      const lastWeek = updatedWeeksData.reduce((prev, current) => {
        return prev.id > current.id ? prev : current;
      }, updatedWeeksData[0]);
      
      setSelectedYear(lastWeek.anio.toString());
      setSelectedMonth(lastWeek.mes);
      setSelectedWeek(lastWeek.semana);
    }
  }, []);

  // Función para obtener weeks
  const fetchWeekData = useCallback(async () => {
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
    
    // Check if the user is not an owner, admin or worker
    if ((storedUserRole !== 'Propietario' && storedUserRole !== 'Administrador')) {
      alert('No tienes los permisos necesarios para realizar esta acción.');
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      navigate('/', { replace: true });
      return;
    }

    // Proceed with the API call      
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/admins/weeks`, { // Cambia esta URL a la correcta para obtener todos los datos de las semanas
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setWeeks(response.data.weeks);
        updateStatesAfterDataRefresh(response.data.weeks);
        setLoadingWeek(false);  // Añade esta línea
        setRetryCount(0);   // Restablece el contador de reintentos
      } else {
        console.error('Error al obtener los datos de las semanas');
      }
    } catch (error) {
      console.error('Error al obtener los datos de las semanas:', error);
    }
  }, [navigate, updateStatesAfterDataRefresh]);

  // Ejecutar función para obtener weeks
  useEffect(() => {
    fetchWeekData();
  }, [fetchWeekData, loadingWeek, retryCount]);

  // Ejecutar función para obtener users, phones, calls y payments
  useEffect(() => {

    // Función para obtener users, phones, calls y payments
    const fetchAdminData = async () => {
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
      
      // Check if the user is not an owner or admin
      if ((storedUserRole !== 'Propietario' && storedUserRole !== 'Administrador')) {
        alert('No tienes los permisos necesarios para realizar esta acción.');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/', { replace: true });
        return;
      }

      // Check if year, month, and week are not empty
      if (!selectedYear || !selectedMonth || !selectedWeek) {
        setPhones([]);
        setCalls([]);
        setPayments([]);
        setIsDataLoaded(true);
        return;
      }

      // Check if selectedYear, selectedMonth, and selectedWeek correspond to a valid id in weeks
      if (!weeks) {
        if (retryCount < 5) { // Solo intenta de nuevo si no has superado el límite de reintentos
          setLoadingWeek(true);
          setRetryCount(prevCount => prevCount + 1); // Incrementa el contador de reintentos
        }
        return;
      }

      const isValidWeek = weeks.some(week => week.anio === Number(selectedYear) && week.mes === selectedMonth && week.semana === selectedWeek);
      if (!isValidWeek) {
        return;
      }

      // Proceed with the API call
      try {
        // Check if year, month, and week are not empty
        if (!selectedYear || !selectedMonth || !selectedWeek) {
          return;
        }

        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/admins`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          // Añadir estas líneas para enviar los parámetros de año, mes y semana en la solicitud
          params: {
            year: selectedYear,
            month: selectedMonth,
            week: selectedWeek,
          },
        });

        if (response.status === 200) {
          setUsers(response.data.users);
          setPhones(response.data.phones);
          setCalls(response.data.calls);
          setPayments(response.data.payments);

          setIsDataLoaded(true);
        } else {
          console.error('Error al obtener los datos del trabajador');
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
            alert('No hay datos registrados para este trabajador');
          }
        } else {
          console.error('Error al obtener los datos del trabajador:', error);
        }
      }
    };

    fetchAdminData();
  }, [selectedYear, selectedMonth, selectedWeek, userRole, navigate, weeks, retryCount]);

  useEffect(() => {
    if (currentPayment) {
      setBanco(currentPayment.banco || 'Binance');
    }
  }, [currentPayment]);

  // Nueva función para obtener el último registro de la tabla weeks
  const getLastWeekRecord = useCallback(() => {
    return weeks.length > 0 ?
      weeks.reduce((prev, current) => {
        return prev.id > current.id ? prev : current;
      }, weeks[0])
      : null;
  }, [weeks]);

  // Establece los valores iniciales de los estados en función del último registro de la tabla weeks
  useEffect(() => {
    if (weeks && weeks.length > 0) {
      const lastWeek = getLastWeekRecord();
      setSelectedYear(lastWeek.anio.toString());
      setSelectedMonth(lastWeek.mes);
      setSelectedWeek(lastWeek.semana);
    }
  }, [weeks, getLastWeekRecord]);

  // Editar llamada
  const handleEditCall = (call, field = null) => {
    const foundPhone = phones.find(phone => phone.id === call.Phone.id);
    const phoneNumber = foundPhone ? foundPhone.phoneNumber : 'Desconocido';
    const foundUser = users.find(user => user.id === call.Phone.UserId);
    const username = foundUser ? foundUser.username : 'Desconocido';
    const id = foundUser ? foundUser.id : 'Desconocido';

    if (!editingCall || editingCall.id !== call.id) {
      const foundCall = calls.find(foundCall => foundCall.id === call.id);
      setEditingCell({ rowId: foundCall ? foundCall.id : null, field });

      setEditingCall({
        id,
        username,
        phoneNumber,
        firstCut: call.firstCut,
        secondCut: call.secondCut,
        finalCut: call.finalCut,
        totalAmount: call.totalAmount,
      });
    }

    setIsModalOpen('call');
  };

  const handleCancelEditCall = () => {
    setEditingCell({ rowId: null, field: null });
    setEditingCall({
      id: '',
      username: '',
      phoneNumber: '',
      firstCut: 0,
      secondCut: 0,
      finalCut: 0,
      totalAmount: 0,
    });
    setIsModalOpen(null);
  };

  const handleCellClick = (call, field) => {
    // Si no estás editando ninguna celda o estás editando una celda diferente, establece editingCall
    if (!editingCall || editingCall.id !== call.id) {
      const editingData = { 
        id: call.id,
        firstCut: call.firstCut || 0,
        secondCut: call.secondCut || 0,
        finalCut: call.finalCut || 0,
        totalAmount: call.totalAmount || 0,
      };
      setEditingCall(editingData);
    }

    setEditingCell({ rowId: call.id, field });
  };

  const handleInputChange = useCallback((field, value) => {
    setEditingCall(prevEditingCall => {
      const updatedEditingCall = {
        ...prevEditingCall,
        [field]: value,
      };
  
      const firstCut = updatedEditingCall.firstCut ? parseFloat(updatedEditingCall.firstCut) : 0;
      const secondCut = updatedEditingCall.secondCut ? parseFloat(updatedEditingCall.secondCut) : 0;
      const finalCut = updatedEditingCall.finalCut ? parseFloat(updatedEditingCall.finalCut) : 0;
  
      const totalAmount = firstCut + secondCut + finalCut;
      updatedEditingCall.totalAmount = formatAmount(totalAmount);
  
      return updatedEditingCall;
    });
  }, [setEditingCall]); // Si setEditingCall proviene de useState, no es necesario ponerlo aquí porque su referencia nunca cambia.

  useEffect(() => {
    const updatedTotalAmount = parseFloat(editingCall.firstCut) + parseFloat(editingCall.secondCut) + parseFloat(editingCall.finalCut);
  
    handleInputChange('totalAmount', updatedTotalAmount);
  }, [editingCall.firstCut, editingCall.secondCut, editingCall.finalCut, handleInputChange]);

  useEffect(() => {
    if (editingCell.rowId !== null && editingCell.field !== null) {
      if (inputRefs.current[editingCell.field]) {
        inputRefs.current[editingCell.field].focus();
        inputRefs.current[editingCell.field].select();
      }
    }
  }, [editingCell]);

  const handleFinishEditing = async () => {

    // Verificar si alguno de los campos requeridos está vacío.
    if (
      editingCall.firstCut === null || editingCall.firstCut === undefined || editingCall.firstCut === '' ||
      editingCall.secondCut === null || editingCall.secondCut === undefined || editingCall.secondCut === '' ||
      editingCall.finalCut === null || editingCall.finalCut === undefined || editingCall.finalCut === ''
    ) {
      alert('Por favor, asegúrate de que todos los campos estén completos.');
      return;
    }
    
    setLoading(true);

    try {
      const callData = {
        firstCut: editingCall.firstCut,
        secondCut: editingCall.secondCut,
        finalCut: editingCall.finalCut,
        totalAmount: editingCall.totalAmount,
      };

      const token = localStorage.getItem('token');
      const response = await axios.put(`${import.meta.env.VITE_APP_API_URL}/api/admins/calls/${editingCell.rowId}`, callData, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setCalls(
          calls.map((call) => (call.id === editingCell.rowId ? { ...call, ...response.data.call } : call))
        );
  
        const paymentResponse = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/admins`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          // Añadir estas líneas para enviar los parámetros de año, mes y semana en la solicitud
          params: {
            year: selectedYear,
            month: selectedMonth,
            week: selectedWeek,
          },
        });
  
        if (paymentResponse.status === 200) {
          setPayments(paymentResponse.data.payments);
        } else {
          console.error('Error al obtener los pagos actualizados');
        }

        setEditingCell({ rowId: null });
        setEditingCall({});
        setNotificationMessage('Llamada actualizada con éxito');
        setTimeout(() => setNotificationMessage(null), 1000);
      } else {
        console.error('Error al actualizar la llamada');
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/', { replace: true });
      } else {
        console.error('Error al actualizar la llamada:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEditCall = async (e) => {
    e.preventDefault();

    // Verificar si alguno de los campos requeridos está vacío.
    if (
      editingCall.firstCut === null || editingCall.firstCut === undefined || editingCall.firstCut === '' ||
      editingCall.secondCut === null || editingCall.secondCut === undefined || editingCall.secondCut === '' ||
      editingCall.finalCut === null || editingCall.finalCut === undefined || editingCall.finalCut === ''
    ) {
      alert('Por favor, asegúrate de que todos los campos estén completos.');
      return;
    }
  
    const confirmUpdate = window.confirm('¿Está seguro de que desea actualizar las llamadas de este Teléfono?');
    if (!confirmUpdate) {
      return;
    }
  
    setLoading(true);
  
    try {
      const callData = {
        firstCut: editingCall.firstCut,
        secondCut: editingCall.secondCut,
        finalCut: editingCall.finalCut,
        totalAmount: editingCall.totalAmount,
      };
  
      const token = localStorage.getItem('token');
      const response = await axios.put(`${import.meta.env.VITE_APP_API_URL}/api/admins/calls/${editingCell.rowId}`, callData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (response.status === 200) {
        setCalls(
          calls.map((call) => (call.id === editingCell.rowId ? { ...call, ...response.data.call } : call))
        );
  
        const paymentResponse = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/admins`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          // Añadir estas líneas para enviar los parámetros de año, mes y semana en la solicitud
          params: {
            year: selectedYear,
            month: selectedMonth,
            week: selectedWeek,
          },
        });
  
        if (paymentResponse.status === 200) {
          setPayments(paymentResponse.data.payments);
        } else {
          console.error('Error al obtener los pagos actualizados');
        }
  
        handleCancelEditCall();
        setNotificationMessage('Llamada actualizada con éxito');
        setTimeout(() => setNotificationMessage(null), 1000);
      } else {
        console.error('Error al actualizar la llamada');
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/', { replace: true });
      } else {
        console.error('Error al actualizar la llamada:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Eliminar llamada
  const handleDeleteCall = async (callId) => {
    const call = calls.find(call => call.id === callId);
  
    if (!call) {
      console.error(`Call with id ${callId} not found`);
      return;
    }
  
    const phone = phones.find(phone => phone.id === call.telefono_id);
  
    if (!phone) {
      console.error(`Phone with id ${call.telefono_id} not found`);
      return;
    }
  
    const phoneNumber = phone.phoneNumber || 'Desconocido';
  
    // Buscar el usuario que está asociado con el teléfono
    const user = users.find(user => user.id === phone.UserId);

    if (!user) {
      console.error(`User with id ${phone.UserId} not found`);
      return;
    }

    // Obtener el nombre de usuario
    const username = user.username || 'Desconocido';

    // Cambiar el mensaje de confirmación para que muestre el nombre de usuario en lugar del callId
    const confirmDelete = window.confirm(`¿Está seguro de que desea eliminar las llamadas de este usuario?\n${username}\n${phoneNumber}`);
    if (!confirmDelete) {
      return;
    }

    setLoading(true);
  
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${import.meta.env.VITE_APP_API_URL}/api/admins/calls/${callId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (response.status === 200) {
        const updatedCalls = calls.filter((call) => call.id !== callId);
        setCalls(updatedCalls);
        
        const newPageCount = Math.ceil(updatedCalls.length / callsItemsPerPage);
    
        if (callsPage > newPageCount) {
          setCallsPage(newPageCount);
        }
        
        const paymentResponse = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/admins`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          // Añadir estas líneas para enviar los parámetros de año, mes y semana en la solicitud
          params: {
            year: selectedYear,
            month: selectedMonth,
            week: selectedWeek,
          },
        });
  
        if (paymentResponse.status === 200) {
          setPayments(paymentResponse.data.payments);

          const newPaymentsPageCount = Math.ceil(paymentResponse.data.payments.length / paymentsItemsPerPage);
    
          if (paymentsPage > newPaymentsPageCount) {
            setPaymentsPage(newPaymentsPageCount === 0 ? 1 : newPaymentsPageCount);
          }
        } else {
          console.error('Error al obtener los pagos actualizados');
        }

        setNotificationMessage('Llamada eliminada con éxito');
        setTimeout(() => setNotificationMessage(null), 1000);
      } else {
        console.error('Error al eliminar la llamada');
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/', { replace: true });
      } else {
        console.error('Error al eliminar la llamada:', error);
      }
    } finally {
      setLoading(false);
    }
  };  

  // Editar pago
  const readImageFromFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const blob = new Blob([new Uint8Array(e.target.result)], { type: file.type });
        const newFile = new File([blob], file.name, { type: file.type });
        resolve(newFile);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };
  
  const getFormattedVenezuelaDate = () => {
    // Function to get local Venezuela date
    const getVenezuelaLocalDate = () => {
      const currentDate = new Date();
      const currentOffset = currentDate.getTimezoneOffset() * 60 * 1000; // Current timezone difference in milliseconds
      const venezuelaOffset = -4 * 60 * 60 * 1000; // Venezuela timezone difference (-4 hours) in milliseconds
      const adjustedDate = new Date(currentDate.getTime() + currentOffset + venezuelaOffset);
  
      return adjustedDate;
    };
  
    // Function to format date to 'YYYY-MM-DD'
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = ('0' + (date.getMonth() + 1)).slice(-2); // Months go from 0 to 11, so we add 1
      const day = ('0' + date.getDate()).slice(-2);
  
      return `${year}-${month}-${day}`;
    };
  
    const venezuelaDate = getVenezuelaLocalDate();
    const formattedVenezuelaDate = formatDate(venezuelaDate);
  
    return formattedVenezuelaDate;
  };

  const handlePasteImage = async (e) => {
    const clipboardData = e.clipboardData;
    const items = clipboardData.items;
  
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          const newFile = await readImageFromFile(file);
          const reader = new FileReader();
          reader.onloadend = () => {
            setImageURL(reader.result);
          };
          reader.readAsDataURL(newFile);
          setCaptura(newFile);
          setFileSelected(true);
          setPago(getFormattedVenezuelaDate());
          setEstatus("Pagado");
        }
        break;
      }
    }
  };
  
  const handleDropImage = async (e) => {
    e.preventDefault();
    const dataTransfer = e.dataTransfer;
    const items = dataTransfer.items;
  
    for (const item of items) {
      if (item.kind === "file" && item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          const newFile = await readImageFromFile(file);
          const reader = new FileReader();
          reader.onloadend = () => {
            setImageURL(reader.result);
          };
          reader.readAsDataURL(newFile);
          setCaptura(newFile);
          setFileSelected(true);
          setPago(getFormattedVenezuelaDate());
          setEstatus("Pagado");
        }
        break;
      }
    }
  };

  function handleClickPasteOrDrop(e) {
    e.preventDefault();
  
    const html = `
    <html style="height: 100%;">
      <head>
        <meta name="viewport" content="width=device-width, minimum-scale=0.1">
        <title>${captura.name}</title>
        <style>
          #zoomable {
            -webkit-user-select: none;
            background-color: hsl(0, 0%, 90%);
            transition: background-color 300ms;
            max-width: 100%;
            max-height: 100%;
            cursor: zoom-in;
          }
          #zoomable:active {
            transform: scale(2);
          }
        </style>
      </head>
      <body style="margin: 0px; background: #0e0e0e; height: 100%; display: flex; align-items: center; justify-content: center;">
        <img id="zoomable" src="${imageURL}" alt="${captura.name}" />
      </body>
    </html>`;
  
    const blob = new Blob([html], {type: 'text/html'});
    const url = URL.createObjectURL(blob);
  
    window.open(url, '_blank');
  }

  const handleEditPayment = (payment) => {
    setCurrentPayment(payment);

    const user = users.find(user => user.id === payment.UserId);
    const username = user ? user.username : 'Desconocido';
    const bankEmail = user ? user.bankEmail : 'Desconocido';
    const id = user ? user.id : 'Desconocido';

    setIdUserPayment(id)
    setUsernamePayment(username);
    setBankEmailPayment(bankEmail);
    setTotalAmountSum(payment.totalAmountSum);
    setPago(payment.pago);
    setEstatus(payment.estatus);
    setBanco(payment.banco);
    setCaptura(payment.captura);
    setDeleteImage(false);
    setFileSelected(false);
    setCheckboxChecked(false);
    setImageURL(payment.captura_url);
    setIsModalOpen('payment');
  };

  const handleCancelEditPayment = () => {
    setCurrentPayment(null);
    setIdUserPayment('');
    setUsernamePayment('');
    setBankEmailPayment('');
    setTotalAmountSum('');
    setPago('');
    setEstatus('');
    setBanco('');
    setCaptura('');
    setDeleteImage(false);
    setFileSelected(false);
    setCheckboxChecked(false);
    setImageURL('');
  };

  const handleSubmitEditPayment = async (e) => {
    e.preventDefault();
  
    const confirmUpdate = window.confirm('¿Está seguro de que desea actualizar el pago de este Usuario?');
    if (!confirmUpdate) {
      return;
    }

    setLoading(true);
  
    try {
      const paymentData = new FormData();
      paymentData.append('pago', pago);
      paymentData.append('estatus', estatus);
      paymentData.append('banco', banco);
  
      if (captura) {
        paymentData.append('captura', captura, captura.name);
      }

      paymentData.append('deleteImage', deleteImage);
  
      const token = localStorage.getItem('token');
      const response = await axios.put(`${import.meta.env.VITE_APP_API_URL}/api/admins/payments/${currentPayment.id}`, paymentData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (response.status === 200) {
        setPayments(
          payments.map((payment) => (payment.id === currentPayment.id ? { ...currentPayment, ...response.data.payment } : payment))
        );
  
        handleCancelEditPayment();
        setNotificationMessage('Pago actualizado con éxito');
        setTimeout(() => setNotificationMessage(null), 1000);
      } else {
        console.error('Error al actualizar el pago');
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/', { replace: true });
      } else if (error.response && error.response.status === 500) {
        alert('Internet inestable, intente nuevamente o recargue la pagina');
      } else {
        console.error('Error al actualizar el pago:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Añadir fecha
  const handleEditAddWeek = () => {
    const lastWeek = getLastWeekRecord();
    
    let newYear, newMonth, newWeekStart, newWeekEnd;
  
    const monthNamesInSpanish = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    if (lastWeek) {
      newYear = lastWeek.anio;
      newMonth = lastWeek.mes;
      newWeekStart = Number(lastWeek.semana.split(' - ')[1]) + 1;
    } else {
      const today = new Date();
      newYear = today.getFullYear();
      newMonth = monthNamesInSpanish[today.getMonth()];
      newWeekStart = today.getDate();
    }
    
    const monthDays = [31, (newYear % 4 === 0 && (newYear % 100 !== 0 || newYear % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // Febrero tiene 29 días en años bisiestos, de lo contrario tiene 28 días.
    
    let newMonthIndex = monthNamesInSpanish.indexOf(newMonth);
    
    if (newWeekStart > monthDays[newMonthIndex]) {
      if (newMonthIndex >= 11) { // Si es diciembre, incrementa el año y vuelve a enero.
        newYear += 1;
        newMonth = 'Enero';
      } else {
        newMonth = monthNamesInSpanish[newMonthIndex + 1];
      }
      
      newWeekStart -= monthDays[newMonthIndex];
    }
  
    newWeekEnd = newWeekStart + 6;
    
    // Si el fin de semana es mayor que los días del mes,
    // cambia al siguiente mes y calcula el fin de semana correctamente.
    if (newWeekEnd > monthDays[newMonthIndex]) {
      newWeekEnd -= monthDays[newMonthIndex];
      if (newMonthIndex >= 11) { // Si es diciembre, incrementa el año y vuelve a enero.
        newYear += 1;
        newMonth = 'Enero';
      } else {
        newMonth = monthNamesInSpanish[newMonthIndex + 1];
      }
    }
  
    setAddYear(newYear);
    setAddMonth(newMonth);
    setAddWeekStart(newWeekStart.toString().padStart(2, '0'));
    setAddWeekEnd(newWeekEnd.toString().padStart(2, '0'));
    setAddWeek(`${newWeekStart.toString().padStart(2, '0')} - ${newWeekEnd.toString().padStart(2, '0')}`);
    setIsModalOpen('addweek');
  };

  const handleCancelEditAddWeek = () => {
    setAddYear('');
    setAddMonth('');
    setAddWeek('');
    setAddWeekStart('');
    setAddWeekEnd('');
    setIsModalOpen(null);
  };  

  const handleSubmitAddWeek = async (e) => {
    e.preventDefault();

    if (addYear === '' || addMonth === '' || addWeek === '') {
      alert("Todos los campos son obligatorios.");
      return;
    }
    
    const confirmUpdate = window.confirm('¿Está seguro de que desea añadir esta nueva fecha?');
    if (!confirmUpdate) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/admins/weeks`, {
        year: addYear,
        month: addMonth,
        week: addWeek
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 201) {
        fetchWeekData();
        
        handleCancelEditAddWeek();
        setNotificationMessage('Fecha añadida con éxito');
        setTimeout(() => setNotificationMessage(null), 1000);
      } else {
        console.error('Error al añadir la fecha', response);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert('Esta fecha ya existe.');
      } else if (error.response && error.response.status === 401) {
        alert('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/', { replace: true });
      } else if (error.response && error.response.status === 500) {
        alert('Internet inestable, intente nuevamente o recargue la pagina');
      } else {
        console.error('Error al añadir la fecha:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Eliminar fecha
  const handleDeleteWeek = async () => {
    const key = `${selectedYear}${selectedMonth}[${selectedWeek}]`;
    
    const token = localStorage.getItem('token');

    // Obtener el ID de la semana desde el servidor
    let weekId;
    try {
      const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/admins/weekId`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        params: {
          year: selectedYear,
          month: selectedMonth,
          week: selectedWeek,
        },
      });
      weekId = response.data.weekId;
    } catch (error) {
      console.error('Error al obtener el ID de la semana:', error);
      alert('Error al obtener la semana. Intente de nuevo más tarde.');
      return;
    }
  
    if (!weekId) {
      alert('No hay semana para eliminar');
      return;
    }
  
    const confirmDelete = window.confirm(`¿Está seguro de que desea eliminar esta fecha?\n${key}`);
    if (!confirmDelete) {
      return;
    }
  
    setLoading(true);
  
    // Eliminar la semana
    try {
      const response = await axios.delete(`${import.meta.env.VITE_APP_API_URL}/api/admins/weeks/${weekId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      // Actualizar el estado local después de eliminar la semana
      if (response.status === 200) {
          fetchWeekData();

          // Mostrar un mensaje de éxito
          setNotificationMessage('Fecha eliminada con éxito');
          setTimeout(() => setNotificationMessage(null), 1000);
      } else {
        console.error('Error al eliminar la fecha');
      }
    } catch (error) {
      // Manejar errores
      if (error.response && error.response.status === 401) {
        alert('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/', { replace: true });
      } else {
        console.error('Error al eliminar la fecha:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Editar fecha  
  const handleEditUpdateWeek = async () => {
    const token = localStorage.getItem('token');
  
    // Obtener el ID de la semana desde el servidor
    let weekId;
    try {
      const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/admins/weekId`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        params: {
          year: selectedYear,
          month: selectedMonth,
          week: selectedWeek,
        },
      });
      weekId = response.data.weekId;
    } catch (error) {
      console.error('Error al obtener el ID de la semana:', error);
      alert('Error al obtener la semana. Intente de nuevo más tarde.');
      return;
    }
  
    if (!weekId) {
      alert('No hay semana para editar');
      return;
    }
  
    setUpdateId(weekId);
    setUpdateYear(selectedYear);
    setUpdateMonth(selectedMonth);
    const [start, end] = selectedWeek.split(' - ');
    setUpdateWeekStart(start);
    setUpdateWeekEnd(end);
    setUpdateWeek(`${start} - ${end}`);
    setIsModalOpen('updateweek');
  };
  
  const handleCancelUpdateWeek = () => {
    setUpdateId('');
    setUpdateYear('');
    setUpdateMonth('');
    setUpdateWeek('');
    setUpdateWeekStart('');
    setUpdateWeekEnd('');
    setIsModalOpen(null);
  };  

  const handleUpdateWeek = async (e) => {
    e.preventDefault();

    if (updateYear === '' || updateMonth === '' || updateWeek === '') {
      alert("Todos los campos son obligatorios.");
      return;
    }

    const confirmUpdate = window.confirm('¿Estás seguro de que quieres actualizar esta fecha?');
    if (!confirmUpdate) {
      return;
    }
  
    setLoading(true);
  
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${import.meta.env.VITE_APP_API_URL}/api/admins/weeks/${updateId}`, {
        id: updateId,
        anio: updateYear,
        mes: updateMonth,
        semana: updateWeek
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (response.status === 200) {
        fetchWeekData();
        
        handleCancelUpdateWeek();
        setNotificationMessage('Fecha actualizada con éxito');
        setTimeout(() => setNotificationMessage(null), 1000);
      } else {
        console.error('Error al actualizar la fecha', response);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert('Esta fecha ya existe.');
      } else if (error.response && error.response.status === 401) {
        alert('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/', { replace: true });
      } else if (error.response && error.response.status === 500) {
        alert('Internet inestable, intente nuevamente o recargue la pagina');
      } else {
        console.error('Error al actualizar la fecha:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Añadir teléfono
  const handleEditAddPhone = () => {
    if (users && users.id && users.username) {
      setIdUserPhone(users.id);
      setUsernamePhone(users.username);
    } else {
      setIdUserPhone('');
      setUsernamePhone('');
    }
    setPhoneNumber('');
    setIsModalOpen('addphone');
  };

  const handleCancelEditAddPhone = () => {
    setIdUserPhone('');
    setUsernamePhone('');
    setPhoneNumber('');
    setIsModalOpen(null);
  };

  const handleSubmitAddPhone = async (e) => {
    e.preventDefault();
  
    if (phoneNumber === '' || idUserPhone === '' || usernamePhone === '') {
      alert("Todos los campos son obligatorios.");
      return;
    }
    
    const confirmUpdate = window.confirm('¿Estás seguro de que quieres añadir este teléfono?');
    if (!confirmUpdate) {
      return;
    }
  
    setLoading(true);
  
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/admins/phones`, {
        phoneNumber: phoneNumber,
        UserId: idUserPhone
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (response.status === 201) {
        // Obtener el ID de la semana desde el servidor
        let weekId;
        try {
          const weekResponse = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/admins/weekId`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            params: {
              year: selectedYear,
              month: selectedMonth,
              week: selectedWeek,
            },
          });
          weekId = weekResponse.data.weekId;
        } catch (error) {
          console.error('Error al obtener el ID de la semana:', error);
          alert('Error al obtener la semana. Intente de nuevo más tarde.');
          return;
        }
        
        if (!weekId) {
          alert('No hay semana para editar');
          return;
        }

        // Agregar nuevo registro de llamada para el teléfono recién creado
        const phone = response.data.phone;
        const callHistoryResponse = await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/admins/calls`, {
          telefono_id: phone.id,
          semana_id: weekId,
          // Demás campos necesarios para la creación de un registro de llamada...
          firstCut: 0,
          secondCut: 0,
          finalCut: 0,
          totalAmount: 0,
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (callHistoryResponse.status !== 201) {
          console.error('Error al crear el historial de llamadas para el nuevo teléfono:', callHistoryResponse);
        }
  
        setPhones([...phones, phone]);
  
        const updatedDataResponse = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/admins`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          // Añadir estas líneas para enviar los parámetros de año, mes y semana en la solicitud
          params: {
            year: selectedYear,
            month: selectedMonth,
            week: selectedWeek,
          },
        });
  
        if (updatedDataResponse.status === 200) {
          setUsers(updatedDataResponse.data.users);
          setPhones(updatedDataResponse.data.phones);
          setCalls(updatedDataResponse.data.calls);
          setPayments(updatedDataResponse.data.payments);
  
          fetchWeekData();
        }
  
        handleCancelEditAddPhone();
        setNotificationMessage('Teléfono añadido con éxito');
        setTimeout(() => setNotificationMessage(null), 1000);
      } else {
        console.error('Error al añadir el teléfono', response);
      }
    } catch (error) {
      console.error('Error al añadir el teléfono:', error);
      if (error.response && error.response.status === 400) {
        alert("Este número de teléfono ya existe.");
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Editar teléfono
  const handleEditUpdatePhone = () => {
    setIsModalOpen('updatephone');
  };

  const handleCancelUpdatePhone = () => {
    setUpdateUserIdPhone('');
    setUpdateUsernamePhone('');
    setUpdateIdPhone('');
    setUpdatePhoneNumberOld('');
    setUpdatePhoneNumberNew('');
    setIsModalOpen(null);
  };

  const handleUpdatePhone = async (e) => {
    e.preventDefault();
  
    if (updateUserIdPhone === '' || updateUsernamePhone === '' || updateIdPhone === '' || updatePhoneNumberOld === '' || updatePhoneNumberNew === '') {
      alert("Todos los campos son obligatorios.");
      return;
    }
    
    const confirmUpdate = window.confirm('¿Estás seguro de que quieres actualizar este teléfono?');
    if (!confirmUpdate) {
      return;
    }
  
    setLoading(true);
  
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${import.meta.env.VITE_APP_API_URL}/api/admins/phones/${updateIdPhone}`, {
        id: updateIdPhone,
        UserId: updateUserIdPhone,
        phoneNumber: updatePhoneNumberNew
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (response.status === 200) {
        const updatedPhoneIndex = phones.findIndex(phone => phone.id === updateIdPhone);
        const updatedPhones = [...phones];
        updatedPhones[updatedPhoneIndex] = response.data;
        setPhones(updatedPhones);
        
        const updatedDataResponse = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/admins`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          // Añadir estas líneas para enviar los parámetros de año, mes y semana en la solicitud
          params: {
            year: selectedYear,
            month: selectedMonth,
            week: selectedWeek,
          },
        });
  
        if (updatedDataResponse.status === 200) {
          setUsers(updatedDataResponse.data.users);
          setPhones(updatedDataResponse.data.phones);
          setCalls(updatedDataResponse.data.calls);
          setPayments(updatedDataResponse.data.payments);
  
          fetchWeekData();
          setUpdatePhoneNumberOld('');
        } else {
          console.error('Error al obtener los datos actualizados');
        }
  
        handleCancelUpdatePhone();
        setNotificationMessage('Teléfono actualizado con éxito');
        setTimeout(() => setNotificationMessage(null), 1000);
      } else {
        console.error('Error al actualizar el teléfono', response);
      }
    } catch (error) {
      console.error('Error al actualizar el teléfono:', error);
      if (error.response && error.response.status === 400) {
        alert("Este número de teléfono ya existe.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Desactivar teléfono
  const handleEditDeactivatePhone = () => {
    setIsModalOpen('deactivatephone');
  };

  const handleCancelEditDeactivatePhone = () => {
    setDeactivateUserId('');
    setDeactivateUsername('');
    setDeactivatePhone('');
    setIsModalOpen(null);
  };

  const handleDeactivatePhone = async (e) => {
    e.preventDefault();

    // Encuentra el objeto de teléfono correspondiente en tu matriz de teléfonos
    const phoneToDeactivate = phones.find(phone => phone.phoneNumber === deactivatePhone);

    // Si no se encontró un teléfono, no se puede continuar
    if (!phoneToDeactivate) {
      alert('No se encontró un teléfono correspondiente al número seleccionado.');
      return;
    }

    const phoneId = phoneToDeactivate.id;  // Usa el id del teléfono encontrado

    const confirmDeactivate = window.confirm(`¿Está seguro de que desea desactivar este teléfono?\nID Teléfono ${phoneId}\nTeléfono ${phoneToDeactivate.phoneNumber}`);
    if (!confirmDeactivate) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(`${import.meta.env.VITE_APP_API_URL}/api/admins/phones/deactivate/${phoneId}`, {}, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setPhones(phones.filter((phone) => phone.isActive));
  
        const updatedDataResponse = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/admins`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          // Añadir estas líneas para enviar los parámetros de año, mes y semana en la solicitud
          params: {
            year: selectedYear,
            month: selectedMonth,
            week: selectedWeek,
          },
        });
  
        if (updatedDataResponse.status === 200) {
          setUsers(updatedDataResponse.data.users);
          setPhones(updatedDataResponse.data.phones);
          setCalls(updatedDataResponse.data.calls);
          setPayments(updatedDataResponse.data.payments);
  
          fetchWeekData();
        } else {
          console.error('Error al obtener los datos actualizados');
        }
  
        handleCancelEditDeactivatePhone();
        setNotificationMessage('Teléfono desactivado con éxito');
        setTimeout(() => setNotificationMessage(null), 1000);
      } else {
        console.error('Error al desactivar el teléfono');
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.error(error)
        alert('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/', { replace: true });
      } else {
        console.error('Error al desactivar el teléfono:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Activar teléfono
  const handleEditActivatePhone = () => {
    setIsModalOpen('activatephone');
  };

  const handleCancelEditActivatePhone = () => {
    setActivateUserId('');
    setActivateUsername('');
    setActivatePhone('');
    setIsModalOpen(null);
  };

  const handleActivatePhone = async (e) => {
    e.preventDefault();

    // Encuentra el objeto de teléfono correspondiente en tu matriz de teléfonos
    const phoneToActivate = phones.find(phone => phone.phoneNumber === activatePhone);

    // Si no se encontró un teléfono, no se puede continuar
    if (!phoneToActivate) {
      alert('No se encontró un teléfono correspondiente al número seleccionado.');
      return;
    }

    const phoneId = phoneToActivate.id;  // Usa el id del teléfono encontrado

    const confirmActivate = window.confirm(`¿Está seguro de que desea activar este teléfono?\nID Teléfono ${phoneId}\nTeléfono ${phoneToActivate.phoneNumber}`);
    if (!confirmActivate) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(`${import.meta.env.VITE_APP_API_URL}/api/admins/phones/activate/${phoneId}`, {}, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setPhones(phones.filter((phone) => phone.isActive));
  
        const updatedDataResponse = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/admins`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          // Añadir estas líneas para enviar los parámetros de año, mes y semana en la solicitud
          params: {
            year: selectedYear,
            month: selectedMonth,
            week: selectedWeek,
          },
        });
  
        if (updatedDataResponse.status === 200) {
          setUsers(updatedDataResponse.data.users);
          setPhones(updatedDataResponse.data.phones);
          setCalls(updatedDataResponse.data.calls);
          setPayments(updatedDataResponse.data.payments);
  
          fetchWeekData();
        } else {
          console.error('Error al obtener los datos actualizados');
        }
  
        handleCancelEditActivatePhone();
        setNotificationMessage('Teléfono activado con éxito');
        setTimeout(() => setNotificationMessage(null), 1000);
      } else {
        console.error('Error al desactivar el teléfono');
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.error(error)
        alert('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/', { replace: true });
      } else {
        console.error('Error al activar el teléfono:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Añadir llamada
  const handleEditAddCallModal = () => {
    setCallUserId('');
    setCallUsername('');
    setCallPhone('');
    setIsModalOpen('addcall');
  }

  const handleCancelEditAddCall = () => {
    setCallUserId('');
    setCallUsername('');
    setCallPhone('');
    setIsModalOpen(null);
  }
  
  const handleAddCall = async (e) => {
    e.preventDefault();
  
    const selectedPhone = phones.find(phone => phone.phoneNumber === callPhone);

    // Obtener el ID de la semana desde el servidor
    const token = localStorage.getItem('token');
    let weekId;
    try {
      const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/admins/weekId`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        params: {
          year: selectedYear,
          month: selectedMonth,
          week: selectedWeek,
        },
      });
      weekId = response.data.weekId;
    } catch (error) {
      console.error('Error al obtener el ID de la semana:', error);
      alert('Error al obtener la semana. Intente de nuevo más tarde.');
      return;
    }
  
    if (!callUserId || !callUsername || !callPhone || !selectedPhone) {
      alert("Todos los campos son obligatorios.");
      return;
    }
  
    if (calls.some(call => call.telefono_id === selectedPhone.id && call.semana_id === weekId)) {
      alert("Ya hay una llamada para este teléfono en la semana seleccionada.");
      return;
    }
    
    const confirmAddCall = window.confirm(`¿Está seguro de que desea añadir esta llamada?`);
    if (!confirmAddCall) {
      return;
    }
  
    setLoading(true);
  
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/admins/calls`, {
        telefono_id: selectedPhone.id,
        semana_id: weekId,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (response.status === 201) {
        const updatedDataResponse = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/admins`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          // Añadir estas líneas para enviar los parámetros de año, mes y semana en la solicitud
          params: {
            year: selectedYear,
            month: selectedMonth,
            week: selectedWeek,
          },
        });
  
        if (updatedDataResponse.status === 200) {
          setUsers(updatedDataResponse.data.users);
          setPhones(updatedDataResponse.data.phones);
          setCalls(updatedDataResponse.data.calls);
          setPayments(updatedDataResponse.data.payments);
        } else {
          console.error('Error al obtener los datos actualizados');
        }
  
        handleCancelEditAddCall();
        setNotificationMessage('Llamada añadida con éxito');
        setTimeout(() => setNotificationMessage(null), 1000);
      } else {
        console.error('Error al añadir la llamada', response);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.error(error)
        alert('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/', { replace: true });
      } else {
        console.error('Error al añadir la llamada:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Eliminar teléfono
  const handleEditDeletePhone = () => {
    setDeleteUserIdPhone('');
    setDeleteUsernamePhone('');
    setDeleteIdPhone('');
    setDeletePhoneNumber('');
    setIsModalOpen('deletephone');
  };

  const handleCancelDeletePhone = () => {
    setDeleteUserIdPhone('');
    setDeleteUsernamePhone('');
    setDeleteIdPhone('');
    setDeletePhoneNumber('');
    setIsModalOpen(null);
  };

  const handleDeletePhone = async (e) => {
    e.preventDefault();

    if (deleteUserIdPhone === '' || deleteUsernamePhone === '' || deleteIdPhone === '' || deletePhoneNumber === '') {
      alert("Todos los campos son obligatorios.");
      return;
    }
    
    // Encuentra el objeto de teléfono correspondiente en tu matriz de teléfonos
    const phoneToDelete = phones.find(phone => phone.phoneNumber === deletePhoneNumber);

    // Si no se encontró un teléfono, no se puede continuar
    if (!phoneToDelete) {
      alert('No se encontró un teléfono correspondiente al número seleccionado.');
      return;
    }

    const phoneId = phoneToDelete.id;  // Usa el id del teléfono encontrado

    // Antes de intentar eliminar el teléfono, verifica si hay alguna llamada asociada con él
    const associatedCalls = calls.filter(call => call.telefono_id === phoneId);

    if (associatedCalls.length > 0) {
      alert('Este teléfono tiene llamadas asociadas. Por favor, elimine las llamadas antes de borrar el teléfono.');
      return;
    }

    const confirmDelete = window.confirm(`¿Está seguro de que desea eliminar este teléfono?\n${deleteUsernamePhone}\n${phoneToDelete.phoneNumber}`);
    if (!confirmDelete) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${import.meta.env.VITE_APP_API_URL}/api/admins/phones/${phoneId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setPhones(phones.filter((phone) => phone.id !== phoneId));
  
        const updatedDataResponse = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/admins`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          // Añadir estas líneas para enviar los parámetros de año, mes y semana en la solicitud
          params: {
            year: selectedYear,
            month: selectedMonth,
            week: selectedWeek,
          },
        });
  
        if (updatedDataResponse.status === 200) {
          setUsers(updatedDataResponse.data.users);
          setPhones(updatedDataResponse.data.phones);
          setCalls(updatedDataResponse.data.calls);
          setPayments(updatedDataResponse.data.payments);
  
          fetchWeekData();
          handleCancelDeletePhone();
        } else {
          console.error('Error al obtener los datos actualizados');
        }
  
        setNotificationMessage('Teléfono eliminado con éxito');
        setTimeout(() => setNotificationMessage(null), 1000);
      } else {
        console.error('Error al eliminar el teléfono');
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/', { replace: true });
      } else {
        console.error('Error al eliminar el teléfono:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Exportar todas las semanas a Google Sheets
  const handleExportToGoogleSheets = async () => {
    const confirmExport = window.confirm('¿Está seguro de que desea exportar todas las semanas a Google Sheets?\nSe recomeinda internet estable para ejecutar esta acción');
    if (!confirmExport) {
      return;
    }

    setLoading(true);
  
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/admins/backup`, {}, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (response.status === 200) {
        setNotificationMessage('Semanas respaldadas con éxito.');
        setTimeout(() => setNotificationMessage(null), 1000);
      } else {
        console.error('Hubo un error al exportar los datos.');
        alert('Hubo un error al exportar los datos.');
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/', { replace: true });
      } else {
        console.error('Error al exportar los datos:', error);
        alert('Hubo un error al exportar los datos.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Exportar una semana a Google Sheets
  const handleExportWeekToGoogleSheets = async () => {
    const key = `${selectedYear}${selectedMonth}[${selectedWeek}]`;
    // Obtener el ID de la semana desde el servidor
    const token = localStorage.getItem('token');
    let weekId;
    try {
      const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/admins/weekId`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        params: {
          year: selectedYear,
          month: selectedMonth,
          week: selectedWeek,
        },
      });
      weekId = response.data.weekId;
    } catch (error) {
      console.error('Error al obtener el ID de la semana:', error);
      alert('Error al obtener la semana. Intente de nuevo más tarde.');
      return;
    }
    
    if (!weekId) {
      alert('No hay semana para exportar');
      return;
    }
  
    const confirmExport = window.confirm(`¿Está seguro de que desea exportar esta fecha?\n${key}`);
    if (!confirmExport) {
      return;
    }
  
    setLoading(true);
  
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/admins/backup/${weekId}`, {}, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (response.status === 200) {
        setNotificationMessage('Semana respaldada con éxito.');
        setTimeout(() => setNotificationMessage(null), 1000);
      } else {
        console.error('Hubo un error al exportar los datos de la semana actual.');
        alert('Hubo un error al exportar los datos de la semana actual.');
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/', { replace: true });
      } else {
        console.error('Error al exportar los datos de la semana actual:', error);
        alert('Hubo un error al exportar los datos de la semana actual.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para filtrar registros basado en los valores seleccionados
  const filterRecords = (records) => {
    if (!records) {
      return [];
    }
    return records.filter(record => {
      const isYearMatch = selectedYear === '' || Number(record.Week.anio) === Number(selectedYear);
      const isMonthMatch = selectedMonth === '' || record.Week.mes === selectedMonth;
      const isWeekMatch = selectedWeek === '' || record.Week.semana === selectedWeek;
      return isYearMatch && isMonthMatch && isWeekMatch;
    });
  };

  const filterCallsBySearch = (records) => {
    if (callSearch === '') {
      return records;
    }

    const searchLowerCase = callSearch.toLowerCase();
    return records.filter((record) => {
      const user = users.find((user) => user.id === record.Phone.UserId);
      const username = user ? user.username.toLowerCase() : '';
      const phone = phones.find((phone) => phone.id === record.Phone.id);
      const phoneNumber = phone ? phone.phoneNumber : '';

      return (
        username.includes(searchLowerCase) ||
        phoneNumber.includes(searchLowerCase)
      );
    });
  };

  // Restablecer la página activa a 1 si se realiza una búsqueda en llamadas y la página activa no es 1
  useEffect(() => {
    if (callSearch !== '' && callsPage !== 1) {
      setCallsPage(1);
    }
  }, [callSearch, callsPage]);

  const filterPaymentsBySearch = (payments) => {
    if (paymentSearch === '') {
      return payments;
    }
  
    const searchLowerCase = paymentSearch.toLowerCase();
    return payments.filter((payment) => {
      const user = users.find((user) => user.id === payment.UserId);
      const username = user ? user.username.toLowerCase() : '';
      const totalAmountSum = payment.totalAmountSum.toString();

      return (
        username.includes(searchLowerCase) ||
        totalAmountSum.includes(searchLowerCase)
      );
    });
  };

  // Restablecer la página activa a 1 si se realiza una búsqueda en pagos y la página activa no es 1
  useEffect(() => {
    if (paymentSearch !== '' && paymentsPage !== 1) {
      setPaymentsPage(1);
    }
  }, [paymentSearch, paymentsPage]);

  // Filtra los registros antes de renderizarlos en la tabla
  const filteredCalls = filterCallsBySearch(filterRecords(calls));
  const filteredPayments = filterPaymentsBySearch(filterRecords(payments));

  const paginate = (items, currentPage, itemsPerPage, showAll) => {
    if (showAll) {
      return items;
    } else {
      const startIndex = (currentPage - 1) * itemsPerPage;
      return items.slice(startIndex, startIndex + itemsPerPage);
    }
  };
  
  const displayedCalls = paginate(filteredCalls, callsPage, callsItemsPerPage, showAllCalls);
  const displayedPayments = paginate(filteredPayments, paymentsPage, paymentsItemsPerPage, showAllPayments);

  const uniqueYears = useMemo(() => Array.from(new Set((weeks || []).map(week => week.anio))), [weeks]);

  const uniqueMonthsForSelectedYear = useMemo(() => selectedYear
      ? Array.from(new Set(weeks ? weeks.filter(week => week.anio === Number(selectedYear)).map(week => week.mes) : []))
      : [], [weeks, selectedYear]);
  
  const uniqueWeeksForSelectedMonth = useMemo(() => selectedMonth && selectedYear
      ? Array.from(new Set(weeks ? weeks.filter(week => week.mes === selectedMonth && week.anio === Number(selectedYear)).map(week => week.semana) : []))
      : [], [weeks, selectedMonth, selectedYear]);

  const uniquePhoneIds = useMemo(() => {
      return Array.from(new Set((phones || []).map(phone => phone.id)));
  }, [phones]);
      
  const uniquePhones = useMemo(() => {
    return Array.from(new Set((phones || []).map(phone => phone.phoneNumber)));
  }, [phones]);

  const uniqueIDs = useMemo(() => {
    return Array.from(new Set((users || []).map(user => user.id)))
  }, [users]);

  const uniqueUsernames = useMemo(() => {
    return Array.from(new Set((users || []).map(user => user.username)))
  }, [users]);

  const uniqueDeactivateUserIDs = useMemo(() => {
      return Array.from(new Set((users || []).filter(user => phones.some(phone => phone.UserId === user.id && phone.isActive)).map(user => user.id)))
    }, [users, phones]);

  const uniqueDeactivateUsernames = useMemo(() => {
      return Array.from(new Set((users || []).filter(user => phones.some(phone => phone.UserId === user.id && phone.isActive)).map(user => user.username)))
    }, [users, phones]);

  const uniqueActivateUserIDs = useMemo(() => {
      return Array.from(new Set((users || []).filter(user => phones.some(phone => phone.UserId === user.id && !phone.isActive)).map(user => user.id)))
    }, [users, phones]);

  const uniqueActivateUsernames = useMemo(() => {
      return Array.from(new Set((users || []).filter(user => phones.some(phone => phone.UserId === user.id && !phone.isActive)).map(user => user.username)))
    }, [users, phones]);

  const uniqueDeactivateUserPhones = useMemo(() => {
    // consider only active phones
    const activePhones = deactivateUserPhones.filter(phone => {
      const phoneObject = phones.find(item => item.phoneNumber === phone);
      return phoneObject && phoneObject.isActive;
    });
    return Array.from(new Set(activePhones));
  }, [deactivateUserPhones, phones]);

  const uniqueActivateUserPhones = useMemo(() => {
    // consider only inactive phones
    const inactivePhones = activateUserPhones.filter(phone => {
      const phoneObject = phones.find(item => item.phoneNumber === phone);
      return phoneObject && !phoneObject.isActive;
    });
    return Array.from(new Set(inactivePhones));
  }, [activateUserPhones, phones]);

  // Añadir llamada
  const getWeekId = async (year, month, week) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/admins/weekId`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        params: {
          year: year,
          month: month,
          week: week,
        },
      });
      return response.data.weekId;
    } catch (error) {
      console.error('Error al obtener el ID de la semana:', error);
      return;
    }
  };

  // Llamadas que corresponden a la semana seleccionada
  const [callsForSelectedWeek, setCallsForSelectedWeek] = useState([]);

  // Filtrar las llamadas según la semana seleccionada cada vez que cambian las llamadas o la semana seleccionada
  useEffect(() => {
    const filterCallsByWeek = async (calls, year, month, week) => {
      if (!calls || !year || !month || !week) {
        return [];
      }
      const weekId = await getWeekId(year, month, week);
      return calls.filter(call => call.semana_id === weekId);
    };
  
    const fetchCalls = async () => {
      const filteredCalls = await filterCallsByWeek(calls, selectedYear, selectedMonth, selectedWeek);
      setCallsForSelectedWeek(filteredCalls || []);
    };
  
    fetchCalls();
  }, [calls, selectedYear, selectedMonth, selectedWeek]);

  // Teléfonos que están activos pero no tienen llamadas en la semana actual
  const uniqueActiveNonCalledPhones = useMemo(() => {
    const activePhones = phones.filter(phone => phone.isActive).map(phone => phone.phoneNumber);
    const calledPhones = callsForSelectedWeek.map(call => {
      const phone = phones.find(phone => phone.id === call.telefono_id);
      return phone ? phone.phoneNumber : null;
    });
    return Array.from(new Set(activePhones.filter(phone => !calledPhones.includes(phone))));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callsForSelectedWeek, phones]);

  // Teléfonos que pertenecen al usuario seleccionado y que están activos pero no tienen llamadas en la semana actual
  const uniqueCallUserPhones = useMemo(() => {
    // consider only active and non-called phones
    const activeNonCalledPhones = callUserPhones.filter(phone => {
      const phoneObject = phones.find(item => item.phoneNumber === phone);
      return phoneObject && phoneObject.isActive && uniqueActiveNonCalledPhones.includes(phone);
    });
    return Array.from(new Set(activeNonCalledPhones));
  }, [callUserPhones, phones, uniqueActiveNonCalledPhones]);

  // IDs de usuarios que tienen al menos un teléfono que está activo pero no tienen llamadas en la semana actual
  const uniqueActiveNonCalledUserIDs = useMemo(() => {
    return Array.from(new Set(phones
      .filter(phone => phone.isActive && uniqueActiveNonCalledPhones.includes(phone.phoneNumber))
      .map(phone => phone.UserId)
    ));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phones, uniqueActiveNonCalledPhones]);

  // Nombres de usuario que corresponden a los IDs de usuario que tienen al menos un teléfono que está activo pero no tienen llamadas en la semana actual
  const uniqueActiveNonCalledUsernames = useMemo(() => {
    const userIdsSet = new Set(uniqueActiveNonCalledUserIDs);
    return Array.from(new Set(users.filter(user => userIdsSet.has(user.id)).map(user => user.username)));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, uniqueActiveNonCalledUserIDs]);

  // Actualizar selectedYear al año más reciente
  useEffect(() => {
    // Encontrar el año más alto si uniqueYears no está vacío
    if (uniqueYears.length > 0) {
      const maxYear = Math.max(...uniqueYears);
      setSelectedYear(maxYear);
    }
  }, [uniqueYears]);
  
  // Actualizar selectedMonth al mes más reciente
  useEffect(() => {
    if (selectedYear && uniqueMonthsForSelectedYear.length > 0) {
      const monthsInNumbers = {
        'Enero': 1,
        'Febrero': 2,
        'Marzo': 3,
        'Abril': 4,
        'Mayo': 5,
        'Junio': 6,
        'Julio': 7,
        'Agosto': 8,
        'Septiembre': 9,
        'Octubre': 10,
        'Noviembre': 11,
        'Diciembre': 12,
      };

      const sortedMonths = uniqueMonthsForSelectedYear.sort((a, b) => monthsInNumbers[b] - monthsInNumbers[a]);
      setSelectedMonth(sortedMonths[0]);
    }
  }, [uniqueMonthsForSelectedYear, selectedYear]);

  // Actualizar selectedWeek a la semana más reciente
  useEffect(() => {
    // Ordenar las semanas por el número final
    if (selectedYear && selectedMonth && uniqueWeeksForSelectedMonth.length > 0) {
      const sortedWeeks = uniqueWeeksForSelectedMonth.sort((a, b) => {
        const endWeekA = Number(a.split(' - ')[1]);
        const endWeekB = Number(b.split(' - ')[1]);
        return endWeekB - endWeekA;
      });

      setSelectedWeek(sortedWeeks[0]);
    }
  }, [uniqueWeeksForSelectedMonth, selectedYear, selectedMonth]);

  const handleKeyDown = (event, formType) => {
    event.stopPropagation();

    if (event.key === "Enter") {
      event.preventDefault();
      if (formType === 'call') {
        handleSubmitEditCall(event);
      } else if (formType === 'payment') {
        handleSubmitEditPayment(event);
      } else if (formType === 'addweek') {
        handleSubmitAddWeek(event);
      } else if (formType === 'updateweek') {
        handleUpdateWeek(event);
      } else if (formType === 'addphone') {
        handleSubmitAddPhone(event);
      } else if (formType === 'updatephone') {
        handleUpdatePhone(event);
      } else if (formType === 'deactivatephone') {
        handleDeactivatePhone(event);
      } else if (formType === 'activatephone') {
        handleActivatePhone(event);
      } else if (formType === 'addcall') {
        handleAddCall(event);
      } else if (formType === 'deletephone') {
        handleDeletePhone(event);
      }
    }
  };

  const handleInputKeyDown = (e) => {
    e.stopPropagation();
    if (e.key === 'Escape') {
      setEditingCell({ rowId: null, field: null });
      setEditingCall({});
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleFinishEditing();
    }
  };
  
  const toggleCalls = () => {
    setShowCalls(!showCalls);
  };

  const togglePayments = () => {
    setShowPayments(!showPayments);
  };

  const closeModal = () => {
    // Manejar el estado existente primero
    if (isModalOpen === 'call') {
      handleCancelEditCall();
    } else if (isModalOpen === 'payment') {
      handleCancelEditPayment();
    } else if (isModalOpen === 'addweek') {
      handleCancelEditAddWeek();
    } else if (isModalOpen === 'updateweek') {
      handleCancelUpdateWeek();
    } else if (isModalOpen === 'addphone') {
      handleCancelEditAddPhone();
    } else if (isModalOpen === 'updatephone') {
      handleCancelUpdatePhone();
    } else if (isModalOpen === 'deactivatephone') {
      handleCancelEditDeactivatePhone();
    } else if (isModalOpen === 'activatephone') {
      handleCancelEditActivatePhone();
    } else if (isModalOpen === 'addcall') {
      handleCancelEditAddCall();
    } else if (isModalOpen === 'deletephone') {
      handleCancelDeletePhone();
    }
  
    // Luego establecer isModalOpen a null
    setIsModalOpen(null);
  };
  
  //Modal.setAppElement('#root');

  const monthsInOrder = [
    "Diciembre",
    "Noviembre",
    "Octubre",
    "Septiembre",
    "Agosto",
    "Julio",
    "Junio",
    "Mayo",
    "Abril",
    "Marzo",
    "Febrero",
    "Enero"
  ];

  // Añadir teléfono
  const handleKeyPress = (event) => {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
    }
  };
  
  const handleIdChange = (e, value) => {
    const selectedId = isNaN(value) ? value : Number(value); // convertir la entrada a un número si es posible
    const selectedUser = users.find(user => user.id === selectedId);
    
    if (selectedUser) {
      setUsernamePhone(selectedUser.username);
      setIdUserPhone(selectedUser.id);
    } else {
      setUsernamePhone('');
    }
  };

  const handleUsernameChange = (e, value) => {
    const selectedUsername = value;
    setUsernamePhone(selectedUsername);
  
    const selectedUser = users.find(user => user.username === selectedUsername);
    if (selectedUser) {
      setIdUserPhone(selectedUser.id);
    } else {
      setIdUserPhone('');
    }
  };

  // Editar teléfono
  const handleUpdateIdChange = (e) => {
    const selectedId = Number(e.target.value); // convert the input to a number
    const selectedUser = users.find(user => user.id === selectedId);
    if (selectedUser) {
      setUpdateUsernamePhone(selectedUser.username);
      setUpdateUserIdPhone(selectedUser.id);
      const userPhones = phones.filter(phone => phone.UserId === selectedUser.id);
      if (!updateIdPhone) {
        setUpdateIdPhone(userPhones[0]?.id || '');  // establecer a una cadena vacía si es undefined
        setUpdatePhoneNumberOld(userPhones[0]?.phoneNumber || '');  // establecer a una cadena vacía si es undefined
      }
    } else {
      setUpdateUsernamePhone('');
      setUpdateUserIdPhone('');
      setUpdateIdPhone('');
      setUpdatePhoneNumberOld('');
    }
  };

  const handleUpdateUsernameChange = (e, value) => {
    const selectedUsername = value;
    setUpdateUsernamePhone(selectedUsername); // Allow writing username
  
    const selectedUser = users.find(user => user.username === selectedUsername);
    if (selectedUser) {
      setUpdateUserIdPhone(selectedUser.id);
      const userPhones = phones.filter(phone => phone.UserId === selectedUser.id);
      if (!updateIdPhone) {
        setUpdateIdPhone(userPhones[0]?.id || '');  // establecer a una cadena vacía si es undefined
        setUpdatePhoneNumberOld(userPhones[0]?.phoneNumber || '');  // establecer a una cadena vacía si es undefined
      }
    } else {
      setUpdateUserIdPhone('');
      setUpdateIdPhone('');
      setUpdatePhoneNumberOld('');
    }
  };

  const handleUpdateIdPhoneChange = (e) => {
    const selectedId = Number(e.target.value);
    const selectedPhone = phones.find(phone => phone.id === selectedId);
    if (selectedPhone) {
      const selectedUser = users.find(user => user.id === selectedPhone.UserId);
      setUpdateUsernamePhone(selectedUser.username);
      setUpdateUserIdPhone(selectedUser.id);
      setUpdateIdPhone(selectedPhone.id);
      setUpdatePhoneNumberOld(selectedPhone.phoneNumber);
    }
  };

  const handleUpdatePhoneChange = (e, value) => {
    const updatePhoneNumberOld = value;
    setUpdatePhoneNumberOld(updatePhoneNumberOld);
  
    const selectedUserPhone = phones.find(phone => phone.phoneNumber === updatePhoneNumberOld);
    if (selectedUserPhone) {
      const selectedUser = users.find(user => user.id === selectedUserPhone.UserId);
      setUpdateUsernamePhone(selectedUser.username);
      setUpdateUserIdPhone(selectedUser.id);
      setUpdateIdPhone(selectedUserPhone.id);
    } else {
      setUpdateIdPhone('');
    }
  };
  
  // Desactivar Teléfono
  const handleDeactivateIdChange = (e, value) => {
    const deactivateId = isNaN(value) ? value : Number(value);
    const deactivateUser = users.find(user => user.id === deactivateId);
    if (deactivateUser) {
      const deactivatePhones = phones.filter(phone => phone.UserId === deactivateUser.id && phone.isActive);
      setDeactivateUserPhones(deactivatePhones.map(phone => phone.phoneNumber));
      setDeactivateUsername(deactivateUser.username);
      setDeactivateUserId(deactivateUser.id.toString());
      if (!deactivatePhone) {
        setDeactivatePhone(deactivatePhones[0]?.phoneNumber || '');  // establecer a una cadena vacía si es undefined
      }
    } else {
      setDeactivateUserPhones([]);
      setDeactivateUsername('');
      setDeactivateUserId('');
      setDeactivatePhone('');
    }
  };

  const handleDeactivateUsernameChange = (e, value) => {
    const deactivateUsername = value;
    setDeactivateUsername(deactivateUsername);
  
    const deactivateUser = users.find(user => user.username === deactivateUsername);
    if (deactivateUser) {
      const deactivatePhones = phones.filter(phone => phone.UserId === deactivateUser.id && phone.isActive);
      setDeactivateUserPhones(deactivatePhones.map(phone => phone.phoneNumber));
      setDeactivateUserId(deactivateUser.id.toString());
      if (!deactivatePhone) {
        setDeactivatePhone(deactivatePhones[0]?.phoneNumber || '');  // establecer a una cadena vacía si es undefined
      }
    } else {
      setDeactivateUserPhones([]);
      setDeactivateUserId('');
      setDeactivatePhone('');
    }
  };

  const handleDeactivatePhoneChange = (e, value) => {
    const deactivatePhone = value;
    setDeactivatePhone(deactivatePhone);
  
    const deactivateUserPhone = phones.find(phone => phone.phoneNumber === deactivatePhone && phone.isActive);
    if (deactivateUserPhone) {
      const deactivateUser = users.find(user => user.id === deactivateUserPhone.UserId);
      setDeactivateUsername(deactivateUser.username);
      setDeactivateUserId(deactivateUser.id);
      const deactivatePhones = phones.filter(phone => phone.UserId === deactivateUser.id && phone.isActive);
      setDeactivateUserPhones(deactivatePhones.map(phone => phone.phoneNumber));
    }
  };

  // Activar Teléfono
  const handleActivateIdChange = (e, value) => {
    const activateId = isNaN(value) ? value : Number(value);
    const activateUser = users.find(user => user.id === activateId);
    if (activateUser) {
      const activatePhones = phones.filter(phone => phone.UserId === activateUser.id && !phone.isActive);
      setActivateUserPhones(activatePhones.map(phone => phone.phoneNumber));
      setActivateUsername(activateUser.username);
      setActivateUserId(activateUser.id.toString());
      if (!activatePhone) {
        setActivatePhone(activatePhones[0]?.phoneNumber || '');  // establecer a una cadena vacía si es undefined
      }
    } else {
      setActivateUserPhones([]);
      setActivateUsername('');
      setActivateUserId('');
      setActivatePhone('');
    }
  };

  const handleActivateUsernameChange = (e, value) => {
    const activateUsername = value;
    setActivateUsername(activateUsername);
  
    const activateUser = users.find(user => user.username === activateUsername);
    if (activateUser) {
      const activatePhones = phones.filter(phone => phone.UserId === activateUser.id && !phone.isActive);
      setActivateUserPhones(activatePhones.map(phone => phone.phoneNumber));
      setActivateUserId(activateUser.id.toString());
      if (!activatePhone) {
        setActivatePhone(activatePhones[0]?.phoneNumber || '');  // establecer a una cadena vacía si es undefined
      }
    } else {
      setActivateUserPhones([]);
      setActivateUserId('');
      setActivatePhone('');
    }
  };

  const handleActivatePhoneChange = (e, value) => {
    const activatePhone = value;
    setActivatePhone(activatePhone);

    const activateUserPhone = phones.find(phone => phone.phoneNumber === activatePhone && !phone.isActive);
    if (activateUserPhone) {
      const activateUser = users.find(user => user.id === activateUserPhone.UserId);
      setActivateUsername(activateUser.username);
      setActivateUserId(activateUser.id);
      const activatePhones = phones.filter(phone => phone.UserId === activateUser.id && !phone.isActive);
      setActivateUserPhones(activatePhones.map(phone => phone.phoneNumber));
    }
  };

  // Añadir Llamada
  const handleCallUserIdChange = (e, value) => {
    const selectedId = isNaN(value) ? value : Number(value);
    const selectedUser = users.find(user => user.id === selectedId);
    if (selectedUser) {
      const userPhones = phones.filter(phone => phone.UserId === selectedUser.id && phone.isActive && uniqueActiveNonCalledPhones.includes(phone.phoneNumber));
      setCallUserPhones(userPhones.map(phone => phone.phoneNumber));
      setCallUsername(selectedUser.username);
      setCallUserId(selectedUser.id.toString());
      if (!callPhone) {
        setCallPhone(userPhones[0]?.phoneNumber || '');  // establecer a una cadena vacía si es undefined
      }
    } else {
      setCallUserPhones([]);
      setCallUsername('');
      setCallUserId('');
      setCallPhone('');
    }
  };
  
  const handleCallUsernameChange = (e, value) => {
    const selectedUsername = value;
    setCallUsername(selectedUsername);
    
    const selectedUser = users.find(user => user.username === selectedUsername);
    if (selectedUser) {
      const userPhones = phones.filter(phone => phone.UserId === selectedUser.id && phone.isActive && uniqueActiveNonCalledPhones.includes(phone.phoneNumber));
      setCallUserPhones(userPhones.map(phone => phone.phoneNumber));
      setCallUserId(selectedUser.id.toString());
      if (!callPhone) {
        setCallPhone(userPhones[0]?.phoneNumber || '');  // establecer a una cadena vacía si es undefined
      }
    } else {
      setCallUserPhones([]);
      setCallUserId('');
      setCallPhone('');
    }
  };
  
  const handleCallPhoneChange = (e, value) => {
    const selectedPhone = value;
    setCallPhone(selectedPhone);
    
    const selectedUserPhone = phones.find(phone => phone.phoneNumber === selectedPhone && phone.isActive);
    if (selectedUserPhone) {
      const selectedUser = users.find(user => user.id === selectedUserPhone.UserId);
      setCallUsername(selectedUser.username);
      setCallUserId(selectedUser.id.toString());
    }
  };

  // Eliminar teléfono
  const handleDeleteIdChange = (e, value) => {
    const selectedId = isNaN(value) ? value : Number(value);
    const selectedUser = users.find(user => user.id === selectedId);
    if (selectedUser) {
      setDeleteUsernamePhone(selectedUser.username);
      setDeleteUserIdPhone(selectedUser.id);
      const userPhones = phones.filter(phone => phone.UserId === selectedUser.id);
      if (!deleteIdPhone) {
        setDeleteIdPhone(userPhones[0]?.id || '');  // establecer a una cadena vacía si es undefined
        setDeletePhoneNumber(userPhones[0]?.phoneNumber || '');  // establecer a una cadena vacía si es undefined
      }
    } else {
      setDeleteUsernamePhone('');
      setDeleteUserIdPhone('');
      setDeleteIdPhone('');
      setDeletePhoneNumber('');
    }
  };

  const handleDeleteUsernameChange = (e, value) => {
    const selectedUsername = value;
    setDeleteUsernamePhone(selectedUsername); // Allow writing username
  
    const selectedUser = users.find(user => user.username === selectedUsername);
    if (selectedUser) {
      setDeleteUserIdPhone(selectedUser.id);
      const userPhones = phones.filter(phone => phone.UserId === selectedUser.id);
      if (!deleteIdPhone) {
        setDeleteIdPhone(userPhones[0]?.id || '');  // establecer a una cadena vacía si es undefined
        setDeletePhoneNumber(userPhones[0]?.phoneNumber || '');  // establecer a una cadena vacía si es undefined
      }
    } else {
      setDeleteUserIdPhone('');
      setDeleteIdPhone('');
      setDeletePhoneNumber('');
    }
  };

  const handleDeleteIdPhoneChange = (e) => {
    const selectedId = Number(e.target.value);
    const selectedPhone = phones.find(phone => phone.id === selectedId);
    if (selectedPhone) {
      const selectedUser = users.find(user => user.id === selectedPhone.UserId);
      setDeleteUsernamePhone(selectedUser.username);
      setDeleteUserIdPhone(selectedUser.id);
      setDeleteIdPhone(selectedPhone.id);
      setDeletePhoneNumber(selectedPhone.phoneNumber);
    }
  };

  const handleDeletePhoneChange = (e, value) => {
    const deletePhoneNumber = value;
    setDeletePhoneNumber(deletePhoneNumber);

    const selectedUserPhone = phones.find(phone => phone.phoneNumber === deletePhoneNumber);
    if (selectedUserPhone) {
      const selectedUser = users.find(user => user.id === selectedUserPhone.UserId);
      setDeleteUsernamePhone(selectedUser.username);
      setDeleteUserIdPhone(selectedUser.id);
      setDeleteIdPhone(selectedUserPhone.id);
    } else {
      setDeleteIdPhone('');
    }
  };

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
            <Typography variant="h7" component="h1" gutterBottom align="center" style={{ marginBottom: '11.20px' }}>Panel de administrador</Typography>
  
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

            <Box sx={{ 
              display: 'flex', 
              flexDirection: isSmallScreen ? 'column' : 'row', 
              alignItems: isSmallScreen ? 'center' : 'initial',
              justifyContent: 'center',
              marginBottom: '7px'
            }}>
              <Typography variant="h7" gutterBottom sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: isSmallScreen ? 'column' : 'row', 
                  alignItems: 'center', 
                  marginRight: '2em' 
                }}>
                  <strong>Fecha:</strong>
                  <Select
                    className='select'
                    style={{maxHeight: '30px', fontSize: '14px'}}
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value);
                      // Obtén los meses para el año seleccionado
                      const monthsForSelectedYear = weeks.filter(week => week.anio === Number(e.target.value));
                      const uniqueMonthsForSelectedYear = Array.from(new Set(monthsForSelectedYear.map(week => week.mes)));

                      // Ordena los meses en orden cronológico inverso
                      const monthsInNumbers = {
                        'Enero': 1,
                        'Febrero': 2,
                        'Marzo': 3,
                        'Abril': 4,
                        'Mayo': 5,
                        'Junio': 6,
                        'Julio': 7,
                        'Agosto': 8,
                        'Septiembre': 9,
                        'Octubre': 10,
                        'Noviembre': 11,
                        'Diciembre': 12,
                      };
                      const sortedMonths = uniqueMonthsForSelectedYear.sort((a, b) => monthsInNumbers[b] - monthsInNumbers[a]);

                      // Establece el mes al mes más reciente para el año seleccionado
                      if (sortedMonths.length > 0) {
                        setSelectedMonth(sortedMonths[0]);

                        // Obtén las semanas para el mes y el año seleccionados
                        const weeksForSelectedMonth = weeks.filter(week => week.mes === sortedMonths[0] && week.anio === Number(e.target.value));
                        const uniqueWeeksForSelectedMonth = Array.from(new Set(weeksForSelectedMonth.map(week => week.semana)));
                        const sortedWeeks = uniqueWeeksForSelectedMonth.sort((a, b) => Number(b.split(' - ')[1]) - Number(a.split(' - ')[1]));
                        
                        // Establece la semana a la semana más reciente para el mes y el año seleccionados
                        if (sortedWeeks.length > 0) {
                          setSelectedWeek(sortedWeeks[0]);
                        } else {
                          // Si no hay semanas disponibles para el mes y el año seleccionados, establece la semana a un valor vacío
                          setSelectedWeek("");
                        }
                      } else {
                        // Si no hay meses disponibles para el año seleccionado, establece el mes a un valor vacío
                        setSelectedMonth("");
                      }
                    }}
                  >
                    <MenuItem value="" disabled style={darkMode ? { background: 'rgb(24, 26, 27)', color: '#d8d4cf' } : {}}><em>Año</em></MenuItem>
                    {uniqueYears.sort((a, b) => b - a).map((year, index) => (
                      <MenuItem key={index} value={year} style={darkMode ? { background: 'rgb(24, 26, 27)', color: '#d8d4cf' } : {}}>{year}</MenuItem>
                    ))}
                  </Select>
                  <Select
                    className='select'
                    style={{maxHeight: '30px', fontSize: '14px'}}
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(e.target.value);
                      // Obtén las semanas para el mes y el año seleccionados
                      const weeksForSelectedMonth = weeks.filter(week => week.mes === e.target.value && week.anio === Number(selectedYear));
                      const uniqueWeeksForSelectedMonth = Array.from(new Set(weeksForSelectedMonth.map(week => week.semana)));
                      const sortedWeeks = uniqueWeeksForSelectedMonth.sort((a, b) => Number(b.split(' - ')[1]) - Number(a.split(' - ')[1]));
                      
                      // Establece la semana a la semana más reciente para el mes seleccionado
                      if (sortedWeeks.length > 0) {
                        setSelectedWeek(sortedWeeks[0]);
                      } else {
                        // Si no hay semanas disponibles para el mes seleccionado, establece la semana a un valor vacío
                        setSelectedWeek("");
                      }
                    }}
                  >
                    <MenuItem value="" disabled style={darkMode ? { background: 'rgb(24, 26, 27)', color: '#d8d4cf' } : {}}><em>Mes</em></MenuItem>
                    {monthsInOrder.filter(month => uniqueMonthsForSelectedYear.includes(month)).map((month, index) => (
                      <MenuItem key={index} value={month} style={darkMode ? { background: 'rgb(24, 26, 27)', color: '#d8d4cf' } : {}}>{month}</MenuItem>
                    ))}
                  </Select>
                  <Select
                    className='select'
                    style={{maxHeight: '30px', fontSize: '14px'}}
                    value={selectedWeek}
                    onChange={(e) => {
                      setSelectedWeek(e.target.value);
                    }}
                  >
                    <MenuItem value="" disabled style={darkMode ? { background: 'rgb(24, 26, 27)', color: '#d8d4cf' } : {}}><em>Semana</em></MenuItem>
                    {uniqueWeeksForSelectedMonth.sort((a, b) => {
                      const endWeekA = Number(a.split(' - ')[1]);
                      const endWeekB = Number(b.split(' - ')[1]);
                      return endWeekB - endWeekA;
                    }).map((week, index) => (
                      <MenuItem key={index} value={week} style={darkMode ? { background: 'rgb(24, 26, 27)', color: '#d8d4cf' } : {}}>{week}</MenuItem>
                    ))}
                  </Select>

                  <Button title="Añadir fecha" className='button-table' onClick={() => handleEditAddWeek()}>➕</Button>
                  <Modal
                    open={isModalOpen === 'addweek'}
                    onClose={closeModal}
                    aria-labelledby="Edit User Modal"
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
                        width: '70%',
                        height: '70%',
                        backgroundColor: 'white',
                        margin: 'auto',
                      }}
                    >
                      <form onSubmit={handleSubmitAddWeek} onKeyDown={(event) => handleKeyDown(event, 'addweek')}>
                        <Typography 
                          variant="h5" 
                          component="h2" 
                          sx={{ marginBlockEnd: '10px' }}
                        >
                          Añadir Fecha
                        </Typography>
                        
                        <Box className="input-container-banco">
                          {addYear ? (
                            <TextField
                              label="Año"
                              className="input-year"
                              id="addYear"
                              type="number"
                              value={addYear}
                              style={{ width: '185px' }}
                              InputLabelProps={{
                                className: 'labels'
                              }}
                              InputProps={{
                                inputProps: {
                                  min: 2023,
                                },
                                className: 'textfields'
                              }}
                              onChange={(e) => {
                                const num = parseFloat(e.target.value);
                                if (Number.isInteger(num) && num >= 2023) {
                                  setAddYear(e.target.value);
                                }
                              }}
                              onKeyPress={(e) => e.preventDefault()}
                            />
                          ) : (
                            <FormControl style={{ marginTop: '10px' }}>
                              <InputLabel id="years-label" className="labels">Año</InputLabel>
                              <Select
                                id="years"
                                labelId="years-label"
                                value={addYear}
                                style={{ width: '185px' }}
                                onChange={(e) => setAddYear(e.target.value)}
                                className='select'
                              >
                                {uniqueYears.map((year, index) => (
                                  <MenuItem key={index} value={year}>{year}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                        </Box>
                        <br />
                        <FormControl style={{ marginTop: '10px', marginBottom: '10px', width: '100%' }}>
                          <InputLabel id="addMonth-label" className="labels">Mes</InputLabel>
                          <Select
                            labelId="addMonth-label"
                            id="addMonth"
                            value={addMonth}
                            style={{ width: '185px' }}
                            onChange={(e) => setAddMonth(e.target.value)}
                            className='select'
                          >
                            {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((month, index) => (
                              <MenuItem key={index} value={month}>{month}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <br />
                        <Box display="flex" alignItems="center">
                          <FormControl style={{ marginBottom: '10px', marginRight: '10px' }}>
                            <InputLabel id="addWeekStart-label" className="labels">Semana</InputLabel>
                            <Select
                              labelId="addWeekStart-label"
                              id="addWeekStart"
                              value={addWeekStart}
                              style={{ width: '80px' }}
                              onChange={(e) => {
                                setAddWeekStart(e.target.value);
                                setAddWeek(`${e.target.value} - ${addWeekStart}`);
                              }}
                              className='select'
                            >
                              {Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0')).map((num) => (
                                <MenuItem key={num} value={num}>
                                  {num}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>

                          <Typography variant="body1" component="span"> - </Typography>

                          <FormControl style={{ marginBottom: '10px', marginLeft: '10px' }}>
                            <InputLabel id="addWeekEnd-label" className="labels"></InputLabel>
                            <Select
                              labelId="addWeekEnd-label"
                              id="addWeekEnd"
                              value={addWeekEnd}
                              style={{ width: '80px' }}
                              onChange={(e) => {
                                setAddWeekEnd(e.target.value);
                                setAddWeek(`${addWeekStart} - ${e.target.value}`);
                              }}
                              className='select'
                            >
                              {Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0')).map((num) => (
                                <MenuItem key={num} value={num}>
                                  {num}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>

                        <Button startIcon={<CloseIcon />} title="Cancelar" type="button" variant="contained" color="secondary" onClick={closeModal}></Button>
                        <Button startIcon={<CheckIcon />} title="Guardar" type="submit" variant="contained" color="primary"/>
                      </form>
                    </Box>
                  </Modal>

                  <Button title="Editar fecha" className='button-table' onClick={() => handleEditUpdateWeek()}>✏️</Button>
                  <Modal
                    open={isModalOpen === 'updateweek'}
                    onClose={closeModal}
                    aria-labelledby="Edit User Modal"
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
                        width: '70%',
                        height: '70%',
                        backgroundColor: 'white',
                        margin: 'auto',
                      }}
                    >
                      <form onSubmit={handleUpdateWeek} onKeyDown={(event) => handleKeyDown(event, 'updateweek')}>
                        <Typography 
                          variant="h5" 
                          component="h2" 
                          sx={{ marginBlockEnd: '10px' }}
                        >
                          Editar Fecha
                        </Typography>

                        <Box className="input-container-banco">
                          <TextField
                            label="ID"
                            id="updateId"
                            type='text'
                            value={updateId}
                            onChange={(e) => setUpdateId(e.target.value)}
                            style={{
                              backgroundColor: darkMode ? undefined : 'lightgray',
                            }}
                            InputLabelProps={{
                              className: 'labels'
                            }}
                            InputProps={{
                              readOnly: true,
                              style: {
                                cursor: 'not-allowed',
                                userSelect: 'none',
                                width: '185px',
                              },
                              className: 'textfields-readonly'
                            }}
                          />
                        </Box>
                        <br />
                        <Box className="input-container-banco">
                          {updateYear ? (
                            <FormControl style={{ marginTop: '10px', marginBottom: '10px', width: '100%' }}>
                              <TextField
                                label="Año"
                                className="input-year"
                                list={updateYear ? "" : "years"}
                                id="updateYear"
                                type="number"
                                value={updateYear}
                                style={{ width: '185px' }}
                                InputLabelProps={{
                                  className: 'labels'
                                }}
                                InputProps={{
                                  inputProps: {
                                    min: 2023,
                                  },
                                  className: 'textfields'
                                }}
                                onChange={(e) => {
                                  const num = parseFloat(e.target.value);
                                  if (Number.isInteger(num) && num >= 2023) {
                                    setUpdateYear(e.target.value);
                                  }
                                }}
                                onKeyPress={(e) => e.preventDefault()}
                              />
                            </FormControl>
                          ) : (
                            <FormControl style={{ marginTop: '10px', marginBottom: '10px', width: '100%' }}>
                              <InputLabel id="years-label" className="labels">Año</InputLabel>
                              <Select
                                id="years"
                                labelId="years-label"
                                value={updateYear}
                                style={{ width: '185px' }}
                                onChange={(e) => setUpdateYear(e.target.value)}
                                className='select'
                              >
                                {uniqueYears.map((year, index) => (
                                  <MenuItem key={index} value={year}>{year}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                        </Box>
                        <br />
                        <Box className="input-container-banco">
                          <FormControl style={{ marginBottom: '10px', width: '100%' }}>
                            <InputLabel id="updateMonth-label" className="labels">Mes</InputLabel>
                            <Select
                              labelId="updateMonth-label"
                              id="updateMonth"
                              value={updateMonth}
                              style={{ width: '185px' }}
                              onChange={(e) => setUpdateMonth(e.target.value)}
                              className='select'
                            >
                              {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((month, index) => (
                                <MenuItem key={index} value={month}>{month}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>
                        <br />
                        <Box display="flex" alignItems="center">
                          <FormControl style={{ marginBottom: '10px', marginRight: '10px' }}>
                            <InputLabel id="updateWeekStart-label" className="labels">Semana</InputLabel>
                            <Select
                              labelId="updateWeekStart-label"
                              id="updateWeekStart"
                              value={updateWeekStart}
                              style={{ width: '80px' }}
                              onChange={(e) => {
                                setUpdateWeekStart(e.target.value);
                                setUpdateWeek(`${e.target.value} - ${updateWeekEnd}`);
                              }}
                              className='select'
                            >
                              {Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0')).map((num) => (
                                <MenuItem key={num} value={num}>
                                  {num}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>

                          <Typography variant="body1" component="span"> - </Typography>

                          <FormControl style={{ marginBottom: '10px', marginLeft: '10px' }}>
                            <InputLabel id="updateWeekEnd-label" className="labels"></InputLabel>
                            <Select
                              labelId="updateWeekEnd-label"
                              id="updateWeekEnd"
                              value={updateWeekEnd}
                              style={{ width: '80px' }}
                              onChange={(e) => {
                                setUpdateWeekEnd(e.target.value);
                                setUpdateWeek(`${updateWeekStart} - ${e.target.value}`);
                              }}
                              className='select'
                            >
                              {Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0')).map((num) => (
                                <MenuItem key={num} value={num}>
                                  {num}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>

                        <Button startIcon={<CloseIcon />} title="Cancelar" type="button" variant="contained" color="secondary" onClick={closeModal}></Button>
                        <Button startIcon={<CheckIcon />} title="Guardar" type="submit" variant="contained" color="primary"/>
                      </form>
                    </Box>
                  </Modal>

                  <Button title="Eliminar fecha" className='button-table' onClick={handleDeleteWeek}>🗑️</Button>

                </Box>

                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginLeft: isSmallScreen ? '0' : '2em',
                  marginTop: isSmallScreen ? '2em' : '0'
                }}>
                  <strong>Teléfono:</strong>
                  <Button title="Añadir teléfono" className='button-table' onClick={handleEditAddPhone}>➕</Button>
                  <Modal
                    open={isModalOpen === 'addphone'}
                    onClose={closeModal}
                    aria-labelledby="Add Phone Modal"
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
                      <form onSubmit={handleSubmitAddPhone} onKeyDown={(event) => handleKeyDown(event, 'addphone')}>
                        <Typography 
                          variant="h5" 
                          component="h2" 
                          sx={{ marginBlockEnd: '10px' }}
                        >
                          Añadir Teléfono
                        </Typography>

                        <Box className="input-container-banco">
                          <FormControl>
                            <Autocomplete
                              id="idUserPhone"
                              options={uniqueIDs.map((id) => id.toString())} // convertir números a strings
                              freeSolo
                              value={idUserPhone.toString()} // asegurar que el value sea un string
                              onInputChange={handleIdChange} // usar onInputChange en lugar de onChange
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="ID Usuario"
                                  margin="normal"
                                  variant="outlined"
                                  style={{ width: '150px', margin: '0px' }}
                                  onKeyPress={handleKeyPress}
                                  InputLabelProps={{
                                    className: 'labels'
                                  }}
                                  InputProps={{
                                    ...params.InputProps,
                                    className: 'textfields'
                                  }}
                                />
                              )}
                            />
                          </FormControl>
                        </Box>
                        <br />

                        <Box className="input-container-banco">
                          <FormControl style={{ marginTop: '10px', marginBottom: '10px', width: '100%' }}>
                            <Autocomplete
                              id="usernamePhone"
                              options={uniqueUsernames}
                              freeSolo
                              value={usernamePhone}
                              onInputChange={handleUsernameChange}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Nombre"
                                  margin="normal"
                                  variant="outlined"
                                  style={{ width: '150px', margin: '0px' }}
                                  InputLabelProps={{
                                    className: 'labels'
                                  }}
                                  InputProps={{
                                    ...params.InputProps,
                                    className: 'textfields'
                                  }}
                                />
                              )}
                            />
                          </FormControl>
                        </Box>
                        <br />

                        <Box className="input-container-banco">
                          <FormControl style={{ marginBottom: '10px', width: '100%' }}>
                            <TextField
                              id="phoneNumber"
                              label="Teléfono"
                              type="text"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              style={{ width: '150px' }}
                              InputLabelProps={{
                                className: 'labels'
                              }}
                              InputProps={{
                                endAdornment: phoneNumber ? (
                                  <InputAdornment position="end">
                                    <IconButton
                                      aria-label="clear input"
                                      edge="end"
                                      size="small"
                                      onClick={() => setPhoneNumber('')}
                                      style={{ width: '5px', height: '5px' }}
                                    >
                                      <CloseIcon />
                                    </IconButton>
                                  </InputAdornment>
                                ) : null,
                                className: 'textfields'
                              }}
                            />
                          </FormControl>
                        </Box>
                        <br />

                        <Button startIcon={<CloseIcon />} title="Cancelar" type="button" variant="contained" color="secondary" onClick={closeModal}></Button>
                        <Button startIcon={<CheckIcon />} title="Guardar" type="submit" variant="contained" color="primary"></Button>
                      </form>
                    </Box>
                  </Modal>

                  <Button title="Editar teléfono" className='button-table' onClick={() => handleEditUpdatePhone()}>✏️</Button>
                  <Modal
                    open={isModalOpen === 'updatephone'}
                    onClose={closeModal}
                    aria-labelledby="Update Phone Modal"
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
                      <form onSubmit={handleUpdatePhone} onKeyDown={(event) => handleKeyDown(event, 'updatephone')}>
                        <Typography 
                          variant="h5" 
                          component="h2" 
                          sx={{ marginBlockEnd: '10px' }}
                        >
                          Editar teléfono
                        </Typography>

                        <Box className="input-container-banco">
                          <FormControl style={{ marginBottom: '10px', width: '100%' }}>
                            <TextField
                              id="updateUserIdPhone"
                              select
                              label="ID Usuario"
                              value={updateUserIdPhone}
                              onChange={handleUpdateIdChange}
                              onFocus={() => setIsFocusedUpdateUserIdPhone(true)}
                              onBlur={() => setIsFocusedUpdateUserIdPhone(false)}
                              style={{ minWidth: '150px', marginBlockStart: '-25px' }}
                              SelectProps={{
                                native: true,
                                style: {
                                  maxHeight: '30px',
                                  fontSize: '14px',
                                },
                                className: 'select'
                              }}
                              InputLabelProps={{
                                style: {
                                  fontSize: '14px',
                                  position: 'relative',
                                  top: updateUserIdPhone || isFocusedUpdateUserIdPhone ? '22px' : '9px',
                                },
                                className: 'labels'
                              }}
                            >
                              <option key="none" value="" disabled style={darkMode ? { background: 'rgb(24, 26, 27)' } : {}}></option>
                              {uniqueIDs.map((users, index) => (
                                <option key={index} value={users} style={darkMode ? { background: 'rgb(24, 26, 27)' } : {}}>
                                  {users}
                                </option>
                              ))}
                            </TextField>
                          </FormControl>
                        </Box>
                        <br />

                        <Box className="input-container-banco">
                          <FormControl style={{ marginBottom: '15px', width: '100%' }}>
                            <Autocomplete
                              id="updateUsernamePhone"
                              options={uniqueUsernames}
                              freeSolo
                              value={updateUsernamePhone}
                              onInputChange={handleUpdateUsernameChange}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Nombre"
                                  style={{ width: '150px' }}
                                  InputLabelProps={{
                                    className: 'labels'
                                  }}
                                  InputProps={{
                                    ...params.InputProps,
                                    className: 'textfields'
                                  }}
                                />
                              )}
                            />
                          </FormControl>
                        </Box>
                        <br />

                        <Box className="input-container-banco">
                          <FormControl style={{ marginBottom: '10px', width: '100%' }}>
                            <TextField
                              id="updateIdPhone"
                              select
                              label="ID Teléfono"
                              value={updateIdPhone}
                              onChange={handleUpdateIdPhoneChange}
                              onFocus={() => setIsFocusedUpdateIdPhone(true)}
                              onBlur={() => setIsFocusedUpdateIdPhone(false)}
                              style={{ minWidth: '150px', marginBlockStart: '-25px' }}
                              SelectProps={{
                                native: true,
                                style: {
                                  maxHeight: '30px',
                                  fontSize: '14px',
                                },
                                className: 'select'
                              }}
                              InputLabelProps={{
                                style: {
                                  fontSize: '14px',
                                  position: 'relative',
                                  top: updateIdPhone || isFocusedUpdateIdPhone ? '22px' : '9px',
                                },
                                className: 'labels'
                              }}
                            >
                              <option key="none" value="" disabled style={darkMode ? { background: 'rgb(24, 26, 27)' } : {}}></option>
                              {uniquePhoneIds.map((phone, index) => (
                                <option key={index} value={phone} style={darkMode ? { background: 'rgb(24, 26, 27)' } : {}}>
                                  {phone}
                                </option>
                              ))}
                            </TextField>
                          </FormControl>
                        </Box>
                        <br />

                        <Box className="input-container-banco">
                          <FormControl style={{ marginBottom: '10px', width: '100%' }}>
                            <Autocomplete
                              id="updatePhoneNumberOld"
                              options={(updateUserIdPhone || updateUsernamePhone)
                                ? phones.filter(phone => phone.UserId === updateUserIdPhone).map(phone => phone.phoneNumber)
                                : uniquePhones}
                              freeSolo
                              value={updatePhoneNumberOld}
                              onInputChange={handleUpdatePhoneChange}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Teléfono actual"
                                  style={{ width: '150px' }}
                                  InputLabelProps={{
                                    className: 'labels'
                                  }}
                                  InputProps={{
                                    ...params.InputProps,
                                    className: 'textfields'
                                  }}
                                />
                              )}
                            />
                          </FormControl>
                        </Box>
                        <br />

                        <Box className="input-container-banco">
                          <FormControl style={{ marginBottom: '10px', width: '100%' }}>
                            <TextField
                              id="updatePhoneNumberNew"
                              label="Teléfono nuevo"
                              type="text"
                              value={updatePhoneNumberNew}
                              onChange={(e) => setUpdatePhoneNumberNew(e.target.value)}
                              style={{ width: '150px' }}
                              InputLabelProps={{
                                className: 'labels'
                              }}
                              InputProps={{
                                endAdornment: updatePhoneNumberNew ? (
                                  <InputAdornment position="end">
                                    <IconButton
                                      aria-label="clear input"
                                      edge="end"
                                      size="small"
                                      onClick={() => setUpdatePhoneNumberNew('')}
                                      style={{ width: '5px', height: '5px' }}
                                    >
                                      <CloseIcon />
                                    </IconButton>
                                  </InputAdornment>
                                ) : null,
                                className: 'textfields'
                              }}
                            />
                          </FormControl>
                        </Box>
                        <br />

                        <Button startIcon={<CloseIcon />} title="Cancelar" type="button" variant="contained" color="secondary" onClick={closeModal}></Button>
                        <Button startIcon={<CheckIcon />} title="Guardar" type="submit" variant="contained" color="primary"></Button>
                      </form>
                    </Box>
                  </Modal>

                  <Button title="Desactivar teléfono" className='button-table' onClick={() => handleEditDeactivatePhone()}>🛑</Button>
                  <Modal
                    open={isModalOpen === 'deactivatephone'}
                    onClose={closeModal}
                    aria-labelledby="Deactivate Phone Modal"
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
                      <form onSubmit={handleDeactivatePhone} onKeyDown={(event) => handleKeyDown(event, 'deactivatephone')}>
                        <Typography 
                          variant="h5" 
                          component="h2"
                          sx={{ marginBlockEnd: '10px' }}
                        >
                          Desactivar Teléfono
                        </Typography>
                        
                        <Box className="input-container-banco">
                          <FormControl>
                            <Autocomplete
                              id="deactivateUserId"
                              options={uniqueDeactivateUserIDs.filter(id => {
                                const userObject = users.find(user => user.id === id);
                                return userObject && phones.some(phone => phone.UserId === userObject.id && phone.isActive);
                              }).map((id) => id.toString())}
                              getOptionLabel={(option) => option.toString()} // Asegurar que el valor sea un string
                              freeSolo
                              value={deactivateUserId}
                              onInputChange={handleDeactivateIdChange}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="ID Usuario"
                                  style={{ width: '150px' }}
                                  InputLabelProps={{
                                    className: 'labels'
                                  }}
                                  InputProps={{
                                    ...params.InputProps,
                                    className: 'textfields'
                                  }}
                                />
                              )}
                            />
                          </FormControl>
                        </Box>
                        <br />

                        <Box className="input-container-banco">
                          <FormControl style={{ marginTop: '10px', marginBottom: '10px', width: '100%' }}>
                            <Autocomplete
                              id="deactivateUsername"
                              options={uniqueDeactivateUsernames.filter(username => {
                                const userObject = users.find(user => user.username === username);
                                return userObject && phones.some(phone => phone.UserId === userObject.id && phone.isActive);
                              })}
                              freeSolo
                              value={deactivateUsername}
                              onInputChange={handleDeactivateUsernameChange}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Nombre"
                                  style={{ width: '150px' }}
                                  InputLabelProps={{
                                    className: 'labels'
                                  }}
                                  InputProps={{
                                    ...params.InputProps,
                                    className: 'textfields'
                                  }}
                                />
                              )}
                            />
                          </FormControl>
                        </Box>
                        <br />

                        <Box className="input-container-banco">
                          <FormControl style={{ marginBottom: '10px', width: '100%' }}>
                            <Autocomplete
                              id="deactivatePhone"
                              options={(deactivateUserId || deactivateUsername ? uniqueDeactivateUserPhones : uniquePhones.filter(phone => {
                                const phoneObject = phones.find(item => item.phoneNumber === phone);
                                return phoneObject && phoneObject.isActive;
                              }))}
                              freeSolo
                              value={deactivatePhone}
                              onInputChange={handleDeactivatePhoneChange}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Teléfono"
                                  style={{ width: '150px' }}
                                  InputLabelProps={{
                                    className: 'labels'
                                  }}
                                  InputProps={{
                                    ...params.InputProps,
                                    className: 'textfields'
                                  }}
                                />
                              )}
                            />
                          </FormControl>
                        </Box>
                        <br />

                        <Button startIcon={<CloseIcon />} title="Cancelar" type="button" variant="contained" color="secondary" onClick={closeModal}></Button>
                        <Button startIcon={<BlockIcon />} title="Desactivar" type="submit" variant="contained" color="secondary"></Button>
                      </form>
                    </Box>
                  </Modal>

                  <Button title="Activar teléfono" className='button-table' onClick={handleEditActivatePhone}>✅</Button>
                  <Modal
                    open={isModalOpen === 'activatephone'}
                    onClose={closeModal}
                    aria-labelledby="Activate Phone Modal"
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
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
                        margin: 'auto', // Este es el truco para centrar el modal
                      }}
                    >
                      <form onSubmit={handleActivatePhone} onKeyDown={(event) => handleKeyDown(event, 'activatephone')}>
                        <Typography 
                          variant="h5" 
                          component="h2" 
                          sx={{ marginBlockEnd: '10px' }}
                        >
                          Activar Teléfono
                        </Typography>

                        <Box className="input-container-banco">
                          <FormControl>
                            <Autocomplete
                              id="activateUserId"
                              options={uniqueActivateUserIDs.filter(id => {
                                const userObject = users.find(user => user.id === id);
                                return userObject && phones.some(phone => phone.UserId === userObject.id && !phone.isActive);
                              }).map((id) => id.toString())}
                              getOptionLabel={(option) => option.toString()} // Asegurar que el valor sea un string
                              freeSolo
                              value={activateUserId}
                              onInputChange={handleActivateIdChange}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="ID Usuario"
                                  style={{ width: '150px' }}
                                  InputLabelProps={{
                                    className: 'labels'
                                  }}
                                  InputProps={{
                                    ...params.InputProps,
                                    className: 'textfields'
                                  }}
                                />
                              )}
                            />
                          </FormControl>
                        </Box>
                        <br />

                        <Box className="input-container-banco">
                          <FormControl style={{ marginTop: '10px', marginBottom: '10px', width: '100%' }}>
                            <Autocomplete
                              id="activateUsername"
                              options={uniqueActivateUsernames.filter(username => {
                                const userObject = users.find(user => user.username === username);
                                return userObject && phones.some(phone => phone.UserId === userObject.id && !phone.isActive);
                              })}
                              freeSolo
                              value={activateUsername}
                              onInputChange={handleActivateUsernameChange}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Nombre"
                                  style={{ width: '150px' }}
                                  InputLabelProps={{
                                    className: 'labels'
                                  }}
                                  InputProps={{
                                    ...params.InputProps,
                                    className: 'textfields'
                                  }}
                                />
                              )}
                            />
                          </FormControl>
                        </Box>
                        <br />

                        <Box className="input-container-banco">
                          <FormControl style={{ marginBottom: '10px', width: '100%' }}>
                            <Autocomplete
                              id="activatePhone"
                              options={(activateUserId || activateUsername ? uniqueActivateUserPhones : uniquePhones.filter(phone => {
                                const phoneObject = phones.find(item => item.phoneNumber === phone);
                                return phoneObject && !phoneObject.isActive;
                              }))}
                              freeSolo
                              value={activatePhone}
                              onInputChange={handleActivatePhoneChange}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Teléfono"
                                  style={{ width: '150px' }}
                                  InputLabelProps={{
                                    className: 'labels'
                                  }}
                                  InputProps={{
                                    ...params.InputProps,
                                    className: 'textfields'
                                  }}
                                />
                              )}
                            />
                          </FormControl>
                        </Box>
                        <br />

                        <Button startIcon={<CloseIcon />} title="Cancelar" type="button" variant="contained" color="secondary" onClick={handleCancelEditActivatePhone}></Button>
                        <Button startIcon={<CheckIcon />} title="Activar" type="submit" variant="contained" color="primary"></Button>
                      </form>
                    </Box>
                  </Modal>

                  <Button title="Eliminar teléfono" className='button-table' onClick={handleEditDeletePhone}>🗑️</Button>
                  <Modal
                    open={isModalOpen === 'deletephone'}
                    onClose={closeModal}
                    aria-labelledby="Delete Phone Modal"
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
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
                        margin: 'auto', // Este es el truco para centrar el modal
                      }}
                    >
                      <form onSubmit={handleDeletePhone} onKeyDown={(event) => handleKeyDown(event, 'deletephone')}>
                        <Typography 
                          variant="h5" 
                          component="h2" 
                          sx={{ marginBlockEnd: '10px' }}
                        >
                          Eliminar Teléfono
                        </Typography>

                        <Box className="input-container-banco">
                          <FormControl>
                            <Autocomplete
                              id="deleteUserIdPhone"
                              options={uniqueIDs.map(id => id.toString())}
                              getOptionLabel={(option) => option.toString()} // Asegurar que el valor sea un string
                              freeSolo
                              value={deleteUserIdPhone}
                              onInputChange={handleDeleteIdChange}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="ID Usuario"
                                  style={{ width: '150px' }}
                                  InputLabelProps={{
                                    className: 'labels'
                                  }}
                                  InputProps={{
                                    ...params.InputProps,
                                    className: 'textfields'
                                  }}
                                />
                              )}
                            />
                          </FormControl>
                        </Box>
                        <br />

                        <Box className="input-container-banco">
                          <FormControl style={{ marginTop: '10px', marginBottom: '10px', width: '100%' }}>
                            <Autocomplete
                              id="deleteUsernamePhone"
                              options={uniqueUsernames}
                              freeSolo
                              value={deleteUsernamePhone}
                              onInputChange={handleDeleteUsernameChange}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Nombre"
                                  style={{ width: '150px' }}
                                  InputLabelProps={{
                                    className: 'labels'
                                  }}
                                  InputProps={{
                                    ...params.InputProps,
                                    className: 'textfields'
                                  }}
                                />
                              )}
                            />
                          </FormControl>
                        </Box>
                        <br />

                        <Box className="input-container-banco">
                          <FormControl style={{ marginBottom: '10px', width: '100%' }}>
                            <TextField
                              id="deleteIdPhone"
                              select
                              label="ID Teléfono"
                              value={deleteIdPhone}
                              onChange={handleDeleteIdPhoneChange}
                              style={{ minWidth: '150px' }}
                              SelectProps={{
                                native: true,
                                className: 'select'
                              }}
                              InputLabelProps={{
                                className: 'labels'
                              }}
                            >
                              <option key="none" value="" disabled style={darkMode ? { background: 'rgb(24, 26, 27)' } : {}}></option>
                              {uniquePhoneIds.map((phone, index) => (
                                <option key={index} value={phone} style={darkMode ? { background: 'rgb(24, 26, 27)' } : {}}>
                                  {phone}
                                </option>
                              ))}
                            </TextField>
                          </FormControl>
                        </Box>
                        <br />

                        <Box className="input-container-banco">
                          <FormControl style={{ marginBottom: '10px', width: '100%' }}>
                            <Autocomplete
                              id="deletePhoneNumber"
                              options={(deleteUserIdPhone || deleteUsernamePhone ? phones.filter(phone => phone.UserId === deleteUserIdPhone).map(phone => phone.phoneNumber) : uniquePhones)}
                              freeSolo
                              value={deletePhoneNumber}
                              onInputChange={handleDeletePhoneChange}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Teléfono"
                                  style={{ width: '150px' }}
                                  InputLabelProps={{
                                    className: 'labels'
                                  }}
                                  InputProps={{
                                    ...params.InputProps,
                                    className: 'textfields'
                                  }}
                                />
                              )}
                            />
                          </FormControl>
                        </Box>
                        <br />
                        
                        <Button startIcon={<CloseIcon />} title="Cancelar" type="button" variant="contained" color="secondary" onClick={closeModal}/>
                        <Button startIcon={<CheckIcon />} title="Activar" type="submit" variant="contained" color="primary"/>
                      </form>
                    </Box>
                  </Modal>

                </Box>

                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginLeft: isSmallScreen ? '0' : '2em',
                  marginTop: isSmallScreen ? '2em' : '0'
                }}>
                  <strong>Exportar:</strong>
                  <Button title="Exportar todas las semanas a Google Sheets" className='button-table' onClick={handleExportToGoogleSheets}>📤</Button>
                  <Button title="Exportar semana actual a Google Sheets" className='button-table' onClick={handleExportWeekToGoogleSheets}>🗓️</Button>
                </Box>
              </Typography>
            </Box>

            <>
              <Box>
                <Typography variant="h5" component="h2" onClick={toggleCalls} style={{fontWeight: 'bold', marginBottom: '14px'}}>
                  Historial de llamadas {showCalls ? "▼" : "▲"}
                </Typography>

                {showCalls && (
                  <Box>
                    <Box component="div" className="input-container-buscador" style={{ position: 'relative' }}>
                      <TextField
                        type="text"
                        placeholder="🔍Nombre o Teléfono"
                        value={callSearch}
                        onChange={(e) => setCallSearch(e.target.value)}
                        InputProps={{
                          style: {
                            width: '170px',
                            maxHeight: '40px',
                            fontSize: '14px',
                          },
                          className: 'buscador'
                        }}
                      />
                      {callSearch && (
                        <IconButton 
                          onClick={() => setCallSearch('')}
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

                    <Box className="button-add-call">
                      <Button title="Añadir llamada" className='button-table' onClick={() => handleEditAddCallModal()}>➕</Button>
                      <Modal
                        open={isModalOpen === 'addcall'}
                        onClose={closeModal}
                        aria-labelledby="Add Call Modal"
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
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
                            margin: 'auto', //Este es el truco para centrar el modal
                          }}
                        >
                          <form onSubmit={handleAddCall} onKeyDown={(event) => handleKeyDown(event, 'addcall')}>
                            <Typography 
                              variant="h5" 
                              component="h2"
                              sx={{ marginBlockEnd: '10px' }}
                            >
                              Añadir Llamada
                            </Typography>
                            
                            <Box className="input-container-banco">
                              <FormControl>
                                <Autocomplete
                                  id="callUserId"
                                  options={uniqueActiveNonCalledUserIDs.filter(id => {
                                    const userObject = users.find(user => user.id === id);
                                    return userObject && phones.some(phone => phone.UserId === userObject.id && phone.isActive);
                                  }).map((id) => id.toString())}
                                  getOptionLabel={(option) => option.toString()} // Asegurar que el valor sea un string
                                  freeSolo
                                  value={callUserId}
                                  onInputChange={handleCallUserIdChange}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      label="ID Usuario"
                                      style={{ width: '150px' }}
                                      InputLabelProps={{
                                        className: 'labels'
                                      }}
                                      InputProps={{
                                        ...params.InputProps,
                                        className: 'textfields'
                                      }}
                                    />
                                  )}
                                />
                              </FormControl>
                            </Box>
                            <br />

                            <Box className="input-container-banco">
                              <FormControl style={{ marginTop: '10px', marginBottom: '10px', width: '100%' }}>
                                <Autocomplete
                                  id="callUsername"
                                  options={uniqueActiveNonCalledUsernames.filter(username => {
                                    const userObject = users.find(user => user.username === username);
                                    return userObject && phones.some(phone => phone.UserId === userObject.id && phone.isActive);
                                  })}
                                  freeSolo
                                  value={callUsername}
                                  onInputChange={handleCallUsernameChange}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      label="Nombre"
                                      style={{ width: '150px' }}
                                      InputLabelProps={{
                                        className: 'labels'
                                      }}
                                      InputProps={{
                                        ...params.InputProps,
                                        className: 'textfields'
                                      }}
                                    />
                                  )}
                                />
                              </FormControl>
                            </Box>
                            <br />

                            <Box className="input-container-banco">
                              <FormControl style={{ marginBottom: '10px', width: '100%' }}>
                                <Autocomplete
                                  id="callPhone"
                                  options={callUserId || callUsername ? uniqueCallUserPhones : uniqueActiveNonCalledPhones}
                                  freeSolo
                                  value={callPhone}
                                  onInputChange={handleCallPhoneChange}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      label="Teléfono"
                                      style={{ width: '150px' }}
                                      InputLabelProps={{
                                        className: 'labels'
                                      }}
                                      InputProps={{
                                        ...params.InputProps,
                                        className: 'textfields'
                                      }}
                                    />
                                  )}
                                />
                              </FormControl>
                            </Box>
                            <br />

                            <Button startIcon={<CloseIcon />} title="Cancelar" type="button" variant="contained" color="secondary" onClick={closeModal}></Button>
                            <Button startIcon={<CheckIcon />} title="Guardar" type="submit" variant="contained" color="primary"></Button>
                          </form>
                        </Box>
                      </Modal>
                    </Box>

                    <Box>
                      <TableContainer component={Paper} style={{ marginBottom: '14px' }}>
                        <Table className="centered-table">
                          <TableHead>
                            <TableRow>
                              <TableCell>ID</TableCell>
                              <TableCell>Nombre</TableCell>
                              <TableCell>Teléfono</TableCell>
                              <TableCell>1ER</TableCell>
                              <TableCell>2DO</TableCell>
                              <TableCell>Final</TableCell>
                              <TableCell>Total</TableCell>
                              <TableCell>Opcs</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {Array.isArray(displayedCalls) && displayedCalls.map((call, index) => {
                              const phone = phones.find(phone => phone.id === call.Phone.id);
                              const phoneNumber = phone ? phone.phoneNumber : 'Desconocido';
                              const user = users.find(user => user.id === call.Phone.UserId);
                              const username = user ? user.username : 'Desconocido';
                              const id = user ? user.id : 'Desconocido';

                              return (
                                <TableRow key={index} onKeyDown={(event) => handleInputKeyDown(event)}>
                                  <TableCell>{id}</TableCell>
                                  <TableCell>{username}</TableCell>
                                  <TableCell>{phoneNumber}</TableCell>

                                  <TableCell style={{width: '102px'}} onClick={() => handleCellClick(call, 'firstCut')}>
                                    {editingCell.rowId === call.id ? (
                                      <TextField
                                        inputRef={(ref) => (inputRefs.current['firstCut'] = ref)}
                                        type="number"
                                        inputProps={{
                                          step: "0.01",
                                          style: {
                                            width: '60px',
                                            padding: '0',
                                            border: '1px solid',
                                            color: darkMode ? 'white' : undefined,
                                          },
                                          className: 'no-spinner',
                                          onChange: (e) => {
                                            const parts = e.target.value.split('.');
                                            if ((parts.length === 1) || (parts.length === 2 && parts[1].length <= 2)) {
                                              const integerPart = Math.floor(e.target.value);
                                              if (String(integerPart).length <= 4) {
                                                handleInputChange('firstCut', e.target.value);
                                              }
                                            }
                                          },
                                        }}
                                        value={editingCall.firstCut}
                                        variant="standard"
                                      />
                                    ) : (
                                      formatAmount(call.firstCut)
                                    )}
                                  </TableCell>

                                  <TableCell style={{width: '102px'}} onClick={() => handleCellClick(call, 'secondCut')}>
                                    {editingCell.rowId === call.id ? (
                                      <TextField
                                        inputRef={(ref) => (inputRefs.current['secondCut'] = ref)}
                                        type="number"
                                        inputProps={{
                                          className: 'no-spinner',
                                          style: {
                                            width: '60px',
                                            padding: '0',
                                            border: '1px solid',
                                            color: darkMode ? 'white' : undefined,
                                          },
                                          step: '0.01',
                                          onChange: (e) => {
                                            const parts = e.target.value.split('.');
                                            if ((parts.length === 1) || (parts.length === 2 && parts[1].length <= 2)) {
                                              const integerPart = Math.floor(e.target.value);
                                              if (String(integerPart).length <= 4) {
                                                handleInputChange('secondCut', e.target.value);
                                              }
                                            }
                                          },
                                        }}
                                        value={editingCall.secondCut}
                                        variant="standard"
                                      />
                                    ) : (
                                      formatAmount(call.secondCut)
                                    )}
                                  </TableCell>

                                  <TableCell style={{width: '102px'}} onClick={() => handleCellClick(call, 'finalCut')}>
                                    {editingCell.rowId === call.id ? (
                                      <TextField
                                        inputRef={(ref) => (inputRefs.current['finalCut'] = ref)}
                                        type="number"
                                        inputProps={{
                                          step: '0.01',
                                          className: 'no-spinner',
                                          style: {
                                            width: '60px',
                                            padding: '0',
                                            border: '1px solid',
                                            color: darkMode ? 'white' : undefined,
                                          },
                                          onChange: (e) => {
                                            const parts = e.target.value.split('.');
                                            if ((parts.length === 1) || (parts.length === 2 && parts[1].length <= 2)) {
                                              const integerPart = Math.floor(e.target.value);
                                              if (String(integerPart).length <= 4) {
                                                handleInputChange('finalCut', e.target.value);
                                              }
                                            }
                                          },
                                        }}
                                        value={editingCall.finalCut}
                                        variant="standard"
                                      />
                                    ) : (
                                      formatAmount(call.finalCut)
                                    )}
                                  </TableCell>

                                  <TableCell>
                                    {editingCell.rowId === call.id ? `$${formatAmount(editingCall.totalAmount)}` : `$${formatAmount(call.totalAmount)}`}
                                  </TableCell>

                                  <TableCell>
                                    {editingCell.rowId === call.id ? (
                                      <>
                                        <Box display="flex" flexDirection="row" justifyContent="center">
                                          <Button title="Cancelar edición" className='button-table' onClick={handleCancelEditCall}>❌</Button>
                                          <Button title="Guardar edición" className='button-table' onClick={handleFinishEditing}>✔️</Button>
                                        </Box>
                                      </>
                                    ) : (
                                      <>
                                        <Box display="flex" flexDirection="row" justifyContent="center">
                                          <Button title="Editar llamada" className='button-table' onClick={() => handleEditCall(call)}>✏️</Button>
                                          <Button title="Eliminar llamada" className='button-table' onClick={() => handleDeleteCall(call.id)}>🗑️</Button>
                                        </Box>
                                      </>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                          <TableFooter>
                            <TableRow>
                              <TablePagination
                                ActionsComponent={TablePaginationActions}
                                count={filteredCalls.length}
                                page={callsPage - 1}
                                onPageChange={(event, newPage) => setCallsPage(newPage + 1)}
                                rowsPerPage={callsItemsPerPage}
                                onRowsPerPageChange={(event) => {
                                  const newValue = parseInt(event.target.value, 10);
                                  if (newValue === -1) {
                                    setShowAllCalls(true);
                                  } else {
                                    setShowAllCalls(false);
                                    setCallsItemsPerPage(newValue);
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
                    </Box>

                    {handleEditCall && (
                      <Modal
                        open={isModalOpen === 'call'}
                        onClose={closeModal}
                        aria-labelledby="Edit Call Modal"
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
                            width: '70%',
                            height: '70%',
                            backgroundColor: 'white',
                            margin: 'auto',
                          }}
                        >
                          <form onSubmit={handleSubmitEditCall} onKeyDown={(event) => handleKeyDown(event, 'call')}>
                            <Typography 
                              variant="h5" 
                              component="h2" 
                              sx={{ marginBlockEnd: '30px' }}
                            >
                              Editar llamada
                            </Typography>

                            <Box className="input-container-banco">
                              <FormControl style={{ marginBottom: '10px', width: '100%' }}>
                                <TextField
                                  id="idUserCall"
                                  type="text"
                                  label="ID"
                                  value={editingCall.id}
                                  style={{ width: '150px', marginBlockStart: '-25px' }}
                                  InputProps={{
                                    readOnly: true,
                                    style: {
                                      backgroundColor: darkMode ? undefined : 'lightgray',
                                      cursor: 'not-allowed',
                                      userSelect: 'none',
                                      fontSize: '14px',
                                      height: '30px',
                                    },
                                    className: 'textfields-readonly'
                                  }}
                                  InputLabelProps={{
                                    shrink: true,
                                    className: 'labels',
                                  }}
                                />
                              </FormControl>
                            </Box>
                            <br />
                            <Box className="input-container-banco">
                              <FormControl style={{ marginBottom: '10px', width: '100%' }}>
                                <TextField
                                  id="usernameCall"
                                  type="text"
                                  label="Nombre"
                                  value={editingCall.username}
                                  style={{ width: '150px', marginBlockStart: '0px' }}
                                  InputProps={{
                                    readOnly: true,
                                    style: {
                                      backgroundColor: darkMode ? undefined : 'lightgray',
                                      cursor: 'not-allowed',
                                      userSelect: 'none',
                                      fontSize: '14px',
                                      height: '30px',
                                    },
                                    className: 'textfields-readonly'
                                  }}
                                  InputLabelProps={{
                                    shrink: true,
                                    className: 'labels',
                                  }}
                                />
                              </FormControl>
                            </Box>
                            <br />
                            <Box className="input-container-banco">
                              <FormControl style={{ marginBottom: '10px', width: '100%' }}>
                                <TextField
                                  id="phoneNumberCall"
                                  type="text"
                                  label="Teléfono"
                                  value={editingCall.phoneNumber}
                                  style={{ width: '150px', marginBlockStart: '0px' }}
                                  InputProps={{
                                    readOnly: true,
                                    style: {
                                      backgroundColor: darkMode ? undefined : 'lightgray',
                                      cursor: 'not-allowed',
                                      userSelect: 'none',
                                      fontSize: '14px',
                                      height: '30px',
                                    },
                                    className: 'textfields-readonly'
                                  }}
                                  InputLabelProps={{
                                    shrink: true,
                                    className: 'labels',
                                  }}
                                />
                              </FormControl>
                            </Box>
                            <br />

                            <Box className="input-container-banco">
                              <FormControl style={{ marginBottom: '10px', width: '100%' }}>
                                <TextField
                                  id="firstCut"
                                  type="number"
                                  step="0.01"
                                  label="1ER"
                                  value={editingCall.firstCut}
                                  onFocus={(e) => e.target.select()}
                                  onChange={(e) => {
                                    const parts = e.target.value.split('.');
                                    if ((parts.length === 1) || (parts.length === 2 && parts[1].length <= 2)) {
                                      const integerPart = Math.floor(e.target.value);
                                      if (String(integerPart).length <= 4) {
                                        handleInputChange('firstCut', e.target.value);
                                      }
                                    }
                                  }}
                                  style={{ width: '150px' }}
                                  InputProps={{
                                    inputProps: {
                                      step: "0.01"
                                    },
                                    style: {
                                      fontSize: '14px',
                                      height: '30px',
                                    },
                                    className: 'textfields'
                                  }}
                                  InputLabelProps={{
                                    shrink: true,
                                    className: 'labels',
                                  }}
                                />
                              </FormControl>
                            </Box>
                            <br />

                            <Box className="input-container-banco">
                              <FormControl style={{ marginBottom: '10px', width: '100%' }}>
                                <TextField
                                  id="secondCut"
                                  type="number"
                                  step="0.01"
                                  label="2DO"
                                  value={editingCall.secondCut}
                                  onFocus={(e) => e.target.select()}
                                  onChange={(e) => {
                                    const parts = e.target.value.split('.');
                                    if ((parts.length === 1) || (parts.length === 2 && parts[1].length <= 2)) {
                                      const integerPart = Math.floor(e.target.value);
                                      if (String(integerPart).length <= 4) {
                                        handleInputChange('secondCut', e.target.value);
                                      }
                                    }
                                  }}
                                  style={{ width: '150px' }}
                                  InputProps={{
                                    inputProps: {
                                      step: "0.01"
                                    },
                                    style: {
                                      fontSize: '14px',
                                      height: '30px',
                                    },
                                    className: 'textfields'
                                  }}
                                  InputLabelProps={{
                                    shrink: true,
                                    className: 'labels',
                                  }}
                                />
                              </FormControl>
                            </Box>
                            <br />

                            <Box className="input-container-banco">
                              <FormControl style={{ marginBottom: '10px', width: '100%' }}>
                                <TextField
                                  id="finalCut"
                                  type="number"
                                  step="0.01"
                                  label="Final"
                                  value={editingCall.finalCut}
                                  onFocus={(e) => e.target.select()}
                                  onChange={(e) => {
                                    const parts = e.target.value.split('.');
                                    if ((parts.length === 1) || (parts.length === 2 && parts[1].length <= 2)) {
                                      const integerPart = Math.floor(e.target.value);
                                      if (String(integerPart).length <= 4) {
                                        handleInputChange('finalCut', e.target.value);
                                      }
                                    }
                                  }}
                                  style={{ width: '150px' }}
                                  InputProps={{
                                    inputProps: {
                                      step: "0.01"
                                    },
                                    style: {
                                      fontSize: '14px',
                                      height: '30px',
                                    },
                                    className: 'textfields'
                                  }}
                                  InputLabelProps={{
                                    shrink: true,
                                    className: 'labels',
                                  }}
                                />
                              </FormControl>
                            </Box>
                            <br />

                            <Box className="input-container-banco">
                              <FormControl style={{ marginBottom: '10px', width: '100%' }}>
                                <TextField
                                  id="totalAmount"
                                  type="number"
                                  label="Total"
                                  value={editingCall.totalAmount}
                                  InputProps={{
                                    readOnly: true,
                                    inputProps: {
                                      step: "0.01"
                                    },
                                    style: {
                                      backgroundColor: darkMode ? undefined : 'lightgray',
                                      cursor: 'not-allowed',
                                      userSelect: 'none',
                                      width: '150px',
                                      fontSize: '14px',
                                      height: '30px',
                                    },
                                    className: 'textfields-readonly'
                                  }}
                                  InputLabelProps={{
                                    shrink: true,
                                    className: 'labels',
                                  }}
                                />
                              </FormControl>
                            </Box>
                            <br />

                            <Button startIcon={<CloseIcon />} title="Cancelar" type="button" variant="contained" color="secondary" onClick={closeModal}></Button>
                            <Button startIcon={<CheckIcon />} title="Guardar" type="submit" variant="contained" color="primary"></Button>
                          </form>
                        </Box>
                      </Modal>
                    )}
                  </Box>
                )}
              </Box>

              <Box>
                <Typography variant="h5" component="h2" onClick={togglePayments} style={{fontWeight: 'bold', marginBottom: '10px'}}>
                  Historial de pagos {showPayments ? "▼" : "▲"}
                </Typography>
                
                {showPayments && (
                  <Box>
                    <Box component="div" className="input-container-buscador" style={{ position: 'relative' }}>
                      <TextField
                        type="text"
                        placeholder="🔍Nombre o Monto"
                        value={paymentSearch}
                        onChange={(e) => setPaymentSearch(e.target.value)}
                        InputProps={{
                          style: {
                            width: '155px',
                            maxHeight: '40px',
                            fontSize: '14px',
                          },
                          className: 'buscador'
                        }}
                      />
                      {paymentSearch && (
                        <IconButton 
                          onClick={() => setPaymentSearch('')}
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
                            <TableCell>Nombre</TableCell>
                            <TableCell>Correo-Banco</TableCell>
                            <TableCell>Pago</TableCell>
                            <TableCell>Fecha</TableCell>
                            <TableCell>Estatus</TableCell>
                            <TableCell>Banco</TableCell>
                            <TableCell>Cap</TableCell>
                            <TableCell>Opcs</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {Array.isArray(displayedPayments) && displayedPayments.map((payment, index) => {
                            const user = users.find(user => user.id === payment.UserId);
                            const username = user ? user.username : 'Desconocido';
                            const bankEmail = user ? user.bankEmail : 'Desconocido';
                            const id = user ? user.id : 'Desconocido';

                            return (
                              <TableRow key={index}>
                                <TableCell>{id}</TableCell>
                                <TableCell>{username}</TableCell>
                                <TableCell>{bankEmail}</TableCell>
                                <TableCell>${formatAmount(payment.totalAmountSum)}</TableCell>
                                <TableCell>{payment.pago}</TableCell>
                                <TableCell>{payment.estatus}</TableCell>
                                <TableCell>{payment.banco}</TableCell>
                                <TableCell>
                                  {payment.captura_url ? (
                                    <a href={payment.captura_url} className="captura" target="_blank" rel="noopener noreferrer">
                                      Ver
                                    </a>
                                  ) : (
                                    ''
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Box display="flex" flexDirection="row" justifyContent="center">
                                    <Button title="Editar pago" className='button-table' onClick={() => handleEditPayment(payment)}>✏️</Button>
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
                              count={filteredPayments.length}
                              page={paymentsPage - 1}
                              onPageChange={(event, newPage) => setPaymentsPage(newPage + 1)}
                              rowsPerPage={paymentsItemsPerPage}
                              onRowsPerPageChange={(event) => {
                                const newValue = parseInt(event.target.value, 10);
                                if (newValue === -1) {
                                  setShowAllPayments(true);
                                } else {
                                  setShowAllPayments(false);
                                  setPaymentsItemsPerPage(newValue);
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
                    {currentPayment && (
                      <Modal
                        open={isModalOpen === 'payment'}
                        onClose={closeModal}
                        aria-labelledby="Edit Payment Modal"
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
                            width: '90%',
                            height: '90%',
                            backgroundColor: 'white',
                            margin: 'auto',
                          }}
                        >
                          <form onSubmit={handleSubmitEditPayment} onKeyDown={(event) => handleKeyDown(event, 'payment')}>
                            <Typography 
                              variant="h5" 
                              component="h2" 
                              sx={{ marginBlockEnd: '30px' }}
                            >
                              Editar pago
                            </Typography>

                            <Box className="input-container-banco">
                              <FormControl style={{ marginBottom: '10px', width: '100%' }}>
                                <TextField
                                  id="idUserPayment"
                                  type="text"
                                  label="ID"
                                  value={idUserPayment}
                                  onChange={(e) => setIdUserPayment(e.target.value)}
                                  style={{ width: '190px', marginBlockStart: '-25px' }}
                                  InputProps={{
                                    readOnly: true,
                                    style: {
                                      backgroundColor: darkMode ? undefined : 'lightgray',
                                      cursor: 'not-allowed',
                                      userSelect: 'none',
                                      fontSize: '14px',
                                      height: '30px',
                                    },
                                    className: 'textfields-readonly'
                                  }}
                                  InputLabelProps={{
                                    shrink: true,
                                    className: 'labels',
                                  }}
                                />
                              </FormControl>
                            </Box>
                            <br />
                            <Box className="input-container-banco">
                              <FormControl style={{ marginBottom: '10px', width: '100%' }}>
                                <TextField
                                  id="usernamePayment"
                                  type="text"
                                  label="Nombre"
                                  value={usernamePayment}
                                  onChange={(e) => setUsernamePayment(e.target.value)}
                                  style={{ width: '190px', marginBlockStart: '0px' }}
                                  InputProps={{
                                    readOnly: true,
                                    style: {
                                      backgroundColor: darkMode ? undefined : 'lightgray',
                                      cursor: 'not-allowed',
                                      userSelect: 'none',
                                      fontSize: '14px',
                                      height: '30px',
                                    },
                                    className: 'textfields-readonly'
                                  }}
                                  InputLabelProps={{
                                    shrink: true,
                                    className: 'labels',
                                  }}
                                />
                              </FormControl>
                            </Box>
                            <br />
                            <Box className="input-container-banco">
                              <FormControl style={{ marginBottom: '10px', width: '100%' }}>
                                <TextField
                                  id="bankEmailPayment"
                                  type="text"
                                  label="Correo-Banco"
                                  value={bankEmailPayment}
                                  onChange={(e) => setBankEmailPayment(e.target.value)}
                                  style={{ width: '190px', marginBlockStart: '0px' }}
                                  InputProps={{
                                    readOnly: true,
                                    style: {
                                      backgroundColor: darkMode ? undefined : 'lightgray',
                                      cursor: 'not-allowed',
                                      userSelect: 'none',
                                      fontSize: '14px',
                                      height: '30px',
                                    },
                                    className: 'textfields-readonly'
                                  }}
                                  InputLabelProps={{
                                    shrink: true,
                                    className: 'labels',
                                  }}
                                />
                              </FormControl>
                            </Box>
                            <br />
                            <Box className="input-container-banco">
                              <FormControl style={{ marginBottom: '10px', width: '100%' }}>
                                <TextField
                                  id="totalAmountSum"
                                  type="number"
                                  label="Pago"
                                  value={totalAmountSum}
                                  onChange={(e) => setTotalAmountSum(e.target.value)}
                                  style={{ width: '190px', marginBlockStart: '0px' }}
                                  InputProps={{
                                    readOnly: true,
                                    style: {
                                      backgroundColor: darkMode ? undefined : 'lightgray',
                                      cursor: 'not-allowed',
                                      userSelect: 'none',
                                      fontSize: '14px',
                                      height: '30px',
                                    },
                                    className: 'textfields-readonly'
                                  }}
                                  InputLabelProps={{
                                    shrink: true,
                                    className: 'labels',
                                  }}
                                />
                              </FormControl>
                            </Box>
                            <br />
                            
                            <Box className="input-container-banco">
                              <FormControl style={{ marginBottom: '10px', width: '100%' }}>
                                <TextField
                                  id="pago"
                                  type="date"
                                  label="Fecha"
                                  value={pago}
                                  onChange={(e) => setPago(e.target.value)}
                                  style={{ width: '190px', marginBlockStart: '0px' }}
                                  InputLabelProps={{
                                    shrink: true,
                                    className: 'labels',
                                  }}
                                  InputProps={{
                                    className: 'textfields'
                                  }}
                                />
                              </FormControl>
                            </Box>
                            <br />
                            
                            <Box className="input-container-banco">
                              <FormControl style={{ marginBottom: '10px', width: '100%' }}>
                                <TextField
                                  id="estatus"
                                  select
                                  label="Estatus"
                                  value={estatus}
                                  onChange={(e) => setEstatus(e.target.value)}
                                  style={{ width: '190px' }}
                                  SelectProps={{
                                    native: true,
                                    className: 'textfields'
                                  }}
                                  InputLabelProps={{
                                    shrink: true,
                                    className: 'labels',
                                  }}
                                >
                                  <option value="" disabled>
                                    Selecciona un estatus
                                  </option>
                                  <option value={"Pendiente"}>Pendiente</option>
                                  <option value={"Pagado"}>Pagado</option>
                                  <option value={"Cancelado"}>Cancelado</option>
                                </TextField>
                              </FormControl>
                            </Box>
                            <br />
                            
                            <Box className="input-container-banco">
                              <FormControl style={{ marginBottom: '10px', width: '100%' }}>
                                <TextField
                                  id="banco"
                                  label="Banco"
                                  type="text"
                                  value={banco}
                                  onChange={(e) => setBanco(e.target.value)}
                                  style={{ width: '190px' }}
                                  InputProps={{
                                    endAdornment: banco ? (
                                      <InputAdornment position="end">
                                        <IconButton
                                          aria-label="clear input"
                                          edge="end"
                                          size="small"
                                          onClick={() => setBanco('')}
                                          style={{ width: '5px', height: '5px' }}
                                        >
                                          <CloseIcon />
                                        </IconButton>
                                      </InputAdornment>
                                    ) : null,
                                    className: 'textfields'
                                  }}
                                  InputLabelProps={{
                                    shrink: true,
                                    className: 'labels',
                                  }}
                                />
                              </FormControl>
                            </Box>
                            <br />
                            
                            <Box className="input-container-banco">
                              {!checkboxChecked && (
                                <FormControl style={{ marginBottom: '10px', width: '100%' }}>
                                  <InputLabel shrink={true} className='labels'>Captura</InputLabel>
                                  <Box
                                    component="div"
                                    style={{
                                      border: '1px dashed #000',
                                      padding: '10px',
                                      textAlign: 'center',
                                      width: '168px',
                                    }}
                                    onPaste={(e) => {
                                      handlePasteImage(e);
                                    }}
                                    onDragOver={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                    }}
                                    onDrop={handleDropImage}
                                    tabIndex="0"
                                  >
                                    {fileSelected || imageURL ? (
                                      <>
                                        <IconButton
                                          style={{
                                            cursor: 'pointer',
                                            textDecoration: 'underline',
                                            color: darkMode ? '#3391ff' : 'blue',
                                            fontSize: '1rem',
                                            padding: '0',
                                          }}
                                          onClick={(e) => {
                                            e.preventDefault();
                                            document.getElementById('captura-input').click();
                                          }}
                                        >
                                          Selecciona
                                        </IconButton>
                                        <span>, pega o<br />deja </span>
                                        {fileSelected ? (
                                          <a href={imageURL} className="captura" onClick={handleClickPasteOrDrop} rel="noopener noreferrer">
                                            {captura.name}
                                          </a>
                                        ) : (
                                          <a href={imageURL} className="captura" target="_blank" rel="noopener noreferrer">
                                            Ver
                                          </a>
                                        )}
                                      </>
                                    ) : (
                                      <>
                                        <IconButton
                                          style={{
                                            cursor: 'pointer',
                                            textDecoration: 'underline',
                                            color: 'blue',
                                            fontSize: '1rem',
                                            padding: '0',
                                          }}
                                          onClick={(e) => {
                                            e.preventDefault();
                                            document.getElementById('captura-input').click();
                                          }}
                                        >
                                          Selecciona
                                        </IconButton>
                                        <span> o pega aquí</span>
                                      </>
                                    )}
                                    <OutlinedInput
                                      id="captura-input"
                                      type="file"
                                      style={{ display: 'none' }}
                                      onChange={(e) => {
                                        setCaptura(e.target.files[0]);
                                        setImageURL(URL.createObjectURL(e.target.files[0]));
                                        setFileSelected(e.target.files.length > 0);
                                        setPago(getFormattedVenezuelaDate());
                                        setEstatus('Pagado');
                                      }}
                                    />
                                  </Box>
                                </FormControl>
                              )}
                            </Box>
                            <br />

                            <Box className="input-container-banco">
                              <FormControl style={{ marginBottom: '10px', width: '100%' }}>
                                {!fileSelected && (
                                  <FormControlLabel
                                    style={{ marginLeft: '0px' }}
                                    control={
                                      <Checkbox
                                        id="deleteImage"
                                        checked={deleteImage}
                                        onChange={(e) => {
                                          setDeleteImage(e.target.checked);
                                          setCheckboxChecked(e.target.checked);
                                        }}
                                        style={{
                                          padding: 0,
                                          color: darkMode ? '#888888' : undefined, // establece el color a gris pastoso cuando el modo oscuro está activado
                                        }}
                                      />
                                    }
                                    label="Eliminar Captura"
                                    labelPlacement="start"
                                  />
                                )}
                              </FormControl>
                            </Box>
                            <br />
                            
                            <Button startIcon={<CloseIcon />} title="Cancelar" type="button" variant="contained" color="secondary" onClick={closeModal}></Button>
                            <Button startIcon={<CheckIcon />} title="Guardar" type="submit" variant="contained" color="primary"></Button>
                          </form>
                        </Box>
                      </Modal>
                    )}
                  </Box>
                )}
              </Box>
            </>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
};

export default AuthWrapper;
