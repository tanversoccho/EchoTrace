import { websiteConfigs } from '../config/websites.js';
import { ScraperService } from '../services/scraper.service.js';

class ToRScraper {
  constructor() {
    this.keywords = [
      'Baseline', 'Mid-term', 'Midline', 'Endline', 
      'Final Evaluation', 'Impact Evaluation', 'Studies',
      'Assessment', 'Research', 'Study', 'Monitoring', 
      'Consultancy firm'
    ];
    this.targetCountry = 'Bangladesh';
    this.documentTypes = ['ToR', 'RFP', 'EOI', 'RFQ'];
    this.previousLinks = new Set(); // Memory for deduplication
  }

  // Check if text matches criteria
  matchesCriteria(title, description) {
    const text = (title + ' ' + description).toLowerCase();
    
    // Must contain at least one keyword
    const hasKeyword = this.keywords.some(keyword => 
      text.includes(keyword.toLowerCase())
    );
    
    // Must mention Bangladesh
    const hasCountry = text.includes('bangladesh');
    
    return hasKeyword && hasCountry;
  }

  // Extract document type from text
  extractDocType(text) {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('terms of reference') || lowerText.includes('tor')) return 'ToR';
    if (lowerText.includes('request for proposal') || lowerText.includes('rfp')) return 'RFP';
    if (lowerText.includes('expression of interest') || lowerText.includes('eoi')) return 'EOI';
    if (lowerText.includes('request for quotation') || lowerText.includes('rfq')) return 'RFQ';
    return 'Other';
  }

  // Main scraping function
  async scanForOpportunities() {
    const newOpportunities = [];
    
    for (const [siteKey, config] of Object.entries(websiteConfigs)) {
      console.log(`🔍 Scanning ${config.name}...`);
      
      try {
        const rawData = await ScraperService.scrapeWebsite(siteKey);
        
        for (const item of rawData) {
          // Apply filters
          if (this.matchesCriteria(item.title, item.description)) {
            const docType = this.extractDocType(item.title + ' ' + item.description);
            
            // Check if this is a new opportunity
            const isNew = !this.previousLinks.has(item.link);
            
            if (isNew) {
              this.previousLinks.add(item.link);
              
              const opportunity = {
                title: item.title,
                organization: item.organization || 'Not specified',
                deadline: item.deadline || 'Not specified',
                link: item.link,
                source: config.name,
                documentType: docType,
                summary: this.generateSummary(item),
                relevance: `Matches: ${this.keywords.filter(k => 
                  (item.title + ' ' + item.description).toLowerCase().includes(k.toLowerCase())
                ).join(', ')}`,
                dateFound: new Date().toISOString(),
                isNew: true
              };
              
              newOpportunities.push(opportunity);
            }
          }
        }
      } catch (error) {
        console.error(`Failed to scan ${config.name}:`, error);
      }
    }
    
    return newOpportunities;
  }

  generateSummary(item) {
    // Create a 3-5 line summary from available data
    const lines = [
      `Opportunity from ${item.organization || item.source}`,
      item.description ? item.description.substring(0, 150) + '...' : 'No description available',
      `Deadline: ${item.deadline || 'Not specified'}`
    ];
    return lines.join('\n');
  }
}

export default ToRScraper;
