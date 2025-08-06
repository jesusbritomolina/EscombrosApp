import React, { useState, useEffect } from 'react';
import { Typography, Box, Container, Grid, Card, CardMedia, CardContent } from '@mui/material';
import sliderImage from '../assets/Slider.jpg';
import aboutImage from '../assets/Logo-Escombros.jpg';
import s1Image from '../assets/s-1.jpg';
import s2Image from '../assets/s-2.jpg';
import s3Image from '../assets/s-3.jpg';
import s4Image from '../assets/s-4.jpg';
import s5Image from '../assets/s-5.jpg';
import s6Image from '../assets/s-6.jpg';
import s7Image from '../assets/s-7.jpg';
import s8Image from '../assets/s-8.jpg';
import w1Image from '../assets/w-1.png';
import w2Image from '../assets/w-2.png';
import w3Image from '../assets/w-3.png';
import w4Image from '../assets/w-4.png';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Navigation from './Navigation';

const Home = ({ toggleDarkMode, darkMode }) => {

  // Parámetros para la barra de navegación
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const userRole = localStorage.getItem('userRole') || '';
  const loggedInUser = localStorage.getItem('username') || '';

  const services = [
    {
      title: 'Escombros',
      image: s1Image,
      imageSize: { height: '200px' }
    },
    {
      title: 'Recolección de Tierra',
      image: s2Image,
      imageSize: { height: '200px' }
    },
    {
      title: 'Transporte de Concreto',
      image: s3Image,
      imageSize: { height: '200px' }
    },
    {
      title: 'Limpieza de Obras',
      image: s4Image,
      imageSize: { height: '200px' }
    },
    {
      title: 'Retiro de Materiales',
      image: s5Image,
      imageSize: { height: '200px' }
    },
    {
      title: 'Transporte de Arena',
      image: s6Image,
      imageSize: { height: '200px' }
    },
    {
      title: 'Desechos',
      image: s7Image,
      imageSize: { height: '200px' }
    },
    {
      title: 'Limpieza de Terrenos',
      image: s8Image,
      imageSize: { height: '200px' }
    },
  ];

  const works = [
    {
      title: 'Solicitud',
      description: 'Registro y solicitud de servicio',
      image: w1Image,
      imageSize: { height: '200px' }
    },
    {
      title: 'Cotización',
      description: 'Cálculo automático de precios',
      image: w2Image,
      imageSize: { height: '200px' }
    },
    {
      title: 'Transporte',
      description: 'Recolección y entrega',
      image: w3Image,
      imageSize: { height: '200px' }
    },
    {
      title: 'Pago',
      description: 'Procesamiento seguro de pagos',
      image: w4Image,
      imageSize: { height: '200px' }
    },
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserRole = localStorage.getItem('userRole');

    if (!token || (storedUserRole !== 'Propietario' && storedUserRole !== 'Administrador' && storedUserRole !== 'Trabajador')) {
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
    }
  }, []);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <div>
      <Navigation 
        toggleDarkMode={toggleDarkMode} 
        darkMode={darkMode} 
        isAuthenticated={isAuthenticated} 
        userRole={userRole}
        loggedInUser={loggedInUser}
      />
      <Box sx={{ py: 3 }}>
        <Container>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'center', md: 'stretch' },
            padding: 0, 
            justifyContent: 'space-between' 
          }}>
            <Box sx={{ flex: '1 1 auto', overflow: 'hidden', marginBottom: { xs: 2, md: 0 } }}>
              <img src={sliderImage} alt="slider" style={{ maxWidth: '100%', height: 'auto' }} />
            </Box>
            <Box sx={{ flex: '1 1 auto', textAlign: { xs: 'center', md: 'left', lg: 'left' }, overflow: 'hidden' }}>
              <Typography variant={isSmallScreen ? "h4" : "h1"} gutterBottom component="div" sx={{ wordWrap: 'break-word', fontWeight: 'bold', fontSize: '4rem' }}>
                <br /> <br /> EscombrosApp
              </Typography>
              <Typography variant="body1" gutterBottom sx={{ wordWrap: 'break-word' }}>
                Ubica el servicio de recolección ideal según tu material, peso y ubicación.
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
      <Box sx={{ py: 3 }}>
        <Container>
          <Box sx={{ textAlign: 'center', marginBottom: 2 }}>
            <Typography variant="h7" component="h1" >
              SOBRE NOSOTROS
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <img src={aboutImage} alt="" style={{ maxWidth: '100%', height: 'auto' }} />
          </Box>
          <Typography variant="body1" paragraph>
            Somos una plataforma especializada en servicios de transporte y recolección de escombros. Conectamos clientes con transportistas profesionales. 
            Estando al alcance de cada proyecto que necesite de nuestros servicios. EscombrosApp
          </Typography>
        </Container>
      </Box>
      <Box sx={{ py: 3 }}>
        <Container>
          <Box sx={{ textAlign: 'center', marginBottom: 2 }}>
            <Typography variant="h7" component="h1" >
              SERVICIOS
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {services.map((service, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card>
                  <div 
                    style={{ 
                      height: service.imageSize.height, 
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={service.image}
                      alt={service.title}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  </div>
                  <CardContent>
                    <Typography variant="h7" component="h3">
                      {service.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      <Box sx={{ py: 3 }}>
        <Container>
          <Box sx={{ textAlign: 'center', marginBottom: 2 }}>
            <Typography variant="h7" component="h1" >
              CÓMO FUNCIONA
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {works.map((work, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card>
                  <div 
                    style={{ 
                      height: work.imageSize.height, 
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                  <CardMedia
                    component="img"
                    image={work.image}
                    alt={work.title}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                  </div>
                  <CardContent>
                    <Typography variant="h7" component="h3">
                      {work.title}
                    </Typography>
                    <Typography variant="body2">
                      {work.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </div>
  );
}

export default Home;
