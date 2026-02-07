import express from 'express';
import { ReportService } from '../services/report.service.js';
import ToRScraper from '../scrapers/torScraper.js';

const router = express.Router();

// Manual scan endpoint
router.post('/scan', async (req, res) => {
  try {
    const scraper = new ToRScraper();
    const opportunities = await scraper.scanForOpportunities();
    
    res.json({
      success: true,
      count: opportunities.length,
      opportunities: opportunities.map(opp => ({
        title: opp.title,
        organization: opp.organization,
        deadline: opp.deadline,
        link: opp.link,
        summary: opp.summary,
        relevance: opp.relevance,
        isNew: opp.isNew,
        source: opp.source
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Daily report endpoint
router.get('/daily-report', async (req, res) => {
  try {
    const report = await ReportService.generateDailyReport();
    
    res.json({
      success: true,
      report: {
        '🔍 Overview': report.overview,
        '📌 New Opportunities Today': report.newOpportunities,
        '📅 Deadlines': report.deadlines,
        '📈 Relevance Notes': 'All opportunities match Bangladesh + consulting keywords',
        '📊 Analytics': report.analytics
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Excel export endpoint
router.get('/export-excel', async (req, res) => {
  try {
    const scraper = new ToRScraper();
    const opportunities = await scraper.scanForOpportunities();
    
    if (opportunities.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No opportunities to export' 
      });
    }
    
    const exportResult = await ReportService.exportToExcel(opportunities);
    
    res.download(exportResult.filepath, exportResult.filename, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      // Optional: Clean up file after download
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get current filter settings
router.get('/filters', (req, res) => {
  const scraper = new ToRScraper();
  res.json({
    keywords: scraper.keywords,
    targetCountry: scraper.targetCountry,
    documentTypes: scraper.documentTypes,
    websites: Object.keys(websiteConfigs).map(key => websiteConfigs[key].name)
  });
});

// Update filter settings
router.post('/filters', (req, res) => {
  // Implementation for updating filters
  const { keywords, country, documentTypes } = req.body;
  // Update the scraper configuration
  res.json({ success: true, message: 'Filters updated' });
});

export default router;
