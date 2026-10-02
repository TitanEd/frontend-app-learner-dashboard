import React, { useMemo } from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';
import { useInitializeLearnerHome } from 'data/hooks';
import {
  CourseFilterControls,
} from 'containers/CourseFilterControls';
import CourseListSlot from 'plugin-slots/CourseListSlot';
import NoCoursesViewSlot from 'plugin-slots/NoCoursesViewSlot';
import { useFilters } from 'data/context';

import { getVisibleList, getTransformedCourseDataList } from 'utils/dataTransformers';

import messages from './messages';

import './index.scss';

/**
 * Renders the list of CourseCards, as well as the controls (CourseFilterControls) for modifying the list.
 * Also houses the NoCoursesView to display if the user hasn't enrolled in any courses.
 * @returns List of courses as CourseCards or empty state
*/
export const CoursesPanel = () => {
  const { formatMessage } = useIntl();
  const { data, isSuccess } = useInitializeLearnerHome();
  const hasCourses = useMemo(() => data?.courses?.length > 0, [data]);

  const {
    filters, sortBy, pageNumber, setPageNumber,
  } = useFilters();
  const { visibleList, numPages } = useMemo(() => {
    let transformedCourses = [];
    if (data?.courses?.length) {
      transformedCourses = getTransformedCourseDataList(data.courses);
    }
    return getVisibleList(
      transformedCourses,
      filters,
      sortBy,
      pageNumber,
    );
  }, [data, filters, sortBy, pageNumber]);

  // Clamp page number when filtered/mutated list shrinks
  React.useEffect(() => {
    if (numPages > 0 && pageNumber > numPages) {
      setPageNumber(1);
    }
  }, [numPages, pageNumber, setPageNumber]);

  const courseListData = {
    filterOptions: filters,
    setPageNumber,
    numPages,
    visibleList,
    showFilters: filters.length > 0,
  };
  // Request is considered completed once the initialize query has resolved
  // (or backed-up data is available while masquerading).
  const initIsCompleted = isSuccess || !!data;

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
          <CourseFilterControls />
        </div>
      </div>
      {content}
    </div>
  );
};

CoursesPanel.propTypes = {};

export default CoursesPanel;
