import { getConfig } from '@edx/frontend-platform';
import { defineMessages, IntlShape } from '@edx/frontend-platform/i18n';

import getLearnerDashboardUrl from './getLearnerDashboardUrl';

// Same ids and texts as the stock Open edX header user menu
// (@edx/frontend-component-header), so their translations apply.
const messages = defineMessages({
  dashboard: {
    id: 'header.user.menu.dashboard',
    defaultMessage: 'Dashboard',
    description: 'Link to the user dashboard',
  },
  profile: {
    id: 'header.user.menu.profile',
    defaultMessage: 'Profile',
    description: 'Link to the user profile',
  },
  account: {
    id: 'header.user.menu.account.settings',
    defaultMessage: 'Account',
    description: 'Link to account settings',
  },
  logout: {
    id: 'header.user.menu.logout',
    defaultMessage: 'Logout',
    description: 'Logout link',
  },
});

interface UserMenuItemsParams {
  intl: IntlShape;
  logoutUrl?: string;
  authenticatedUser: any;
  userMenuItemsFromAPI?: any;
}

/**
 * User menu of the custom header.
 * Items come from the user-dropdown-menu API; when it returns nothing the
 * stock Open edX user menu is rebuilt from the MFE config (no hardcoded URLs).
 */
const customGetUserMenuItems = ({
  intl,
  logoutUrl,
  authenticatedUser,
  userMenuItemsFromAPI,
}: UserMenuItemsParams) => {
  if (Array.isArray(userMenuItemsFromAPI?.menu_items) && userMenuItemsFromAPI.menu_items.length) {
    return userMenuItemsFromAPI.menu_items.map((item: { label: string; url: string }) => ({
      href: item.url,
      title: item.label,
    }));
  }

  const { ACCOUNT_PROFILE_URL, ACCOUNT_SETTINGS_URL, LOGOUT_URL } = getConfig();

  return [
    {
      href: getLearnerDashboardUrl('/'),
      title: intl.formatMessage(messages.dashboard),
    },
    {
      href: `${ACCOUNT_PROFILE_URL}/u/${authenticatedUser?.username}`,
      title: intl.formatMessage(messages.profile),
    },
    {
      href: ACCOUNT_SETTINGS_URL,
      title: intl.formatMessage(messages.account),
    },
    {
      href: logoutUrl || LOGOUT_URL,
      title: intl.formatMessage(messages.logout),
    },
  ];
};

export default customGetUserMenuItems;
