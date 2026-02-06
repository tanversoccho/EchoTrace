import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const TORs = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        ToRs
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        All Terms of Reference will appear here
      </Typography>
      
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          ToR List
        </Typography>
        <Typography color="text.secondary">
          ToR table and filters will appear here
        </Typography>
      </Paper>
    </Box>
  );
};

export default TORs;
