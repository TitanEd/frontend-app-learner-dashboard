import React from 'react';
import PropTypes from 'prop-types';

import { useIntl } from '@edx/frontend-platform/i18n';

import track from 'tracking';
import { reduxHooks } from 'hooks';
// import useActionDisabledState from '../hooks';
import ActionButton from './ActionButton';
import messages from './messages';

export const ResumeButton = ({ cardId }) => {
  const { formatMessage } = useIntl();
  const { resumeUrl } = reduxHooks.useCardCourseRunData(cardId);
  const execEdTrackingParam = reduxHooks.useCardExecEdTrackingParam(cardId);
  // const { disableResumeCourse } = useActionDisabledState(cardId);
  const { allowResume } = reduxHooks.useCardEnrollmentData(cardId);
  // const allowResume = true;

  console.log('allowResume', allowResume);

  const handleClick = reduxHooks.useTrackCourseEvent(
    track.course.enterCourseClicked,
    cardId,
    resumeUrl + execEdTrackingParam,
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
      {formatMessage(messages.resume)}
    </ActionButton>
  );
};
ResumeButton.propTypes = {
  cardId: PropTypes.string.isRequired,
};
export default ResumeButton;
