import React from 'react';
import { reduxHooks } from 'hooks';
import CourseCard from 'containers/CourseCard';
import { useCourseListData } from '../../containers/CoursesPanel/hooks';

const ContinueLearning = () => {
  const hasCourses = reduxHooks.useHasCourses();
  const courseListData = useCourseListData();

  const { visibleList } = courseListData;

  console.log('courseListData:', courseListData);
  console.log('hasCourses:', hasCourses);

  return (
    <div>
      {hasCourses ? visibleList.map(({ cardId }) => (
        <CourseCard key={cardId} cardId={cardId} />
      )) : null }
    </div>
  );
};

export default ContinueLearning;
