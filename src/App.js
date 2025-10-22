import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import CustomerPortal from './pages/Customer/CustomerPortal';
import SupportChat from './pages/Support/SupportChat';
import TicketManagement from './pages/Tickets/TicketManagement';
import CustomerManagement from './pages/Customers/CustomerManagement';
import ServiceManagement from './pages/Services/ServiceManagement';
import CallLogs from './pages/Calls/CallLogs';
import Analytics from './pages/Analytics/Analytics';
import Settings from './pages/Settings/Settings';

function AppContent() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <div>Loading...</div>
      </Box>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          marginTop: '64px',
          marginLeft: sidebarOpen ? '240px' : '0px',
          transition: 'margin-left 0.3s ease',
        }}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/customer-portal" element={<CustomerPortal />} />
          <Route path="/support-chat" element={<SupportChat />} />
          <Route path="/tickets" element={<TicketManagement />} />
          <Route path="/customers" element={<CustomerManagement />} />
          <Route path="/services" element={<ServiceManagement />} />
          <Route path="/calls" element={<CallLogs />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppContent />
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
