// backend/src/database/schema.js
export const createTORSchema = (db) => {
  const queries = [
    // Main ToRs table with comprehensive fields
    `CREATE TABLE IF NOT EXISTS tors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unique_hash TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      organization TEXT,
      source TEXT NOT NULL,
      source_id TEXT,
      link TEXT NOT NULL,
      publish_date DATE,
      deadline DATE,
      country TEXT DEFAULT 'Bangladesh',
      document_type TEXT CHECK(document_type IN ('ToR', 'RFP', 'EOI', 'RFQ', 'Tender', 'Other')),
      budget_range TEXT,
      reference_no TEXT,
      keywords JSON,
      relevance_score INTEGER DEFAULT 0,
      
      -- Status tracking
      is_read BOOLEAN DEFAULT FALSE,
      is_favorite BOOLEAN DEFAULT FALSE,
      is_archived BOOLEAN DEFAULT FALSE,
      is_duplicate BOOLEAN DEFAULT FALSE,
      duplicate_of INTEGER,
      
      -- Scraping metadata
      scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      first_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      version INTEGER DEFAULT 1,
      
      -- Raw data for debugging
      raw_data JSON,
      
      -- Indexes for performance
      CONSTRAINT fk_duplicate FOREIGN KEY (duplicate_of) REFERENCES tors(id) ON DELETE SET NULL
    )`,

    // Scraping history table
    `CREATE TABLE IF NOT EXISTS scraping_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      website_key TEXT NOT NULL,
      status TEXT CHECK(status IN ('pending', 'running', 'completed', 'failed')) DEFAULT 'pending',
      items_found INTEGER DEFAULT 0,
      items_new INTEGER DEFAULT 0,
      items_updated INTEGER DEFAULT 0,
      items_duplicate INTEGER DEFAULT 0,
      error_message TEXT,
      started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP,
      logs TEXT
    )`,

    // Keywords tracking for analytics
    `CREATE TABLE IF NOT EXISTS keyword_mentions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      keyword TEXT NOT NULL,
      tor_id INTEGER NOT NULL,
      count INTEGER DEFAULT 1,
      FOREIGN KEY (tor_id) REFERENCES tors(id) ON DELETE CASCADE,
      UNIQUE(keyword, tor_id)
    )`,

    // Daily summary statistics
    `CREATE TABLE IF NOT EXISTS daily_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date DATE UNIQUE NOT NULL,
      total_tors INTEGER DEFAULT 0,
      new_tors INTEGER DEFAULT 0,
      expiring_tors INTEGER DEFAULT 0,
      by_source JSON,
      by_type JSON,
      by_organization JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // User interactions (for future features)
    `CREATE TABLE IF NOT EXISTS user_interactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tor_id INTEGER NOT NULL,
      user_id INTEGER,
      action TEXT CHECK(action IN ('view', 'favorite', 'archive', 'export', 'share')),
      metadata JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tor_id) REFERENCES tors(id) ON DELETE CASCADE
    )`,

    // Performance indexes
    `CREATE INDEX IF NOT EXISTS idx_tors_hash ON tors(unique_hash)`,
    `CREATE INDEX IF NOT EXISTS idx_tors_source ON tors(source)`,
    `CREATE INDEX IF NOT EXISTS idx_tors_deadline ON tors(deadline)`,
    `CREATE INDEX IF NOT EXISTS idx_tors_publish_date ON tors(publish_date)`,
    `CREATE INDEX IF NOT EXISTS idx_tors_document_type ON tors(document_type)`,
    `CREATE INDEX IF NOT EXISTS idx_tors_country ON tors(country)`,
    `CREATE INDEX IF NOT EXISTS idx_tors_organization ON tors(organization)`,
    `CREATE INDEX IF NOT EXISTS idx_tors_relevance ON tors(relevance_score)`,
    `CREATE INDEX IF NOT EXISTS idx_scraping_sessions_date ON scraping_sessions(started_at)`,
    `CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date)`
  ];

  return queries;
};
