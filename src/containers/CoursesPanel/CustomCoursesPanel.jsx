import React, { useMemo } from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';
import { useInitializeLearnerHome } from 'data/hooks';
import { useFilters } from 'data/context';
import { baseAppUrl } from 'data/services/lms/urls';

import { getTransformedCourseDataList } from 'utils/dataTransformers';
import { getCustomVisibleList } from 'utils/customDataTransformers';

import CustomCourseFilterControls from 'plugins/CustomCourseFilterControls/CustomCourseFilterControls';
import CustomCourseListWidget from 'plugins/CustomCourseListWidget';
import CustomNoCoursesView from 'containers/CoursesPanel/NoCoursesView/CustomNoCoursesView';
import noCoursesMessages from 'containers/CoursesPanel/NoCoursesView/messages';
import { useIsCollapsed } from 'containers/CoursesPanel/CourseList/hooks';

import messages from './messages';
import customMessages from '../../customMessages';

import './index.scss';

export const CustomCoursesPanel = () => {
  const { formatMessage } = useIntl();
  const { data, isSuccess } = useInitializeLearnerHome();
  const hasCourses = useMemo(() => data?.courses?.length > 0, [data]);
  const isCollapsed = useIsCollapsed();

  const {
    filters, sortBy, pageNumber, setPageNumber, setSortBy,
  } = useFilters();
  const { visibleList, numPages } = useMemo(() => {
    let transformedCourses = [];
    if (data?.courses?.length) {
      transformedCourses = getTransformedCourseDataList(data.courses);
    }
    return getCustomVisibleList(
      transformedCourses,
      filters,
      sortBy,
      pageNumber,
    );
  }, [data, filters, sortBy, pageNumber]);

  React.useEffect(() => {
    if (numPages > 0 && pageNumber > numPages) {
      setPageNumber(1);
    }
  }, [numPages, pageNumber, setPageNumber]);

  // Backed-up data is available without a fresh success while masquerading.
  const initIsCompleted = isSuccess || !!data;

  const courseSearchUrl = data?.platformSettings?.courseSearchUrl || '';

  let content;
  if (!initIsCompleted) {
    content = (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">{formatMessage(customMessages.loadingCourses)}</span>
        </div>
      </div>
    );
  } else if (hasCourses) {
    content = (
      <CustomCourseListWidget
        visibleList={visibleList}
        numPages={numPages}
        setPageNumber={setPageNumber}
        isCollapsed={isCollapsed}
      />
    );
  } else {
    content = (
      <CustomNoCoursesView
        formatMessage={formatMessage}
        messages={noCoursesMessages}
        buttonHref={baseAppUrl(courseSearchUrl)}
      />
    );
  }

  return (
    <div className="course-list-container">
      <div className="course-list-heading-container">
        <h2 className="course-list-title">{formatMessage(messages.myCourses)}</h2>
        <div className="course-filter-controls-container">
          <CustomCourseFilterControls
            hasCourses={hasCourses}
            filters={filters}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
        </div>
      </div>
      {content}
    </div>
  );
};

CustomCoursesPanel.propTypes = {};

export default CustomCoursesPanel;
