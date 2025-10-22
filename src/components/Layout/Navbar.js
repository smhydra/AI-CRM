import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Divider,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Settings,
  Logout,
  Language,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { notifications, clearNotifications } = useSocket();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
  };

  const handleLanguageChange = (language) => {
    // Implement language change logic
    console.log('Language changed to:', language);
    handleProfileMenuClose();
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={onMenuClick}
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Cyber Cafe CRM
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Language Selector */}
          <IconButton
            color="inherit"
            onClick={() => handleLanguageChange('en')}
            title="Switch Language"
          >
            <Language />
          </IconButton>

          {/* Notifications */}
          <IconButton
            color="inherit"
            onClick={handleNotificationMenuOpen}
            title="Notifications"
          >
            <Badge badgeContent={unreadNotifications} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* Profile Menu */}
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="primary-search-account-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
        </Box>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
        >
          <MenuItem onClick={handleProfileMenuClose}>
            <ListItemIcon>
              <AccountCircle fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </MenuItem>
          <MenuItem onClick={handleProfileMenuClose}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </MenuItem>
        </Menu>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notificationAnchor}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationMenuClose}
        >
          {notifications.length === 0 ? (
            <MenuItem disabled>
              <ListItemText primary="No notifications" />
            </MenuItem>
          ) : (
            notifications.map((notification, index) => (
              <MenuItem key={index} onClick={handleNotificationMenuClose}>
                <ListItemText 
                  primary={notification.message}
                  secondary={new Date(notification.timestamp).toLocaleString()}
                />
              </MenuItem>
            ))
          )}
          {notifications.length > 0 && (
            <>
              <Divider />
              <MenuItem onClick={() => { clearNotifications(); handleNotificationMenuClose(); }}>
                <ListItemText primary="Clear all" />
              </MenuItem>
            </>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
