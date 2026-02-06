import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';

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
