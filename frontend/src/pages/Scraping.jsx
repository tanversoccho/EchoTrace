import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Scraping = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Scraping Management
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Configure and monitor website scraping
      </Typography>
      
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Website Configuration
        </Typography>
        <Typography color="text.secondary">
          Website manager and scraping jobs will appear here
        </Typography>
      </Paper>
    </Box>
  );
};

export default Scraping;
