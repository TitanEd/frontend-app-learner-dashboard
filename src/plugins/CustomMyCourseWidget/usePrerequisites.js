/*
 * Courses locked by prerequisites on My Courses.
 *
 * The learner home API only says whether a course has unmet prerequisites
 * (enrollment.coursewareAccess.hasUnmetPrerequisites); control-hub names them
 * (GET {LMS}/titaned/api/v2/my-courses/prerequisites/):
 *
 *   { "course-v1:Org+B+1": [{ id: "course-v1:Org+A+1", name: "Course A", url: "…" }] }
 *
 * Fetched once per page for all cards (per learner when staff use "View as").
 * Course staff are not locked, as in the platform.
 */
import { useEffect, useState } from 'react';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { useMasquerade } from 'data/context';
import { useCourseData } from 'hooks';

const pending = {};

const fetchPrerequisites = (user = '') => {
  if (!pending[user]) {
    pending[user] = getAuthenticatedHttpClient()
      .get(`${getConfig().LMS_BASE_URL}/titaned/api/v2/my-courses/prerequisites/`, { params: user ? { user } : {} })
      .then(({ data }) => data || {})
      .catch(() => { delete pending[user]; return {}; });
  }
  return pending[user];
};

// For tests.
export const forgetPrerequisites = () => { Object.keys(pending).forEach((user) => { delete pending[user]; }); };

/** `{ isLocked, courses }`: whether the card's course waits for prerequisites, and which ones. */
export const usePrerequisites = (cardId) => {
  const courseData = useCourseData(cardId);
  const { hasUnmetPrerequisites, isStaff } = courseData?.enrollment?.coursewareAccess || {};
  const courseId = courseData?.courseRun?.courseId;
  const { masqueradeUser } = useMasquerade();
  const [all, setAll] = useState({});
  useEffect(() => {
    let mounted = true;
    if (hasUnmetPrerequisites && !isStaff) {
      fetchPrerequisites(masqueradeUser || '').then((data) => { if (mounted) { setAll(data); } });
    }
    return () => { mounted = false; };
  }, [hasUnmetPrerequisites, isStaff, masqueradeUser]);
  const courses = (courseId && all[courseId]) || [];
  return { isLocked: Boolean(hasUnmetPrerequisites && !isStaff), courses };
};

export default usePrerequisites;
