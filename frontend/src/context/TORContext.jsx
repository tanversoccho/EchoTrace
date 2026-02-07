import React, { createContext, useState, useContext, useCallback } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { toast } from 'react-hot-toast';

const TORContext = createContext();

export const useTOR = () => {
  const context = useContext(TORContext);
  if (!context) {
    throw new Error('useTOR must be used within TORProvider');
  }
  return context;
};

export const TORProvider = ({ children }) => {
  const [tors, setTors] = useState([]);
  const [filteredTors, setFilteredTors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    newToday: 0,
    expiringSoon: 0,
    bySource: {},
    byCategory: {}
  });
  const [filters, setFilters] = useState({
    source: [],
    category: [],
    dateRange: { start: null, end: null },
    keywords: '',
    hasDeadline: false
  });

  // WebSocket for real-time updates
  const { sendMessage, isConnected } = useWebSocket({
    onMessage: (data) => {
      if (data.type === 'new_tor') {
        handleNewTOR(data.tor);
      } else if (data.type === 'scraping_update') {
        handleScrapingUpdate(data.update);
      }
    }
  });

  const handleNewTOR = useCallback((newTor) => {
    setTors(prev => [newTor, ...prev]);
    setStats(prev => ({
      ...prev,
      total: prev.total + 1,
      newToday: prev.newToday + 1,
      bySource: {
        ...prev.bySource,
        [newTor.source]: (prev.bySource[newTor.source] || 0) + 1
      }
    }));
    
    toast.success(`New ToR found: ${newTor.title}`, {
      duration: 5000,
      position: 'bottom-right'
    });
  }, []);

  const handleScrapingUpdate = useCallback((update) => {
    if (update.status === 'error') {
      toast.error(`Scraping error: ${update.message}`);
    } else if (update.status === 'completed') {
      toast.success(`Scraping completed: ${update.source}`);
    }
  }, []);

  // const fetchTORs = useCallback(async (params = {}) => {
  //   setLoading(true);
  //   try {
  //     const query = new URLSearchParams(params).toString();
  //     const response = await fetch(`http://localhost:5000/api/tors?${query}`);
  //     const data = await response.json();
  //     setTors(data.tors || []);
  //     setStats(data.stats || {
  //       total: 0,
  //       newToday: 0,
  //       expiringSoon: 0,
  //       bySource: {},
  //       byCategory: {}
  //     });
  //     applyFilters(data.tors || [], filters);
  //   } catch (error) {
  //     console.error('Failed to fetch ToRs:', error);
  //     toast.error('Failed to fetch ToRs');
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [filters]);

    // In TORContext.jsx, update fetchTORs
  // In src/context/TORContext.jsx
  const fetchTORs = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const query = new URLSearchParams(params).toString();
      const response = await fetch(`http://localhost:5000/api/db/tors?${query}`);
      const data = await response.json();
      if (data.success) {
        setTors(data.tors);
        setStats({
          total: data.stats.total || 0,
          newToday: data.stats.new_count || 0,
          expiringSoon: data.stats.expiring_soon || 0,
          bySource: data.stats.by_source?.reduce((acc, item) => {
            acc[item.source] = item.count;
            return acc;
          }, {}) || {},
          byType: data.stats.by_type?.reduce((acc, item) => {
            acc[item.document_type] = item.count;
            return acc;
          }, {}) || {}
        });
      }
    } catch (error) {
      console.error('Failed to fetch ToRs:', error);
      toast.error('Failed to fetch ToRs');
    } finally {
      setLoading(false);
    }
  }, []);

  const applyFilters = useCallback((data, filterConfig) => {
    let filtered = [...data];
    
    if (filterConfig.source.length > 0) {
      filtered = filtered.filter(tor => filterConfig.source.includes(tor.source));
    }
    
    if (filterConfig.category.length > 0) {
      filtered = filtered.filter(tor => filterConfig.category.includes(tor.category));
    }
    
    if (filterConfig.keywords) {
      const keywords = filterConfig.keywords.toLowerCase();
      filtered = filtered.filter(tor => 
        tor.title?.toLowerCase().includes(keywords) ||
        tor.description?.toLowerCase().includes(keywords) ||
        tor.organization?.toLowerCase().includes(keywords)
      );
    }
    
    if (filterConfig.hasDeadline) {
      filtered = filtered.filter(tor => tor.deadline);
    }
    
    if (filterConfig.dateRange.start && filterConfig.dateRange.end) {
      filtered = filtered.filter(tor => {
        const publishDate = new Date(tor.publish_date);
        return publishDate >= filterConfig.dateRange.start &&
               publishDate <= filterConfig.dateRange.end;
      });
    }
    
    setFilteredTors(filtered);
  }, []);

  const updateFilters = useCallback((newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    applyFilters(tors, updatedFilters);
  }, [tors, filters, applyFilters]);

  const markAsRead = useCallback(async (torId) => {
    try {
      await fetch(`http://localhost:5000/api/tors/${torId}/read`, { method: 'POST' });
      setTors(prev => prev.map(tor => 
        tor.id === torId ? { ...tor, is_read: true } : tor
      ));
    } catch (error) {
      console.error('Failed to mark as read:', error);
      toast.error('Failed to mark as read');
    }
  }, []);

  const markAsFavorite = useCallback(async (torId) => {
    try {
      await fetch(`http://localhost:5000/api/tors/${torId}/favorite`, { method: 'POST' });
      setTors(prev => prev.map(tor => 
        tor.id === torId ? { ...tor, is_favorite: !tor.is_favorite } : tor
      ));
    } catch (error) {
      console.error('Failed to update favorite status:', error);
      toast.error('Failed to update favorite status');
    }
  }, []);

  const value = {
    tors,
    filteredTors,
    loading,
    stats,
    filters,
    fetchTORs,
    updateFilters,
    markAsRead,
    markAsFavorite,
    sendMessage,
    isConnected
  };

  return (
    <TORContext.Provider value={value}>
      {children}
    </TORContext.Provider>
  );
};

export default TORContext;
