import React from 'react';
import PropTypes from 'prop-types';
import useCourseProgress from './hooks/useCourseProgress';

// Simple Progress Bar Component
const CourseProgressBar = ({ progress = 0, loading = false }) => {
  const progressPercentage = Math.min(Math.max(progress, 0), 100);

  if (loading) {
    return (
      <div className="course-progress-container" style={{ marginTop: '8px' }}>
        <div
          className="progress"
          style={{
            height: '6px',
            backgroundColor: '#E9ECEF',
            borderRadius: '3px',
            overflow: 'hidden',
            marginBottom: '8px',
          }}
        >
          <div
            className="progress-bar"
            style={{
              width: '100%',
              backgroundColor: '#E9ECEF',
              borderRadius: '3px',
              animation: 'pulse 1.5s ease-in-out infinite alternate',
            }}
          />
        </div>
        <div>
          <span className="text-muted small">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="course-progress-container" style={{ marginTop: '8px' }}>
      <div
        className="progress"
        style={{
          height: '6px',
          backgroundColor: '#E9ECEF',
          borderRadius: '3px',
          overflow: 'hidden',
          marginBottom: '8px',
        }}
      >
        <div
          className="progress-bar"
          role="progressbar"
          aria-label={`Course progress: ${progressPercentage}%`}
          style={{
            width: `${progressPercentage}%`,
            backgroundColor: '#11047A',
            transition: 'width 0.3s ease',
            borderRadius: '3px',
          }}
          aria-valuenow={progressPercentage}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>
      <div>
        <span className="text-muted small">{progressPercentage}% Completed</span>
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
