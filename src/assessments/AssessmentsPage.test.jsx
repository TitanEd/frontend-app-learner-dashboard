import React from 'react';
import {
  render, screen, fireEvent, within,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import AssessmentsPage from './AssessmentsPage';

jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  getConfig: () => ({ LMS_BASE_URL: 'http://lms.test', FAVICON_URL: '' }),
}));
jest.mock('@edx/frontend-platform/auth', () => ({ getAuthenticatedHttpClient: jest.fn() }));

const assessment = (index, overrides = {}) => ({
  id: `block-${index}`,
  title: `Assessment ${String(index).padStart(2, '0')}`,
  course_id: 'course-v1:A+B+C',
  course: 'Algebra',
  section: 'Section 1',
  format: 'Homework',
  kind: 'quiz',
  status: 'active',
  due: null,
  url: `http://lms.test/jump/${index}`,
  questions: 4,
  answered: 0,
  started: false,
  ...overrides,
});

const load = (items) => {
  getAuthenticatedHttpClient.mockReturnValue({
    get: jest.fn().mockResolvedValue({
      data: {
        items,
        courses: [{ id: 'course-v1:A+B+C', name: 'Algebra' }, { id: 'course-v1:D+E+F', name: 'Biology' }],
      },
    }),
  });
  return render(<IntlProvider locale="en"><AssessmentsPage /></IntlProvider>);
};
const rows = () => screen.queryAllByRole('listitem').filter((item) => item.closest('.tas-list'));

describe('AssessmentsPage', () => {
  beforeAll(() => { window.HTMLElement.prototype.scrollIntoView = jest.fn(); });

  it('asks the learner API', async () => {
    load([assessment(1)]);
    expect((await screen.findAllByText('Assessment 01')).length).toBeGreaterThan(0);
    expect(getAuthenticatedHttpClient().get).toHaveBeenCalledWith('http://lms.test/titaned/api/v2/my-assessments/');
  });

  it('shows no pager when everything fits on one page', async () => {
    load(Array.from({ length: 20 }, (_, index) => assessment(index + 1)));
    await screen.findAllByText('Assessment 01');
    expect(rows()).toHaveLength(20);
    expect(screen.queryByText(/Showing 1–20/)).not.toBeInTheDocument();
  });

  it('shows twenty assessments per page', async () => {
    load(Array.from({ length: 45 }, (_, index) => assessment(index + 1)));
    await screen.findByText('Showing 1–20 of 45');
    expect(rows()).toHaveLength(20);

    fireEvent.click(screen.getAllByRole('button', { name: /^Next/ })[0]);
    expect(await screen.findByText('Showing 21–40 of 45')).toBeInTheDocument();
    expect(rows()).toHaveLength(20);

    fireEvent.click(screen.getAllByRole('button', { name: /^Next/ })[0]);
    expect(await screen.findByText('Showing 41–45 of 45')).toBeInTheDocument();
    expect(rows()).toHaveLength(5);
  });

  it('goes back to the first page when a filter changes', async () => {
    const items = Array.from({ length: 45 }, (_, index) => assessment(index + 1, index >= 30
      ? { course_id: 'course-v1:D+E+F', course: 'Biology' } : {}));
    load(items);
    await screen.findByText('Showing 1–20 of 45');
    fireEvent.click(screen.getAllByRole('button', { name: /^Next/ })[0]);
    await screen.findByText('Showing 21–40 of 45');

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Algebra' } });
    expect(await screen.findByText('Showing 1–20 of 30')).toBeInTheDocument();
  });

  it('keeps a group heading with its full count when the group continues on the next page', async () => {
    load(Array.from({ length: 25 }, (_, index) => assessment(index + 1)));
    await screen.findByText('Showing 1–20 of 25');
    const heading = () => screen.getAllByRole('heading', { level: 2 }).find((item) => item.closest('.tas-group'));
    expect(within(heading()).getByText('25')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: /^Next/ })[0]);
    await screen.findByText('Showing 21–25 of 25');
    expect(within(heading()).getByText('25')).toBeInTheDocument();
  });

  it('says the page is not available when the site does not have the feature', async () => {
    getAuthenticatedHttpClient.mockReturnValue({
      get: jest.fn().mockRejectedValue({ response: { status: 403 } }),
    });
    render(<IntlProvider locale="en"><AssessmentsPage /></IntlProvider>);
    expect(await screen.findByText('This page is not available on this site.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument();
  });

  it('offers to try again when the list cannot be loaded', async () => {
    getAuthenticatedHttpClient.mockReturnValue({
      get: jest.fn().mockRejectedValue({ response: { status: 500 } }),
    });
    render(<IntlProvider locale="en"><AssessmentsPage /></IntlProvider>);
    expect(await screen.findByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('says so when no assessment matches', async () => {
    load([assessment(1)]);
    await screen.findAllByText('Assessment 01');
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'zzz' } });
    expect(rows()).toHaveLength(0);
    expect(screen.getAllByRole('button', { name: 'Clear filters' }).length).toBeGreaterThan(0);
  });
});
