/* eslint-disable react/prop-types */
import React from 'react';
import { Pagination } from '@openedx/paragon';
import CourseCard from '../containers/CourseCard/index';

const CustomCourseListWidget = ({
  visibleList,
  numPages,
  setPageNumber,
  isCollapsed,
}) => (
  <div className="course-list-wrapper">
    <div className="cardList-direction-alignment">
      {visibleList?.map(({ cardId }) => (
        <CourseCard key={cardId} cardId={cardId} />
      ))}
    </div>
    <div className="pagination-container">
      {numPages > 1 && (
        <Pagination
          variant={isCollapsed ? 'reduced' : 'secondary'}
          paginationLabel="Course List"
          pageCount={numPages}
          onPageSelect={setPageNumber}
        />
      )}
    </div>
  </div>
);

export default CustomCourseListWidget;
