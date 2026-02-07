// Script to run database maintenance tasks
import databaseService from '../src/services/database.service.js';

async function runMaintenance() {
  await databaseService.initialize();
  
  console.log('Starting database maintenance...');
  
  // 1. Archive old ToRs
  const archived = await databaseService.archiveOldTORs(90);
  console.log(`Archived ${archived} old ToRs`);
  
  // 2. Update daily stats
  const today = new Date().toISOString().split('T')[0];
  const stats = await databaseService.getStats('day');
  
  await databaseService.db.run(
    `INSERT OR REPLACE INTO daily_stats 
     (date, total_tors, new_tors, expiring_tors, by_source, by_type, by_organization)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      today,
      stats.total,
      stats.new_count,
      stats.expiring_soon,
      JSON.stringify(stats.by_source),
      JSON.stringify(stats.by_type),
      JSON.stringify({}) // Add organization stats if needed
    ]
  );
  
  console.log('Daily stats updated');
  
  // 3. Clean up old scraping sessions (keep last 30 days)
  const deleted = await databaseService.db.run(
    `DELETE FROM scraping_sessions 
     WHERE started_at < DATE('now', '-30 days')`
  );
  
  console.log(`Cleaned up ${deleted.changes} old scraping sessions`);
  
  console.log('Database maintenance completed');
  process.exit(0);
}

runMaintenance().catch(console.error);
