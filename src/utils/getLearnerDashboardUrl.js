import { getConfig } from '@edx/frontend-platform';

/**
 * URL of a page in the learner dashboard MFE, built from Open edX config only.
 *
 * - LEARNER_HOME_MICROFRONTEND_URL: the LMS setting Open edX uses to send
 *   learners to the learner dashboard MFE (exposed in MFE_CONFIG by
 *   tutor-tels-theme-plugins). Used when present so sub pages such as
 *   /my-courses can be opened directly.
 * - Otherwise `${LMS_BASE_URL}/dashboard`: the LMS redirects it to the learner
 *   dashboard MFE (the standard Open edX redirect used by the stock header).
 */
const getLearnerDashboardUrl = (path = '/') => {
  const { LEARNER_HOME_MICROFRONTEND_URL, LMS_BASE_URL } = getConfig();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (LEARNER_HOME_MICROFRONTEND_URL) {
    return `${String(LEARNER_HOME_MICROFRONTEND_URL).replace(/\/+$/, '')}${normalizedPath}`;
  }

  return `${LMS_BASE_URL}/dashboard`;
};

export default getLearnerDashboardUrl;
