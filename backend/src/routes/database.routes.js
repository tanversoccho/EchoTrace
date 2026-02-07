import express from 'express';
import databaseService from '../services/database.service.js';

const router = express.Router();

// Get ToRs with filters
router.get('/tors', async (req, res) => {
  try {
    const filters = {
      source: req.query.source,
      document_type: req.query.type,
      country: req.query.country,
      keywords: req.query.keywords,
      from_date: req.query.from,
      to_date: req.query.to,
      deadline_soon: req.query.deadline_soon === 'true',
      is_new: req.query.is_new === 'true',
      is_favorite: req.query.favorite === 'true',
      sort_by: req.query.sort_by || 'relevance_score',
      limit: req.query.limit ? parseInt(req.query.limit) : 50,
      offset: req.query.offset ? parseInt(req.query.offset) : 0
    };
    
    const tors = await databaseService.getTORs(filters);
    const stats = await databaseService.getStats();
    
    res.json({
      success: true,
      tors,
      stats,
      pagination: {
        total: tors.length,
        limit: filters.limit,
        offset: filters.offset
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get statistics
router.get('/stats', async (req, res) => {
  try {
    const timeframe = req.query.timeframe || 'day';
    const stats = await databaseService.getStats(timeframe);
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update ToR status (read, favorite, etc.)
router.patch('/tors/:id/status', async (req, res) => {
  try {
    const success = await databaseService.updateTORStatus(
      req.params.id,
      req.body
    );
    
    if (success) {
      res.json({ success: true, message: 'ToR status updated' });
    } else {
      res.status(400).json({ success: false, error: 'Invalid update fields' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search ToRs
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ success: false, error: 'Search query required' });
    }
    
    const tors = await databaseService.db.all(
      `SELECT * FROM tors 
       WHERE title LIKE ? OR description LIKE ? OR organization LIKE ?
       ORDER BY relevance_score DESC
       LIMIT 50`,
      [`%${query}%`, `%${query}%`, `%${query}%`]
    );
    
    res.json({
      success: true,
      query,
      results: tors.length,
      tors: tors.map(tor => ({
        ...tor,
        keywords: JSON.parse(tor.keywords || '[]')
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get scraping history
router.get('/scraping-history', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    
    const history = await databaseService.db.all(
      `SELECT * FROM scraping_sessions 
       ORDER BY started_at DESC
       LIMIT ?`,
      [limit]
    );
    
    const summary = await databaseService.db.get(
      `SELECT 
        COUNT(*) as total_sessions,
        SUM(items_found) as total_items,
        SUM(items_new) as total_new,
        AVG(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) * 100 as success_rate
       FROM scraping_sessions`
    );
    
    res.json({
      success: true,
      history,
      summary
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Archive old ToRs
router.post('/archive', async (req, res) => {
  try {
    const days = req.body.days || 90;
    const archived = await databaseService.archiveOldTORs(days);
    
    res.json({
      success: true,
      message: `Archived ${archived} ToRs older than ${days} days`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
