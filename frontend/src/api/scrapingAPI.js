import api from './axiosConfig'

export const scrapingAPI = {
  // Get all configured websites
  getWebsites: () => api.get('/scraping/websites'),
  
  // Get website by ID
  getWebsite: (id) => api.get(`/scraping/websites/${id}`),
  
  // Add new website
  addWebsite: (data) => api.post('/scraping/websites', data),
  
  // Update website configuration
  updateWebsite: (id, data) => api.put(`/scraping/websites/${id}`, data),
  
  // Delete website
  deleteWebsite: (id) => api.delete(`/scraping/websites/${id}`),
  
  // Test website scraping
  testWebsite: (id) => api.post(`/scraping/websites/${id}/test`),
  
  // Get scraping jobs
  getJobs: (params) => api.get('/scraping/jobs', { params }),
  
  // Create scraping job
  createJob: (data) => api.post('/scraping/jobs', data),
  
  // Update scraping job
  updateJob: (id, data) => api.put(`/scraping/jobs/${id}`, data),
  
  // Delete scraping job
  deleteJob: (id) => api.delete(`/scraping/jobs/${id}`),
  
  // Start scraping job
  startJob: (id) => api.post(`/scraping/jobs/${id}/start`),
  
  // Stop scraping job
  stopJob: (id) => api.post(`/scraping/jobs/${id}/stop`),
  
  // Get scraping logs
  getLogs: (params) => api.get('/scraping/logs', { params }),
  
  // Get scraping statistics
  getStatistics: () => api.get('/scraping/statistics'),
  
  // Clear scraping cache
  clearCache: () => api.post('/scraping/clear-cache'),
  
  // Get scraping schedule
  getSchedule: () => api.get('/scraping/schedule'),
  
  // Update scraping schedule
  updateSchedule: (data) => api.put('/scraping/schedule', data),
  
  // Get 2FA status for website
  get2FAStatus: (websiteId) => api.get(`/scraping/websites/${websiteId}/2fa-status`),
  
  // Update 2FA credentials
  update2FACredentials: (websiteId, data) => 
    api.put(`/scraping/websites/${websiteId}/2fa`, data),
}

export const scrapingSocketAPI = {
  // WebSocket events for real-time updates
  events: {
    NEW_TOR: 'new_tor',
    SCRAPING_STARTED: 'scraping_started',
    SCRAPING_COMPLETED: 'scraping_completed',
    SCRAPING_ERROR: 'scraping_error',
    SCRAPING_PROGRESS: 'scraping_progress',
    WEBSITE_STATUS_CHANGE: 'website_status_change',
  },
  
  // Connect to scraping WebSocket
  connect: (token) => {
    const ws = new WebSocket(
      // eslint-disable-next-line no-undef
      `${process.env.REACT_APP_WS_URL || 'ws://localhost:5000'}/scraping?token=${token}`
    )
    return ws
  },
}
