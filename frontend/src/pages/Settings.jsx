import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Settings = () => (
  <Box>
    <Typography variant="h4" gutterBottom>Settings</Typography>
    <Typography paragraph>Configure application settings</Typography>
    <Paper sx={{ p: 3 }}>Settings panel will appear here</Paper>
  </Box>
);
export default Settings;
