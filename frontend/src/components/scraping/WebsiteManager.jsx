import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Alert,
  LinearProgress
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  PlayArrow,
  Stop,
  Refresh,
  CheckCircle,
  Error,
  Warning,
  Security
} from '@mui/icons-material'
import { scrapingAPI } from '../../api/scrapingAPI'
import { toast } from 'react-hot-toast'

const WebsiteManager = () => {
  const [websites, setWebsites] = useState([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedWebsite, setSelectedWebsite] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    requires_login: false,
    requires_2fa: false,
    login_url: '',
    username_selector: '',
    password_selector: '',
    submit_selector: '',
    tor_list_url: '',
    container_selector: '',
    pagination_enabled: false,
    schedule: 'daily',
    active: true
  })

  useEffect(() => {
    fetchWebsites()
  }, [])

  const fetchWebsites = async () => {
    setLoading(true)
    try {
      const response = await scrapingAPI.getWebsites()
      setWebsites(response.data)
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error('Failed to fetch websites')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (website = null) => {
    if (website) {
      setSelectedWebsite(website)
      setFormData(website)
    } else {
      setSelectedWebsite(null)
      setFormData({
        name: '',
        url: '',
        requires_login: false,
        requires_2fa: false,
        login_url: '',
        username_selector: '',
        password_selector: '',
        submit_selector: '',
        tor_list_url: '',
        container_selector: '',
        pagination_enabled: false,
        schedule: 'daily',
        active: true
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setSelectedWebsite(null)
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSaveWebsite = async () => {
    try {
      if (selectedWebsite) {
        await scrapingAPI.updateWebsite(selectedWebsite.id, formData)
        toast.success('Website updated successfully')
      } else {
        await scrapingAPI.addWebsite(formData)
        toast.success('Website added successfully')
      }
      fetchWebsites()
      handleCloseDialog()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save website')
    }
  }

  const handleDeleteWebsite = async (id) => {
    if (window.confirm('Are you sure you want to delete this website?')) {
      try {
        await scrapingAPI.deleteWebsite(id)
        toast.success('Website deleted successfully')
        fetchWebsites()
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
        toast.error('Failed to delete website')
      }
    }
  }

  const handleTestWebsite = async (id) => {
    try {
      toast.loading('Testing website...')
      const response = await scrapingAPI.testWebsite(id)
      toast.dismiss()
      
      if (response.data.success) {
        toast.success(`Test successful: ${response.data.count} ToRs found`)
      } else {
        toast.error(`Test failed: ${response.data.message}`)
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.dismiss()
      toast.error('Test failed')
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle color="success" />
      case 'error':
        return <Error color="error" />
      case 'warning':
        return <Warning color="warning" />
      default:
        return <CheckCircle color="disabled" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success'
      case 'error': return 'error'
      case 'warning': return 'warning'
      default: return 'default'
    }
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Website Manager</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Website
        </Button>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>URL</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Auth</TableCell>
              <TableCell>Schedule</TableCell>
              <TableCell>Last Run</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {websites.map((website) => (
              <TableRow key={website.id}>
                <TableCell>
                  <Typography fontWeight="medium">{website.name}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="textSecondary">
                    {website.url}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={getStatusIcon(website.status)}
                    label={website.status}
                    color={getStatusColor(website.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    {website.requires_login && (
                      <Chip
                        icon={<Security />}
                        label="Login"
                        size="small"
                        variant="outlined"
                      />
                    )}
                    {website.requires_2fa && (
                      <Chip
                        label="2FA"
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                    )}
                    {!website.requires_login && (
                      <Chip
                        label="Public"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={website.schedule}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  {website.last_run ? (
                    <Typography variant="body2">
                      {new Date(website.last_run).toLocaleString()}
                    </Typography>
                  ) : (
                    'Never'
                  )}
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <IconButton
                      size="small"
                      onClick={() => handleTestWebsite(website.id)}
                      title="Test"
                    >
                      <PlayArrow />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(website)}
                      title="Edit"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteWebsite(website.id)}
                      title="Delete"
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => fetchWebsites()}
                      title="Refresh"
                    >
                      <Refresh />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedWebsite ? 'Edit Website' : 'Add New Website'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Website Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Base URL"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      name="requires_login"
                      checked={formData.requires_login}
                      onChange={handleInputChange}
                    />
                  }
                  label="Requires Login"
                />
              </Grid>
              
              {formData.requires_login && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Login URL"
                      name="login_url"
                      value={formData.login_url}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Username Selector"
                      name="username_selector"
                      value={formData.username_selector}
                      onChange={handleInputChange}
                      placeholder="e.g., #username"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Password Selector"
                      name="password_selector"
                      value={formData.password_selector}
                      onChange={handleInputChange}
                      placeholder="e.g., #password"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Submit Selector"
                      name="submit_selector"
                      value={formData.submit_selector}
                      onChange={handleInputChange}
                      placeholder="e.g., button[type='submit']"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="requires_2fa"
                          checked={formData.requires_2fa}
                          onChange={handleInputChange}
                        />
                      }
                      label="Requires 2FA"
                    />
                  </Grid>
                </>
              )}
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="ToR List URL"
                  name="tor_list_url"
                  value={formData.tor_list_url}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Container Selector"
                  name="container_selector"
                  value={formData.container_selector}
                  onChange={handleInputChange}
                  placeholder="e.g., .tor-item"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Schedule</InputLabel>
                  <Select
                    name="schedule"
                    value={formData.schedule}
                    onChange={handleInputChange}
                    label="Schedule"
                  >
                    <MenuItem value="hourly">Hourly</MenuItem>
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="manual">Manual</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      name="active"
                      checked={formData.active}
                      onChange={handleInputChange}
                    />
                  }
                  label="Active"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Alert severity="info">
                  After saving, you can test the configuration using the Test button.
                </Alert>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveWebsite} variant="contained">
            {selectedWebsite ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default WebsiteManager
