import express from 'express';
const router = express.Router();

const mockTors = [
  {
    id: 1,
    unique_hash: 'hash1',
    source: 'World Bank',
    title: 'Consultancy for Education Project in Bangladesh',
    description: 'Looking for consultants for a large-scale education project...',
    publish_date: '2024-02-01',
    deadline: '2024-03-15',
    link: 'https://procurement-notices.undp.org/view_opportunity/1',
    organization: 'World Bank',
    country: 'Bangladesh',
    category: 'Education',
    budget_range: '$500,000 - $1,000,000',
    reference_no: 'WB-EDU-2024-001',
    is_read: false,
    is_favorite: false,
    scraped_at: '2024-02-01T10:30:00Z'
  },
  {
    id: 2,
    unique_hash: 'hash2',
    source: 'UNDP',
    title: 'Climate Change Adaptation Research',
    description: 'Research consultancy for climate change adaptation strategies...',
    publish_date: '2024-02-05',
    deadline: '2024-03-20',
    link: 'https://jobs.undp.org/cj_view_job.cfm?cur_job_id=12345',
    organization: 'UNDP',
    country: 'Global',
    category: 'Environment',
    budget_range: '$200,000 - $500,000',
    reference_no: 'UNDP-ENV-2024-002',
    is_read: true,
    is_favorite: true,
    scraped_at: '2024-02-05T14:20:00Z'
  },
  {
    id: 3,
    unique_hash: 'hash3',
    source: 'ADB',
    title: 'Infrastructure Development Advisor',
    description: 'Advisor needed for infrastructure development project...',
    publish_date: '2024-02-10',
    deadline: '2024-04-01',
    link: 'https://www.adb.org/projects/details/123',
    organization: 'Asian Development Bank',
    country: 'Philippines',
    category: 'Infrastructure',
    budget_range: '$1,000,000+',
    reference_no: 'ADB-INF-2024-003',
    is_read: false,
    is_favorite: false,
    scraped_at: '2024-02-10T09:15:00Z'
  }
];

router.get('/', (req, res) => {
  const { source, search } = req.query;
  let filteredTors = [...mockTors];
  
  if (source) {
    filteredTors = filteredTors.filter(tor => tor.source === source);
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    filteredTors = filteredTors.filter(tor => 
      tor.title.toLowerCase().includes(searchLower) ||
      tor.description.toLowerCase().includes(searchLower) ||
      tor.organization.toLowerCase().includes(searchLower)
    );
  }
  
  res.json({
    tors: filteredTors,
    stats: {
      total: mockTors.length,
      newToday: 1,
      expiringSoon: 1,
      bySource: {
        'World Bank': 1,
        'UNDP': 1,
        'ADB': 1
      }
    }
  });
});

router.get('/:id', (req, res) => {
  const tor = mockTors.find(t => t.id === parseInt(req.params.id));
  if (!tor) {
    return res.status(404).json({ error: 'ToR not found' });
  }
  res.json({ tor });
});

router.post('/:id/read', (req, res) => {
  res.json({ message: 'ToR marked as read' });
});

router.post('/:id/favorite', (req, res) => {
  res.json({ message: 'Favorite status updated', is_favorite: true });
});

export default router;
