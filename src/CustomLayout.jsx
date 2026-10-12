/* eslint-disable no-console */
import React, { useContext, useEffect, useState } from 'react';

import { Spinner } from '@openedx/paragon';
import { Home, LmsBook } from '@openedx/paragon/icons';
import {
  Navigate, Outlet, Route, Routes, useLocation, useNavigate,
} from 'react-router-dom';
// Installed from package.json. Run npm install before lint/build if this stays unresolved.
// eslint-disable-next-line import/no-unresolved
import { MainHeader, Sidebar, SidebarProvider } from 'titaned-frontend-library';

import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { useIntl } from '@edx/frontend-platform/i18n';
import { AppContext, PageWrap } from '@edx/frontend-platform/react';

import CustomApp from './CustomApp';
import CustomHomeDashboard from './components/CustomHomeDashboard';
import messages from './customMessages';
import customGetUserMenuItems from './utils/customGetUserMenuItems';
import registerFontAwesomeIcons from './utils/RegisterFontAwesome';
import HeaderExtras, { headerUser } from './customHeaderExtras';

// Custom UI styles load after the stock Verawood styles (as in the previous
// version), so on equal specificity the custom rules win.
import('titaned-frontend-library/dist/index.css');
import('./styles/styles-overrides.scss');
import('./styles/custom-layout.scss');

// Font Awesome icons used by the custom dashboard widgets (was done in index.jsx before).
registerFontAwesomeIcons();

// Design tokens for the custom UI are scoped to this class
// (tels-brand-openedx paragon/custom_learner-dashboard.scss).
const CUSTOM_UI_CLASS = 'tels-custom-learner-dashboard';

const DEFAULT_MENU_CONFIG = {
  enabled_re_sync: false,
  enable_switch_to_learner: false,
  enable_help_center: false,
  language_selector_is_enabled: false,
  notification_is_enabled: false,
  enabled_languages: [],
};

const fetchNavigationItems = async () => {
  try {
    const response = await getAuthenticatedHttpClient().get(`${getConfig().STUDIO_BASE_URL}/titaned/api/v1/menu-config/`);
    if (response.status !== 200) {
      throw new Error('Failed to fetch Navigation Items');
    }
    return response.data;
  } catch (error) {
    console.warn('Failed to fetch navigation items, using defaults:', error);
    return DEFAULT_MENU_CONFIG;
  }
};

const CustomLayoutShell = () => {
  const { authenticatedUser, config } = useContext(AppContext);
  const intl = useIntl();
  const location = useLocation();
  const navigate = useNavigate();

  const [loadingSidebar, setLoadingSidebar] = useState(true);
  const [headerButtons, setHeaderButtons] = useState({});
  const [languageSelectorList, setLanguageSelectorList] = useState([]);
  const [userMenuItemsFromAPI, setUserMenuItemsFromAPI] = useState({});

  // Sidebar items are pages of this MFE (see CustomLayout routes below).
  const sidebarItems = [
    {
      label: intl.formatMessage(messages.sidebarDashboardTitle),
      path: '/',
      icon: <Home />,
    },
    {
      label: intl.formatMessage(messages.sidebarMyCoursesTitle),
      path: '/my-courses',
      icon: <LmsBook />,
    },
  ];

  useEffect(() => {
    document.documentElement.classList.add(CUSTOM_UI_CLASS);
    document.body.classList.add(CUSTOM_UI_CLASS);
    return () => {
      document.documentElement.classList.remove(CUSTOM_UI_CLASS);
      document.body.classList.remove(CUSTOM_UI_CLASS);
    };
  }, []);

  useEffect(() => {
    const fetchUserMenu = async () => {
      try {
        const response = await getAuthenticatedHttpClient().get(
          `${getConfig().LMS_BASE_URL}/titaned/api/v1/user-dropdown-menu/`,
        );
        if (response.data) { setUserMenuItemsFromAPI(response.data); }
      } catch (err) {
        console.error('Failed to load user menu from API', err);
        setUserMenuItemsFromAPI({});
      }
    };
    fetchUserMenu();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchMenu = async () => {
      const menuConfig = await fetchNavigationItems();
      if (isMounted) {
        setHeaderButtons({
          reSync: menuConfig.enabled_re_sync || false,
          contextSwitcher: menuConfig.enable_switch_to_learner || false,
          help: menuConfig.enable_help_center || false,
          translation: menuConfig.language_selector_is_enabled || false,
          notification: menuConfig.notification_is_enabled || false,
        });
        setLanguageSelectorList(menuConfig.enabled_languages || []);
        setLoadingSidebar(false);
      }
    };

    fetchMenu();

    return () => {
      isMounted = false;
    };
  }, []);

  // Full name and profile picture, as the header shows them (customHeaderExtras.jsx).
  const updatedAuthenticatedUser = headerUser(authenticatedUser, userMenuItemsFromAPI);

  const userMenuItems = customGetUserMenuItems({
    intl,
    logoutUrl: config.LOGOUT_URL,
    authenticatedUser: updatedAuthenticatedUser,
    userMenuItemsFromAPI,
  });

  const handleLanguageChange = () => {
    window.location.reload();
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className={`app-container ${CUSTOM_UI_CLASS}`}>
      <SidebarProvider>
        <div className="header-container">
          <MainHeader
            logoUrl={config.LOGO_URL}
            authenticatedUser={updatedAuthenticatedUser}
            userMenuItems={userMenuItems}
            onLanguageChange={handleLanguageChange}
            headerButtons={headerButtons}
            languageSelectorList={languageSelectorList}
          />
          <HeaderExtras />
        </div>
        <div className="content-wrapper">
          <div className="sidebar-container">
            {loadingSidebar ? (
              <div
                className="sidebar-loading d-flex justify-content-center"
                role="status"
                aria-live="polite"
              >
                <Spinner
                  animation="border"
                  variant="primary"
                  screenReaderText={intl.formatMessage(messages.sidebarLoading)}
                />
              </div>
            ) : (
              <Sidebar
                buttons={sidebarItems}
                onNavigate={handleNavigate}
                presentPath={location.pathname}
              />
            )}
          </div>
          <div className="main-content">
            <div className="page-content">
              <main id="main" tabIndex={-1}>
                <Outlet />
              </main>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

// Learner dashboard routes in the custom shell: home dashboard and My Courses.
const CustomLayout = () => (
  <Routes>
    <Route element={<CustomLayoutShell />}>
      <Route path="/" element={<PageWrap><CustomHomeDashboard /></PageWrap>} />
      <Route path="/my-courses" element={<PageWrap><CustomApp /></PageWrap>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>
);

export default CustomLayout;
