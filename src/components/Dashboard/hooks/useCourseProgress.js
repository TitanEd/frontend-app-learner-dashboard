/* eslint-disable camelcase */
import { useState, useEffect } from 'react';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';

/**
 * Custom hook to fetch course progress data from the API
 * @param {string} courseId - The course ID to fetch progress for
 * @returns {Object} - { progress, loading, error }
 */
export const useCourseProgress = (courseId) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!courseId) {
      setProgress(null);
      return;
    }

    const fetchProgress = async () => {
      setLoading(true);
      setError(null);

      try {
        // Use the same pattern as the existing code
        const baseUrl = getConfig().LMS_BASE_URL || 'http://local.openedx.io:8000';
        const progressUrl = `${baseUrl}/api/course_home/progress/${courseId}`;

        const client = getAuthenticatedHttpClient();
        const response = await client.get(progressUrl);

        const progressData = response.data;

        // Calculate progress percentage using the same logic as provided
        const { completion_summary } = progressData;
        if (completion_summary) {
          const { complete_count, incomplete_count, locked_count } = completion_summary;
          const numTotalUnits = complete_count + incomplete_count + locked_count;

          const completePercentage = (numTotalUnits > 0 && complete_count)
            ? Number(((complete_count / numTotalUnits) * 100).toFixed(0))
            : 0;

          setProgress({
            percentage: completePercentage,
            completeCount: complete_count,
            incompleteCount: incomplete_count,
            lockedCount: locked_count,
            totalUnits: numTotalUnits,
            rawData: progressData,
          });
        } else {
          setProgress({
            percentage: 0, completeCount: 0, incompleteCount: 0, lockedCount: 0, totalUnits: 0,
          });
        }
      } catch (err) {
        setError(err);
        // Set default progress on error
        setProgress({
          percentage: 0, completeCount: 0, incompleteCount: 0, lockedCount: 0, totalUnits: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [courseId]);

  return { progress, loading, error };
};

export default useCourseProgress;
