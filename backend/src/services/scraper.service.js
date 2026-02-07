// backend/src/services/scraper.service.js
import axios from 'axios';
import cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import { websiteConfigs } from '../config/websites.js';

export class ScraperService {
  static async scrapeWebsite(websiteKey) {
    const config = websiteConfigs[websiteKey];
    if (!config) throw new Error(`Config for ${websiteKey} not found`);

    console.log(`Starting scrape for: ${config.name}`);

    let data = [];
    if (config.type === 'static') {
      data = await this.scrapeWithCheerio(config);
    } else if (config.type === 'dynamic') {
      data = await this.scrapeWithPuppeteer(config);
    }

    console.log(`Found ${data.length} items from ${config.name}`);
    return data;
  }

  static async scrapeWithCheerio(config) {
    const { data: html } = await axios.get(config.url);
    const $ = cheerio.load(html);
    const items = [];

    $(config.selectors.container).each((i, elem) => {
      const item = {};
      for (const [key, selector] of Object.entries(config.selectors)) {
        if (key === 'container') continue;
        item[key] = this.extractData($, elem, selector);
      }
      item.source = config.name;
      item.scrapedAt = new Date().toISOString();
      items.push(item);
    });
    return items;
  }

  static async scrapeWithPuppeteer(config) {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto(config.url, { waitUntil: 'networkidle2' });

    // Add logic here for login if config.requiresLogin is true

    const data = await page.evaluate((selectors) => {
      const items = [];
      document.querySelectorAll(selectors.container).forEach(elem => {
        const item = {};
        item.title = elem.querySelector(selectors.title)?.innerText;
        item.link = elem.querySelector(selectors.title)?.href;
        // ... extract other fields
        items.push(item);
      });
      return items;
    }, config.selectors);

    await browser.close();
    return data.map(item => ({
      ...item,
      source: config.name,
      scrapedAt: new Date().toISOString()
    }));
  }

  static extractData($, elem, selector) {
    // ... helper to get text or attribute (like href)
  }
}
