export const websiteConfigs = {
  bdjobs: {
    name: 'BDJobs',
    url: 'https://www.bdjobs.com/',
    type: 'static',
    searchPath: '/jobs/search/?q=consultancy',
    selectors: {
      container: '.job-item',
      title: '.job-title a',
      organization: '.company-name',
      description: '.job-desc',
      deadline: '.deadline',
      link: '.job-title a@href',
      publishDate: '.post-time'
    }
  },
  
  ungm: {
    name: 'UN Global Marketplace',
    url: 'https://www.ungm.org/Public/Notice',
    type: 'dynamic', // Uses JavaScript
    requiresLogin: false,
    selectors: {
      container: '.notice-item',
      title: '.notice-title a',
      organization: '.organization',
      deadline: '.submission-date',
      link: '.notice-title a@href',
      country: '.country'
    },
    filters: {
      country: 'Bangladesh'
    }
  },
  
  cptu: {
    name: 'CPTU Bangladesh',
    url: 'https://bangla.cptu.gov.bd/advertisement-notices/advertisement-services.html',
    type: 'static',
    selectors: {
      container: '.notice-item',
      title: 'h3 a',
      reference: '.ref-no',
      deadline: '.submission-date',
      link: 'h3 a@href',
      type: '.notice-type'
    }
  },
  
  // Add your other sites here:
  worldbank: {
    name: 'World Bank',
    url: 'https://procurement-notices.undp.org/',
    type: 'dynamic',
    requiresLogin: true,
    selectors: {
      container: '.procurement-notice',
      title: 'h3 a',
      reference: '.reference-no',
      deadline: '.deadline-date',
      link: 'h3 a@href',
      country: '.country'
    }
  },
  
  adb: {
    name: 'Asian Development Bank',
    url: 'https://www.adb.org/projects/tenders',
    type: 'dynamic',
    requiresLogin: false,
    selectors: {
      container: '.tender-item',
      title: '.title a',
      deadline: '.submission-date',
      link: '.title a@href',
      country: '.country'
    }
  }
  // Add UNDP, UNHCR, Care Bangladesh, PKSF similarly
};
