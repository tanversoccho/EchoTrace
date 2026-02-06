import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.json([
    { id: 1, name: 'World Bank', url: 'https://procurement-notices.undp.org' },
    { id: 2, name: 'UNDP', url: 'https://jobs.undp.org' },
    { id: 3, name: 'ADB', url: 'https://www.adb.org' },
    { id: 4, name: 'BDJobs', url: 'https://www.bdjobs.com' }
  ]);
});

export default router;
