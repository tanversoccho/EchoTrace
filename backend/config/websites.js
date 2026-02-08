
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
    type: 'dynamic',
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
  
  pksf: {
    name: 'Palli Karma-Sahayak Foundation',
    url: 'https://pksf.org.bd',
    type: 'static',
    searchPath: '/category/tender/',
    selectors: {
      container: 'article.post',
      title: 'h2.entry-title a',
      description: '.entry-content',
      date: '.posted-on',
      link: 'h2.entry-title a@href',
      category: '.cat-links'
    }
  },
  
  carebangladesh: {
    name: 'Care Bangladesh',
    url: 'https://www.carebangladesh.org',
    type: 'static',
    searchPath: '/consultancy',
    selectors: {
      container: '.job-item, article',
      title: 'h3 a, h2 a',
      description: '.job-description, .entry-content',
      deadline: '.deadline-date',
      link: 'h3 a@href, h2 a@href',
      location: '.job-location'
    }
  },
  
  adb: {
    name: 'Asian Development Bank',
    url: 'https://www.adb.org',
    type: 'dynamic',
    requiresLogin: false,
    searchPath: '/projects/country/bangladesh',
    selectors: {
      container: '.project-item, .result-item',
      title: '.title a, h3 a',
      description: '.description',
      country: '.country',
      link: '.title a@href, h3 a@href',
      status: '.status',
      sector: '.sector'
    },
    filters: {
      country: 'Bangladesh'
    }
  },
 
  worldbank: {
    name: 'World Bank',
    url: 'https://projects.worldbank.org',
    type: 'dynamic',
    requiresLogin: false,
    searchPath: '/en/projects-operations/projects-list?os=0&countryshortname_exact=Bangladesh',
    selectors: {
      container: '.project-item, .search-result-item',
      title: '.project-title a, h3 a',
      description: '.project-description',
      id: '.project-id',
      link: '.project-title a@href, h3 a@href',
      approvalDate: '.approval-date',
      commitmentAmount: '.commitment-amount'
    }
  },
  
  unoops: {
    name: 'UNOPS Procurement',
    url: 'https://www.ungm.org',
    type: 'dynamic',
    requiresLogin: false,
    searchPath: '/Public/Notice?agencyEnglishAbbreviation=UNOPS',
    selectors: {
      container: '.notice-item',
      title: '.notice-title a',
      organization: '.organization',
      deadline: '.submission-date',
      link: '.notice-title a@href',
      country: '.country',
      noticeType: '.notice-type'
    }
  },
  
  undp: {
    name: 'UNDP Procurement',
    url: 'https://procurement-notices.undp.org',
    type: 'dynamic',
    requiresLogin: false,
    searchPath: '/',
    selectors: {
      container: '.notice-item, .procurement-notice',
      title: '.title a, h3 a',
      deadline: '.deadline-date',
      link: '.title a@href, h3 a@href',
      country: '.country',
      reference: '.reference-no',
      publishedDate: '.published-date'
    }
  },
  
  unbangladesh: {
    name: 'UN Bangladesh',
    url: 'https://bangladesh.un.org',
    type: 'static',
    searchPath: '/en/jobs',
    selectors: {
      container: '.job-item, .vacancy',
      title: '.job-title a',
      organization: '.organization',
      location: '.job-location',
      deadline: '.application-deadline',
      link: '.job-title a@href',
      level: '.job-level'
    },
    filters: {
      location: 'Bangladesh'
    }
  }
};