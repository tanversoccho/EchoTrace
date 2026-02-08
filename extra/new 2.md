I'll create a comprehensive React.js dashboard for your ToR monitoring system. This will be a modern web interface to manage scraping jobs, view results, and export data.

## **🚀 Complete React.js ToR Monitoring Dashboard**

### **1. Project Structure**
```
tor-monitor-dashboard/
├── public/
│   ├── index.html
│   └── favicon.ico
│
├── src/
│   ├── api/
│   │   ├── axiosConfig.js
│   │   ├── authAPI.js
│   │   ├── scrapingAPI.js
│   │   └── torAPI.js
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── Notification.jsx
│   │   │   └── DataTable.jsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Layout.jsx
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx
│   │   │   └── TwoFactorModal.jsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── DashboardStats.jsx
│   │   │   ├── RecentTORs.jsx
│   │   │   ├── SourceStatus.jsx
│   │   │   └── ActivityLog.jsx
│   │   │
│   │   ├── scraping/
│   │   │   ├── WebsiteManager.jsx
│   │   │   ├── ScraperConfig.jsx
│   │   │   ├── ScrapingJob.jsx
│   │   │   └── ScheduleManager.jsx
│   │   │
│   │   ├── tors/
│   │   │   ├── TORList.jsx
│   │   │   ├── TORCard.jsx
│   │   │   ├── TORFilter.jsx
│   │   │   └── TORDetail.jsx
│   │   │
│   │   └── export/
│   │       ├── ExportPanel.jsx
│   │       └── ExportHistory.jsx
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── NotificationContext.jsx
│   │   └── TORContext.jsx
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useTORs.js
│   │   └── useWebSocket.js
│   │
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── TORs.jsx
│   │   ├── Scraping.jsx
│   │   ├── Export.jsx
│   │   ├── Settings.jsx
│   │   └── Reports.jsx
│   │
│   ├── utils/
│   │   ├── constants.js
│   │   ├── formatters.js
│   │   └── validators.js
│   │
│   ├── styles/
│   │   ├── global.css
│   │   ├── theme.js
│   │   └── components.css
│   │
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── routes.jsx
│
├── package.json
├── vite.config.js (or webpack.config.js)
└── README.md
```

### **2. Package.json & Dependencies**

#### **`package.json`**
```json
{
  "name": "tor-monitor-dashboard",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2",
    "chart.js": "^4.4.0",
    "react-chartjs-2": "^5.2.0",
    "@tanstack/react-table": "^8.10.7",
    "date-fns": "^3.0.6",
    "lodash": "^4.17.21",
    "react-hook-form": "^7.48.2",
    "yup": "^1.3.3",
    "@hookform/resolvers": "^3.3.2",
    "react-hot-toast": "^2.4.1",
    "react-icons": "^4.12.0",
    "socket.io-client": "^4.7.2",
    "xlsx": "^0.18.5",
    "file-saver": "^2.0.5",
    "@mui/material": "^5.14.18",
    "@emotion/react": "^11.11.1",
    "@emotion/styled": "^11.11.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "vite": "^5.0.0"
  }
}
```

### **3. Main Application Setup**

#### **`src/main.jsx`**
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

#### **`src/App.jsx`**
```jsx
import { BrowserRouter as Router } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import { TORProvider } from './context/TORContext'
import AppRoutes from './routes'
import Layout from './components/layout/Layout'

// Create MUI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff4081',
      dark: '#9a0036',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <NotificationProvider>
          <AuthProvider>
            <TORProvider>
              <Layout>
                <AppRoutes />
              </Layout>
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#4caf50',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#f44336',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </TORProvider>
          </AuthProvider>
        </NotificationProvider>
      </Router>
    </ThemeProvider>
  )
}

export default App
```

#### **`src/routes.jsx`**
```jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import TORs from './pages/TORs'
import Scraping from './pages/Scraping'
import Export from './pages/Export'
import Settings from './pages/Settings'
import Reports from './pages/Reports'

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div>Loading...</div>
  }
  
  return user ? children : <Navigate to="/login" />
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      } />
      
      <Route path="/tors" element={
        <PrivateRoute>
          <TORs />
        </PrivateRoute>
      } />
      
      <Route path="/scraping" element={
        <PrivateRoute>
          <Scraping />
        </PrivateRoute>
      } />
      
      <Route path="/export" element={
        <PrivateRoute>
          <Export />
        </PrivateRoute>
      } />
      
      <Route path="/settings" element={
        <PrivateRoute>
          <Settings />
        </PrivateRoute>
      } />
      
      <Route path="/reports" element={
        <PrivateRoute>
          <Reports />
        </PrivateRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default AppRoutes
```

### **4. Context Providers**

#### **`src/context/AuthContext.jsx`**
```jsx
import React, { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [requires2FA, setRequires2FA] = useState(false)
  const [tempToken, setTempToken] = useState('')

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      setUser(JSON.parse(userData))
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    setLoading(false)
  }, [])

  const login = async (credentials) => {
    try {
      setLoading(true)
      const response = await axios.post('/api/auth/login', credentials)
      
      if (response.data.requires2FA) {
        setRequires2FA(true)
        setTempToken(response.data.tempToken)
        toast.success('Please enter 2FA code')
      } else {
        completeLogin(response.data)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const verify2FA = async (code) => {
    try {
      const response = await axios.post('/api/auth/verify-2fa', {
        tempToken,
        code
      })
      completeLogin(response.data)
      setRequires2FA(false)
      setTempToken('')
    } catch (error) {
      toast.error(error.response?.data?.message || '2FA verification failed')
      throw error
    }
  }

  const completeLogin = (data) => {
    const { token, user } = data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(user)
    toast.success('Login successful')
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
    toast.success('Logged out successfully')
  }

  const updateUser = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const value = {
    user,
    loading,
    requires2FA,
    login,
    verify2FA,
    logout,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
```

#### **`src/context/TORContext.jsx`**
```jsx
import React, { createContext, useState, useContext, useCallback } from 'react'
import { useWebSocket } from '../hooks/useWebSocket'
import { toast } from 'react-hot-toast'

const TORContext = createContext()

export const useTOR = () => {
  const context = useContext(TORContext)
  if (!context) {
    throw new Error('useTOR must be used within TORProvider')
  }
  return context
}

export const TORProvider = ({ children }) => {
  const [tors, setTors] = useState([])
  const [filteredTors, setFilteredTors] = useState([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    newToday: 0,
    expiringSoon: 0,
    bySource: {},
    byCategory: {}
  })
  const [filters, setFilters] = useState({
    source: [],
    category: [],
    dateRange: { start: null, end: null },
    keywords: '',
    hasDeadline: false
  })

  // WebSocket for real-time updates
  const { sendMessage, isConnected } = useWebSocket({
    onMessage: (data) => {
      if (data.type === 'new_tor') {
        handleNewTOR(data.tor)
      } else if (data.type === 'scraping_update') {
        handleScrapingUpdate(data.update)
      }
    }
  })

  const handleNewTOR = useCallback((newTor) => {
    setTors(prev => [newTor, ...prev])
    setStats(prev => ({
      ...prev,
      total: prev.total + 1,
      newToday: prev.newToday + 1,
      bySource: {
        ...prev.bySource,
        [newTor.source]: (prev.bySource[newTor.source] || 0) + 1
      }
    }))
    
    toast.success(`New ToR found: ${newTor.title}`, {
      duration: 5000,
      position: 'bottom-right'
    })
  }, [])

  const handleScrapingUpdate = useCallback((update) => {
    if (update.status === 'error') {
      toast.error(`Scraping error: ${update.message}`)
    } else if (update.status === 'completed') {
      toast.success(`Scraping completed: ${update.source}`)
    }
  }, [])

  const fetchTORs = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      const query = new URLSearchParams(params).toString()
      const response = await fetch(`/api/tors?${query}`)
      const data = await response.json()
      setTors(data.tors)
      setStats(data.stats)
      applyFilters(data.tors, filters)
    } catch (error) {
      toast.error('Failed to fetch ToRs')
    } finally {
      setLoading(false)
    }
  }, [filters])

  const applyFilters = useCallback((data, filterConfig) => {
    let filtered = [...data]
    
    if (filterConfig.source.length > 0) {
      filtered = filtered.filter(tor => filterConfig.source.includes(tor.source))
    }
    
    if (filterConfig.category.length > 0) {
      filtered = filtered.filter(tor => filterConfig.category.includes(tor.category))
    }
    
    if (filterConfig.keywords) {
      const keywords = filterConfig.keywords.toLowerCase()
      filtered = filtered.filter(tor => 
        tor.title.toLowerCase().includes(keywords) ||
        tor.description.toLowerCase().includes(keywords) ||
        tor.organization.toLowerCase().includes(keywords)
      )
    }
    
    if (filterConfig.hasDeadline) {
      filtered = filtered.filter(tor => tor.deadline)
    }
    
    if (filterConfig.dateRange.start && filterConfig.dateRange.end) {
      filtered = filtered.filter(tor => {
        const publishDate = new Date(tor.publish_date)
        return publishDate >= filterConfig.dateRange.start &&
               publishDate <= filterConfig.dateRange.end
      })
    }
    
    setFilteredTors(filtered)
  }, [])

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    applyFilters(tors, { ...filters, ...newFilters })
  }, [tors, filters, applyFilters])

  const markAsRead = useCallback(async (torId) => {
    try {
      await fetch(`/api/tors/${torId}/read`, { method: 'POST' })
      setTors(prev => prev.map(tor => 
        tor.id === torId ? { ...tor, is_read: true } : tor
      ))
    } catch (error) {
      toast.error('Failed to mark as read')
    }
  }, [])

  const markAsFavorite = useCallback(async (torId) => {
    try {
      await fetch(`/api/tors/${torId}/favorite`, { method: 'POST' })
      setTors(prev => prev.map(tor => 
        tor.id === torId ? { ...tor, is_favorite: !tor.is_favorite } : tor
      ))
    } catch (error) {
      toast.error('Failed to update favorite status')
    }
  }, [])

  const value = {
    tors,
    filteredTors,
    loading,
    stats,
    filters,
    fetchTORs,
    updateFilters,
    markAsRead,
    markAsFavorite,
    sendMessage,
    isConnected
  }

  return (
    <TORContext.Provider value={value}>
      {children}
    </TORContext.Provider>
  )
}
```

### **5. Dashboard Components**

#### **`src/components/dashboard/DashboardStats.jsx`**
```jsx
import React from 'react'
import { Box, Grid, Paper, Typography, Chip } from '@mui/material'
import {
  TrendingUp,
  NewReleases,
  AccessTime,
  Source,
  Category
} from '@mui/icons-material'
import { useTOR } from '../../context/TORContext'

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
  )
}

const DashboardStats = () => {
  const { stats } = useTOR()
  
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total ToRs"
          value={stats.total}
          icon={<Source />}
          color="primary"
          trend="+12%"
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="New Today"
          value={stats.newToday}
          icon={<NewReleases />}
          color="success"
          trend="+5 today"
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Expiring Soon"
          value={stats.expiringSoon}
          icon={<AccessTime />}
          color="warning"
          trend="3 urgent"
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Active Sources"
          value={Object.keys(stats.bySource || {}).length}
          icon={<TrendingUp />}
          color="info"
          trend="All systems OK"
        />
      </Grid>
    </Grid>
  )
}

export default DashboardStats
```

#### **`src/components/tors/TORList.jsx`**
```jsx
import React, { useState, useMemo } from 'react'
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  IconButton,
  Tooltip,
  Chip,
  Avatar
} from '@mui/material'
import {
  Visibility,
  Star,
  StarBorder,
  Download,
  Share,
  Delete
} from '@mui/icons-material'
import { useTOR } from '../../context/TORContext'
import { formatDate, truncateText } from '../../utils/formatters'

const TORList = () => {
  const { filteredTors, markAsRead, markAsFavorite } = useTOR()
  const [selected, setSelected] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelected = filteredTors.map((tor) => tor.id)
      setSelected(newSelected)
      return
    }
    setSelected([])
  }

  const handleSelect = (id) => {
    const selectedIndex = selected.indexOf(id)
    let newSelected = []

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1))
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      )
    }

    setSelected(newSelected)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const visibleTors = useMemo(() => {
    return filteredTors.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    )
  }, [filteredTors, page, rowsPerPage])

  const getSourceColor = (source) => {
    const colors = {
      'World Bank': 'success',
      'UNDP': 'primary',
      'ADB': 'warning',
      'UNHCR': 'error',
      'BDJobs': 'info'
    }
    return colors[source] || 'default'
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selected.length > 0 && selected.length < filteredTors.length
                  }
                  checked={
                    filteredTors.length > 0 && selected.length === filteredTors.length
                  }
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Organization</TableCell>
              <TableCell>Published</TableCell>
              <TableCell>Deadline</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleTors.map((tor) => {
              const isSelected = selected.includes(tor.id)
              return (
                <TableRow
                  key={tor.id}
                  hover
                  selected={isSelected}
                  sx={{
                    opacity: tor.is_read ? 0.7 : 1,
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleSelect(tor.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2">
                        {truncateText(tor.title, 60)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {truncateText(tor.description, 80)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={tor.source}
                      size="small"
                      color={getSourceColor(tor.source)}
                      avatar={
                        <Avatar sx={{ bgcolor: 'transparent' }}>
                          {tor.source.charAt(0)}
                        </Avatar>
                      }
                    />
                  </TableCell>
                  <TableCell>{tor.organization}</TableCell>
                  <TableCell>
                    <Tooltip title={formatDate(tor.publish_date, 'full')}>
                      <span>{formatDate(tor.publish_date)}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    {tor.deadline ? (
                      <Chip
                        label={formatDate(tor.deadline)}
                        size="small"
                        color={
                          new Date(tor.deadline) < new Date(Date.now() + 7 * 86400000)
                            ? 'error'
                            : 'default'
                        }
                        variant="outlined"
                      />
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => markAsRead(tor.id)}>
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title={tor.is_favorite ? "Remove favorite" : "Add favorite"}>
                        <IconButton
                          size="small"
                          onClick={() => markAsFavorite(tor.id)}
                          color={tor.is_favorite ? 'warning' : 'default'}
                        >
                          {tor.is_favorite ? <Star /> : <StarBorder />}
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Download">
                        <IconButton size="small">
                          <Download />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Share">
                        <IconButton size="small">
                          <Share />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredTors.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  )
}

export default TORList
```

### **6. API Integration Layer**

#### **`src/api/axiosConfig.js`**
```jsx
import axios from 'axios'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

#### **`src/api/scrapingAPI.js`**
```jsx
import api from './axiosConfig'

export const scrapingAPI = {
  // Get all configured websites
  getWebsites: () => api.get('/scraping/websites'),
  
  // Get website by ID
  getWebsite: (id) => api.get(`/scraping/websites/${id}`),
  
  // Add new website
  addWebsite: (data) => api.post('/scraping/websites', data),
  
  // Update website configuration
  updateWebsite: (id, data) => api.put(`/scraping/websites/${id}`, data),
  
  // Delete website
  deleteWebsite: (id) => api.delete(`/scraping/websites/${id}`),
  
  // Test website scraping
  testWebsite: (id) => api.post(`/scraping/websites/${id}/test`),
  
  // Get scraping jobs
  getJobs: (params) => api.get('/scraping/jobs', { params }),
  
  // Create scraping job
  createJob: (data) => api.post('/scraping/jobs', data),
  
  // Update scraping job
  updateJob: (id, data) => api.put(`/scraping/jobs/${id}`, data),
  
  // Delete scraping job
  deleteJob: (id) => api.delete(`/scraping/jobs/${id}`),
  
  // Start scraping job
  startJob: (id) => api.post(`/scraping/jobs/${id}/start`),
  
  // Stop scraping job
  stopJob: (id) => api.post(`/scraping/jobs/${id}/stop`),
  
  // Get scraping logs
  getLogs: (params) => api.get('/scraping/logs', { params }),
  
  // Get scraping statistics
  getStatistics: () => api.get('/scraping/statistics'),
  
  // Clear scraping cache
  clearCache: () => api.post('/scraping/clear-cache'),
  
  // Get scraping schedule
  getSchedule: () => api.get('/scraping/schedule'),
  
  // Update scraping schedule
  updateSchedule: (data) => api.put('/scraping/schedule', data),
  
  // Get 2FA status for website
  get2FAStatus: (websiteId) => api.get(`/scraping/websites/${websiteId}/2fa-status`),
  
  // Update 2FA credentials
  update2FACredentials: (websiteId, data) => 
    api.put(`/scraping/websites/${websiteId}/2fa`, data),
}

export const scrapingSocketAPI = {
  // WebSocket events for real-time updates
  events: {
    NEW_TOR: 'new_tor',
    SCRAPING_STARTED: 'scraping_started',
    SCRAPING_COMPLETED: 'scraping_completed',
    SCRAPING_ERROR: 'scraping_error',
    SCRAPING_PROGRESS: 'scraping_progress',
    WEBSITE_STATUS_CHANGE: 'website_status_change',
  },
  
  // Connect to scraping WebSocket
  connect: (token) => {
    const ws = new WebSocket(
      `${process.env.REACT_APP_WS_URL || 'ws://localhost:5000'}/scraping?token=${token}`
    )
    return ws
  },
}
```

### **7. Scraping Configuration Component**

#### **`src/components/scraping/WebsiteManager.jsx`**
```jsx
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
```

### **8. Export Functionality**

#### **`src/components/export/ExportPanel.jsx`**
```jsx
import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  TextField,
  Chip,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material'
import {
  Download,
  Email,
  Share,
  Schedule,
  FilterList
} from '@mui/icons-material'
import { useTOR } from '../../context/TORContext'
import { format } from 'date-fns'

const ExportPanel = () => {
  const { tors, filteredTors, filters } = useTOR()
  const [exportType, setExportType] = useState('csv')
  const [includeColumns, setIncludeColumns] = useState([
    'title', 'description', 'source', 'organization', 'publish_date', 'deadline', 'link'
  ])
  const [emailExport, setEmailExport] = useState(false)
  const [emailRecipients, setEmailRecipients] = useState('')
  const [scheduledExport, setScheduledExport] = useState(false)
  const [scheduleFrequency, setScheduleFrequency] = useState('daily')
  const [exportName, setExportName] = useState('')
  const [exporting, setExporting] = useState(false)

  const columnOptions = [
    { value: 'title', label: 'Title' },
    { value: 'description', label: 'Description' },
    { value: 'source', label: 'Source' },
    { value: 'organization', label: 'Organization' },
    { value: 'publish_date', label: 'Publish Date' },
    { value: 'deadline', label: 'Deadline' },
    { value: 'link', label: 'Link' },
    { value: 'reference', label: 'Reference No' },
    { value: 'country', label: 'Country' },
    { value: 'category', label: 'Category' },
    { value: 'budget_range', label: 'Budget Range' },
    { value: 'scraped_at', label: 'Scraped At' }
  ]

  const handleExport = async () => {
    setExporting(true)
    try {
      const exportData = {
        type: exportType,
        columns: includeColumns,
        filters: filters,
        tors: filteredTors.map(tor => ({
          id: tor.id,
          ...tor
        })),
        options: {
          email: emailExport ? emailRecipients.split(',').map(e => e.trim()) : null,
          schedule: scheduledExport ? scheduleFrequency : null,
          name: exportName || `ToRs_${format(new Date(), 'yyyy-MM-dd_HH-mm')}`
        }
      }

      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportData),
      })

      if (response.ok) {
        if (exportType === 'csv') {
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${exportData.options.name}.csv`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        } else if (exportType === 'excel') {
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${exportData.options.name}.xlsx`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        }

        alert('Export completed successfully!')
      } else {
        throw new Error('Export failed')
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('Export failed. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const handleColumnToggle = (column) => {
    if (includeColumns.includes(column)) {
      setIncludeColumns(includeColumns.filter(c => c !== column))
    } else {
      setIncludeColumns([...includeColumns, column])
    }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Export ToRs
      </Typography>

      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Chip 
          label={`${filteredTors.length} ToRs selected`}
          color="primary"
          icon={<FilterList />}
        />
        <Chip 
          label={exportType.toUpperCase()}
          variant="outlined"
        />
      </Box>

      <Stack spacing={3}>
        {/* Export Name */}
        <TextField
          label="Export Name"
          value={exportName}
          onChange={(e) => setExportName(e.target.value)}
          placeholder="Enter export name"
          fullWidth
        />

        {/* Export Type */}
        <FormControl fullWidth>
          <InputLabel>Export Format</InputLabel>
          <Select
            value={exportType}
            onChange={(e) => setExportType(e.target.value)}
            label="Export Format"
          >
            <MenuItem value="csv">CSV</MenuItem>
            <MenuItem value="excel">Excel (XLSX)</MenuItem>
            <MenuItem value="json">JSON</MenuItem>
            <MenuItem value="pdf">PDF Report</MenuItem>
          </Select>
        </FormControl>

        {/* Column Selection */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Select Columns to Include
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {columnOptions.map((column) => (
              <Chip
                key={column.value}
                label={column.label}
                color={includeColumns.includes(column.value) ? 'primary' : 'default'}
                variant={includeColumns.includes(column.value) ? 'filled' : 'outlined'}
                onClick={() => handleColumnToggle(column.value)}
                clickable
              />
            ))}
          </Stack>
        </Box>

        {/* Email Export */}
        <FormControlLabel
          control={
            <Checkbox
              checked={emailExport}
              onChange={(e) => setEmailExport(e.target.checked)}
            />
          }
          label="Email Export"
        />
        
        {emailExport && (
          <TextField
            label="Recipient Emails"
            value={emailRecipients}
            onChange={(e) => setEmailRecipients(e.target.value)}
            placeholder="email1@example.com, email2@example.com"
            fullWidth
            helperText="Separate multiple emails with commas"
          />
        )}

        {/* Scheduled Export */}
        <FormControlLabel
          control={
            <Checkbox
              checked={scheduledExport}
              onChange={(e) => setScheduledExport(e.target.checked)}
            />
          }
          label="Schedule Regular Export"
        />
        
        {scheduledExport && (
          <FormControl fullWidth>
            <InputLabel>Frequency</InputLabel>
            <Select
              value={scheduleFrequency}
              onChange={(e) => setScheduleFrequency(e.target.value)}
              label="Frequency"
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly (Monday)</MenuItem>
              <MenuItem value="monthly">Monthly (1st)</MenuItem>
            </Select>
          </FormControl>
        )}

        {/* Preview */}
        <Alert severity="info">
          <Typography variant="body2">
            This export will include {filteredTors.length} ToRs matching your current filters.
            {filters.source.length > 0 && ` Sources: ${filters.source.join(', ')}`}
            {filters.keywords && ` Keywords: "${filters.keywords}"`}
          </Typography>
        </Alert>

        {/* Action Buttons */}
        <Box display="flex" gap={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            startIcon={<Share />}
          >
            Share Export
          </Button>
          
          <Button
            variant="contained"
            startIcon={exporting ? <CircularProgress size={20} /> : <Download />}
            onClick={handleExport}
            disabled={exporting || filteredTors.length === 0}
          >
            {exporting ? 'Exporting...' : 'Export Now'}
          </Button>
        </Box>
      </Stack>
    </Paper>
  )
}

export default ExportPanel
```

### **9. Styles and Theme**

#### **`src/styles/global.css`**
```css
/* Global Styles */
:root {
  --primary-color: #1976d2;
  --secondary-color: #dc004e;
  --success-color: #4caf50;
  --warning-color: #ff9800;
  --error-color: #f44336;
  --info-color: #2196f3;
  
  --bg-default: #f5f7fa;
  --bg-paper: #ffffff;
  
  --text-primary: #1a202c;
  --text-secondary: #718096;
  
  --border-radius: 8px;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.12);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background-color: var(--bg-default);
  color: var(--text-primary);
  line-height: 1.6;
}

/* Scrollbar Styles */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

.slide-in {
  animation: slideIn 0.3s ease-out;
}

/* Utility Classes */
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-multiline-truncate {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hover-lift {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Table Styles */
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: var(--bg-paper);
}

/* Card Styles */
.card-hover {
  transition: all 0.2s ease-in-out;
  border: 1px solid transparent;
}

.card-hover:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-md);
}

/* Status Indicators */
.status-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
}

.status-active {
  background-color: var(--success-color);
}

.status-warning {
  background-color: var(--warning-color);
}

.status-error {
  background-color: var(--error-color);
}

.status-inactive {
  background-color: var(--text-secondary);
}

/* Loading Spinner */
.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Utilities */
@media (max-width: 768px) {
  .hide-on-mobile {
    display: none !important;
  }
  
  .stack-on-mobile {
    flex-direction: column !important;
  }
}

@media (min-width: 769px) {
  .hide-on-desktop {
    display: none !important;
  }
}

/* Print Styles */
@media print {
  .no-print {
    display: none !important;
  }
  
  body {
    background: white;
    color: black;
  }
  
  a {
    color: black !important;
    text-decoration: underline;
  }
}
```

### **10. Backend API Structure (Express.js)**

Here's a basic Express.js backend structure to complement the React frontend:

```javascript
// backend/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { WebSocketServer } = require('ws');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tors', require('./routes/tors'));
app.use('/api/scraping', require('./routes/scraping'));
app.use('/api/export', require('./routes/export'));
app.use('/api/websites', require('./routes/websites'));

// WebSocket Server
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws, req) => {
  const token = req.url.split('token=')[1];
  
  if (!token) {
    ws.close();
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    ws.user = decoded;
    
    ws.on('message', (message) => {
      const data = JSON.parse(message);
      handleWebSocketMessage(ws, data);
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });

  } catch (error) {
    ws.close();
  }
});

function handleWebSocketMessage(ws, data) {
  switch (data.type) {
    case 'subscribe':
      ws.subscriptions = data.channels;
      break;
    case 'scraping_command':
      handleScrapingCommand(ws, data);
      break;
    case 'ping':
      ws.send(JSON.stringify({ type: 'pong' }));
      break;
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

This React.js dashboard provides:

1. **Modern UI/UX** with Material-UI components
2. **Real-time updates** via WebSocket connections
3. **Secure authentication** with 2FA support
4. **Comprehensive scraping management**
5. **Advanced filtering and export capabilities**
6. **Responsive design** for mobile and desktop
7. **State management** with React Context
8. **API integration** layer for backend communication

The system is fully modular and can be extended with additional features as needed. You'll need to implement the backend API endpoints to complete the full-stack solution.