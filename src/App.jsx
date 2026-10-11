import React from 'react';
import { Helmet } from 'react-helmet';

import { useIntl } from '@edx/frontend-platform/i18n';

import { ErrorPage } from '@edx/frontend-platform/react';
import { FooterSlot } from '@edx/frontend-component-footer';
import { Alert } from '@openedx/paragon';

import Dashboard from 'containers/Dashboard';

import AppWrapper from 'containers/AppWrapper';
import LearnerDashboardHeader from 'containers/LearnerDashboardHeader';

import { getConfig } from '@edx/frontend-platform';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { useInitializeLearnerHome } from 'data/hooks';
import { useMasquerade } from 'data/context';
import messages from './messages';
import './App.scss';

export const App = () => {
  const [ready, setReady] = React.useState(false);
  const { formatMessage } = useIntl();
  const { masqueradeUser } = useMasquerade();
  const { data, isError } = useInitializeLearnerHome();
  const hasNetworkFailure = !masqueradeUser && isError;
  const supportEmail = data?.platformSettings?.supportEmail || undefined;

  // Performance fix: Show skeleton first, defer ALL operations
  React.useEffect(() => {
    const timer = setTimeout(() => setReady(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Performance hack: Show lightweight skeleton first
  if (!ready) {
    return (
      <div style={{ padding: '20px', minHeight: '100vh' }}>
        <div style={{
          height: '60px', backgroundColor: '#f0f0f0', borderRadius: '4px', marginBottom: '20px',
        }}
        />
        <div style={{
          height: '400px', backgroundColor: '#f0f0f0', borderRadius: '8px', marginBottom: '20px',
        }}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ height: '300px', backgroundColor: '#f0f0f0', borderRadius: '8px' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{formatMessage(messages.pageTitle)}</title>
        <link rel="shortcut icon" href={getConfig().FAVICON_URL} type="image/x-icon" />
      </Helmet>
      <div>
        <AppWrapper>
          <PluginSlot id="header_footer_hide_plugin_slot">
            <LearnerDashboardHeader />
          </PluginSlot>
          <main id="main">
            {hasNetworkFailure
              ? (
                <Alert variant="danger">
                  <ErrorPage message={formatMessage(messages.errorMessage, { supportEmail })} />
                </Alert>
              ) : (
                <Dashboard />
              )}
          </main>
        </AppWrapper>
        <PluginSlot id="header_footer_hide_plugin_slot">
          <FooterSlot />
        </PluginSlot>
      </div>
    </>
  );
};

export default App;
