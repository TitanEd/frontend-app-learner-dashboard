import { useState, useEffect } from 'react';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';

const useWidgets = () => {
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWidgets = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if we're in local development mode
        const isLocal = process.env.NODE_ENV !== 'prod' && process.env.NODE_ENV !== 'production';

        if (isLocal) {
          // Use mock API for local development
          console.log('Fetching widgets from: http://localhost:3003/widgets');
          const response = await fetch('http://localhost:3003/widgets');
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          console.log('Widgets data received:', data);
          setWidgets(data || []);
        } else {
          // Use real API endpoints
          const baseUrl = `${getConfig().LMS_BASE_URL}/titaned/api/v1/dashboard`;
          const client = getAuthenticatedHttpClient();

          // Fetch widgets from multiple endpoints
          const [widgetsRes, chartsRes, contentRes] = await Promise.allSettled([
            client.get(`${baseUrl}/widgets`),
            client.get(`${baseUrl}/charts`),
            client.get(`${baseUrl}/content-widgets`),
          ]);

          const allWidgets = [];

          // Process widgets endpoint
          if (widgetsRes.status === 'fulfilled' && widgetsRes.value.data) {
            allWidgets.push(...widgetsRes.value.data);
          }

          // Process charts endpoint
          if (chartsRes.status === 'fulfilled' && chartsRes.value.data) {
            allWidgets.push(...chartsRes.value.data);
          }

          // Process content widgets endpoint
          if (contentRes.status === 'fulfilled' && contentRes.value.data) {
            allWidgets.push(...contentRes.value.data);
          }

          setWidgets(allWidgets);
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
  }, []);

  const refreshWidgets = async () => {
    // Force refresh widgets data
    const isLocal = process.env.NODE_ENV !== 'prod' && process.env.NODE_ENV !== 'production';

    try {
      if (isLocal) {
        const response = await fetch('http://localhost:3003/widgets');
        const data = await response.json();
        setWidgets(data || []);
      } else {
        const baseUrl = `${getConfig().LMS_BASE_URL}/titaned/api/v1/dashboard`;
        const client = getAuthenticatedHttpClient();
        const response = await client.get(`${baseUrl}/widgets`);
        setWidgets(response.data);
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
