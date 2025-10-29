/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import { Card } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from './components/messages';

const ContinueLearningProgressBar = () => {
  const [recentCourses, setRecentCourses] = useState([]);
  const intl = useIntl();
  useEffect(() => {
    const fetchRecentCourses = async () => {
      try {
        const response = await fetch('http://localhost:3003/recent-courses');
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const data = await response.json();
        console.log(data, 'data in ContinueLearningProgressBar::::');
        setRecentCourses(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching recent courses:', error);
        setRecentCourses([]);
      }
    };
    fetchRecentCourses();
  }, []);

  console.log(recentCourses, 'recentCourses in ContinueLearningProgressBar::::');

  return (
    <div className="continue-learning-section">
      {/* Course Cards */}
      {recentCourses?.length > 0 ? (
        <div className="continue-learning-cards">
          {recentCourses.map((course) => (
            <div
              key={course.cardId}
              className="continue-learning-card"
              id={course.cardId}
              data-testid="CourseCard"
            >
              <Card className="continue-learning-card-wrapper">
                <Card.Body className="continue-learning-card-body">
                  {/* Course Image */}
                  <div className="continue-learning-image-container">
                    <img
                      src={course.bannerImgSrc}
                      alt={course.courseName}
                      className="continue-learning-image"
                    />
                  </div>

                  {/* Course Content */}
                  <div className="continue-learning-content">
                    <h3 className="continue-learning-course-title">
                      {course.courseName}
                    </h3>
                    <p className="continue-learning-description">
                      {course.shortDescription}
                    </p>
                  </div>
                  {/* Resume Course Button */}
                  <button type="button" className="btn btn-primary continue-learning-resume-btn" onClick={() => { window.location.href = course.resumeUrl; }}>
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
