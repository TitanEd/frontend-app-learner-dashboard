import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { useCourseTrackingEvent, useCourseData } from 'hooks';
import { baseAppUrl } from 'data/services/lms/urls';

import track from 'tracking';
import useActionDisabledState from '../hooks';
import ResumeButton from './ResumeButton';

const authOrgId = 'auth-org-id';
jest.mock('data/hooks', () => ({
  useInitializeLearnerHome: jest.fn().mockReturnValue({
    data: {
      enterpriseDashboard: {
        authOrgId,
      },
    },
  }),
}));

jest.mock('hooks', () => ({
  useCourseData: jest.fn().mockReturnValue({
    enrollment: { mode: 'executive-education' },
    courseRun: { homeUrl: 'home-url' },
  }),
  useCourseTrackingEvent: jest.fn().mockReturnValue({
    trackCourseEvent: jest.fn(),
  }),
}));

jest.mock('tracking', () => ({
  course: {
    enterCourseClicked: jest.fn().mockName('segment.enterCourseClicked'),
  },
}));

jest.mock('../hooks', () => jest.fn(() => ({ disableResumeCourse: false })));

jest.mock('./ActionButton/hooks', () => jest.fn(() => false));

useCourseData.mockReturnValue({
  enrollment: { mode: 'executive-education' },
  courseRun: { resumeUrl: '/resume-url' },
});

describe('ResumeButton', () => {
  const props = {
    cardId: 'cardId',
  };
  describe('initialize hooks', () => {
    beforeEach(() => render(<IntlProvider locale="en"><ResumeButton {...props} /></IntlProvider>));
    it('initializes course run data with cardId', () => {
      expect(useCourseData).toHaveBeenCalledWith(props.cardId);
    });
    it('does not use action hooks disabled state (TELS uses enrollment.allowResume)', () => {
      expect(useActionDisabledState).not.toHaveBeenCalled();
    });
  });
  describe('behavior', () => {
    describe('disabled', () => {
      beforeEach(() => {
        useCourseData.mockReturnValueOnce({
          enrollment: { mode: 'executive-education', allowResume: false },
          courseRun: { resumeUrl: '/resume-url' },
        });
      });
      it('should be disabled', () => {
        render(<IntlProvider locale="en"><ResumeButton {...props} /></IntlProvider>);
        const button = screen.getByRole('button', { name: 'Resume' });
        expect(button).toHaveClass('disabled');
        expect(button).toHaveAttribute('aria-disabled', 'true');
      });
    });
    describe('enabled', () => {
      it('should be enabled', () => {
        render(<IntlProvider locale="en"><ResumeButton {...props} /></IntlProvider>);
        const button = screen.getByRole('button', { name: 'Resume' });
        expect(button).toBeInTheDocument();
        expect(button).not.toHaveClass('disabled');
        expect(button).not.toHaveAttribute('aria-disabled', 'true');
      });
      it('should track enter course clicked event on click, with exec ed param', async () => {
        render(<IntlProvider locale="en"><ResumeButton {...props} /></IntlProvider>);
        const user = userEvent.setup();
        const button = screen.getByRole('button', { name: 'Resume' });
        user.click(button);
        expect(useCourseTrackingEvent).toHaveBeenCalledWith(
          track.course.enterCourseClicked,
          props.cardId,
          baseAppUrl(`/resume-url?org_id=${authOrgId}`),
        );
      });
    });
  });
});
