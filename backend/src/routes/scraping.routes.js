import express from 'express';
const router = express.Router();

router.get('/websites', (req, res) => {
  res.json([
    { id: 1, name: 'World Bank', url: 'https://procurement-notices.undp.org', status: 'active' },
    { id: 2, name: 'UNDP', url: 'https://jobs.undp.org', status: 'active' },
    { id: 3, name: 'ADB', url: 'https://www.adb.org', status: 'active' },
    { id: 4, name: 'BDJobs', url: 'https://www.bdjobs.com', status: 'active' }
  ]);
});

router.get('/jobs', (req, res) => {
  res.json([]);
});

router.get('/logs', (req, res) => {
  res.json([]);
});

export default router;
