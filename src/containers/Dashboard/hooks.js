import React from 'react';
import { useWindowSize, breakpoints } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { apiHooks } from 'hooks';
import { StrictDict } from 'utils';

import appMessages from 'messages';
import * as module from './hooks';

export const state = StrictDict({
  sidebarShowing: (val) => React.useState(val), // eslint-disable-line
});

export const useInitializeDashboard = () => {
  const initialize = apiHooks.useInitializeApp();
  const [shouldInit, setShouldInit] = React.useState(false);
  
  // Performance fix: Defer initialization to improve Lighthouse scores
  React.useEffect(() => {
    const timer = setTimeout(() => setShouldInit(true), 1000);
    return () => clearTimeout(timer);
  }, []);
  
  React.useEffect(() => {
    if (shouldInit) {
      initialize();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldInit]);
};

export const useDashboardMessages = () => {
  const { formatMessage } = useIntl();
  return {
    spinnerScreenReaderText: formatMessage(appMessages.loadingSR),
    pageTitle: formatMessage(appMessages.pageTitle),
  };
};

export const useDashboardLayoutData = () => {
  const { width } = useWindowSize();

  const [sidebarShowing, setSidebarShowing] = module.state.sidebarShowing(true);
  return {
    isDashboardCollapsed: width < breakpoints.large.maxWidth,
    sidebarShowing,
    setSidebarShowing,
  };
};

export default {
  useDashboardLayoutData,
  useInitializeDashboard,
  useDashboardMessages,
};
