// backend/src/services/scraper.service.js
import axios from 'axios';
import cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import { websiteConfigs } from '../../config/websites.js';
import databaseService from './database.service.js';

export class ScraperService {
  static async scrapeWebsite(websiteKey) {
    const config = websiteConfigs[websiteKey];
    if (!config) throw new Error(`Config for ${websiteKey} not found`);

    console.log(`🚀 Starting scrape for: ${config.name}`);
    
    // Record scraping session
    const sessionId = await databaseService.recordScrapingSession({
      website_key: websiteKey,
      status: 'running'
    });

    let data = [];
    let results = {
      items_found: 0,
      items_new: 0,
      items_updated: 0,
      items_duplicate: 0,
      items_filtered: 0
    };

    try {
      // Get data based on website type
      if (config.type === 'static') {
        data = await this.scrapeWithCheerio(config);
      } else if (config.type === 'dynamic') {
        data = await this.scrapeWithPuppeteer(config);
      }

      console.log(`📊 Found ${data.length} raw items from ${config.name}`);
      
      // Apply keyword and country filtering
      const filteredData = this.applyFilters(data, config);
      results.items_filtered = data.length - filteredData.length;
      results.items_found = filteredData.length;
      
      console.log(`✅ ${filteredData.length} items match criteria after filtering`);
      
      // Process each item and save to database
      for (const item of filteredData) {
        const enrichedItem = this.enrichTORData(item, config);
        const saveResult = await this.processAndSaveTOR(enrichedItem);
        
        // Update counts based on save result
        if (saveResult.action === 'inserted') {
          results.items_new++;
        } else if (saveResult.action === 'updated') {
          results.items_updated++;
        }
        
        if (saveResult.is_duplicate) {
          results.items_duplicate++;
        }
      }

      // Update scraping session with results
      await databaseService.completeScrapingSession(sessionId, results);
      
      console.log(`🎯 ${config.name} scrape completed:`);
      console.log(`   New: ${results.items_new}, Updated: ${results.items_updated}`);
      console.log(`   Duplicates: ${results.items_duplicate}, Filtered: ${results.items_filtered}`);
      
      return {
        data: filteredData,
        results,
        sessionId
      };
      
    } catch (error) {
      console.error(`❌ Scraping failed for ${config.name}:`, error);
      
      // Mark session as failed
      await databaseService.recordScrapingSession({
        website_key: websiteKey,
        status: 'failed',
        error_message: error.message,
        logs: [error.stack]
      });
      
      throw error;
    }
  }

  static async scrapeWithCheerio(config) {
    try {
      console.log(`📡 Fetching: ${config.url}`);
      const { data: html } = await axios.get(config.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 EchoTrace-Bot/1.0'
        },
        timeout: 30000
      });
      
      const $ = cheerio.load(html);
      const items = [];

      // Check if container exists
      const containerCount = $(config.selectors.container).length;
      console.log(`🔍 Found ${containerCount} containers with selector: ${config.selectors.container}`);

      $(config.selectors.container).each((i, elem) => {
        const item = {};
        
        // Extract all fields from selectors
        for (const [key, selector] of Object.entries(config.selectors)) {
          if (key === 'container') continue;
          
          if (selector.includes('@')) {
            // Handle attribute selectors like "a@href"
            const [elementSelector, attr] = selector.split('@');
            item[key] = $(elem).find(elementSelector).attr(attr) || '';
          } else {
            // Handle text selectors
            item[key] = $(elem).find(selector).text().trim();
          }
        }
        
        // Add metadata
        item.source = config.name;
        item.source_key = config.key || Object.keys(websiteConfigs).find(k => websiteConfigs[k] === config);
        item.scraped_at = new Date().toISOString();
        item.raw_html = $(elem).html(); // Store raw HTML for debugging
        
        items.push(item);
      });

      // Handle pagination if configured
      if (config.pagination && items.length > 0) {
        const paginatedItems = await this.handlePagination($, config);
        items.push(...paginatedItems);
      }

      return items;
    } catch (error) {
      console.error(`Error scraping ${config.name} with Cheerio:`, error);
      throw error;
    }
  }

  static async scrapeWithPuppeteer(config) {
    let browser = null;
    try {
      console.log(`🌐 Launching Puppeteer for: ${config.name}`);
      
      browser = await puppeteer.launch({ 
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu'
        ]
      });
      
      const page = await browser.newPage();
      
      // Set realistic browser headers
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 EchoTrace-Bot/1.0');
      
      // Set viewport
      await page.setViewport({ width: 1366, height: 768 });
      
      console.log(`➡️  Navigating to: ${config.url}`);
      await page.goto(config.url, { 
        waitUntil: 'networkidle2',
        timeout: 60000 
      });

      // Handle login if required
      if (config.requiresLogin) {
        await this.handleLogin(page, config);
      }

      // Wait for content to load
      await page.waitForSelector(config.selectors.container, { timeout: 30000 });
      
      // Extract data
      const data = await page.evaluate((selectors, websiteName) => {
        const items = [];
        const containers = document.querySelectorAll(selectors.container);
        
        containers.forEach(elem => {
          const item = {};
          
          // Extract each field
          for (const [key, selector] of Object.entries(selectors)) {
            if (key === 'container') continue;
            
            if (selector.includes('@')) {
              const [elementSelector, attr] = selector.split('@');
              const element = elem.querySelector(elementSelector);
              item[key] = element ? (element.getAttribute(attr) || '') : '';
            } else {
              const element = elem.querySelector(selector);
              item[key] = element ? element.textContent.trim() : '';
            }
          }
          
          item.source = websiteName;
          items.push(item);
        });
        
        return items;
      }, config.selectors, config.name);

      console.log(`📊 Puppeteer extracted ${data.length} items`);
      
      // Handle dynamic pagination
      if (config.pagination) {
        const moreData = await this.handlePuppeteerPagination(page, config);
        data.push(...moreData);
      }

      await browser.close();
      
      return data.map(item => ({
        ...item,
        scraped_at: new Date().toISOString(),
        source: config.name
      }));
      
    } catch (error) {
      if (browser) {
        await browser.close();
      }
      console.error(`Error scraping ${config.name} with Puppeteer:`, error);
      throw error;
    }
  }

  static async handleLogin(page, config) {
    console.log(`🔐 Attempting login for ${config.name}`);
    
    try {
      if (!config.loginConfig) {
        throw new Error('Login configuration missing');
      }

      const { username, password, selectors } = config.loginConfig;
      
      // Enter username
      if (selectors.username) {
        await page.type(selectors.username, username);
      }
      
      // Enter password
      if (selectors.password) {
        await page.type(selectors.password, password);
      }
      
      // Click submit
      if (selectors.submit) {
        await page.click(selectors.submit);
      }
      
      // Wait for login to complete
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
      console.log(`✅ Login successful for ${config.name}`);
      
    } catch (error) {
      console.error(`❌ Login failed for ${config.name}:`, error);
      throw error;
    }
  }

  static async handlePuppeteerPagination(page, config) {
    const allItems = [];
    let pageNumber = 1;
    const maxPages = config.maxPages || 5;
    
    console.log(`📄 Starting pagination (max ${maxPages} pages)`);
    
    while (pageNumber <= maxPages) {
      try {
        // Extract current page data
        const pageData = await page.evaluate((selectors, websiteName) => {
          const items = [];
          const containers = document.querySelectorAll(selectors.container);
          
          containers.forEach(elem => {
            const item = {};
            for (const [key, selector] of Object.entries(selectors)) {
              if (key === 'container') continue;
              
              if (selector.includes('@')) {
                const [elementSelector, attr] = selector.split('@');
                const element = elem.querySelector(elementSelector);
                item[key] = element ? element.getAttribute(attr) : '';
              } else {
                const element = elem.querySelector(selector);
                item[key] = element ? element.textContent.trim() : '';
              }
            }
            item.source = websiteName;
            items.push(item);
          });
          
          return items;
        }, config.selectors, config.name);
        
        allItems.push(...pageData);
        console.log(`   Page ${pageNumber}: Found ${pageData.length} items`);
        
        // Try to go to next page
        const hasNextPage = await page.evaluate(() => {
          const nextButtons = [
            '.pagination-next', 
            '.next-page', 
            'a:contains("Next")',
            'button:contains("Next")',
            '[aria-label="Next"]'
          ];
          
          for (const selector of nextButtons) {
            const element = document.querySelector(selector);
            if (element && !element.disabled && element.style.display !== 'none') {
              return true;
            }
          }
          return false;
        });
        
        if (!hasNextPage) {
          console.log('   No more pages found');
          break;
        }
        
        // Click next page
        await page.evaluate(() => {
          const nextButtons = [
            '.pagination-next', 
            '.next-page', 
            'a:contains("Next")',
            'button:contains("Next")',
            '[aria-label="Next"]'
          ];
          
          for (const selector of nextButtons) {
            const element = document.querySelector(selector);
            if (element && !element.disabled && element.style.display !== 'none') {
              element.click();
              return;
            }
          }
        });
        
        // Wait for next page to load
        await page.waitForTimeout(2000); // Wait for content to load
        await page.waitForSelector(config.selectors.container, { timeout: 10000 });
        
        pageNumber++;
        
      } catch (error) {
        console.log(`   Stopping pagination at page ${pageNumber}:`, error.message);
        break;
      }
    }
    
    console.log(`📚 Pagination complete: ${allItems.length} total items across ${pageNumber} pages`);
    return allItems;
  }

  static extractData($, elem, selector) {
    try {
      if (selector.includes('@')) {
        // Handle attribute selectors
        const [elementSelector, attr] = selector.split('@');
        return $(elem).find(elementSelector).attr(attr) || '';
      } else {
        // Handle text selectors
        return $(elem).find(selector).text().trim();
      }
    } catch (error) {
      console.warn(`Failed to extract data with selector ${selector}:`, error.message);
      return '';
    }
  }

  static applyFilters(items, config) {
    const keywords = [
      'baseline', 'mid-term', 'midline', 'endline', 
      'final evaluation', 'impact evaluation', 'studies',
      'assessment', 'research', 'study', 'monitoring', 
      'consultancy', 'consultant', 'consulting', 'firm'
    ];
    
    const documentTypes = ['tor', 'rfp', 'eoi', 'rfq', 'tender'];
    
    return items.filter(item => {
      const combinedText = (item.title + ' ' + (item.description || '')).toLowerCase();
      
      // Check for Bangladesh mention
      if (!combinedText.includes('bangladesh')) {
        return false;
      }
      
      // Check for at least one keyword
      const hasKeyword = keywords.some(keyword => combinedText.includes(keyword));
      if (!hasKeyword) {
        return false;
      }
      
      // Check for document type in title/description
      const hasDocType = documentTypes.some(docType => combinedText.includes(docType));
      if (!hasDocType) {
        return false;
      }
      
      return true;
    });
  }

  static enrichTORData(item, config) {
    const combinedText = (item.title + ' ' + (item.description || '')).toLowerCase();
    
    // Extract document type
    let documentType = 'Other';
    if (combinedText.includes('terms of reference') || combinedText.includes('tor')) {
      documentType = 'ToR';
    } else if (combinedText.includes('request for proposal') || combinedText.includes('rfp')) {
      documentType = 'RFP';
    } else if (combinedText.includes('expression of interest') || combinedText.includes('eoi')) {
      documentType = 'EOI';
    } else if (combinedText.includes('request for quotation') || combinedText.includes('rfq')) {
      documentType = 'RFQ';
    } else if (combinedText.includes('tender')) {
      documentType = 'Tender';
    }
    
    // Extract keywords found
    const keywords = [
      'baseline', 'mid-term', 'midline', 'endline', 
      'final evaluation', 'impact evaluation', 'studies',
      'assessment', 'research', 'study', 'monitoring', 
      'consultancy', 'consultant', 'consulting'
    ].filter(keyword => combinedText.includes(keyword));
    
    // Generate summary
    const summary = this.generateSummary(item);
    
    // Calculate relevance score
    const relevanceScore = this.calculateRelevanceScore(combinedText, keywords.length);
    
    return {
      ...item,
      document_type: documentType,
      country: 'Bangladesh',
      keywords: keywords,
      summary: summary,
      relevance_score: relevanceScore,
      is_bangladesh: true,
      has_consulting_keywords: keywords.length > 0,
      raw_data: {
        title: item.title,
        description: item.description,
        organization: item.organization,
        scraped_at: item.scraped_at
      }
    };
  }

  static generateSummary(item) {
    const lines = [
      `Opportunity: ${item.title}`,
      `Organization: ${item.organization || 'Not specified'}`,
      item.deadline ? `Deadline: ${item.deadline}` : 'Deadline: Not specified',
      item.description ? `${item.description.substring(0, 200)}${item.description.length > 200 ? '...' : ''}` : 'No description available'
    ];
    
    return lines.join('\n');
  }

  static calculateRelevanceScore(text, keywordCount) {
    let score = 0;
    
    // Base score for Bangladesh mention
    if (text.includes('bangladesh')) {
      score += 30;
    }
    
    // Score for keywords
    score += (keywordCount * 10);
    
    // Bonus for specific document types
    if (text.includes('terms of reference') || text.includes('tor')) {
      score += 20;
    }
    
    // Bonus for evaluation keywords
    if (text.includes('evaluation')) {
      score += 15;
    }
    
    // Cap at 100
    return Math.min(score, 100);
  }

  static async processAndSaveTOR(torData) {
    try {
      // Generate unique hash
      const hashString = `${torData.title}_${torData.link}_${torData.source}_${torData.publish_date || ''}`;
      const uniqueHash = require('crypto').createHash('md5').update(hashString).digest('hex');
      
      // Check if exists
      const existing = await databaseService.torExists(uniqueHash);
      
      if (existing) {
        // Update existing
        const updated = await databaseService.updateTOR(existing.id, torData);
        return { 
          id: existing.id, 
          action: 'updated', 
          is_new: false,
          is_duplicate: await this.checkForDuplicates(existing.id, torData)
        };
      } else {
        // Insert new
        const inserted = await databaseService.insertTOR(torData, uniqueHash);
        return { 
          id: inserted.id, 
          action: 'inserted', 
          is_new: true,
          is_duplicate: false
        };
      }
    } catch (error) {
      console.error('Error processing ToR:', error);
      throw error;
    }
  }

  static async checkForDuplicates(torId, torData) {
    try {
      // Simple duplicate check based on title similarity
      const existingTors = await databaseService.db.all(
        `SELECT id, title FROM tors WHERE id != ? AND source = ?`,
        [torId, torData.source]
      );
      
      for (const existing of existingTors) {
        const similarity = this.calculateSimilarity(torData.title, existing.title);
        if (similarity > 0.8) { // 80% similarity threshold
          await databaseService.db.run(
            `UPDATE tors SET is_duplicate = TRUE, duplicate_of = ? WHERE id = ?`,
            [existing.id, torId]
          );
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error checking duplicates:', error);
      return false;
    }
  }

  static calculateSimilarity(str1, str2) {
    // Simple Jaccard similarity
    const words1 = new Set(str1.toLowerCase().split(/\W+/).filter(w => w.length > 2));
    const words2 = new Set(str2.toLowerCase().split(/\W+/).filter(w => w.length > 2));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  static async handlePagination($, config) {
    const allItems = [];
    let currentPage = 1;
    const maxPages = config.maxPages || 3;
    
    console.log(`📄 Starting pagination for ${config.name} (max ${maxPages} pages)`);
    
    while (currentPage < maxPages) {
      try {
        // Find next page link
        const nextPageUrl = this.findNextPageUrl($, config, currentPage);
        if (!nextPageUrl) {
          console.log('   No more pages found');
          break;
        }
        
        console.log(`   Fetching page ${currentPage + 1}: ${nextPageUrl}`);
        
        // Fetch next page
        const { data: nextHtml } = await axios.get(nextPageUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          timeout: 30000
        });
        
        const $$ = cheerio.load(nextHtml);
        
        // Extract items from next page
        $$(config.selectors.container).each((i, elem) => {
          const item = {};
          for (const [key, selector] of Object.entries(config.selectors)) {
            if (key === 'container') continue;
            item[key] = this.extractData($$, elem, selector);
          }
          item.source = config.name;
          item.scraped_at = new Date().toISOString();
          allItems.push(item);
        });
        
        console.log(`   Page ${currentPage + 1}: Found ${$$(config.selectors.container).length} items`);
        
        // Update $ for next iteration
        $ = $$;
        currentPage++;
        
        // Add delay to be polite
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.log(`   Stopping pagination at page ${currentPage}:`, error.message);
        break;
      }
    }
    
    console.log(`📚 Pagination complete: ${allItems.length} additional items across ${currentPage} pages`);
    return allItems;
  }

  static findNextPageUrl($, config, currentPage) {
    // Common pagination selectors
    const paginationSelectors = [
      `.pagination a[href*="page=${currentPage + 1}"]`,
      `.pagination a:contains("${currentPage + 1}")`,
      `a:contains("Next")`,
      `a[rel="next"]`,
      `.next-page`,
      `[aria-label="Next"]`
    ];
    
    for (const selector of paginationSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        const href = element.attr('href');
        if (href) {
          // Handle relative URLs
          return href.startsWith('http') ? href : new URL(href, config.url).href;
        }
      }
    }
    
    return null;
  }

  // Batch scraping for all websites
  static async scrapeAllWebsites() {
    const results = [];
    
    for (const websiteKey in websiteConfigs) {
      try {
        console.log(`\n=== Starting batch scrape for ${websiteConfigs[websiteKey].name} ===`);
        const result = await this.scrapeWebsite(websiteKey);
        results.push({
          website: websiteKey,
          ...result.results,
          success: true
        });
        
        // Add delay between websites to be polite
        await new Promise(resolve => setTimeout(resolve, 5000));
        
      } catch (error) {
        console.error(`Failed to scrape ${websiteKey}:`, error.message);
        results.push({
          website: websiteKey,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  // Test scraping for a single website
  static async testScrape(websiteKey) {
    try {
      console.log(`🧪 Testing scrape for: ${websiteKey}`);
      const config = websiteConfigs[websiteKey];
      
      if (!config) {
        throw new Error(`Website config not found for key: ${websiteKey}`);
      }
      
      // Quick test - just get first few items
      let testData = [];
      if (config.type === 'static') {
        const { data: html } = await axios.get(config.url, { timeout: 10000 });
        const $ = cheerio.load(html);
        
        // Just get first 3 items for testing
        $(config.selectors.container).slice(0, 3).each((i, elem) => {
          const item = {};
          for (const [key, selector] of Object.entries(config.selectors)) {
            if (key === 'container') continue;
            item[key] = this.extractData($, elem, selector);
          }
          testData.push(item);
        });
      }
      
      return {
        success: true,
        website: websiteKey,
        config_valid: true,
        items_found: testData.length,
        sample_data: testData.slice(0, 2), // Return first 2 items as sample
        selectors_working: testData.length > 0
      };
      
    } catch (error) {
      return {
        success: false,
        website: websiteKey,
        error: error.message,
        config_valid: false
      };
    }
  }
}

// Initialize database service on import
databaseService.initialize().catch(console.error);
