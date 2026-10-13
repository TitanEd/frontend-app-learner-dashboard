/*
 * The learner's home page: the dashboard an administrator composed in Control Hub ->
 * Dashboard Builder -> Learner dashboard (src/dashboardBoard), under the page title.
 */
import React from 'react';
import { Helmet } from 'react-helmet';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Container } from '@openedx/paragon';

import ConfirmEmailBanner from '../../containers/LearnerDashboardHeader/ConfirmEmailBanner/CustomConfirmEmailBanner';
import DashboardBoard from '../../dashboardBoard';
import messages from './components/messages';
import './index.scss';

const BoardHome = () => {
  const intl = useIntl();
  return (
    <div className="dashboard-wrapper">
      <Helmet>
        <title>{intl.formatMessage(messages.pageTitle)}</title>
        <link rel="shortcut icon" href={getConfig().FAVICON_URL} type="image/x-icon" />
      </Helmet>
      <Container fluid size="xl" className="dashboard-main-content">
        <ConfirmEmailBanner />
        <h1 className="dashboard-header">{intl.formatMessage(messages.dashboardPageTitle)}</h1>
        <DashboardBoard audience="learner" />
      </Container>
    </div>
  );
};

export default BoardHome;
