import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
        auth: {
          token
        }
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setConnected(false);
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      // Message handling
      newSocket.on('new_message', (message) => {
        setMessages(prev => [...prev, message]);
      });

      newSocket.on('ai_response', (response) => {
        setMessages(prev => [...prev, {
          ...response,
          isAIMessage: true,
          userName: 'AI Assistant'
        }]);
      });

      // Notification handling
      newSocket.on('new_ticket', (ticket) => {
        setNotifications(prev => [...prev, {
          type: 'ticket',
          message: `New ticket: ${ticket.subject}`,
          data: ticket,
          timestamp: new Date()
        }]);
      });

      newSocket.on('call_initiated', (call) => {
        setNotifications(prev => [...prev, {
          type: 'call',
          message: `Call initiated for ${call.customerName}`,
          data: call,
          timestamp: new Date()
        }]);
      });

      newSocket.on('escalation_needed', (escalation) => {
        setNotifications(prev => [...prev, {
          type: 'escalation',
          message: `Escalation needed for ticket: ${escalation.ticketId}`,
          data: escalation,
          timestamp: new Date()
        }]);
      });

      newSocket.on('agent_joined', (agent) => {
        setNotifications(prev => [...prev, {
          type: 'agent',
          message: `${agent.agentName} joined`,
          data: agent,
          timestamp: new Date()
        }]);
      });

      newSocket.on('agent_left', (agent) => {
        setNotifications(prev => [...prev, {
          type: 'agent',
          message: `${agent.agentName} left`,
          data: agent,
          timestamp: new Date()
        }]);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  const sendMessage = (message, ticketId) => {
    if (socket && connected) {
      socket.emit('send_message', {
        message,
        ticketId,
        isAIMessage: false
      });
    }
  };

  const requestCall = (customerPhone, purpose = 'support', priority = 'medium') => {
    if (socket && connected) {
      socket.emit('request_call', {
        customerPhone,
        purpose,
        priority
      });
    }
  };

  const createTicket = (ticketData) => {
    if (socket && connected) {
      socket.emit('create_ticket', ticketData);
    }
  };

  const assignTicket = (ticketId, agentId) => {
    if (socket && connected) {
      socket.emit('assign_ticket', {
        ticketId,
        agentId
      });
    }
  };

  const updateAgentStatus = (status, availability) => {
    if (socket && connected) {
      socket.emit('agent_status', {
        status,
        availability
      });
    }
  };

  const joinTicketRoom = (ticketId) => {
    if (socket && connected) {
      socket.emit('join_ticket', { ticketId });
    }
  };

  const leaveTicketRoom = (ticketId) => {
    if (socket && connected) {
      socket.emit('leave_ticket', { ticketId });
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const removeNotification = (index) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  const value = {
    socket,
    connected,
    messages,
    notifications,
    sendMessage,
    requestCall,
    createTicket,
    assignTicket,
    updateAgentStatus,
    joinTicketRoom,
    leaveTicketRoom,
    clearNotifications,
    removeNotification
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
