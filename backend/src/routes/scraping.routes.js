import express from 'express';
import { ScraperService } from '../services/scraper.service.js';
const router = express.Router();

router.post('/scrape/:websiteKey', async (req, res) => {
  try {
    const data = await ScraperService.scrapeWebsite(req.params.websiteKey);
    // TODO: Save data to database, check for duplicates
    res.json({ success: true, message: `Scraped ${data.length} items`, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get a list of all configured websites
router.get('/websites', (req, res) => {
  const websiteList = Object.keys(websiteConfigs).map(key => ({
    key,
    ...websiteConfigs[key]
  }));
  res.json(websiteList);
});

export default router;
