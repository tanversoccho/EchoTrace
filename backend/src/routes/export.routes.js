import express from 'express';
const router = express.Router();

router.post('/', (req, res) => {
  res.json({ 
    message: 'Export started', 
    exportId: Date.now(),
    status: 'processing'
  });
});

router.get('/history', (req, res) => {
  res.json([]);
});

export default router;
