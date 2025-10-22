import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Support as SupportIcon,
  Assignment as TicketIcon,
  Phone as PhoneIcon,
  Business as ServiceIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Computer as ComputerIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: ['admin', 'agent', 'customer'] },
  { text: 'Customer Portal', icon: <ComputerIcon />, path: '/customer-portal', roles: ['customer'] },
  { text: 'Support Chat', icon: <SupportIcon />, path: '/support-chat', roles: ['admin', 'agent', 'customer'] },
  { text: 'Tickets', icon: <TicketIcon />, path: '/tickets', roles: ['admin', 'agent'] },
  { text: 'Customers', icon: <PeopleIcon />, path: '/customers', roles: ['admin', 'agent'] },
  { text: 'Services', icon: <ServiceIcon />, path: '/services', roles: ['admin', 'agent', 'customer'] },
  { text: 'Call Logs', icon: <PhoneIcon />, path: '/calls', roles: ['admin', 'agent'] },
  { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics', roles: ['admin'] },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings', roles: ['admin', 'agent', 'customer'] },
];

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          marginTop: '64px',
        },
      }}
    >
      <Box sx={{ overflow: 'auto', height: '100%' }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" color="primary" fontWeight="bold">
            {user?.role === 'admin' ? 'Admin Panel' : 
             user?.role === 'agent' ? 'Agent Panel' : 
             'Customer Portal'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome, {user?.name}
          </Typography>
        </Box>
        
        <Divider />
        
        <List>
          {filteredMenuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                }}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
