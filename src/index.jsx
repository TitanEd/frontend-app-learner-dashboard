/* eslint-disable no-console */
/* eslint-disable import/prefer-default-export */
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import {
  Route, Navigate, Routes,
} from 'react-router-dom';

import {
  AppProvider,
  ErrorPage,
  PageWrap,
} from '@edx/frontend-platform/react';
import { getMessages, IntlProvider } from '@edx/frontend-platform/i18n';
import store from 'data/store';
import {
  APP_READY,
  APP_INIT_ERROR,
  initialize,
  subscribe,
  mergeConfig,
  getConfig,
} from '@edx/frontend-platform';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { configuration } from './config';

import messages from './i18n';

import registerFontAwesomeIcons from './utils/RegisterFontAwesome';
import App from './App';
import NoticesWrapper from './components/NoticesWrapper';
import HomeDashboard from './components/Dashboard';
import './index.scss';

// import 'titaned-lib/dist/index.css';
// import './styles/styles-overrides.scss';
import Layout from './Layout';
import { applyTheme } from './styles/themeLoader';

// Load styles only for new UI
const loadStylesForNewUI = (isOldUI) => {
  document.body.className = isOldUI ? 'old-ui' : 'new-ui';
  document.documentElement.className = isOldUI ? 'old-ui' : 'new-ui';

  if (!isOldUI) {
    import('titaned-frontend-library/dist/index.css');
    import('./styles/styles-overrides.scss');
  } else {
    import('./styles/old-ui.scss');
  }
};

registerFontAwesomeIcons();

// Main App component with state management
const MainApp = () => {
  const [oldUI, setOldUI] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuConfig, setMenuConfig] = useState(null);

  // Load UI preference and menu config in one API call to avoid race conditions
  useEffect(() => {
    const loadUIPreferenceAndMenuConfig = async () => {
      try {
        // First, load from localStorage for immediate display
        const localStorageValue = localStorage.getItem('oldUI') || 'false';
        setOldUI(localStorageValue);
        setLoading(false);

        // Then, fetch both UI preference and menu config in one API call
        const response = await getAuthenticatedHttpClient().get(`${getConfig().STUDIO_BASE_URL}/titaned/api/v1/menu-config/`);

        if (response.status === 200 && response.data) {
          setMenuConfig(response.data);

          // Extract UI preference from the same response
          const useNewUI = response.data.use_new_ui === true;
          const apiOldUIValue = !useNewUI ? 'true' : 'false';

          // Check if API response matches localStorage
          if (localStorageValue !== apiOldUIValue) {
            localStorage.setItem('oldUI', apiOldUIValue);
            // Reload page to re-run build-time config with correct localStorage
            window.location.reload();
          }
        } else {
          console.warn('API failed, using localStorage value and default menu config');
          setMenuConfig({}); // Set empty object as fallback
        }
      } catch (error) {
        console.error('API call failed, using localStorage value and default menu config:', error);
        setMenuConfig({}); // Set empty object as fallback
      }
    };

    loadUIPreferenceAndMenuConfig();
  }, []);

  // Apply theme from JSON
  useEffect(() => {
    if (oldUI === 'false') {
      applyTheme(); // Load default theme from /theme.json
    }
  }, [oldUI]);

  useEffect(() => {
    // Only load styles after we know the UI preference
    if (oldUI !== null) {
      loadStylesForNewUI(oldUI === 'true');
    }
  }, [oldUI]);

  // Show loading screen while UI preference is being fetched
  if (loading || menuConfig === null) {
    return (
      <div className="d-flex justify-content-center align-items-center flex-column vh-100">
        <div>Loading... Please wait...</div>
      </div>
    );
  }

  return (
    <AppProvider store={store}>
      <NoticesWrapper>
        <Routes>
          {oldUI === 'false' ? (
            <Route path="/" element={<Layout />}>
              {/* <Route path="/" element={<PageWrap><App /></PageWrap>} /> */}
              <Route path="/" element={<PageWrap><HomeDashboard /></PageWrap>} />
              <Route path="/my-courses" element={<PageWrap><App /></PageWrap>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          ) : (
            <>
              <Route path="/" element={<PageWrap><App /></PageWrap>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}

        </Routes>
      </NoticesWrapper>
    </AppProvider>
  );
};

subscribe(APP_READY, () => {
  ReactDOM.render(
    <IntlProvider locale={getConfig().language || 'en'} messages={getMessages()}>
      <MainApp />
    </IntlProvider>,
    document.getElementById('root'),
  );
});

subscribe(APP_INIT_ERROR, (error) => {
  ReactDOM.render(
    <ErrorPage message={error.message} />,
    document.getElementById('root'),
  );
});

export const appName = 'LearnerHomeAppConfig';

initialize({
  handlers: {
    config: () => {
      mergeConfig(configuration, appName);
    },
  },
  messages,
  requireAuthenticatedUser: true,
});
