import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Grid, Paper, Select, MenuItem, Table, TableBody, TableCell, Typography } from '@mui/material';
import { TableContainer, TableHead, TableRow, TextField, TablePagination, TableFooter, IconButton } from '@mui/material';
import TablePaginationActions from './TablePaginationActions';
import CloseIcon from '@mui/icons-material/Close';
import Navigation from './Navigation';

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

  // Si está autenticado, renderiza WorkerDashboard
  if (isAuthenticated === true) {
    return (
      <WorkerDashboard 
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

const WorkerDashboard = ({ userRole, toggleDarkMode, darkMode, loggedInUser, isAuthenticated }) => {
  const navigate = useNavigate();

  // Datos de los usuarios
  const [phones, setPhones] = useState([]);
  const [calls, setCalls] = useState([]);
  const [payments, setPayments] = useState([]);
  const [weeks, setWeeks] = useState([]);

  // Fecha
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('');

  // Paginación
  const [callsPage, setCallsPage] = useState(1);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [callsItemsPerPage, setCallsItemsPerPage] = useState(10);
  const [paymentsItemsPerPage, setPaymentsItemsPerPage] = useState(10);
  const [showAllCalls, setShowAllCalls] = useState(false);
  const [showAllPayments, setShowAllPayments] = useState(false);

  // Búsqueda
  const [callSearch, setCallSearch] = useState('');

  // Ocultar/desocultar historial de llamadas y pagos
  const [showCalls, setShowCalls] = useState(true);
  const [showPayments, setShowPayments] = useState(true);

  // Cargando pagina
  const [isDataLoaded, setIsDataLoaded] = useState(false);

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

  useEffect(() => {
    // Función para obtener todos los datos de las semanas
    const fetchWeekData = async () => {
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
      if ((storedUserRole !== 'Propietario' && storedUserRole !== 'Administrador' && storedUserRole !== 'Trabajador')) {
        alert('No tienes los permisos necesarios para realizar esta acción.');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/', { replace: true });
        return;
      }

      // Proceed with the API call      
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/workers/weeks`, { // Cambia esta URL a la correcta para obtener todos los datos de las semanas
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          setWeeks(response.data.weeks);
        } else {
          console.error('Error al obtener los datos de las semanas');
        }
      } catch (error) {
        console.error('Error al obtener los datos de las semanas:', error);
      }
    };

    fetchWeekData();
  }, [userRole, navigate]);

  useEffect(() => {
    // Función para obtener los datos del trabajador desde la API
    const fetchWorkerData = async () => {
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
      if ((storedUserRole !== 'Propietario' && storedUserRole !== 'Administrador' && storedUserRole !== 'Trabajador')) {
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
      const isValidWeek = weeks.some(week => week.anio === Number(selectedYear) && week.mes === selectedMonth && week.semana === selectedWeek);
      if (!isValidWeek) {
        return;
      }

      // Proceed with the API call      
      try {
        const token = localStorage.getItem('token');

        // Check if year, month, and week are not empty
        if (!selectedYear || !selectedMonth || !selectedWeek) {
          return;
        }

        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/workers`, {
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

    fetchWorkerData();
  }, [selectedYear, selectedMonth, selectedWeek, userRole, navigate, weeks]);

  // Nueva función para obtener el último registro de llamadas
  const getLastCallRecord = useCallback(() => {
    return calls.reduce((prev, current) => {
      const prevDate = new Date(prev.Week.anio, prev.Week.mes, prev.Week.semana);
      const currentDate = new Date(current.Week.anio, current.Week.mes, current.Week.semana);
      return prevDate > currentDate ? prev : current;
    }, calls[0]);
  }, [calls]);

  // Establece los valores iniciales de los estados en función del último registro de las llamadas
  useEffect(() => {
    if (calls.length > 0) {
      const lastCall = getLastCallRecord();
      setSelectedYear(lastCall.Week.anio.toString());
      setSelectedMonth(lastCall.Week.mes);
      setSelectedWeek(lastCall.Week.semana);
    }
  }, [calls, getLastCallRecord]);

  // Función para filtrar registros basado en los valores seleccionados
  const filterRecords = (records) => {
    return records.filter(record => {
      const isYearMatch = selectedYear === '' || Number(record.Week.anio) === Number(selectedYear);
      const isMonthMatch = selectedMonth === '' || record.Week.mes === selectedMonth;
      const isWeekMatch = selectedWeek === '' || record.Week.semana === selectedWeek;
      return isYearMatch && isMonthMatch && isWeekMatch;
    });
  };

  const handleCallSearchChange = (e) => {
    setCallSearch(e.target.value);
  };

  const filterCallsBySearch = (records) => {
    if (callSearch === '') {
      return records;
    }

    const searchLowerCase = callSearch.toLowerCase();
    return records.filter((record) => {
      const phone = phones.find((phone) => phone.id === record.Phone.id);
      const phoneNumber = phone ? phone.phoneNumber : '';

      return (
        phoneNumber.includes(searchLowerCase)
      );
    });
  };

  // Filtra los registros antes de renderizarlos en la tabla
  const filteredCalls = filterCallsBySearch(filterRecords(calls));
  const filteredPayments = filterRecords(payments);

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

  // Obtener los años únicos de las semanas
  const uniqueYears = useMemo(() => Array.from(new Set(weeks.map(week => week.anio))), [weeks]);

  // Obtener los meses únicos para el año seleccionado
  const uniqueMonthsForSelectedYear = useMemo(() => selectedYear
    ? Array.from(new Set(weeks.filter(week => week.anio === Number(selectedYear)).map(week => week.mes)))
    : [], [weeks, selectedYear]);

  // Obtener las semanas únicas para el mes y año seleccionados
  const uniqueWeeksForSelectedMonth = useMemo(() => selectedMonth && selectedYear
    ? Array.from(new Set(weeks.filter(week => week.mes === selectedMonth && week.anio === Number(selectedYear)).map(week => week.semana)))
    : [], [weeks, selectedMonth, selectedYear]);

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

  const toggleCalls = () => {
    setShowCalls(!showCalls);
  };

  const togglePayments = () => {
    setShowPayments(!showPayments);
  };

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
              <Typography variant="h7" component="h1" gutterBottom align="center" style={{ marginBottom: '11.20px' }}>Panel de trabajador</Typography>

              <Box component="div" style={{ marginBottom: '14px' }}>
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
                          placeholder="🔍Teléfono"
                          value={callSearch}
                          onChange={handleCallSearchChange}
                          InputProps={{
                            style: {
                              width: '150px',
                              maxHeight: '40px',
                              fontSize: '14px',
                            },
                            className: 'buscador'
                          }}
                        />
                        {callSearch && (
                          <IconButton 
                            title="Borrar"
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

                      <TableContainer component={Paper} style={{ marginBottom: '14px' }}>
                        <Table className="centered-table">
                          <TableHead>
                            <TableRow>
                              <TableCell>Teléfono</TableCell>
                              <TableCell>1ER</TableCell>
                              <TableCell>2DO</TableCell>
                              <TableCell>Final</TableCell>
                              <TableCell>Total</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {Array.isArray(displayedCalls) && displayedCalls.map((call, index) => {
                              const phone = phones.find(phone => phone.id === call.Phone.id);
                              const phoneNumber = phone ? phone.phoneNumber : 'Desconocido';

                              return (
                                <TableRow key={index}>
                                  <TableCell>{phoneNumber}</TableCell>
                                  <TableCell>${formatAmount(call.firstCut)}</TableCell>
                                  <TableCell>${formatAmount(call.secondCut)}</TableCell>
                                  <TableCell>${formatAmount(call.finalCut)}</TableCell>
                                  <TableCell>${formatAmount(call.totalAmount)}</TableCell>
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
                  )}
                </Box>

                <Box>
                  <Typography variant="h5" component="h2" onClick={togglePayments} style={{fontWeight: 'bold', marginBottom: '14px'}}>
                    Historial de pagos {showPayments ? "▼" : "▲"}
                  </Typography>

                  {showPayments && (
                    <Box>
                      <TableContainer component={Paper}>
                        <Table className="centered-table">
                          <TableHead>
                            <TableRow>
                              <TableCell>Pago</TableCell>
                              <TableCell>Fecha</TableCell>
                              <TableCell>Estatus</TableCell>
                              <TableCell>Banco</TableCell>
                              <TableCell>Cap</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {Array.isArray(displayedPayments) && displayedPayments.map((payment, index) => (
                              <TableRow key={index}>
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
                              </TableRow>
                            ))}
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
