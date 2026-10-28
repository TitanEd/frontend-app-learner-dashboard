import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { useIntl } from '@edx/frontend-platform/i18n';
import { EXECUTIVE_EDUCATION_COURSE_MODES } from 'data/constants/course';

import track from 'tracking';
import { useCourseData, useCourseTrackingEvent } from 'hooks';
import { useInitializeLearnerHome } from 'data/hooks';
// import useActionDisabledState from '../hooks';
import usePrerequisites from '../../../../plugins/CustomMyCourseWidget/usePrerequisites';
import ActionButton from './ActionButton';
import messages from './messages';

export const BeginCourseButton = ({ cardId }) => {
  const { formatMessage } = useIntl();
  const { data: learnerData } = useInitializeLearnerHome();
  const courseData = useCourseData(cardId);
  const homeUrl = courseData?.courseRun?.homeUrl;
  const execEdTrackingParam = useMemo(() => {
    const isExecEd2UCourse = EXECUTIVE_EDUCATION_COURSE_MODES.includes(courseData.enrollment.mode);
    const { authOrgId } = learnerData.enterpriseDashboard || {};
    return isExecEd2UCourse ? `?org_id=${authOrgId}` : '';
  }, [courseData.enrollment.mode, learnerData.enterpriseDashboard]);
  // const { disableBeginCourse } = useActionDisabledState(cardId);
  const allowResume = courseData?.enrollment?.allowResume;
  // const allowResume = false;
  const handleClick = useCourseTrackingEvent(
    track.course.enterCourseClicked,
    cardId,
    homeUrl + execEdTrackingParam,
  );
  // Also off while the course waits for its prerequisite courses (the card says which).
  const { isLocked } = usePrerequisites(cardId);
  const isDisabled = allowResume === false || isLocked;
  return (
    <ActionButton
      // disabled={disableBeginCourse}
      disabled={isDisabled}
      as="a"
      href="#"
      onClick={(e) => {
        if (isDisabled) {
          e.preventDefault();
          return;
        }
        handleClick(e);
      }}
      style={isDisabled ? { pointerEvents: 'none', opacity: 0.5 } : {}}
    >
      {formatMessage(messages.beginCourse)}
    </ActionButton>
  );
};
BeginCourseButton.propTypes = {
  cardId: PropTypes.string.isRequired,
};
export default BeginCourseButton;
