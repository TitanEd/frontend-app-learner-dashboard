/* eslint-disable react/prop-types */
import { Button, Spinner } from '@openedx/paragon';
import { Search } from '@openedx/paragon/icons';
import React, { useState, useEffect } from 'react';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';

const CustomNoCoursesView = (props) => {
  const { formatMessage, messages, buttonHref } = props;
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmptyDashboardData = async () => {
      try {
        setLoading(true);
        const baseUrl = `${getConfig().LMS_BASE_URL}/titaned/api/v1/empty-dashboard/`;
        const client = getAuthenticatedHttpClient();
        const response = await client.get(baseUrl);

        if (response.status === 200 && response.data) {
          setApiData(response.data);
        }
        // If API fails, apiData remains null and we'll use default messages
      } catch {
        // Silently fail and use default messages
        // API failure is handled by apiData being null
      } finally {
        setLoading(false);
      }
    };

    fetchEmptyDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="text-center d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <Spinner
          animation="border"
          screenReaderText="Loading empty dashboard content..."
        />
      </div>
    );
  }

  const heading = apiData?.heading || formatMessage(messages.lookingForChallengePrompt);
  const subheading = apiData?.subheading || formatMessage(messages.exploreCoursesPrompt);

  const defaultButtonText = formatMessage(messages.exploreCoursesButton);
  const buttonText = apiData === null ? defaultButtonText : (apiData?.button_text || null);
  const buttonUrl = apiData?.button_url || buttonHref;

  const showButton = apiData === null || (buttonText && buttonText.trim() !== '');

  return (
    <div className="text-center">
      <h1>
        {heading}
      </h1>
      <p className="mb-4.5 mt-4.5">
        {subheading}
      </p>
      {showButton && (
        <Button
          variant="brand"
          as="a"
          href={buttonUrl}
          iconBefore={Search}
        >
          {buttonText}
        </Button>
      )}
    </div>
  );
};

export default CustomNoCoursesView;
