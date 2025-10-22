import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Computer,
  Print,
  Scanner,
  SportsEsports,
  Wifi,
  Build,
  School,
  MoreVert,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const CustomerPortal = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/services');
      setServices(response.data.services);
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const serviceIcons = {
    internet: <Wifi />,
    printing: <Print />,
    scanning: <Scanner />,
    gaming: <SportsEsports />,
    software: <Computer />,
    hardware: <Build />,
    training: <School />,
    other: <MoreVert />,
  };

  const getServiceIcon = (category) => {
    return serviceIcons[category] || serviceIcons.other;
  };

  const handleBookService = (service) => {
    // Implement service booking logic
    console.log('Booking service:', service);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.name}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse and book our cyber cafe services
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Service Categories */}
      <Grid container spacing={3}>
        {services.map((service) => (
          <Grid item xs={12} sm={6} md={4} key={service._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    {getServiceIcon(service.category)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" component="h2">
                      {service.name}
                    </Typography>
                    <Chip 
                      label={service.category} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {service.description}
                </Typography>
                
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" color="primary">
                    ₹{service.pricing.basePrice}
                    <Typography component="span" variant="body2" color="text.secondary">
                      /{service.pricing.type}
                    </Typography>
                  </Typography>
                  
                  <Chip 
                    label={service.availability.isAvailable ? 'Available' : 'Unavailable'}
                    color={service.availability.isAvailable ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
              </CardContent>
              
              <CardActions>
                <Button 
                  size="small" 
                  variant="contained"
                  onClick={() => handleBookService(service)}
                  disabled={!service.availability.isAvailable}
                  fullWidth
                >
                  Book Service
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Stats */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Your Activity
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Box textAlign="center">
              <Typography variant="h4" color="primary">
                0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Services Used
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box textAlign="center">
              <Typography variant="h4" color="success.main">
                ₹0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Spent
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box textAlign="center">
              <Typography variant="h4" color="info.main">
                0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Loyalty Points
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default CustomerPortal;
