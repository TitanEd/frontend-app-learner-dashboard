import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, Image } from '@openedx/paragon';
import { Search } from '@openedx/paragon/icons';
import { baseAppUrl } from 'data/services/lms/urls';

import emptyCourseSVG from 'assets/empty-course.svg';
import { reduxHooks } from 'hooks';

import { PluginSlot } from '@openedx/frontend-plugin-framework';
import messages from './messages';
import './index.scss';

export const NoCoursesView = () => {
  const { formatMessage } = useIntl();
  const { courseSearchUrl } = reduxHooks.usePlatformSettingsData();
  return (
    <div
      id="no-courses-content-view"
      className="d-flex align-items-center justify-content-center mb-4.5"
    >
      <Image src={emptyCourseSVG} alt={formatMessage(messages.bannerAlt)} />
      <PluginSlot
        id="custom_no_courses_view_slot"
        pluginProps={{
          buttonHref: baseAppUrl(courseSearchUrl),
          formatMessage,
          messages,
        }}
      >
        <h1>
          {formatMessage(messages.lookingForChallengePrompt)}
        </h1>
        <p>
          {formatMessage(messages.exploreCoursesPrompt)}
        </p>
        <Button
          variant="brand"
          as="a"
          href={baseAppUrl(courseSearchUrl)}
          iconBefore={Search}
        >
          {formatMessage(messages.exploreCoursesButton)}
        </Button>
      </PluginSlot>
    </div>
  );
};

export default NoCoursesView;
