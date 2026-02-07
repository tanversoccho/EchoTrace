// backend/src/services/database.service.js
import Database from '../database/db.js';
import crypto from 'crypto';

class DatabaseService {
  constructor() {
    this.db = null;
  }

  async initialize() {
    const dbInstance = new Database();
    this.db = await dbInstance.initialize();
    return this.db;
  }

  // Generate unique hash for a ToR
  generateHash(torData) {
    const hashString = `${torData.title}_${torData.link}_${torData.source}_${torData.publish_date || ''}`;
    return crypto.createHash('md5').update(hashString).normalize('NFC')).digest('hex');
  }

  // Check if ToR already exists
  async torExists(uniqueHash) {
    try {
      const result = await this.db.get(
        'SELECT id, version, last_seen_at FROM tors WHERE unique_hash = ?',
        [uniqueHash]
      );
      return result || null;
    } catch (error) {
      console.error('Error checking if ToR exists:', error);
      return null;
    }
  }

  // Insert or update a ToR
  async saveTOR(torData) {
    const uniqueHash = this.generateHash(torData);
    const existing = await this.torExists(uniqueHash);
    
    const now = new Date().toISOString();
    
    if (existing) {
      // Update existing record
      return await this.updateTOR(existing.id, torData, now);
    } else {
      // Insert new record
      return await this.insertTOR(torData, uniqueHash, now);
    }
  }

  async insertTOR(torData, uniqueHash, timestamp) {
    try {
      const result = await this.db.run(
        `INSERT INTO tors (
          unique_hash, title, description, organization, source,
          source_id, link, publish_date, deadline, country,
          document_type, budget_range, reference_no, keywords,
          relevance_score, raw_data, first_seen_at, last_seen_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uniqueHash,
          torData.title,
          torData.description || null,
          torData.organization || null,
          torData.source,
          torData.source_id || null,
          torData.link,
          torData.publish_date || null,
          torData.deadline || null,
          torData.country || 'Bangladesh',
          torData.document_type || 'Other',
          torData.budget_range || null,
          torData.reference_no || null,
          JSON.stringify(torData.keywords || []),
          this.calculateRelevanceScore(torData),
          JSON.stringify(torData.raw_data || {}),
          timestamp,
          timestamp
        ]
      );

      const torId = result.lastID;
      
      // Track keyword mentions
      if (torData.keywords && torData.keywords.length > 0) {
        await this.trackKeywords(torId, torData.keywords);
      }

      return { id: torId, isNew: true, action: 'inserted' };
    } catch (error) {
      console.error('Error inserting ToR:', error);
      throw error;
    }
  }

  async updateTOR(torId, torData, timestamp) {
    try {
      await this.db.run(
        `UPDATE tors SET
          last_seen_at = ?,
          version = version + 1,
          is_duplicate = ?
        WHERE id = ?`,
        [timestamp, torData.is_duplicate || false, torId]
      );

      return { id: torId, isNew: false, action: 'updated' };
    } catch (error) {
      console.error('Error updating ToR:', error);
      throw error;
    }
  }

  // Calculate relevance score based on criteria
  calculateRelevanceScore(torData) {
    let score = 0;
    const text = (torData.title + ' ' + (torData.description || '')).toLowerCase();
    
    // Keywords scoring
    const keywords = [
      'baseline', 'mid-term', 'midline', 'endline', 
      'final evaluation', 'impact evaluation', 'studies',
      'assessment', 'research', 'study', 'monitoring', 
      'consultancy', 'consultant', 'consulting'
    ];
    
    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        score += 10;
      }
    });
    
    // Country match
    if (text.includes('bangladesh')) {
      score += 20;
    }
    
    // Document type bonus
    const docType = torData.document_type?.toLowerCase();
    if (docType === 'tor') score += 15;
    if (docType === 'rfp') score += 10;
    
    return Math.min(score, 100);
  }

  // Track keyword mentions for analytics
  async trackKeywords(torId, keywords) {
    for (const keyword of keywords) {
      try {
        await this.db.run(
          `INSERT OR REPLACE INTO keyword_mentions (keyword, tor_id, count)
           VALUES (?, ?, COALESCE((SELECT count FROM keyword_mentions WHERE keyword = ? AND tor_id = ?), 0) + 1)`,
          [keyword, torId, keyword, torId]
        );
      } catch (error) {
        console.error('Error tracking keyword:', error);
      }
    }
  }

  // Record scraping session
  async recordScrapingSession(sessionData) {
    try {
      const result = await this.db.run(
        `INSERT INTO scraping_sessions (
          website_key, status, items_found, items_new,
          items_updated, items_duplicate, error_message, logs
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sessionData.website_key,
          sessionData.status || 'completed',
          sessionData.items_found || 0,
          sessionData.items_new || 0,
          sessionData.items_updated || 0,
          sessionData.items_duplicate || 0,
          sessionData.error_message || null,
          JSON.stringify(sessionData.logs || [])
        ]
      );
      
      return result.lastID;
    } catch (error) {
      console.error('Error recording scraping session:', error);
      throw error;
    }
  }

  // Update scraping session on completion
  async completeScrapingSession(sessionId, results) {
    try {
      await this.db.run(
        `UPDATE scraping_sessions SET
          status = 'completed',
          completed_at = CURRENT_TIMESTAMP,
          items_found = ?,
          items_new = ?,
          items_updated = ?,
          items_duplicate = ?
        WHERE id = ?`,
        [
          results.items_found,
          results.items_new,
          results.items_updated,
          results.items_duplicate,
          sessionId
        ]
      );
    } catch (error) {
      console.error('Error completing scraping session:', error);
    }
  }

  // Get ToRs with various filters
  async getTORs(filters = {}) {
    try {
      let query = `SELECT * FROM tors WHERE 1=1`;
      const params = [];
      
      // Apply filters
      if (filters.source) {
        query += ` AND source = ?`;
        params.push(filters.source);
      }
      
      if (filters.document_type) {
        query += ` AND document_type = ?`;
        params.push(filters.document_type);
      }
      
      if (filters.country) {
        query += ` AND country = ?`;
        params.push(filters.country);
      }
      
      if (filters.keywords) {
        query += ` AND keywords LIKE ?`;
        params.push(`%${filters.keywords}%`);
      }
      
      if (filters.from_date) {
        query += ` AND publish_date >= ?`;
        params.push(filters.from_date);
      }
      
      if (filters.to_date) {
        query += ` AND publish_date <= ?`;
        params.push(filters.to_date);
      }
      
      if (filters.deadline_soon) {
        query += ` AND deadline BETWEEN DATE('now') AND DATE('now', '+7 days')`;
      }
      
      if (filters.is_new) {
        query += ` AND DATE(first_seen_at) = DATE('now')`;
      }
      
      if (filters.is_favorite) {
        query += ` AND is_favorite = TRUE`;
      }
      
      // Sorting
      query += ` ORDER BY ${filters.sort_by || 'relevance_score'} DESC, publish_date DESC`;
      
      // Pagination
      if (filters.limit) {
        query += ` LIMIT ?`;
        params.push(filters.limit);
      }
      
      if (filters.offset) {
        query += ` OFFSET ?`;
        params.push(filters.offset);
      }
      
      const tors = await this.db.all(query, params);
      return tors.map(tor => ({
        ...tor,
        keywords: JSON.parse(tor.keywords || '[]'),
        raw_data: JSON.parse(tor.raw_data || '{}')
      }));
    } catch (error) {
      console.error('Error fetching ToRs:', error);
      throw error;
    }
  }

  // Get statistics
  async getStats(timeframe = 'day') {
    try {
      let dateCondition = "DATE('now')";
      if (timeframe === 'week') {
        dateCondition = "DATE('now', '-7 days')";
      } else if (timeframe === 'month') {
        dateCondition = "DATE('now', '-30 days')";
      }
      
      const stats = await this.db.get(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN DATE(first_seen_at) >= ${dateCondition} THEN 1 ELSE 0 END) as new_count,
          SUM(CASE WHEN deadline BETWEEN DATE('now') AND DATE('now', '+7 days') THEN 1 ELSE 0 END) as expiring_soon,
          COUNT(DISTINCT source) as sources_count,
          COUNT(DISTINCT organization) as organizations_count
         FROM tors`
      );
      
      // Get by source
      const bySource = await this.db.all(
        `SELECT source, COUNT(*) as count 
         FROM tors 
         WHERE publish_date >= ${dateCondition}
         GROUP BY source 
         ORDER BY count DESC`
      );
      
      // Get by type
      const byType = await this.db.all(
        `SELECT document_type, COUNT(*) as count 
         FROM tors 
         WHERE publish_date >= ${dateCondition}
         GROUP BY document_type 
         ORDER BY count DESC`
      );
      
      // Get top keywords
      const topKeywords = await this.db.all(
        `SELECT keyword, SUM(count) as total_count
         FROM keyword_mentions km
         JOIN tors t ON km.tor_id = t.id
         WHERE t.publish_date >= ${dateCondition}
         GROUP BY keyword
         ORDER BY total_count DESC
         LIMIT 10`
      );
      
      return {
        ...stats,
        by_source: bySource,
        by_type: byType,
        top_keywords: topKeywords,
        timeframe: timeframe
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      throw error;
    }
  }

  // Mark ToR as read/favorite/etc.
  async updateTORStatus(torId, updates) {
    try {
      const allowedFields = ['is_read', 'is_favorite', 'is_archived'];
      const setClauses = [];
      const params = [];
      
      Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key)) {
          setClauses.push(`${key} = ?`);
          params.push(updates[key]);
        }
      });
      
      if (setClauses.length === 0) {
        return false;
      }
      
      params.push(torId);
      
      await this.db.run(
        `UPDATE tors SET ${setClauses.join(', ')} WHERE id = ?`,
        params
      );
      
      return true;
    } catch (error) {
      console.error('Error updating ToR status:', error);
      return false;
    }
  }

  // Clean up old data (archival)
  async archiveOldTORs(days = 90) {
    try {
      const result = await this.db.run(
        `UPDATE tors SET is_archived = TRUE 
         WHERE deadline < DATE('now', '-? days') 
         AND is_archived = FALSE`,
        [days]
      );
      
      return result.changes;
    } catch (error) {
      console.error('Error archiving old ToRs:', error);
      return 0;
    }
  }

  // Find potential duplicates
  async findDuplicates(torId, threshold = 0.8) {
    try {
      const tor = await this.db.get(
        `SELECT title, organization, description FROM tors WHERE id = ?`,
        [torId]
      );
      
      if (!tor) return [];
      
      const allTors = await this.db.all(
        `SELECT id, title, organization, description FROM tors WHERE id != ?`,
        [torId]
      );
      
      // Simple similarity check (in production, use better algorithms)
      const duplicates = allTors.filter(other => {
        const similarity = this.calculateSimilarity(tor.title, other.title);
        return similarity >= threshold;
      });
      
      return duplicates;
    } catch (error) {
      console.error('Error finding duplicates:', error);
      return [];
    }
  }

  calculateSimilarity(str1, str2) {
    // Simple Jaccard similarity for demo
    const set1 = new Set(str1.toLowerCase().split(/\W+/));
    const set2 = new Set(str2.toLowerCase().split(/\W+/));
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }
}

// Singleton instance
const databaseService = new DatabaseService();
export default databaseService;
