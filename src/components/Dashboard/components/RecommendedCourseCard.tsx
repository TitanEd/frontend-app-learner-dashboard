/* eslint-disable max-len */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable linebreak-style */
import React from 'react';
import {
  Card, Button,
} from '@openedx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './RecommendedCourseCard.scss';
import { useFormatDate } from '../../../utils/hooks';
// import { Repeat } from '@openedx/paragon/icons';

type RecommendedCourseCardProps = {
  imageSrc?: string;
  title: string;
  metadata: string;
  onViewLive?: () => void;
  // onEditCourse?: () => void;
  // onReRun?: () => void;
  // isReRunEnabled?: boolean;
  courseDate?: string;
  noOfStudents?: number;
  noOfLessons?: number;
};

const fallbackImage = 'https://www.generationsforpeace.org/wp-content/uploads/2018/03/empty.jpg';

const RecommendedCourseCard: React.FC<RecommendedCourseCardProps> = ({
  imageSrc,
  title,
  metadata,
  onViewLive,
  courseDate,
  noOfStudents,
  noOfLessons,
  // onEditCourse,
  // onReRun,
  // isReRunEnabled = false,
}) => {
  const formatDate = useFormatDate();
  const displayBannerSrc = imageSrc
    && !imageSrc.includes('images_course_image.jpg')
    && !imageSrc.includes('pencils.jpg')
    ? imageSrc
    : null;

  return (
    <Card style={{ width: '19rem' }} className="recommended-course-card" onClick={onViewLive}>
      <Card.ImageCap
        src={displayBannerSrc === null ? fallbackImage : displayBannerSrc}
        srcAlt="Course cover"
        className="recommended-course-card-image"
      />
      <Card.Section className="text-center recommended-course-card-content-section">
        <div className="recommended-course-card-title-container">
          <p className="recommended-course-card-date">{courseDate !== null ? formatDate(courseDate) : formatDate(new Date())}</p>
          <h6 className="recommended-course-card-title fw-bold">{title}</h6>
        </div>
        <div className="recommended-course-card-metadata">
          <p className="metadata-item">
            <FontAwesomeIcon icon="book" className="mr-1" />
            {noOfLessons != null ? `${noOfLessons} Lessons` : '10 Lessons'}
          </p>
          <p className="metadata-item">
            <FontAwesomeIcon icon="users" className="mr-1" />
            {noOfStudents != null ? `${noOfStudents} Students` : '32 Students'}
          </p>
          {/* <Button size="sm" variant="primary" onClick={onViewLive}>View Course</Button> */}
          {/* <Button size="sm" variant="outline-primary" onClick={onEditCourse}>Edit course</Button>
          {isReRunEnabled && (
          <IconButtonWithTooltip src={Repeat} size="sm" variant="primary" iconAs={Icon} alt="Re-run" tooltipPlacement="bottom" tooltipContent="Re-run" onClick={onReRun} />
          )} */}
        </div>
      </Card.Section>
    </Card>
  );
};

export default RecommendedCourseCard;
