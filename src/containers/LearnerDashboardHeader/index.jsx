/* eslint-disable no-console */
import React from 'react';

import MasqueradeBar from 'containers/MasqueradeBar';
import { AppContext } from '@edx/frontend-platform/react';
import Header from '@edx/frontend-component-header';
import { reduxHooks } from 'hooks';
import urls from 'data/services/lms/urls';
import { setUIPreference } from '../../services/uiPreferenceService';

import ConfirmEmailBanner from './ConfirmEmailBanner';

import { useLearnerDashboardHeaderMenu, findCoursesNavClicked } from './hooks';

import './index.scss';

export const LearnerDashboardHeader = () => {
  const { authenticatedUser } = React.useContext(AppContext);
  const { courseSearchUrl } = reduxHooks.usePlatformSettingsData();

  const exploreCoursesClick = () => {
    findCoursesNavClicked(urls.baseAppUrl(courseSearchUrl));
  };

  const learnerHomeHeaderMenu = useLearnerDashboardHeaderMenu({
    courseSearchUrl,
    authenticatedUser,
    exploreCoursesClick,
  });

  return (
    <>
      <ConfirmEmailBanner />
      <div>
        <Header
          mainMenuItems={learnerHomeHeaderMenu.mainMenu}
          secondaryMenuItems={learnerHomeHeaderMenu.secondaryMenu}
          userMenuItems={learnerHomeHeaderMenu.userMenu}
        />
        <button
          type="button"
          className="ui-switch-button"
          onClick={async () => {
            try {
              console.log('Switching to new UI...');
              const success = await setUIPreference(true);
              if (success) {
                console.log('Successfully switched to new UI, reloading page...');
                window.location.reload();
              } else {
                console.error('Failed to switch to new UI');
              }
            } catch (error) {
              console.error('Error switching to new UI:', error);
            }
          }}
        >
          Switch to New UI
        </button>
      </div>
      <MasqueradeBar />
    </>
  );
};

LearnerDashboardHeader.propTypes = {};

export default LearnerDashboardHeader;
