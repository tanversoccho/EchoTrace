import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const [credentials, setCredentials] = useState({ 
    email: 'admin@helios.com', 
    password: 'admin123' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      console.log('User already logged in, redirecting to dashboard');
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    console.log('🔐 Login attempt:', credentials);

    try {
      // Call the login function from AuthContext
      const result = await login(credentials);
      console.log('Login result:', result);
      
      // Check if login was successful
      if (result && result.success !== false) {
        // Login successful - page should redirect automatically
        console.log('✅ Login successful');
        
        // Force a small delay to ensure state updates
        setTimeout(() => {
          navigate('/');
        }, 100);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f7fa'
      }}
    >
      <Paper sx={{ p: 4, width: 400 }}>
        <Typography variant="h4" align="center" gutterBottom>
          EchoTrace
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" paragraph>
          ToR Monitoring System
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            value={credentials.email}
            onChange={(e) => setCredentials({...credentials, email: e.target.value})}
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            value={credentials.password}
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            required
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Login'}
          </Button>
        </form>
        
        <Box sx={{ mt: 3, p: 2, bgcolor: '#f0f0f0', borderRadius: 1 }}>
          <Typography variant="body2" align="center">
            <strong>💡 Development Mode</strong>
          </Typography>
          <Typography variant="caption" display="block" align="center">
            Any email/password works
          </Typography>
          <Typography variant="caption" display="block" align="center">
            Try: admin@helios.com / anything
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
