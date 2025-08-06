import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, Button, Drawer, Menu, MenuItem, useTheme, useMediaQuery } from '@mui/material';
import { ArrowDropDown, AccountCircle, Menu as MenuIcon, Login as LoginIcon, PersonAdd as PersonAddIcon, Brightness4 as Brightness4Icon, Brightness7 as Brightness7Icon } from '@mui/icons-material';
import GroupIcon from '@mui/icons-material/Group';
import DashboardIcon from '@mui/icons-material/Dashboard';
import WorkIcon from '@mui/icons-material/Work';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LogoutIcon from '@mui/icons-material/Logout';

const Navigation = ({ toggleDarkMode, darkMode, isAuthenticated, userRole, loggedInUser }) => {
  const navigate = useNavigate();

  // Menú usuario
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Si estamos en una de estas rutas, solo mostramos titulo y botones de cerrar sesion y modo claro/oscuro
  const location = useLocation();
  const restrictedRoutes = ['/confirm-email', '/verify-email'];
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    navigate('/', { replace: true });
    window.location.reload();
  };

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const drawer = (
    <div>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={open}
        onClose={handleClose}
      >
        {restrictedRoutes.includes(location.pathname) ? (
          <div>
            <MenuItem onClick={toggleDarkMode}>
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              Modo Claro/Oscuro
            </MenuItem>
            <MenuItem onClick={handleLogout}><LogoutIcon /> Cerrar sesión</MenuItem>
          </div>
        ) : isAuthenticated ? (
          <div>
            {userRole === 'Propietario' && (
              <div>
                <MenuItem component={RouterLink} to="/owner-dashboard">
                  <GroupIcon /> Gestión de usuarios
                </MenuItem>
                <MenuItem component={RouterLink} to="/admin-dashboard">
                  <DashboardIcon /> Panel de administrador
                </MenuItem>
                <MenuItem component={RouterLink} to="/worker-dashboard">
                  <WorkIcon /> Panel de trabajador
                </MenuItem>
                <MenuItem component={RouterLink} to="/payment-method">
                  <AccountBalanceIcon /> Método de pago
                </MenuItem>
                <MenuItem onClick={toggleDarkMode}>
                  {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                  Modo Claro/Oscuro
                </MenuItem>
                <MenuItem onClick={handleLogout}><LogoutIcon /> Cerrar sesión</MenuItem>
              </div>
            )}
            {userRole === 'Administrador' && (
              <div>
                <MenuItem component={RouterLink} to="/admin-dashboard">
                  <DashboardIcon /> Panel de administrador
                </MenuItem>
                <MenuItem component={RouterLink} to="/worker-dashboard">
                  <WorkIcon /> Panel de trabajador
                </MenuItem>
                <MenuItem component={RouterLink} to="/payment-method">
                  <AccountBalanceIcon /> Método de pago
                </MenuItem>
                <MenuItem onClick={toggleDarkMode}>
                  {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                  Modo Claro/Oscuro
                </MenuItem>
                <MenuItem onClick={handleLogout}><LogoutIcon /> Cerrar sesión</MenuItem>
              </div>
            )}
            {userRole === 'Trabajador' && (
              <div>
                <MenuItem component={RouterLink} to="/worker-dashboard">
                  <WorkIcon /> Panel de trabajador
                </MenuItem>
                <MenuItem component={RouterLink} to="/payment-method">
                  <AccountBalanceIcon /> Método de pago
                </MenuItem>
                <MenuItem onClick={toggleDarkMode}>
                  {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                  Modo Claro/Oscuro
                </MenuItem>
                <MenuItem onClick={handleLogout}><LogoutIcon /> Cerrar sesión</MenuItem>
              </div>
            )}
          </div>
        ) : (
          <div>
            <MenuItem component={RouterLink} to="/login">
              <LoginIcon /> Iniciar sesión
            </MenuItem>
            <MenuItem component={RouterLink} to="/register">
              <PersonAddIcon /> Registrarse
            </MenuItem>
            <MenuItem onClick={toggleDarkMode}>
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              Modo Claro/Oscuro
            </MenuItem>
          </div>
        )}
      </Menu>
    </div>
  );

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div">
            <RouterLink title="Inicio" to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              EscombrosApp
            </RouterLink>
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          {isSmallScreen ? (
            <>
              {isAuthenticated ? (
                <Button
                  title="Usuario"
                  startIcon={<AccountCircle />}
                  endIcon={<ArrowDropDown />}
                  onClick={(event) => handleMenu(event)}
                  style={{backgroundColor: '#1976d2', color: 'white', textTransform: 'none', fontSize: '0.9rem'}}
                >
                  {loggedInUser}
                </Button>
              ) : (
                <Button edge="start" color="inherit" aria-label="menu" onClick={(event) => handleMenu(event)}>
                  <MenuIcon />
                </Button>
              )}
              <Drawer
                variant="temporary"
                anchor={theme.direction === 'rtl' ? 'right' : 'left'}
                open={drawerOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                  keepMounted: true, // Better open performance on mobile.
                }}
              >
                {drawer}
              </Drawer>
            </>
          ) : (
            <>
              {restrictedRoutes.includes(location.pathname) ? (
                <>
                  <Button title="Cerrar sesión" color="inherit" onClick={handleLogout}><LogoutIcon /></Button>
                  <Button 
                    title="Modo Claro/Oscuro"
                    variant="contained" 
                    color={darkMode ? "secondary" : "primary"} 
                    onClick={toggleDarkMode} 
                    startIcon={darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                  >
                  </Button>
                </>
              ) : isAuthenticated ? (
                <>
                  {userRole === 'Propietario' && (
                    <>
                      <Button title="Gestión de usuarios" startIcon={<GroupIcon />} color="inherit" component={RouterLink} to="/owner-dashboard"></Button>
                      <Button title="Panel de administrador" startIcon={<DashboardIcon />} color="inherit" component={RouterLink} to="/admin-dashboard"></Button>
                      <Button title="Panel de trabajador" startIcon={<WorkIcon />} color="inherit" component={RouterLink} to="/worker-dashboard"></Button>
                    </>
                  )}
                  {userRole === 'Administrador' && (
                    <>
                      <Button title="Panel de administrador" startIcon={<DashboardIcon />} color="inherit" component={RouterLink} to="/admin-dashboard"></Button>
                      <Button title="Panel de trabajador" startIcon={<WorkIcon />} color="inherit" component={RouterLink} to="/worker-dashboard"></Button>
                    </>
                  )}
                  {userRole === 'Trabajador' && (
                    <Button title="Panel de trabajador" startIcon={<WorkIcon />} color="inherit" component={RouterLink} to="/worker-dashboard"></Button>
                  )}
                  <Menu
                    id="user-menu-appbar"
                    anchorEl={anchorEl}
                    anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                    }}
                    open={open}
                    onClose={handleClose}
                  >
                    <MenuItem component={RouterLink} to="/payment-method">
                      <AccountBalanceIcon /> Método de pago
                    </MenuItem>
                    <MenuItem onClick={toggleDarkMode}>
                      {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                      Modo Claro/Oscuro
                    </MenuItem>
                    <MenuItem onClick={handleLogout}><LogoutIcon /> Cerrar sesión</MenuItem>
                  </Menu>
                  <Button
                    title="Usuario"
                    startIcon={<AccountCircle />}
                    endIcon={<ArrowDropDown />}
                    onClick={(event) => handleMenu(event)}
                    style={{backgroundColor: '#1976d2', color: 'white', textTransform: 'none', fontSize: '0.9rem'}}
                  >
                    {loggedInUser}
                  </Button>
                </>
              ) : (
                <>
                  <Button title="Iniciar sesión" color="inherit" component={RouterLink} to="/login">
                  <LoginIcon />
                  </Button>
                  <Button title="Registrarse" color="inherit" component={RouterLink} to="/register">
                  <PersonAddIcon />
                  </Button>
                  <Button 
                    title="Modo Claro/Oscuro"
                    variant="contained" 
                    color={darkMode ? "secondary" : "primary"} 
                    onClick={toggleDarkMode} 
                    style={{backgroundColor: '#1976d2'}}
                    startIcon={darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                  >
                  </Button>
                </>
              )}
            </>
          )}
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default Navigation;
