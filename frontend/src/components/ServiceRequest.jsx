import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { LocationOn, LocalShipping, AttachMoney } from '@mui/icons-material';
import axios from 'axios';

const ServiceRequest = ({ darkMode }) => {
  const [formData, setFormData] = useState({
    serviceType: '',
    originAddress: '',
    destinationAddress: '',
    materialType: '',
    materialDescription: '',
    estimatedWeight: '',
    estimatedVolume: '',
    scheduledDate: '',
    clientNotes: ''
  });

  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const serviceTypes = [
    { value: 'Por Peso', label: 'Por Peso (Toneladas)' },
    { value: 'Por Trayecto', label: 'Por Trayecto (Distancia)' },
    { value: 'Por Material', label: 'Por Material (Tipo)' }
  ];

  const materialTypes = [
    { value: 'escombros', label: 'Escombros' },
    { value: 'tierra', label: 'Tierra' },
    { value: 'concreto', label: 'Concreto' },
    { value: 'otros', label: 'Otros' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculatePrice = async () => {
    if (!formData.serviceType || !formData.materialType) return;

    try {
      setLoading(true);
      const response = await axios.post('/api/services/calculate-price', {
        serviceType: formData.serviceType,
        distance: 10, // Valor por defecto, se puede mejorar con geocoding
        estimatedWeight: parseFloat(formData.estimatedWeight) || 0,
        materialType: formData.materialType
      });

      setEstimatedPrice(response.data.estimatedPrice);
    } catch (error) {
      console.error('Error al calcular precio:', error);
      setError('Error al calcular el precio estimado');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formData.serviceType && formData.materialType) {
      calculatePrice();
    }
  }, [formData.serviceType, formData.materialType, formData.estimatedWeight]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/services/create', {
        ...formData,
        estimatedPrice: estimatedPrice,
        distance: 10, // Valor por defecto
        originCoordinates: '', // Se puede mejorar con geocoding
        destinationCoordinates: '' // Se puede mejorar con geocoding
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSuccess('Servicio solicitado exitosamente. Los transportistas cercanos serán notificados.');
      setFormData({
        serviceType: '',
        originAddress: '',
        destinationAddress: '',
        materialType: '',
        materialDescription: '',
        estimatedWeight: '',
        estimatedVolume: '',
        scheduledDate: '',
        clientNotes: ''
      });
      setEstimatedPrice(0);
    } catch (error) {
      console.error('Error al crear servicio:', error);
      setError(error.response?.data?.message || 'Error al crear el servicio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4, backgroundColor: darkMode ? '#2d2d2d' : '#fff' }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
          <LocalShipping sx={{ mr: 1, verticalAlign: 'middle' }} />
          Solicitar Servicio de Transporte
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Tipo de Servicio */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Servicio</InputLabel>
                <Select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleInputChange}
                  required
                >
                  {serviceTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Tipo de Material */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Material</InputLabel>
                <Select
                  name="materialType"
                  value={formData.materialType}
                  onChange={handleInputChange}
                  required
                >
                  {materialTypes.map((material) => (
                    <MenuItem key={material.value} value={material.value}>
                      {material.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Direcciones */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOn sx={{ mr: 1 }} />
                Ubicaciones
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Dirección de Origen"
                name="originAddress"
                value={formData.originAddress}
                onChange={handleInputChange}
                required
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Dirección de Destino"
                name="destinationAddress"
                value={formData.destinationAddress}
                onChange={handleInputChange}
                required
                multiline
                rows={2}
              />
            </Grid>

            {/* Detalles del Material */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Detalles del Material
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Peso Estimado (Toneladas)"
                name="estimatedWeight"
                type="number"
                value={formData.estimatedWeight}
                onChange={handleInputChange}
                inputProps={{ min: 0, step: 0.1 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Volumen Estimado (m³)"
                name="estimatedVolume"
                type="number"
                value={formData.estimatedVolume}
                onChange={handleInputChange}
                inputProps={{ min: 0, step: 0.1 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción del Material"
                name="materialDescription"
                value={formData.materialDescription}
                onChange={handleInputChange}
                multiline
                rows={3}
                placeholder="Describe el material que necesitas transportar..."
              />
            </Grid>

            {/* Fecha Programada */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Fecha Programada"
                name="scheduledDate"
                type="datetime-local"
                value={formData.scheduledDate}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            {/* Notas Adicionales */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Notas Adicionales"
                name="clientNotes"
                value={formData.clientNotes}
                onChange={handleInputChange}
                multiline
                rows={2}
                placeholder="Información adicional..."
              />
            </Grid>

            {/* Precio Estimado */}
            <Grid item xs={12}>
              <Card sx={{ backgroundColor: darkMode ? '#3d3d3d' : '#f5f5f5' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <AttachMoney sx={{ mr: 1 }} />
                    Precio Estimado
                  </Typography>
                  <Typography variant="h4" color="primary">
                    ${estimatedPrice.toLocaleString('es-CO')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Este es un precio estimado. El precio final puede variar según la disponibilidad y distancia.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Botón de Envío */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Solicitar Servicio'
                )}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default ServiceRequest; 