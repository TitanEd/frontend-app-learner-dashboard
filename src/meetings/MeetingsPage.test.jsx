import React from 'react';
import {
  render, screen, fireEvent, within,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import MeetingsPage from './MeetingsPage';
import {
  icsFor, inPeriod, prepare, tabOf,
} from './meetingUtils';

jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  getConfig: () => ({ LMS_BASE_URL: 'http://lms.test', FAVICON_URL: '' }),
}));
jest.mock('@edx/frontend-platform/auth', () => ({ getAuthenticatedHttpClient: jest.fn() }));

const MINUTE = 60 * 1000;
const at = (minutes) => new Date(Date.now() + minutes * MINUTE).toISOString();
const meeting = (index, startIn, overrides = {}) => ({
  id: `occ-${index}`,
  meeting_id: `m-${index}`,
  topic: `Class ${String(index).padStart(2, '0')}`,
  agenda: '',
  course_id: 'course-v1:A+B+C',
  course: 'Leadership',
  start: at(startIn),
  end: at(startIn + 45),
  duration: 45,
  time_zone: 'UTC',
  host: 'Ada Teacher',
  is_recurring: false,
  status: 'upcoming',
  join_opens: at(startIn - 15),
  can_join: false,
  join_url: `http://lms.test/join/m-${index}/meeting/`,
  recording_url: '',
  ...overrides,
});

const load = (items) => {
  getAuthenticatedHttpClient.mockReturnValue({
    get: jest.fn().mockResolvedValue({
      data: {
        items,
        courses: [{ id: 'course-v1:A+B+C', name: 'Leadership' }, { id: 'course-v1:D+E+F', name: 'Maths' }],
        time_zone: 'UTC',
        truncated: false,
      },
    }),
  });
  return render(<IntlProvider locale="en"><MeetingsPage /></IntlProvider>);
};
const rows = () => screen.queryAllByRole('listitem').filter((item) => item.closest('.mtg-list'));

describe('MeetingsPage', () => {
  beforeAll(() => { window.HTMLElement.prototype.scrollIntoView = jest.fn(); });

  it('asks the learner API and opens the upcoming tab', async () => {
    load([meeting(1, 24 * 60)]);
    expect(await screen.findByRole('heading', { name: 'Class 01' })).toBeInTheDocument();
    expect(getAuthenticatedHttpClient().get).toHaveBeenCalledWith('http://lms.test/titaned/api/v2/my-meetings/', { params: {} });
    expect(screen.getByRole('tab', { name: /Upcoming/ })).toHaveAttribute('aria-selected', 'true');
  });

  it('opens the live tab when a class is live, with an enabled join button', async () => {
    load([meeting(1, -10, { status: 'live' }), meeting(2, 24 * 60)]);
    const row = (await screen.findByRole('heading', { name: 'Class 01' })).closest('article');
    expect(screen.getByRole('tab', { name: /Live now/ })).toHaveAttribute('aria-selected', 'true');
    const join = within(row).getByRole('link', { name: 'Join' });
    expect(join).toHaveAttribute('href', 'http://lms.test/join/m-1/meeting/');
    expect(rows()).toHaveLength(1);
  });

  it('keeps the join button closed until shortly before the start', async () => {
    load([meeting(1, 120)]);
    const row = (await screen.findByRole('heading', { name: 'Class 01' })).closest('article');
    expect(within(row).getByRole('button', { name: 'Join' })).toBeDisabled();
    expect(within(row).getByText(/You can join from/)).toBeInTheDocument();
  });

  it('shows past classes with their recording', async () => {
    load([meeting(1, -24 * 60, { status: 'ended', recording_url: 'https://cdn.test/rec.mp4' })]);
    fireEvent.click(await screen.findByRole('tab', { name: /Past/ }));
    expect(screen.getByRole('link', { name: 'Watch recording' })).toHaveAttribute('href', 'https://cdn.test/rec.mp4');
  });

  it('filters by course, type and text', async () => {
    load([
      meeting(1, 60 * 24),
      meeting(2, 60 * 25, { course_id: 'course-v1:D+E+F', course: 'Maths' }),
      meeting(3, 60 * 26, { is_recurring: true, topic: 'Weekly feedback' }),
    ]);
    await screen.findAllByText('Class 01');
    expect(rows()).toHaveLength(3);
    fireEvent.change(screen.getByLabelText('Course'), { target: { value: 'course-v1:D+E+F' } });
    expect(rows()).toHaveLength(1);
    fireEvent.change(screen.getByLabelText('Course'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'recurring' } });
    expect(rows()).toHaveLength(1);
    fireEvent.change(screen.getByLabelText('Type'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Search'), { target: { value: 'feedback' } });
    expect(rows()).toHaveLength(1);
    fireEvent.click(screen.getAllByRole('button', { name: 'Clear filters' })[0]);
    expect(rows()).toHaveLength(3);
  });

  it('says so when live classes are not part of the plan', async () => {
    getAuthenticatedHttpClient.mockReturnValue({ get: jest.fn().mockRejectedValue({ response: { status: 403 } }) });
    render(<IntlProvider locale="en"><MeetingsPage /></IntlProvider>);
    expect(await screen.findByText('Live classes are not part of this site.')).toBeInTheDocument();
  });

  it('shows an empty state', async () => {
    load([]);
    expect(await screen.findByText('No upcoming classes')).toBeInTheDocument();
  });
});

describe('meetingUtils', () => {
  it('moves a class on with the clock', () => {
    const now = new Date();
    const [item] = prepare([meeting(1, -5)], now);
    expect(item.status).toBe('live');
    expect(item.canJoin).toBe(true);
    const [over] = prepare([meeting(2, -60)], now);
    expect(over.status).toBe('ended');
    expect(tabOf(over, now)).toBe('past');
  });

  it('knows the periods in a time zone', () => {
    const now = new Date('2026-11-04T10:00:00Z'); // a Wednesday
    expect(inPeriod(new Date('2026-11-04T23:30:00Z'), 'today', now, 'UTC')).toBe(true);
    expect(inPeriod(new Date('2026-11-04T23:30:00Z'), 'today', now, 'Asia/Kolkata')).toBe(false);
    expect(inPeriod(new Date('2026-11-02T08:00:00Z'), 'week', now, 'UTC')).toBe(true);
    expect(inPeriod(new Date('2026-11-09T08:00:00Z'), 'week', now, 'UTC')).toBe(false);
    expect(inPeriod(new Date('2026-11-20T08:00:00Z'), 'custom', now, 'UTC', '2026-11-19', '2026-11-21')).toBe(true);
  });

  it('writes a calendar file', () => {
    const [item] = prepare([meeting(1, 60, { topic: 'Feedback, part 1; intro' })], new Date());
    const ics = icsFor(item);
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('SUMMARY:Feedback\\, part 1\\; intro');
    expect(ics).toMatch(/DTSTART:\d{8}T\d{6}Z/);
    expect(ics.split('\r\n').every((line) => line.length <= 75)).toBe(true);
  });
});
