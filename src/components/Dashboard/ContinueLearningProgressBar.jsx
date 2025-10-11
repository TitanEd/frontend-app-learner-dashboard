/* eslint-disable no-console */
import React from 'react';
import { reduxHooks } from 'hooks';
// import CourseCard from 'containers/CourseCard';
import { Card } from '@openedx/paragon';

import CourseCardMenu from 'containers/CourseCard/components/CourseCardMenu';
import CourseCardActions from 'containers/CourseCard/components/CourseCardActions';
import CourseCardTitle from 'containers/CourseCard/components/CourseCardTitle';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useCourseListData } from '../../containers/CoursesPanel/hooks';
import CourseProgressWrapper from './CourseProgressWrapper';

import messages from './components/messages';

const ContinueLearningProgressBar = () => {
  const hasCourses = reduxHooks.useHasCourses();
  const courseListData = useCourseListData();

  const { visibleList } = courseListData;
  const intl = useIntl();

  // Filter for courses that have been started (hasStarted: true) and have a resumeUrl
  const startedCourses = visibleList?.filter(
    (course) => course.enrollment?.hasStarted === true && course.courseRun?.resumeUrl,
  ) || [];

  // Sort by lastEnrolled date and get up to 4 most recently enrolled courses
  const recentCourses = startedCourses
    .sort((a, b) => new Date(b.enrollment.lastEnrolled) - new Date(a.enrollment.lastEnrolled))
    .slice(0, 4);

  // Debug: Log course data to see what's available
  console.log('Recent courses data:', recentCourses.map(course => ({
    cardId: course.cardId,
    courseId: course.courseRun?.courseId,
    courseName: course.course?.courseName,
    hasStarted: course.enrollment?.hasStarted,
    resumeUrl: course.courseRun?.resumeUrl,
  })));

  return (
    <div>
      {/* Course Cards Grid */}
      {hasCourses && recentCourses.length > 0 ? (
        <div
          className="continue-learning-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px',
          }}
        >
          {recentCourses.map((course) => (
            <div
              key={course.cardId}
              className="course-card course-card-individual"
              id={course.cardId}
              data-testid="CourseCard"
            >
              <Card className="border-0">
                <Card.Body className="d-flex flex-row mtop card-body-flex">
                  <div style={{ width: '80%' }} className="course-progress-wrapper">
                    <Card.Header
                      title={(
                        <div className="course-title-ellipsis">
                          <CourseCardTitle cardId={course.cardId} />
                        </div>
                      )}
                      actions={
                        <CourseCardMenu cardId={course.cardId} />
                      }
                      className="border-0 pb-2"
                    />
                    <Card.Section className="pt-0">
                      <CourseProgressWrapper courseId={course.courseRun?.courseId} />
                    </Card.Section>
                  </div>
                  <div
                    className="course-card-actions-wrapper"
                    style={{
                      width: '20%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      marginTop: '2rem',
                    }}
                  >
                    <CourseCardActions cardId={course.cardId} />
                  </div>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 course-card-individual">
          <p className="text-muted mb-0">{intl.formatMessage(messages.noCourseInProgress)}</p>
        </div>
      )}
    </div>
  );
};

export default ContinueLearningProgressBar;
