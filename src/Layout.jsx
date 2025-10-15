/* eslint-disable no-console */
import React, { useContext, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { MainHeader, Sidebar, SidebarProvider } from 'titaned-lib';
import { AppContext } from '@edx/frontend-platform/react';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { Spinner } from '@openedx/paragon';
import {
  Analytics, Assignment, Assistant, Calendar, FolderShared, Home, LibraryAdd, LibraryBooks, Lightbulb, LmsBook,
} from '@openedx/paragon/icons';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import getUserMenuItems from './utils/getUserMenuItems.ts';
import { setUIPreference } from './services/uiPreferenceService';
import messages from './messages';
// import { applyTheme } from './styles/themeLoader';

// API to fetch sidebar items
const fetchNavigationItems = async () => {
  try {
    const response = await getAuthenticatedHttpClient().get(`${getConfig().STUDIO_BASE_URL}/titaned/api/v1/menu-config/`);
    // const response = await getAuthenticatedHttpClient().get(
    //   'https://staging.titaned.com/titaned/api/v1/menu-config/'
    // );

    // https://staging.titaned.com
    if (response.status !== 200) {
      throw new Error('Failed to fetch Navigation Items');
    }

    return response.data;
  } catch (error) {
    console.warn('Failed to fetch navigation items, using defaults:', error);
    // Return default values when API fails
    return {
      allow_to_create_new_course: false,
      show_class_planner: false,
      show_insights_and_reports: false,
      assistant_is_enabled: false,
      resources_is_enabled: false,
      enable_search_in_header: false,
      enabled_re_sync: false,
      enable_switch_to_learner: false,
      enable_help_center: false,
      language_selector_is_enabled: false,
      notification_is_enabled: false,
      enabled_languages: [],
    };
  }
};

const Layout = () => {
  const { authenticatedUser, config } = useContext(AppContext);
  console.log('authenticatedUser', authenticatedUser);
  console.log('config', config);
  const { LMS_BASE_URL, LOGOUT_URL } = config;

  const intl = useIntl();

  const [loadingSidebar, setLoadingSidebar] = useState(true);
  const [headerButtons, setHeaderButtons] = useState({});
  const [languageSelectorList, setLanguageSelectorList] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

  const presentPath = location.pathname;
  console.log('presentPath', presentPath);

  const handleLanguageChange = () => {
    const { pathname } = location;
    const cleanPath = pathname.replace('/learner-dashboard', '');
    window.location.href = `/learner-dashboard${cleanPath}`;
  };

  const [sidebarItems, setSidebarItems] = useState([
    {
      // label: 'Home',
      label: intl.formatMessage(messages.sidebarDashboardTitle),
      path: '/',
      icon: <Home />,
    },
  ]);

  const userMenuItems = getUserMenuItems({
    lmsBaseUrl: LMS_BASE_URL,
    logoutUrl: LOGOUT_URL,
    authenticatedUser,
    // isAdmin: userIsAdmin,
  });

  useEffect(() => {
    let isMounted = true;

    // Apply theme from JSON
    // applyTheme(); // Load default theme from /theme.json

    const fetchMenu = async () => {
      try {
        const menuConfig = await fetchNavigationItems();

        if (isMounted && menuConfig) {
          // Define all sidebar items with their visibility conditions
          const sidebarItemsConfig = [
            {
              label: intl.formatMessage(messages.sidebarDashboardTitle),
              // label: 'Home',
              path: '/',
              icon: <Home />,
              isVisible: true, // Always visible
            },
            // {
            //   label: intl.formatMessage(messages.sidebarCreateNewCourseTitle),
            //   // label: 'Create New Course',
            //   path: '/new-course',
            //   icon: <LibraryAdd />,
            //   isVisible: menuConfig.allow_to_create_new_course || false,
            // },
            {
              label: intl.formatMessage(messages.sidebarMyCoursesTitle),
              // label: 'My Courses',
              path: '/my-courses',
              icon: <LmsBook />,
              isVisible: true, // Always visible
            },
            // {
            //   label: intl.formatMessage(messages.sidebarContentLibrariesTitle),
            //   // label: 'Content Libraries',
            //   path: '/libraries',
            //   icon: <LibraryBooks />,
            //   isVisible: true, // Always visible
            // },
            // {
            //   label: intl.formatMessage(messages.sidebarCalendarTitle),
            //   // label: 'Calendar',
            //   path: '/calendar',
            //   icon: <Calendar />,
            //   isVisible: true, // Always visible
            // },
            // {
            //   label: intl.formatMessage(messages.sidebarClassPlannerTitle),
            //   // label: 'Class Planner',
            //   path: '/class-planner',
            //   icon: <Analytics />,
            //   isVisible: menuConfig.show_class_planner || false,
            // },
            // {
            //   label: intl.formatMessage(messages.sidebarInsightsReportsTitle),
            //   // label: 'Insights & Reports',
            //   path: '/reports',
            //   icon: <Lightbulb />,
            //   isVisible: menuConfig.show_insights_and_reports || false,
            // },
            // {
            //   label: intl.formatMessage(messages.sidebarTitanAITitle),
            //   // label: 'Titan AI',
            //   path: '/ai-assistant',
            //   icon: <Assistant />,
            //   isVisible: menuConfig.assistant_is_enabled || false,
            // },
            // {
            //   label: intl.formatMessage(messages.sidebarSharedResourcesTitle),
            //   // label: 'Shared Resources',
            //   path: '/shared-resources',
            //   icon: <FolderShared />,
            //   isVisible: menuConfig.resources_is_enabled || false,
            // },
            // {
            //   label: intl.formatMessage(messages.sidebarTaxonomiesTitle),
            //   // label: 'Taxonomies',
            //   path: '/taxonomies',
            //   icon: <Assignment />,
            //   isVisible: true, // Always visible
            // },
            {
              label: intl.formatMessage(messages.sidebarSwitchToOldViewTitle),
              // label: 'Switch to Old View',
              path: 'switch-to-old-view',
              icon: <FolderShared />,
              isVisible: true,
            },
          ];

          // Filter visible items and remove the isVisible property
          const visibleSidebarItems = sidebarItemsConfig
            .filter(item => item.isVisible)
            .map(({ isVisible, ...item }) => item);

          setSidebarItems(visibleSidebarItems);

          // const headerButtonsConfig = {
          //   reSync: true,
          //   contextSwitcher: true,
          //   help: true,
          //   translation: menuConfig.language_selector_is_enabled || false,
          //   notification: menuConfig.notification_is_enabled || false,
          // };
          const headerButtonsConfig = {
            reSync: menuConfig.enabled_re_sync || false,
            contextSwitcher: menuConfig.enable_switch_to_learner || false,
            help: menuConfig.enable_help_center || false,
            translation: menuConfig.language_selector_is_enabled || false,
            notification: menuConfig.notification_is_enabled || false,
          };

          setHeaderButtons(headerButtonsConfig);

          if (menuConfig.enabled_languages) {
            setLanguageSelectorList(menuConfig.enabled_languages);
          }
        }
      } catch (error) {
        // Fallback to always-visible items when API fails
        const fallbackItems = [
          {
            label: intl.formatMessage(messages.sidebarDashboardTitle),
            // label: 'Home',
            path: '/',
            icon: <Home />,
            isVisible: true,
          },
          // {
          //   label: intl.formatMessage(messages.sidebarCreateNewCourseTitle),
          //   // label: 'Create New Course',
          //   path: '/new-course',
          //   icon: <LibraryAdd />,
          //   isVisible: false, // Hide when API fails
          // },
          {
            label: intl.formatMessage(messages.sidebarMyCoursesTitle),
            // label: 'My Courses',
            path: '/my-courses',
            icon: <LmsBook />,
            isVisible: true,
          },
          // {
          //   label: intl.formatMessage(messages.sidebarContentLibrariesTitle),
          //   // label: 'Content Libraries',
          //   path: '/libraries',
          //   icon: <LibraryBooks />,
          //   isVisible: true,
          // },
          // {
          //   label: intl.formatMessage(messages.sidebarCalendarTitle),
          //   // label: 'Calendar',
          //   path: '/calendar',
          //   icon: <Calendar />,
          //   isVisible: true,
          // },
          // {
          //   label: intl.formatMessage(messages.sidebarClassPlannerTitle),
          //   // label: 'Class Planner',
          //   path: '/class-planner',
          //   icon: <Analytics />,
          //   isVisible: false, // Hide when API fails
          // },
          // {
          //   label: intl.formatMessage(messages.sidebarInsightsReportsTitle),
          //   // label: 'Insights & Reports',
          //   path: '/reports',
          //   icon: <Lightbulb />,
          //   isVisible: false, // Hide when API fails
          // },
          // {
          //   label: intl.formatMessage(messages.sidebarTitanAITitle),
          //   // label: 'Titan AI',
          //   path: '/ai-assistant',
          //   icon: <Assistant />,
          //   isVisible: false, // Hide when API fails
          // },
          // {
          //   label: intl.formatMessage(messages.sidebarSharedResourcesTitle),
          //   // label: 'Shared Resources',
          //   path: '/shared-resources',
          //   icon: <FolderShared />,
          //   isVisible: false, // Hide when API fails
          // },
          // {
          //   label: intl.formatMessage(messages.sidebarTaxonomiesTitle),
          //   // label: 'Taxonomies',
          //   path: '/taxonomies',
          //   icon: <Assignment />,
          //   isVisible: true,
          // },
          {
            label: intl.formatMessage(messages.sidebarSwitchToOldViewTitle),
            // label: 'Switch to Old View',
            path: 'switch-to-old-view',
            icon: <FolderShared />,
            isVisible: true,
          },
        ];

        // Filter visible items and remove the isVisible property
        const visibleFallbackItems = fallbackItems
          .filter(item => item.isVisible)
          .map(({ isVisible, ...item }) => item);

        setSidebarItems(visibleFallbackItems);

        // const fallbackHeaderButtonsConfig = {
        //   reSync: true,
        //   contextSwitcher: true,
        //   help: true,
        //   translation: false,
        //   notification: false,
        // };
        const fallbackHeaderButtonsConfig = {
          reSync: true,
          contextSwitcher: true,
          help: true,
          translation: false,
          notification: false,
        };

        setHeaderButtons(fallbackHeaderButtonsConfig);
        setLanguageSelectorList([]);
      } finally {
        setLoadingSidebar(false);
      }
    };

    fetchMenu();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleNavigate = async (path) => {
    if (path === 'switch-to-old-view') {
      try {
        console.log('Switching to old UI...');
        const success = await setUIPreference(false);
        if (success) {
          console.log('Successfully switched to old UI, reloading page...');
          window.location.href = '/learner-dashboard/';
        } else {
          console.error('Failed to switch to old UI');
        }
      } catch (error) {
        console.error('Error switching to old UI:', error);
      }
    } else {
      navigate(path);
    }
  };

  return (
    <div className="app-container">
      {/* <p>This is header</p> */}
      <SidebarProvider>
        <div className="header-container">
          <MainHeader
            // logoUrl="/titanEd_logo.png"
            logoUrl={config.LOGO_URL}
              // menuAlignment={headerData.menu.align}
              // menuList={headerData.menu.menuList}
              // loginSignupButtons={headerData.menu.loginSignupButtons}
            authenticatedUser={authenticatedUser}
            userMenuItems={userMenuItems}
            onLanguageChange={handleLanguageChange}
            // getBaseUrl={() => '/account'}
            headerButtons={headerButtons}
            languageSelectorList={languageSelectorList}
          />
        </div>
        {/* Sidebar and Main Content */}
        <div className="content-wrapper">
          <div className="sidebar-container">
            {loadingSidebar ? (
              <div className="d-flex justify-content-center" style={{ height: '100%', width: '80px', paddingTop: '1rem' }}>
                <Spinner animation="border" variant="primary" />
              </div>
            ) : (
              <Sidebar
                buttons={sidebarItems}
                onNavigate={handleNavigate}
                presentPath={presentPath}
              />
            )}
          </div>
          <div className="main-content">
            <div className="page-content">
              <Outlet />
            </div>
          </div>
        </div>
        {/* <div>
            <div className="footer-container">
              <Footer
                contactInfo={contactInfo}
                quickLinks={quickLinks}
                exploreLinks={exploreLinks}
                logoUrl="https://titaned.com/wp-content/uploads/2023/07/TitanEdLogoHigherEdOrange.png"
                copyrights="Copyright © 2025 All Rights Reserved by TitanEd"
              />
            </div>
          </div> */}
      </SidebarProvider>
    </div>
  );
};

export default Layout;
