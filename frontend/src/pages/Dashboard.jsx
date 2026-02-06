import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography
} from '@mui/material';
import DashboardStats from '../components/dashboard/DashboardStats';

const Dashboard = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Welcome to EchoTrace - Your ToR Monitoring Dashboard
      </Typography>
      
      <DashboardStats />
      
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 300 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Typography color="text.secondary">
              Activity feed will appear here
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 300 }}>
            <Typography variant="h6" gutterBottom>
              Source Status
            </Typography>
            <Typography color="text.secondary">
              Website scraping status will appear here
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
