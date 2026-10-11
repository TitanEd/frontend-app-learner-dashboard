import { useState, useEffect, useCallback } from 'react';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';

const normalizeList = (data) => {
  if (Array.isArray(data)) {
    return data;
  }
  if (Array.isArray(data?.results)) {
    return data.results;
  }
  if (Array.isArray(data?.widgets)) {
    return data.widgets;
  }
  if (Array.isArray(data?.data)) {
    return data.data;
  }
  return [];
};

const useWidgets = () => {
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isLocal = false;

  const fetchWidgets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (isLocal) {
        const response = await fetch('http://localhost:3003/widgets');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setWidgets(normalizeList(data));
      } else {
        const client = getAuthenticatedHttpClient();
        const baseUrl = `${getConfig().LMS_BASE_URL}/titaned/api/v1/lms-dashboard`;
        const response = await client.get(`${baseUrl}/widgets`);
        setWidgets(normalizeList(response.data));
      }
    } catch (err) {
      console.error('Error fetching widgets:', err);
      setError(err.message);
      setWidgets([]);
    } finally {
      setLoading(false);
    }
  }, [isLocal]);

  useEffect(() => {
    fetchWidgets();
  }, [fetchWidgets]);

  return {
    widgets,
    loading,
    error,
    refreshWidgets: fetchWidgets,
  };
};

export default useWidgets;
