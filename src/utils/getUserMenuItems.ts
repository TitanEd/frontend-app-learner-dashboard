/* eslint-disable linebreak-style */
import { getConfig } from '@edx/frontend-platform';

interface UserMenuItemsParams {
  lmsBaseUrl: string;
  logoutUrl: string;
  isAdmin: any;
  userName: string;
  authenticatedUser: any;
  userMenuItemsFromAPI?: any;
}

const getUserMenuItems = ({
  lmsBaseUrl,
  logoutUrl,
  authenticatedUser,
  userMenuItemsFromAPI,
//   isAdmin,
}: UserMenuItemsParams) => {
  // Use menu_items from API if available, otherwise use fallback items
  if (userMenuItemsFromAPI?.menu_items && Array.isArray(userMenuItemsFromAPI.menu_items)) {
    return userMenuItemsFromAPI.menu_items.map((item: { label: string; url: string }) => ({
      href: item.url,
      title: item.label,
    }));
  }

  // Fallback items
  const items = [
    // {
    //   href: `${lmsBaseUrl}/dashboard`,
    //   title: 'Dashboard',
    // },
    {
      href: `${getConfig().ACCOUNT_PROFILE_URL}/u/${authenticatedUser?.username}`,
      title: 'Profile',
    },
    {
      href: `${getConfig().ACCOUNT_SETTINGS_URL}`,
      title: 'Account',
    },
    // {
    //   href: 'http://localhost:1996/orders',
    //   title: 'Order History',
    // },
    {
      href: `${logoutUrl}`,
      title: 'Sign Out',
    },
  ];
  //   if (isAdmin) {
  //     items = [
  //       {
  //         href: `${lmsBaseUrl}`,
  //         title: 'LMS Home',
  //       }, {
  //         href: `${getConfig().STUDIO_BASE_URL}/maintenance`,
  //         title: 'Maintenance',
  //       }, {
  //         href: `${logoutUrl}`,
  //         title: 'Logout',
  //       },
  //     ];
  //   }

  return items;
};

export default getUserMenuItems;
