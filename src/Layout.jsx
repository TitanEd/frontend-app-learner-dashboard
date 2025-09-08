import React, { useContext, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { MainHeader, Sidebar, SidebarProvider } from 'titaned-lib';
import { AppContext } from '@edx/frontend-platform/react';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import {
  Analytics, Assignment, Assistant, Calendar, FolderShared, Home, LibraryAdd, LibraryBooks, Lightbulb, LmsBook,
} from '@openedx/paragon/icons';
import getUserMenuItems from '../src/utils/getUserMenuItems';
import './index.scss';

// API to fetch sidebar items
const fetchNavigationItems = async () => {
  const response = await getAuthenticatedHttpClient().get('https://staging.titaned.com/titaned/api/v1/menu-config/');

  if (response.status !== 200) {
    throw new Error('Failed to fetch Navigation Items');
  }

  return response.data;
};

const Layout = () => {
  const { authenticatedUser, config } = useContext(AppContext);
  const { LMS_BASE_URL, LOGOUT_URL } = config;

  const [loadingSidebar, setLoadingSidebar] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const presentPath = location.pathname;

  const handleLanguageChange = () => {
    const { pathname } = location;
    const cleanPath = pathname.replace('/learning', '');
    window.location.href = `/learning${cleanPath}`;
  };

  const [sidebarItems, setSidebarItems] = useState([
    {
      label: 'Home',
      path: '/home',
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

    const fetchMenu = async () => {
      try {
        const menuConfig = await fetchNavigationItems();

        if (isMounted && menuConfig) {
          // Define all sidebar items with their visibility conditions
          const sidebarItemsConfig = [
            {
              // label: intl.formatMessage(messages.sidebarDashboardTitle),
              label: 'Home',
              path: '/home',
              icon: <Home />,
              isVisible: true, // Always visible
            },
            {
              // label: intl.formatMessage(messages.sidebarCreateNewCourseTitle),
              label: 'Create New Course',
              path: '/new-course',
              icon: <LibraryAdd />,
              isVisible: menuConfig.allow_to_create_new_course || false,
            },
            {
              // label: intl.formatMessage(messages.sidebarMyCoursesTitle),
              label: 'My Courses',
              path: '/my-courses',
              icon: <LmsBook />,
              isVisible: true, // Always visible
            },
            {
              // label: intl.formatMessage(messages.sidebarContentLibrariesTitle),
              label: 'Content Libraries',
              path: '/libraries',
              icon: <LibraryBooks />,
              isVisible: true, // Always visible
            },
            {
              // label: intl.formatMessage(messages.sidebarCalendarTitle),
              label: 'Calendar',
              path: '/calendar',
              icon: <Calendar />,
              isVisible: true, // Always visible
            },
            {
              // label: intl.formatMessage(messages.sidebarClassPlannerTitle),
              label: 'Class Planner',
              path: '/class-planner',
              icon: <Analytics />,
              isVisible: menuConfig.show_class_planner || false,
            },
            {
              // label: intl.formatMessage(messages.sidebarInsightsReportsTitle),
              label: 'Insights & Reports',
              path: '/reports',
              icon: <Lightbulb />,
              isVisible: menuConfig.show_insights_and_reports || false,
            },
            {
              // label: intl.formatMessage(messages.sidebarTitanAITitle),
              label: 'Titan AI',
              path: '/ai-assistant',
              icon: <Assistant />,
              isVisible: menuConfig.assistant_is_enabled || false,
            },
            {
              // label: intl.formatMessage(messages.sidebarSharedResourcesTitle),
              label: 'Shared Resources',
              path: '/shared-resources',
              icon: <FolderShared />,
              isVisible: menuConfig.resources_is_enabled || false,
            },
            {
              // label: intl.formatMessage(messages.sidebarTaxonomiesTitle),
              label: 'Taxonomies',
              path: '/taxonomies',
              icon: <Assignment />,
              isVisible: true, // Always visible
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

          // setHeaderButtons(headerButtonsConfig);
        }
      } catch (error) {
        // Fallback to always-visible items when API fails
        const fallbackItems = [
          {
            // label: intl.formatMessage(messages.sidebarDashboardTitle),
            label: 'Home',
            path: '/home',
            icon: <Home />,
            isVisible: true,
          },
          {
            // label: intl.formatMessage(messages.sidebarCreateNewCourseTitle),
            label: 'Create New Course',
            path: '/new-course',
            icon: <LibraryAdd />,
            isVisible: false, // Hide when API fails
          },
          {
            // label: intl.formatMessage(messages.sidebarMyCoursesTitle),
            label: 'My Courses',
            path: '/my-courses',
            icon: <LmsBook />,
            isVisible: true,
          },
          {
            // label: intl.formatMessage(messages.sidebarContentLibrariesTitle),
            label: 'Content Libraries',
            path: '/libraries',
            icon: <LibraryBooks />,
            isVisible: true,
          },
          {
            // label: intl.formatMessage(messages.sidebarCalendarTitle),
            label: 'Calendar',
            path: '/calendar',
            icon: <Calendar />,
            isVisible: true,
          },
          {
            // label: intl.formatMessage(messages.sidebarClassPlannerTitle),
            label: 'Class Planner',
            path: '/class-planner',
            icon: <Analytics />,
            isVisible: false, // Hide when API fails
          },
          {
            // label: intl.formatMessage(messages.sidebarInsightsReportsTitle),
            label: 'Insights & Reports',
            path: '/reports',
            icon: <Lightbulb />,
            isVisible: false, // Hide when API fails
          },
          {
            // label: intl.formatMessage(messages.sidebarTitanAITitle),
            label: 'Titan AI',
            path: '/ai-assistant',
            icon: <Assistant />,
            isVisible: false, // Hide when API fails
          },
          {
            // label: intl.formatMessage(messages.sidebarSharedResourcesTitle),
            label: 'Shared Resources',
            path: '/shared-resources',
            icon: <FolderShared />,
            isVisible: false, // Hide when API fails
          },
          {
            // label: intl.formatMessage(messages.sidebarTaxonomiesTitle),
            label: 'Taxonomies',
            path: '/taxonomies',
            icon: <Assignment />,
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

        // setHeaderButtons(fallbackHeaderButtonsConfig);
      } finally {
        setLoadingSidebar(false);
      }
    };

    fetchMenu();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleNavigate = (path) => {
    if (path === '/my-courses') {
      window.location.href = `${LMS_BASE_URL}/dashboard`;
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
            logoUrl="/titanEd_logo.png"
              // menuAlignment={headerData.menu.align}
              // menuList={headerData.menu.menuList}
              // loginSignupButtons={headerData.menu.loginSignupButtons}
            authenticatedUser={authenticatedUser}
            userMenuItems={userMenuItems}
            onLanguageChange={handleLanguageChange}
            getBaseUrl={() => '/learning'}
            // headerButtons={headerButtons}
          />
        </div>
        {/* Sidebar and Main Content */}
        <div className="content-wrapper">
          <div className="sidebar-container">
            {loadingSidebar ? (
              <div>Loading menu...</div>
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
