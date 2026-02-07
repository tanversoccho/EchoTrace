import ToRScraper from '../scrapers/torScraper.js';
import xlsx from 'xlsx';

export class ReportService {
  static async generateDailyReport() {
    const scraper = new ToRScraper();
    const opportunities = await scraper.scanForOpportunities();
    
    if (opportunities.length === 0) {
      return {
        overview: 'No new relevant opportunities found today.',
        opportunities: [],
        analytics: { total: 0, sitesScanned: Object.keys(websiteConfigs).length }
      };
    }
    
    // Group by deadline urgency
    const urgentDeadlines = opportunities.filter(opp => {
      if (!opp.deadline || opp.deadline === 'Not specified') return false;
      const deadline = new Date(opp.deadline);
      const today = new Date();
      const daysDiff = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
      return daysDiff <= 7;
    });
    
    const report = {
      overview: `Found ${opportunities.length} new opportunities matching Bangladesh-focused consulting criteria.`,
      newOpportunities: opportunities.map(opp => ({
        title: opp.title,
        organization: opp.organization,
        deadline: opp.deadline,
        link: opp.link,
        type: opp.documentType,
        summary: opp.summary
      })),
      deadlines: {
        urgent: urgentDeadlines.map(opp => ({
          title: opp.title,
          deadline: opp.deadline,
          daysRemaining: Math.ceil((new Date(opp.deadline) - new Date()) / (1000 * 60 * 60 * 24))
        })),
        all: opportunities.map(opp => opp.deadline).filter(d => d !== 'Not specified')
      },
      analytics: {
        totalNew: opportunities.length,
        sitesScanned: Object.keys(websiteConfigs).length,
        byType: this.countByDocumentType(opportunities),
        bySource: this.countBySource(opportunities)
      }
    };
    
    return report;
  }
  
  static async exportToExcel(opportunities) {
    const worksheetData = opportunities.map(opp => ({
      'Title': opp.title,
      'Link': opp.link,
      'Organization': opp.organization,
      'Deadline': opp.deadline,
      'Type': opp.documentType,
      'Summary': opp.summary,
      'Why it matches criteria': opp.relevance,
      'Date found': opp.dateFound,
      'Source': opp.source
    }));
    
    const worksheet = xlsx.utils.json_to_sheet(worksheetData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Bangladesh ToR Report');
    
    const filename = `Bangladesh_ToR_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    const filepath = `./storage/exports/${filename}`;
    
    xlsx.writeFile(workbook, filepath);
    
    return {
      filename,
      filepath,
      count: opportunities.length
    };
  }
  
  static countByDocumentType(opportunities) {
    const counts = {};
    opportunities.forEach(opp => {
      counts[opp.documentType] = (counts[opp.documentType] || 0) + 1;
    });
    return counts;
  }
  
  static countBySource(opportunities) {
    const counts = {};
    opportunities.forEach(opp => {
      counts[opp.source] = (counts[opp.source] || 0) + 1;
    });
    return counts;
  }
}
