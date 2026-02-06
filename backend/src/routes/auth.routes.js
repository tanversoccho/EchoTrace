import express from 'express';
const router = express.Router();

router.post('/register', (req, res) => {
  const { email, name, organization } = req.body;
  
  res.json({
    message: 'User registered successfully',
    user: { 
      id: 1, 
      email, 
      name, 
      organization: organization || 'Helios'
    },
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AaGVsaW9zLmNvbSIsIm5hbWUiOiJBZG1pbiBVc2VyIiwiaWF0IjoxNzA3MjIwMDAwLCJleHAiOjE3MDc4MjQ4MDB9.mock-token-for-development'
  });
});

router.post('/login', (req, res) => {
  const { email } = req.body;
  
  res.json({
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AaGVsaW9zLmNvbSIsIm5hbWUiOiJBZG1pbiBVc2VyIiwiaWF0IjoxNzA3MjIwMDAwLCJleHAiOjE3MDc4MjQ4MDB9.mock-token-for-development',
    user: { 
      id: 1, 
      email: email || 'admin@helios.com', 
      name: 'Admin User',
      organization: 'Helios'
    }
  });
});

router.get('/profile', (req, res) => {
  res.json({ 
    user: { 
      id: 1, 
      email: 'admin@helios.com', 
      name: 'Admin User',
      organization: 'Helios',
      role: 'admin'
    } 
  });
});

export default router;
