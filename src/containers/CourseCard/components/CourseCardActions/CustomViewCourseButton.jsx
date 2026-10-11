import React from 'react';
import PropTypes from 'prop-types';

import { useIntl } from '@edx/frontend-platform/i18n';

import track from 'tracking';
import { useCourseTrackingEvent, useCourseData } from 'hooks';
// import useActionDisabledState from '../hooks';
import ActionButton from './ActionButton';
import messages from './messages';

export const ViewCourseButton = ({ cardId }) => {
  const { formatMessage } = useIntl();
  const courseData = useCourseData(cardId);
  const homeUrl = courseData?.courseRun?.homeUrl;
  // const { disableViewCourse } = useActionDisabledState(cardId);
  const allowResume = courseData?.enrollment?.allowResume;
  // const allowResume = false;

  const handleClick = useCourseTrackingEvent(
    track.course.enterCourseClicked,
    cardId,
    homeUrl,
  );

  const isDisabled = allowResume === false;
  return (
    <ActionButton
      disabled={isDisabled}
      as="a"
      href="#"
      onClick={(e) => {
        if (allowResume === false) {
          e.preventDefault();
          return;
        }
        handleClick(e);
      }}
      style={isDisabled ? { pointerEvents: 'none', opacity: 0.5 } : {}}
    >
      {formatMessage(messages.viewCourse)}
    </ActionButton>
  );
};
ViewCourseButton.propTypes = {
  cardId: PropTypes.string.isRequired,
};
export default ViewCourseButton;
