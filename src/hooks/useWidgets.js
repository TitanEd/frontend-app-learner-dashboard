import { useState, useEffect } from 'react';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';

const useWidgets = () => {
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simple flag to switch between mock and real API
  const isLocal = false; // Set to false to use real API

  useEffect(() => {
    const fetchWidgets = async () => {
      try {
        setLoading(true);
        setError(null);

        if (isLocal) {
          // Mock API
          const response = await fetch('http://localhost:3003/widgets');
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setWidgets(data || []);
        } else {
          // Real API
          const client = getAuthenticatedHttpClient();
          const baseUrl = `${getConfig().LMS_BASE_URL}/titaned/api/v1/instructor-dashboard`;
          const response = await client.get(`${baseUrl}/widgets`);
          setWidgets(response.data || []);
        }
      } catch (err) {
        console.error('Error fetching widgets:', err);
        setError(err.message);
        // Set fallback widgets in case of error
        setWidgets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWidgets();
  }, [isLocal]);

  const refreshWidgets = async () => {
    try {
      if (isLocal) {
        // Mock API
        const response = await fetch('http://localhost:3003/widgets');
        const data = await response.json();
        setWidgets(data || []);
      } else {
        // Real API
        const client = getAuthenticatedHttpClient();
        const baseUrl = `${getConfig().LMS_BASE_URL}/titaned/api/v1/instructor-dashboard`;
        const response = await client.get(`${baseUrl}/widgets`);
        setWidgets(response.data || []);
      }
    } catch (err) {
      console.error('Error refreshing widgets:', err);
      setError(err.message);
    }
  };

  return {
    widgets,
    loading,
    error,
    refreshWidgets,
  };
};

export default useWidgets;
