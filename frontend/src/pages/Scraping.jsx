import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Grid, Card, CardContent,
  Chip, Alert, LinearProgress, IconButton
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Schedule as ScheduleIcon,
  NewReleases as NewIcon
} from '@mui/icons-material';

const ToRMonitor = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    newToday: 0,
    bySource: {}
  });

  const scanNow = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/tor-monitor/scan', {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        setOpportunities(data.opportunities);
        setStats({
          total: data.count,
          newToday: data.opportunities.filter(opp => opp.isNew).length,
          bySource: data.opportunities.reduce((acc, opp) => {
            acc[opp.source] = (acc[opp.source] || 0) + 1;
            return acc;
          }, {})
        });
      }
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    window.open('http://localhost:5000/api/tor-monitor/export-excel', '_blank');
  };

  const getDailyReport = async () => {
    const response = await fetch('http://localhost:5000/api/tor-monitor/daily-report');
    const data = await response.json();
    if (data.success) {
      console.log('Daily Report:', data.report);
      // Display this in a modal or new page
    }
  };

  useEffect(() => {
    scanNow(); // Auto-scan on load
  }, []);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">ToR Monitoring Dashboard</Typography>
        <Box>
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />}
            onClick={scanNow}
            disabled={loading}
            sx={{ mr: 2 }}
          >
            {loading ? 'Scanning...' : 'Scan Now'}
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />}
            onClick={exportToExcel}
          >
            Export Excel
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" color="primary">
              Total Opportunities
            </Typography>
            <Typography variant="h3">{stats.total}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" color="success.main">
              New Today
            </Typography>
            <Typography variant="h3">{stats.newToday}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">
              Sources Active
            </Typography>
            <Typography variant="h3">{Object.keys(stats.bySource).length}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Opportunities List */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      
      {opportunities.length === 0 && !loading ? (
        <Alert severity="info">
          No new relevant opportunities found matching your criteria.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {opportunities.map((opp, index) => (
            <Grid item xs={12} key={index}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="h6">
                      {opp.title}
                      {opp.isNew && (
                        <Chip 
                          label="NEW" 
                          size="small" 
                          color="success" 
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Typography>
                    <Chip label={opp.source} size="small" />
                  </Box>
                  <Typography color="textSecondary" gutterBottom>
                    {opp.organization} • Deadline: {opp.deadline}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {opp.summary}
                  </Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Chip 
                      label={opp.relevance.substring(0, 50) + '...'} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                    <Button 
                      size="small" 
                      href={opp.link} 
                      target="_blank"
                    >
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ToRMonitor;
