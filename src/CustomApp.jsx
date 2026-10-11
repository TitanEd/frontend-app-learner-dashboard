import React from 'react';
import { Helmet } from 'react-helmet';

import { useIntl } from '@edx/frontend-platform/i18n';

import { ErrorPage } from '@edx/frontend-platform/react';
import { Alert } from '@openedx/paragon';

import CustomDashboard from 'containers/Dashboard/CustomDashboard';

import AppWrapper from 'containers/AppWrapper';

import { getConfig } from '@edx/frontend-platform';
import { useInitializeLearnerHome } from 'data/hooks';
import { useMasquerade } from 'data/context';
import messages from './messages';
import './App.scss';

export const CustomApp = () => {
  const { formatMessage } = useIntl();
  const { masqueradeUser } = useMasquerade();
  const { data, isError } = useInitializeLearnerHome();
  const hasNetworkFailure = !masqueradeUser && isError;
  const supportEmail = data?.platformSettings?.supportEmail || undefined;

  return (
    <>
      <Helmet>
        <title>{formatMessage(messages.pageTitle)}</title>
        <link rel="shortcut icon" href={getConfig().FAVICON_URL} type="image/x-icon" />
      </Helmet>
      <div>
        <AppWrapper>
          <main id="main">
            {hasNetworkFailure
              ? (
                <Alert variant="danger">
                  <ErrorPage message={formatMessage(messages.errorMessage, { supportEmail })} />
                </Alert>
              ) : (
                <CustomDashboard />
              )}
          </main>
        </AppWrapper>
      </div>
    </>
  );
};

export default CustomApp;
