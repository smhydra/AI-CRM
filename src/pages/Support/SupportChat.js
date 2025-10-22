import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Send,
  Phone,
  Assignment,
  Person,
  SmartToy,
  Language,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import axios from 'axios';

const SupportChat = () => {
  const { user } = useAuth();
  const { 
    messages, 
    sendMessage, 
    createTicket, 
    requestCall, 
    connected 
  } = useSocket();
  
  const [currentMessage, setCurrentMessage] = useState('');
  const [currentTicket, setCurrentTicket] = useState(null);
  const [language, setLanguage] = useState(user?.preferences?.language || 'en');
  const [isTyping, setIsTyping] = useState(false);
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Auto-create ticket for new chat sessions
    if (user && !currentTicket) {
      createNewTicket();
    }
  }, [user]);

  const createNewTicket = async () => {
    try {
      const ticketData = {
        subject: 'Support Chat Session',
        description: 'Chat session started',
        category: 'general',
        priority: 'medium',
        language: language
      };
      
      // This would typically create a ticket via API
      const mockTicket = {
        ticketId: `TK${Date.now()}`,
        subject: ticketData.subject,
        status: 'open',
        createdAt: new Date()
      };
      
      setCurrentTicket(mockTicket);
    } catch (error) {
      console.error('Error creating ticket:', error);
      setError('Failed to create support ticket');
    }
  };

  const handleSendMessage = () => {
    if (!currentMessage.trim() || !currentTicket) return;

    sendMessage(currentMessage, currentTicket.ticketId);
    setCurrentMessage('');
    setIsTyping(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRequestCall = () => {
    if (user?.phone) {
      requestCall(user.phone, 'support', 'medium');
      setShowCallDialog(false);
    } else {
      setError('Phone number not available. Please update your profile.');
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    // Update user preferences
    // This would typically call an API to update user preferences
  };

  const getMessageIcon = (message) => {
    if (message.isAIMessage) {
      return <SmartToy />;
    } else if (message.userRole === 'agent') {
      return <Person />;
    } else {
      return <Person />;
    }
  };

  const getMessageColor = (message) => {
    if (message.isAIMessage) {
      return 'primary';
    } else if (message.userRole === 'agent') {
      return 'success';
    } else {
      return 'default';
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Box sx={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6">
              Support Chat
              {currentTicket && (
                <Chip 
                  label={`Ticket: ${currentTicket.ticketId}`} 
                  size="small" 
                  sx={{ ml: 2 }}
                />
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {connected ? 'Connected' : 'Disconnected'}
            </Typography>
          </Box>
          
          <Box display="flex" gap={1}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Language</InputLabel>
              <Select
                value={language}
                label="Language"
                onChange={(e) => handleLanguageChange(e.target.value)}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="hi">हिन्दी</MenuItem>
              </Select>
            </FormControl>
            
            <IconButton 
              color="primary" 
              onClick={() => setShowCallDialog(true)}
              title="Request Call"
            >
              <Phone />
            </IconButton>
            
            <IconButton 
              color="secondary" 
              onClick={() => setShowTicketDialog(true)}
              title="Create Ticket"
            >
              <Assignment />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Messages */}
      <Paper 
        ref={messagesContainerRef}
        sx={{ 
          flex: 1, 
          p: 2, 
          mb: 2, 
          overflow: 'auto',
          backgroundColor: '#f5f5f5'
        }}
      >
        {messages.length === 0 ? (
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            height="100%"
            flexDirection="column"
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Welcome to Support Chat
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {language === 'hi' 
                ? 'आपकी कैसे मदद कर सकते हैं?'
                : 'How can we help you today?'
              }
            </Typography>
          </Box>
        ) : (
          <List>
            {messages.map((message, index) => (
              <ListItem key={index} sx={{ mb: 1 }}>
                <Box sx={{ width: '100%' }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Avatar 
                      sx={{ 
                        bgcolor: `${getMessageColor(message)}.main`, 
                        mr: 1,
                        width: 32,
                        height: 32
                      }}
                    >
                      {getMessageIcon(message)}
                    </Avatar>
                    <Typography variant="subtitle2" sx={{ mr: 1 }}>
                      {message.userName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatTime(message.timestamp)}
                    </Typography>
                    {message.isAIMessage && (
                      <Chip 
                        label="AI" 
                        size="small" 
                        color="primary" 
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      backgroundColor: message.isAIMessage ? 'primary.light' : 'white',
                      color: message.isAIMessage ? 'white' : 'text.primary'
                    }}
                  >
                    <Typography variant="body1">
                      {message.message}
                    </Typography>
                    {message.confidence && (
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        Confidence: {Math.round(message.confidence * 100)}%
                      </Typography>
                    )}
                  </Paper>
                </Box>
              </ListItem>
            ))}
            {isTyping && (
              <ListItem>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
                    <SmartToy />
                  </Avatar>
                  <Typography variant="body2" color="text.secondary">
                    AI is typing...
                  </Typography>
                </Box>
              </ListItem>
            )}
            <div ref={messagesEndRef} />
          </List>
        )}
      </Paper>

      {/* Message Input */}
      <Paper sx={{ p: 2 }}>
        <Box display="flex" gap={1}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder={
              language === 'hi' 
                ? 'अपना संदेश यहाँ लिखें...'
                : 'Type your message here...'
            }
            value={currentMessage}
            onChange={(e) => {
              setCurrentMessage(e.target.value);
              setIsTyping(e.target.value.length > 0);
            }}
            onKeyPress={handleKeyPress}
            disabled={!connected || !currentTicket}
          />
          <Button
            variant="contained"
            onClick={handleSendMessage}
            disabled={!currentMessage.trim() || !connected || !currentTicket}
            startIcon={<Send />}
          >
            Send
          </Button>
        </Box>
      </Paper>

      {/* Call Request Dialog */}
      <Dialog open={showCallDialog} onClose={() => setShowCallDialog(false)}>
        <DialogTitle>Request Call Support</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            {language === 'hi' 
              ? 'क्या आप चाहते हैं कि हमारा AI एजेंट आपको कॉल करे?'
              : 'Would you like our AI agent to call you?'
            }
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {language === 'hi' 
              ? 'हमारा AI एजेंट आपकी समस्या को समझने और हल करने में मदद करेगा।'
              : 'Our AI agent will help understand and resolve your issue.'
            }
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCallDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleRequestCall} variant="contained">
            Request Call
          </Button>
        </DialogActions>
      </Dialog>

      {/* Ticket Creation Dialog */}
      <Dialog open={showTicketDialog} onClose={() => setShowTicketDialog(false)}>
        <DialogTitle>Create Support Ticket</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            {language === 'hi' 
              ? 'एक नया सहायता टिकट बनाएं'
              : 'Create a new support ticket'
            }
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {language === 'hi' 
              ? 'यह आपकी समस्या को ट्रैक करने में मदद करेगा।'
              : 'This will help track your issue.'
            }
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTicketDialog(false)}>
            Cancel
          </Button>
          <Button onClick={createNewTicket} variant="contained">
            Create Ticket
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SupportChat;
