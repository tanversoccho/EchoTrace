// backend/config/websites.js
export const websiteConfigs = {
  bdjobs: {
    name: 'BDJobs',
    url: 'https://www.bdjobs.com/',
    type: 'static', // Uses Cheerio
    selectors: {
      container: '.job-item', // Parent element for each job
      title: '.job-title a',
      description: '.job-desc',
      publishDate: '.post-time',
      deadline: '.deadline',
      link: '.job-title a@href'
    },
    pagination: true
  },
  worldbank: {
    name: 'World Bank',
    url: 'https://procurement-notices.undp.org/',
    type: 'dynamic', // Requires Puppeteer
    requiresLogin: true,
    selectors: {
      container: '.notice-item',
      title: 'h3 a',
      reference: '.reference-no',
      deadline: '.deadline-date',
      link: 'h3 a@href'
    }
  },
  // Add configurations for ADB, UNDP, UNGM, UNHCR, etc. here.
};
