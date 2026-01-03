/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import { Card } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';
import messages from './components/messages';

const ContinueLearningProgressBar = () => {
  const [recentCourses, setRecentCourses] = useState([]);
  const intl = useIntl();
  useEffect(() => {
    const fetchRecentCourses = async () => {
      try {
        // const response = await fetch('http://localhost:3003/recent-courses');
        const response = await getAuthenticatedHttpClient().get(`${getConfig().LMS_BASE_URL}/titaned/api/v1/recent-courses/`);
        // const response = await getAuthenticatedHttpClient().get('https://staging.titaned.com/titaned/api/v1/recent-courses/');
        const { data } = response;
        setRecentCourses(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error('Error fetching recent courses:', error);
        setRecentCourses([]);
      }
    };
    fetchRecentCourses();
  }, []);


  return (
    <div className="continue-learning-section">
      {/* Course Cards */}
      {recentCourses?.length > 0 ? (
        <div className="continue-learning-cards">
          {recentCourses.map((course) => (
            <div
              key={course.course_key}
              className="continue-learning-card"
              id={course.course_key}
              data-testid="CourseCard"
            >
              <Card className="continue-learning-card-wrapper">
                <Card.Body className="continue-learning-card-body">
                  {/* Course Image */}
                  <div className="continue-learning-image-container">
                    <img
                      src={course.course_image_url}
                      alt={course.course_name}
                      className="continue-learning-image"
                    />
                  </div>

                  {/* Course Content */}
                  <div className="continue-learning-content">
                    <h3 className="continue-learning-course-title">
                      {course.course_name}
                    </h3>
                    <p className="continue-learning-description">
                      {course.short_description}
                    </p>
                  </div>
                  {/* Resume Course Button */}
                  <button type="button" className="btn btn-primary continue-learning-resume-btn" onClick={() => { window.location.href = course.course_resume_url; }}>
                    Resume Course
                  </button>
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
