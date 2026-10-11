import React from 'react';
import { useWindowSize, breakpoints } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useInitializeLearnerHome } from 'data/hooks';
import { StrictDict } from 'utils';

import appMessages from 'messages';
import * as module from './customHooks';

export const state = StrictDict({
  sidebarShowing: (val) => React.useState(val), // eslint-disable-line
});

export const useInitializeDashboard = () => {
  useInitializeLearnerHome();
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
