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
import { Settings } from "@openedx/paragon/icons";
import { useIntl } from "@edx/frontend-platform/i18n";
import useCardDetailsData from "../../containers/CourseCard/components/CourseCardDetails/hooks";

import SelectSessionButton from "../../containers/CourseCard/components/CourseCardActions/SelectSessionButton";
import BeginCourseButton from "../../containers/CourseCard/components/CourseCardActions/CustomBeginCourseButton";
import ResumeButton from "../../containers/CourseCard/components/CourseCardActions/CustomResumeButton";
import ViewCourseButton from "../../containers/CourseCard/components/CourseCardActions/CustomViewCourseButton";
import CourseCardMenu from "../../containers/CourseCard/components/CourseCardMenu/CustomCourseCardMenu";
import ActionButton from "../../containers/CourseCard/components/CourseCardActions/ActionButton";
import messages from "../../customMessages";

const fallbackImage = "https://www.generationsforpeace.org/wp-content/uploads/2018/03/empty.jpg";

const CustomMyCourseWidget = ({ cardId }) => {
  const { formatMessage } = useIntl();
  const courseData = useCourseData(cardId);
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
          <h6 className="card-title fw-bold">{courseName}</h6>
          <section className="title-subsection">
            <div className="title-messages">
              <p className="text-muted small m-0">{providerName}</p>
              <p className="text-muted small m-0">{accessMessage}</p>
            </div>
            <div className="title-icon">
              <CourseCardMenu cardId={cardId} />
            </div>
          </section>
        </div>

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
