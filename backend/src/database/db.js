import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import { createTORSchema } from './schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class Database {
  async initialize() {
    const dbPath = join(__dirname, '../../../storage/data/tor_database.db');
    
    // Ensure storage directory exists
    await fs.mkdir(dirname(dbPath), { recursive: true });
    
    // Open database
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    console.log('📦 Database connected');
    
    // Create tables
    // Add at the top of backend/src/database/db.js
    // Update the createTables method
    // async createTables() {
    //   try {
    //     const schemaQueries = createTORSchema();
    //
    //     for (const query of schemaQueries) {
    //         await this.db.exec(query);
    //     }
    //
    //     console.log('✅ ToR database schema created successfully');
    //
    //     // Create default daily stats entry
    //     await this.createDefaultStats();
    //
    //   } catch (error) {
    //       console.error('❌ Error creating database schema:', error);
    //       throw error;
    //   }
    // }

    // async createDefaultStats() {
    //   try {
    //     const today = new Date().toISOString().split('T')[0];
    //     await this.db.run(
    //     `INSERT OR IGNORE INTO daily_stats (date) VALUES (?)`,
    //        [today]
    //     );
    //   } catch (error) {
    //       console.error('Error creating default stats:', error);
    //   }
    // }
    await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      organization TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `);

    await db.exec(`
    CREATE TABLE IF NOT EXISTS tors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unique_hash TEXT UNIQUE NOT NULL,
      source TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      publish_date DATE,
      deadline DATE,
      link TEXT,
      organization TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `);

    return db;
  }
}

export default Database;
