/* eslint-disable linebreak-style */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import {
  Card, Button, Icon, IconButtonWithTooltip,
} from "@openedx/paragon";
import { useCourseData, useEntitlementInfo } from "hooks";
import { baseAppUrl } from "data/services/lms/urls";
import { Locked, Settings } from "@openedx/paragon/icons";
import { useIntl } from "@edx/frontend-platform/i18n";
import useCardDetailsData from "../../containers/CourseCard/components/CourseCardDetails/hooks";

import SelectSessionButton from "../../containers/CourseCard/components/CourseCardActions/SelectSessionButton";
import BeginCourseButton from "../../containers/CourseCard/components/CourseCardActions/CustomBeginCourseButton";
import ResumeButton from "../../containers/CourseCard/components/CourseCardActions/CustomResumeButton";
import ViewCourseButton from "../../containers/CourseCard/components/CourseCardActions/CustomViewCourseButton";
import CourseCardMenu from "../../containers/CourseCard/components/CourseCardMenu/CustomCourseCardMenu";
import ActionButton from "../../containers/CourseCard/components/CourseCardActions/ActionButton";
import messages from "../../customMessages";
import bannerMessages from "../../containers/CourseCard/components/CourseCardBanners/messages";
import usePrerequisites from "./usePrerequisites";

const fallbackImage = "https://www.generationsforpeace.org/wp-content/uploads/2018/03/empty.jpg";

const CustomMyCourseWidget = ({ cardId }) => {
  const { formatMessage, formatDate, formatList } = useIntl();
  const courseData = useCourseData(cardId);
  // Locked until the prerequisite courses are completed (Begin/Resume are disabled too).
  const prerequisites = usePrerequisites(cardId);
  // Get course basic details
  const courseName = courseData?.course?.courseName || formatMessage(messages.untitledCourse);
  const bannerImgSrc = courseData?.course?.bannerImgSrc
    ? baseAppUrl(courseData.course.bannerImgSrc)
    : fallbackImage;

  const displayBannerSrc = bannerImgSrc
    && !bannerImgSrc.includes("images_course_image.jpg")
    && !bannerImgSrc.includes("pencils.jpg")
    ? bannerImgSrc
    : null;

  const { providerName = "", accessMessage = "" } = useCardDetailsData({ cardId }) || {};

  // Course run dates (learner-home API: courseRun.startDate / endDate, null
  // when not set in Studio). Each one is left out when missing or unparsable.
  // Short month keeps both dates on one line of the card.
  const formatRunDate = (value) => (
    value && !Number.isNaN(new Date(value).getTime())
      ? formatDate(new Date(value), { year: "numeric", month: "short", day: "numeric" })
      : null
  );
  const courseRun = courseData?.courseRun || {};
  const enrollment = courseData?.enrollment || {};
  // Same rule as the stock card: an advertised start replaces the start date
  // until the run starts.
  const startDate = (!courseRun.isStarted && courseRun.advertisedStart)
    || formatRunDate(courseRun.startDate);
  const endDate = formatRunDate(courseRun.endDate);
  const courseDates = [
    startDate && {
      key: "start",
      text: formatMessage(
        courseRun.isStarted ? messages.courseCardStarted : messages.courseCardStarts,
        { date: startDate },
      ),
    },
    endDate && {
      key: "end",
      text: formatMessage(
        courseRun.isArchived ? messages.courseCardEnded : messages.courseCardEnds,
        { date: endDate },
      ),
    },
  ].filter(Boolean);
  // The stock access message repeats the start/end date except when it tells
  // about the audit access expiry; only that case is kept next to the dates.
  const isAccessExpiryMessage = Boolean(
    courseRun.isStarted
    && enrollment.isEnrolled
    && enrollment.isAudit
    && enrollment.accessExpirationDate,
  );

  // Hooks for action decision
  const { isEntitlement, isFulfilled } = useEntitlementInfo(courseData);
  const hasStarted = courseData?.enrollment?.hasStarted || false;
  const isArchived = courseData?.courseRun?.isArchived || false;
  const certificate = courseData?.certificate
    ? {
      ...courseData.certificate,
      certPreviewUrl: baseAppUrl(courseData.certificate.certPreviewUrl),
    }
    : {};

  const handleViewCertificateClick = () => {
    // console.log('handleViewCertificateClick', certificate.certPreviewUrl);
    window.location.href = certificate.certPreviewUrl;
  };

  return (
    <Card style={{ width: "19rem" }} className="cardContainer">
      <Card.ImageCap
        src={displayBannerSrc === null ? fallbackImage : displayBannerSrc}
        srcAlt={formatMessage(messages.courseCoverAlt)}
        className="cardContainer-image"
      />
      <Card.Section className="text-center card-content-section">
        <div className="title-container">
          {/* Clamped to two lines; the full name shows on hover */}
          <h6 className="card-title fw-bold" title={courseName}>{courseName}</h6>
          <section className="title-subsection">
            <div className="title-messages">
              <p className="text-muted small m-0">{providerName}</p>
              {isAccessExpiryMessage && accessMessage && (
                <p className="text-muted small m-0">{accessMessage}</p>
              )}
            </div>
            <div className="title-icon">
              <CourseCardMenu cardId={cardId} />
            </div>
          </section>
          {courseDates.length > 0 && (
            <p className="course-card-dates text-muted small m-0">
              {courseDates.map(({ key, text }) => (
                <span key={key} className="course-card-dates__item">{text}</span>
              ))}
            </p>
          )}
        </div>

        {prerequisites.isLocked && (
          <div className="course-card-prerequisite" role="note">
            <Icon src={Locked} className="course-card-prerequisite__icon" />
            <p className="m-0">
              {prerequisites.courses.length > 0
                ? formatMessage(messages.courseCardPrerequisite, {
                  courses: formatList(
                    prerequisites.courses.map((course) => (
                      <a key={course.id} href={course.url}>{course.name}</a>
                    )),
                    { type: "conjunction" },
                  ),
                })
                : formatMessage(bannerMessages.prerequisitesNotMet)}
            </p>
          </div>
        )}

        <div className="cardContainer-buttons">
          {/* Action buttons logic */}
          {isEntitlement
            && (isFulfilled ? (
              <ViewCourseButton cardId={cardId} />
            ) : (
              <SelectSessionButton cardId={cardId} />
            ))}

          {isArchived && !isEntitlement && <ViewCourseButton cardId={cardId} />}

          {!(isArchived || isEntitlement)
            && (hasStarted ? (
              <ResumeButton cardId={cardId} />
            ) : (
              <BeginCourseButton cardId={cardId} />
            ))}

          {certificate.isDownloadable && (
          <ActionButton
            // disabled={disableResumeCourse}
            as="a"
            href="#"
            variant="outline-primary"
            onClick={handleViewCertificateClick}
          >
            {formatMessage(messages.viewCertificate)}
          </ActionButton>
          )}
        </div>
      </Card.Section>
    </Card>
  );
};

export default CustomMyCourseWidget;
