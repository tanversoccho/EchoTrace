import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip
} from '@mui/material';
import {
  TrendingUp,
  NewReleases,
  AccessTime,
  Source
} from '@mui/icons-material';

const StatCard = ({ title, value, icon, color, trend }) => {
  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" variant="subtitle2">
            {title}
          </Typography>
          <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
            {value}
          </Typography>
          {trend && (
            <Chip 
              size="small"
              label={trend}
              color={trend.includes('+') ? 'success' : 'error'}
              sx={{ mt: 1 }}
            />
          )}
        </Box>
        <Box
          sx={{
            p: 2,
            borderRadius: '50%',
            bgcolor: `${color}.50`,
            color: `${color}.main`
          }}
        >
          {icon}
        </Box>
      </Box>
    </Paper>
  );
};

const DashboardStats = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total ToRs"
          value="0"
          icon={<Source />}
          color="primary"
          trend="+0%"
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="New Today"
          value="0"
          icon={<NewReleases />}
          color="success"
          trend="+0 today"
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Expiring Soon"
          value="0"
          icon={<AccessTime />}
          color="warning"
          trend="0 urgent"
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Active Sources"
          value="0"
          icon={<TrendingUp />}
          color="info"
          trend="No sources"
        />
      </Grid>
    </Grid>
  );
};

export default DashboardStats;
