/* eslint-disable linebreak-style */
/* eslint-disable react/prop-types */
import { Container } from '@openedx/paragon';
import React from 'react';

const CustomDashboardLayoutWidget = ({ courseListColumnProps, children }) => (
  <Container fluid size="xl">
    <div {...(courseListColumnProps || {})} className="course-list-column p-0">
      {children}
    </div>
  </Container>
);

export default CustomDashboardLayoutWidget;
