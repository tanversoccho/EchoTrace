import React from 'react'
import { Outlet } from 'react-router-dom'
import { Box, Toolbar } from '@mui/material'
import Header from './Header'
import Sidebar from './Sidebar'

const Layout = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Header />
      <Sidebar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 240px)` },
          backgroundColor: '#f5f7fa',
          minHeight: '100vh'
        }}
      >
        <Toolbar /> {/* Spacer for fixed header */}
        <Outlet />  {/* Render page here */}
      </Box>
    </Box>
  )
}

export default Layout
