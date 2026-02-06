# setup-backend.ps1
Write-Host "🚀 Setting up EchoTrace Backend" -ForegroundColor Cyan
Write-Host "==============================="

# 1. Create directories
Write-Host "1. Creating directory structure..." -ForegroundColor Yellow
$directories = @(
    "src/database",
    "src/routes", 
    "src/models",
    "src/controllers",
    "src/services",
    "src/scrapers",
    "src/utils",
    "src/config",
    "storage/data",
    "storage/logs", 
    "storage/sessions",
    "storage/exports",
    "storage/scraping"
)

foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "   Created: $dir" -ForegroundColor Gray
    }
}

# 2. Create db.js
Write-Host "`n2. Creating database setup..." -ForegroundColor Yellow
$dbContent = @'
// src/database/db.js - Complete Database Setup
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class Database {
  constructor() {
    this.db = null;
    this.dbPath = join(__dirname, '../../../storage/data/tor_database.db');
  }

  async initialize() {
    try {
      // Ensure storage directory exists
      await fs.mkdir(dirname(this.dbPath), { recursive: true });
      
      this.db = await open({
        filename: this.dbPath,
        driver: sqlite3.Database
      });
      
      console.log('📦 Database connected:', this.dbPath);
      await this.createTables();
      return this.db;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  async createTables() {
    const queries = [
      \`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        organization TEXT,
        role TEXT DEFAULT 'user',
        two_fa_secret TEXT,
        two_fa_enabled BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )\`,

      \`CREATE TABLE IF NOT EXISTS websites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        requires_login BOOLEAN DEFAULT FALSE,
        requires_2fa BOOLEAN DEFAULT FALSE,
        schedule TEXT DEFAULT 'daily',
        active BOOLEAN DEFAULT TRUE,
        last_run TIMESTAMP,
        last_status TEXT DEFAULT 'idle',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )\`,

      \`CREATE TABLE IF NOT EXISTS tors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        unique_hash TEXT UNIQUE NOT NULL,
        source TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        publish_date DATE NOT NULL,
        deadline DATE,
        link TEXT NOT NULL,
        organization TEXT,
        country TEXT,
        category TEXT,
        budget_range TEXT,
        reference_no TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        is_favorite BOOLEAN DEFAULT FALSE,
        scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )\`,

      \`CREATE INDEX IF NOT EXISTS idx_tors_hash ON tors(unique_hash)\`,
      \`CREATE INDEX IF NOT EXISTS idx_tors_source ON tors(source)\`,
      \`CREATE INDEX IF NOT EXISTS idx_tors_date ON tors(publish_date)\`
    ];

    for (const query of queries) {
      await this.db.exec(query);
    }
    
    console.log('✅ Database tables created/verified');
    await this.seedDefaultData();
  }

  async seedDefaultData() {
    try {
      // Check if we have any websites
      const websiteCount = await this.db.get('SELECT COUNT(*) as count FROM websites');
      
      if (websiteCount.count === 0) {
        const defaultWebsites = [
          ['World Bank', 'https://procurement-notices.undp.org', 1, 1, 'daily', 1],
          ['UNDP', 'https://jobs.undp.org', 1, 1, 'daily', 1],
          ['ADB', 'https://www.adb.org', 0, 0, 'daily', 1],
          ['BDJobs', 'https://www.bdjobs.com', 0, 0, 'hourly', 1]
        ];

        for (const website of defaultWebsites) {
          await this.db.run(
            \`INSERT INTO websites (name, url, requires_login, requires_2fa, schedule, active) 
             VALUES (?, ?, ?, ?, ?, ?)\`,
            website
          );
        }
        console.log('🌐 Default websites seeded');
      }

      // Check if we have any users
      const userCount = await this.db.get('SELECT COUNT(*) as count FROM users');
      
      if (userCount.count === 0) {
        // Insert a default admin user (password: admin123)
        await this.db.run(
          \`INSERT INTO users (email, password_hash, name, organization, role) 
           VALUES (?, ?, ?, ?, ?)\`,
          ['admin@helios.com', '\$2a\$10\$N9qo8uLOickgx2ZMRZoMy.MrqK.3.6Z1Q6.2fTp8Qz7sFk3J9zW6y', 'Helios Admin', 'Helios', 'admin']
        );
        console.log('👤 Default admin user created (email: admin@helios.com, password: admin123)');
      }
    } catch (error) {
      console.error('Error seeding default data:', error);
    }
  }

  async close() {
    if (this.db) {
      await this.db.close();
      console.log('📦 Database connection closed');
    }
  }
}

export default Database;
'@

Set-Content -Path "src/database/db.js" -Value $dbContent -Encoding UTF8
Write-Host "   Created: src/database/db.js" -ForegroundColor Gray

# 3. Create .env file
Write-Host "`n3. Creating environment file..." -ForegroundColor Yellow
$envContent = @'
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=echotrace-super-secret-key-change-in-production-2024
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef
DATABASE_PATH=./storage/data/tor_database.db
'@

Set-Content -Path ".env" -Value $envContent -Encoding UTF8
Write-Host "   Created: .env" -ForegroundColor Gray

Write-Host "`n✅ Backend setup complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Install dependencies: npm install" -ForegroundColor Yellow
Write-Host "2. Start server: npm run dev" -ForegroundColor Yellow
Write-Host "3. Test: curl http://localhost:5000/api/health" -ForegroundColor Yellow