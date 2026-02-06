import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { BrowserRouter as Router } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AppRoutes from './routes'
import { NotificationProvider } from './context/NotificationContext'
import { AuthProvider } from './context/AuthContext'
import { TORProvider } from './context/TORContext'

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
    background: { default: '#f5f7fa' },
  },
  typography: { fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' },
  shape: { borderRadius: 8 },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <NotificationProvider>
          <AuthProvider>
            <TORProvider>
              <AppRoutes />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: { background: '#363636', color: '#fff' },
                  success: { duration: 3000, iconTheme: { primary: '#4caf50', secondary: '#fff' } },
                  error: { duration: 5000, iconTheme: { primary: '#f44336', secondary: '#fff' } },
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
