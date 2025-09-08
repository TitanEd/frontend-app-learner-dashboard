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
    <div style={{
      border: '1px solid #D5D7DA',
      borderRadius: '12px',
      padding: '16px',
    }}
    >
      {/* Course Card */}
      {hasCourses && mostRecentCourse ? (
        <div className="course-card" id={mostRecentCourse.cardId} data-testid="CourseCard">
          <Card className="border-0">
            <div className="d-flex">
              <CourseCardImage cardId={mostRecentCourse.cardId} orientation="horizontal" />
              <Card.Body className="d-flex flex-row mtop">
                <div style={{ width: '80%' }}>
                  <Card.Header
                    title={<CourseCardTitle cardId={mostRecentCourse.cardId} />}
                    actions={<CourseCardMenu cardId={mostRecentCourse.cardId} />}
                    className="border-0 pb-2"
                  />
                  <Card.Section className="pt-0">
                    <CourseCardDetails cardId={mostRecentCourse.cardId} />
                  </Card.Section>
                </div>
                <div
                  style={{
                    width: '20%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    marginTop: '2rem',
                  }}
                >
                  <CourseCardActions cardId={mostRecentCourse.cardId} />
                </div>
              </Card.Body>
            </div>
          </Card>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-muted mb-0">No course in progress to resume.</p>
        </div>
      )}
    </div>
  );
};

export default ContinueLearning;
