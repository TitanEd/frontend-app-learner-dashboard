/* eslint-disable linebreak-style */
/* eslint-disable quotes */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";
import {
  Card, Button, Icon, IconButtonWithTooltip,
} from "@openedx/paragon";
import { reduxHooks } from "hooks";
import { Settings } from "@openedx/paragon/icons";
import useCardDetailsData from "../../containers/CourseCard/components/CourseCardDetails/hooks";

import SelectSessionButton from "../../containers/CourseCard/components/CourseCardActions/SelectSessionButton";
import BeginCourseButton from "../../containers/CourseCard/components/CourseCardActions/BeginCourseButton";
import ResumeButton from "../../containers/CourseCard/components/CourseCardActions/ResumeButton";
import ViewCourseButton from "../../containers/CourseCard/components/CourseCardActions/ViewCourseButton";
// import "./CustomMyCourseWidget.scss";
import CourseCardActions from "../../containers/CourseCard/components/CourseCardActions";
import CourseCardMenu from "../../containers/CourseCard/components/CourseCardMenu";

const fallbackImage = "https://www.generationsforpeace.org/wp-content/uploads/2018/03/empty.jpg";

const CustomMyCourseWidget = ({ cardId }) => {
  console.log('cardId', cardId);
  // Get course basic details
  const { courseName = "Untitled Course", bannerImgSrc = fallbackImage } = reduxHooks.useCardCourseData(cardId) || {};
  console.log('courseName', courseName);
  console.log('bannerImgSrc', bannerImgSrc);

  const displayBannerSrc = bannerImgSrc
    && !bannerImgSrc.includes("images_course_image.jpg")
    && !bannerImgSrc.includes("pencils.jpg")
    ? bannerImgSrc
    : null;

  const { providerName = "", accessMessage = "" } = useCardDetailsData({ cardId }) || {};

  // Hooks for action decision
  const { isEntitlement, isFulfilled } = reduxHooks.useCardEntitlementData(cardId);
  const { hasStarted } = reduxHooks.useCardEnrollmentData(cardId);
  const { isArchived } = reduxHooks.useCardCourseRunData(cardId);

  return (
    <Card style={{ width: "19rem" }} className="cardContainer">
      <Card.ImageCap
        src={displayBannerSrc === null ? fallbackImage : displayBannerSrc}
        srcAlt="Course cover"
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
        </div>
      </Card.Section>
    </Card>
  );
};

export default CustomMyCourseWidget;
