import React from 'react';
import PropTypes from 'prop-types';

import { useIntl } from '@edx/frontend-platform/i18n';

import track from 'tracking';
import { reduxHooks } from 'hooks';
// import useActionDisabledState from '../hooks';
import ActionButton from './ActionButton';
import messages from './messages';

export const ViewCourseButton = ({ cardId }) => {
  const { formatMessage } = useIntl();
  const { homeUrl } = reduxHooks.useCardCourseRunData(cardId);
  // const { disableViewCourse } = useActionDisabledState(cardId);
  const { allowResume } = reduxHooks.useCardEnrollmentData(cardId);
  // const allowResume = false;

  const handleClick = reduxHooks.useTrackCourseEvent(
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
