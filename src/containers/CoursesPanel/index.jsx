import React from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';

import { reduxHooks } from 'hooks';
import {
  CourseFilterControls,
} from 'containers/CourseFilterControls';
import CourseListSlot from 'plugin-slots/CourseListSlot';
import NoCoursesViewSlot from 'plugin-slots/NoCoursesViewSlot';

import { useCourseListData } from './hooks';

import messages from './messages';

import './index.scss';
import { RequestKeys } from '../../data/constants/requests';

/**
 * Renders the list of CourseCards, as well as the controls (CourseFilterControls) for modifying the list.
 * Also houses the NoCoursesView to display if the user hasn't enrolled in any courses.
 * @returns List of courses as CourseCards or empty state
*/
export const CoursesPanel = () => {
  const { formatMessage } = useIntl();
  const hasCourses = reduxHooks.useHasCourses();
  const courseListData = useCourseListData();
  const initIsCompleted = reduxHooks.useRequestIsCompleted(RequestKeys.initialize);

  // Only show courses/no courses view after initialization is completed
  // Show loading while pending or not yet completed
  let content;
  if (!initIsCompleted) {
    content = (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading courses...</span>
        </div>
      </div>
    );
  } else if (hasCourses) {
    content = <CourseListSlot courseListData={courseListData} />;
  } else {
    content = <NoCoursesViewSlot />;
  }

  return (
    <div className="course-list-container">
      <div className="course-list-heading-container">
        <h2 className="course-list-title">{formatMessage(messages.myCourses)}</h2>
        <div className="course-filter-controls-container">
          <CourseFilterControls {...courseListData.filterOptions} />
        </div>
      </div>
      {content}
    </div>
  );
};

CoursesPanel.propTypes = {};

export default CoursesPanel;
