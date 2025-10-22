import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
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
  TrendingUp,
  People,
  Support,
  Phone,
  Assignment,
  Computer,
  Schedule,
  CheckCircle,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const { notifications, connected } = useSocket();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/analytics/dashboard');
      setStats(response.data);
      
      // Combine recent tickets and calls
      const activity = [
        ...response.data.recentActivity.tickets.map(ticket => ({
          ...ticket,
          type: 'ticket',
          icon: <Assignment />,
        })),
        ...response.data.recentActivity.calls.map(call => ({
          ...call,
          type: 'call',
          icon: <Phone />,
        }))
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
       .slice(0, 5);
      
      setRecentActivity(activity);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'warning';
      case 'in_progress': return 'info';
      case 'resolved': return 'success';
      case 'closed': return 'default';
      case 'completed': return 'success';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {getGreeting()}, {user?.name}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to your {user?.role === 'admin' ? 'Admin' : 
                          user?.role === 'agent' ? 'Agent' : 'Customer'} Dashboard
        </Typography>
        {connected && (
          <Chip 
            label="Connected" 
            color="success" 
            size="small" 
            sx={{ mt: 1 }}
          />
        )}
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <Assignment />
                </Avatar>
                <Box>
                  <Typography variant="h6">{stats?.tickets?.total || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Tickets
                  </Typography>
                </Box>
              </Box>
            </CardContent>
            <CardActions>
              <Button size="small" href="/tickets">View All</Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <Phone />
                </Avatar>
                <Box>
                  <Typography variant="h6">{stats?.calls?.total || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Calls
                  </Typography>
                </Box>
              </Box>
            </CardContent>
            <CardActions>
              <Button size="small" href="/calls">View All</Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <People />
                </Avatar>
                <Box>
                  <Typography variant="h6">{stats?.customers?.newCustomers || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    New Customers
                  </Typography>
                </Box>
              </Box>
            </CardContent>
            <CardActions>
              <Button size="small" href="/customers">View All</Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    ₹{stats?.customers?.totalSpent?.toLocaleString() || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
                  </Typography>
                </Box>
              </Box>
            </CardContent>
            <CardActions>
              <Button size="small" href="/analytics">View Details</Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {recentActivity.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                  No recent activity
                </Typography>
              ) : (
                recentActivity.map((activity, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {activity.icon}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body1">
                              {activity.type === 'ticket' 
                                ? `Ticket: ${activity.subject}`
                                : `Call: ${activity.customerName}`
                              }
                            </Typography>
                            <Chip 
                              label={activity.status} 
                              color={getStatusColor(activity.status)}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {new Date(activity.createdAt).toLocaleString()}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < recentActivity.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              {user?.role === 'customer' && (
                <>
                  <Button 
                    variant="contained" 
                    startIcon={<Computer />}
                    href="/customer-portal"
                    fullWidth
                  >
                    Access Services
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<Support />}
                    href="/support-chat"
                    fullWidth
                  >
                    Get Support
                  </Button>
                </>
              )}
              {(user?.role === 'admin' || user?.role === 'agent') && (
                <>
                  <Button 
                    variant="contained" 
                    startIcon={<Support />}
                    href="/support-chat"
                    fullWidth
                  >
                    Support Chat
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<Assignment />}
                    href="/tickets"
                    fullWidth
                  >
                    Manage Tickets
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<Phone />}
                    href="/calls"
                    fullWidth
                  >
                    Call Logs
                  </Button>
                </>
              )}
            </Box>
          </Paper>

          {/* Notifications */}
          {notifications.length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Notifications
              </Typography>
              <List>
                {notifications.slice(0, 3).map((notification, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'info.main' }}>
                          <CheckCircle />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={notification.message}
                        secondary={new Date(notification.timestamp).toLocaleString()}
                      />
                    </ListItem>
                    {index < Math.min(notifications.length, 3) - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
