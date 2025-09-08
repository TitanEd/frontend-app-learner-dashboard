import React from 'react';
import { reduxHooks } from 'hooks';
// import CourseCard from 'containers/CourseCard';
import { Card } from '@openedx/paragon';

import CourseCardBanners from 'containers/CourseCard/components/CourseCardBanners';
import CourseCardImage from 'containers/CourseCard/components/CourseCardImage';
import CourseCardMenu from 'containers/CourseCard/components/CourseCardMenu';
import CourseCardActions from 'containers/CourseCard/components/CourseCardActions';
import CourseCardDetails from 'containers/CourseCard/components/CourseCardDetails';
import CourseCardTitle from 'containers/CourseCard/components/CourseCardTitle';
import { useCourseListData } from '../../containers/CoursesPanel/hooks';

const ContinueLearning = () => {
  const hasCourses = reduxHooks.useHasCourses();
  const courseListData = useCourseListData();

  const { visibleList } = courseListData;
  const orientation = 'horizontal';

  // Filter for courses that have been started (hasStarted: true) and have a resumeUrl
  const startedCourses = visibleList?.filter(course => course.enrollment?.hasStarted === true
    && course.courseRun?.resumeUrl) || [];

  // Sort by lastEnrolled date to get the most recently watched course
  const mostRecentCourse = startedCourses.sort((a, b) => new Date(b.enrollment.lastEnrolled)
  - new Date(a.enrollment.lastEnrolled))[0];

  return (
    <div>
      {hasCourses && mostRecentCourse ? (
        <div className="mb-4.5 course-card" id={mostRecentCourse.cardId} data-testid="CourseCard">
          <Card orientation={orientation}>
            <div className="d-flex flex-column w-100">
              <div {...({ className: 'd-flex' })}>
                <CourseCardImage cardId={mostRecentCourse.cardId} orientation="horizontal" />
                <Card.Body>
                  <Card.Header
                    title={<CourseCardTitle cardId={mostRecentCourse.cardId} />}
                    actions={<CourseCardMenu cardId={mostRecentCourse.cardId} />}
                  />
                  <Card.Section className="pt-0">
                    <CourseCardDetails cardId={mostRecentCourse.cardId} />
                  </Card.Section>
                  <Card.Footer orientation={orientation}>
                    <CourseCardActions cardId={mostRecentCourse.cardId} />
                  </Card.Footer>
                </Card.Body>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <p className="text-muted">No course in progress to resume.</p>
      )}
    </div>
  );
};

export default ContinueLearning;
