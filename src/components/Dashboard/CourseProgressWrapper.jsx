import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import useCourseProgress from '../../hooks/useCourseProgress';

import messages from './components/messages';

// SVG Progress Bar Component
const CourseProgressBar = ({ progress = 0, loading = false }) => {
  const progressPercentage = Math.min(Math.max(progress, 0), 100);
  const barWidth = 280;
  const barHeight = 8;
  const completedWidth = (progressPercentage / 100) * barWidth;
  const intl = useIntl();

  if (loading) {
    return (
      <div className="course-progress-container" style={{ marginTop: '8px' }}>
        <svg
          width={barWidth}
          height={barHeight}
          viewBox={`0 0 ${barWidth} ${barHeight}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ marginBottom: '8px' }}
        >
          <rect width={barWidth} height={barHeight} rx="4" fill="#F5F5F5" />
          <rect
            width={barWidth}
            height={barHeight}
            rx="4"
            fill="#F5F5F5"
            style={{
              animation: 'pulse 1.5s ease-in-out infinite alternate',
            }}
          />
        </svg>
        <div>
          <span className="text-muted small">{intl.formatMessage(messages.loadingSmall)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="course-progress-container" style={{ marginTop: '8px' }}>
      <svg
        width={barWidth}
        height={barHeight}
        viewBox={`0 0 ${barWidth} ${barHeight}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ marginBottom: '8px' }}
        role="img"
        aria-label={`Course progress: ${progressPercentage}%`}
      >
        {/* Background bar */}
        <rect width={barWidth} height={barHeight} rx="4" fill="#F5F5F5" />
        {/* Progress bar */}
        <rect
          width={completedWidth}
          height={barHeight}
          rx="4"
          fill="#2B2399"
          style={{
            transition: 'width 0.3s ease',
          }}
        />
      </svg>
      <div>
        <span className="text-muted small">{progressPercentage}% {intl.formatMessage(messages.completedSuffix)}</span>
      </div>
    </div>
  );
};

CourseProgressBar.propTypes = {
  progress: PropTypes.number,
  loading: PropTypes.bool,
};

// Wrapper component that fetches progress data
const CourseProgressWrapper = ({ courseId }) => {
  console.log('CourseProgressWrapper received courseId:', courseId);
  const { progress, loading, error } = useCourseProgress(courseId);

  if (error) {
    console.error('Error loading progress for course:', courseId, error);
    // Show 0% progress on error
    return <CourseProgressBar progress={0} loading={false} />;
  }

  return (
    <CourseProgressBar
      progress={progress?.percentage || 0}
      loading={loading}
    />
  );
};

CourseProgressWrapper.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default CourseProgressWrapper;
