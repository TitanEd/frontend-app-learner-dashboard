/* eslint-disable react/prop-types */
import React from 'react';
import { Pagination } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import customMessages from '../customMessages';
import CustomMyCourseWidget from './CustomMyCourseWidget/CustomMyCourseWidget';

const CustomCourseListWidget = ({
  visibleList,
  numPages,
  setPageNumber,
  isCollapsed,
}) => {
  const { formatMessage } = useIntl();
  return (
  <div className="course-list-wrapper">
    <div className="cardList-direction-alignment">
      {visibleList?.map(({ cardId }) => (
        <CustomMyCourseWidget key={cardId} cardId={cardId} />
      ))}
    </div>
    <div className="pagination-container">
      {numPages > 1 && (
        <Pagination
          variant={isCollapsed ? 'reduced' : 'secondary'}
          paginationLabel={formatMessage(customMessages.courseListLabel)}
          pageCount={numPages}
          onPageSelect={setPageNumber}
        />
      )}
    </div>
  </div>
  );
};

export default CustomCourseListWidget;
