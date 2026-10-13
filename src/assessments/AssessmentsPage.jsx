/*
 * "My Assessments" (left navigation of the learner dashboard): the quizzes, exams and
 * assignments of every course the learner is enrolled in, with status, due date and score.
 * Filters: status, course, assessment type, due period, search. A row opens the assessment
 * in the course.
 *
 * Data: GET {LMS}/titaned/api/v2/my-assessments/ (control-hub assignment_manager/overview.py).
 * The list is small (the graded subsections of the learner's courses), so filtering and
 * grouping happen here, in the learner's own time zone.
 */
import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button, Container, Form, Icon, Pagination, Spinner,
} from '@openedx/paragon';
import {
  ArrowForward, Assignment, CheckCircle, Edit, HourglassEmpty, Quiz, Schedule, Search, Timer, UploadFile,
  VerifiedUser, Warning,
} from '@openedx/paragon/icons';

import messages from './messages';
import './style.scss';

const DAY = 24 * 60 * 60 * 1000;
const KINDS = {
  quiz: { icon: Quiz, label: messages.kindQuiz },
  timed_exam: { icon: Timer, label: messages.kindTimedExam },
  entrance_exam: { icon: VerifiedUser, label: messages.kindEntranceExam },
  open_response: { icon: Edit, label: messages.kindOpenResponse },
  staff_graded: { icon: UploadFile, label: messages.kindStaffGraded },
};
const STATUSES = {
  past_due: { icon: Warning, label: messages.statusPastDue },
  due: { icon: Schedule, label: messages.statusDue },
  active: { icon: Assignment, label: messages.statusActive },
  submitted: { icon: CheckCircle, label: messages.statusSubmitted },
};
const STATUS_ORDER = ['past_due', 'due', 'active', 'submitted'];
const GROUPS = [
  ['past_due', messages.groupPastDue],
  ['today', messages.groupToday],
  ['tomorrow', messages.groupTomorrow],
  ['week', messages.groupWeek],
  ['later', messages.groupLater],
  ['open', messages.groupOpen],
  ['submitted', messages.groupSubmitted],
];

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
// Whole calendar days from today to the date (0 = today, negative = in the past).
const daysAway = (date, now) => Math.round((startOfDay(date) - startOfDay(now)) / DAY);

const inPeriod = (due, period, now) => {
  if (!period) { return true; }
  if (!due) { return false; }
  const days = daysAway(due, now);
  if (period === 'today') { return days === 0; }
  if (period === 'tomorrow') { return days === 1; }
  if (period === 'week') {
    // The calendar week, Monday to Sunday.
    const monday = startOfDay(now);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    return due >= monday && due < new Date(monday.getTime() + 7 * DAY);
  }
  if (period === 'month') { return due.getFullYear() === now.getFullYear() && due.getMonth() === now.getMonth(); }
  return due.getFullYear() === now.getFullYear();
};

const groupOf = (item, now) => {
  if (item.status === 'submitted') { return 'submitted'; }
  if (item.status === 'past_due') { return 'past_due'; }
  if (!item.dueDate) { return 'open'; }
  const days = daysAway(item.dueDate, now);
  if (days <= 0) { return 'today'; }
  if (days === 1) { return 'tomorrow'; }
  return days <= 7 ? 'week' : 'later';
};

const Ring = ({ percent, children, size = 120 }) => {
  const radius = 52;
  const length = 2 * Math.PI * radius;
  return (
    <span className="tas-ring" style={{ inlineSize: size }}>
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle className="tas-ring__track" cx="60" cy="60" r={radius} />
        <circle
          className="tas-ring__value"
          cx="60"
          cy="60"
          r={radius}
          strokeDasharray={length}
          strokeDashoffset={length * (1 - Math.min(100, percent) / 100)}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <span className="tas-ring__inside">{children}</span>
    </span>
  );
};

Ring.propTypes = {
  percent: PropTypes.number.isRequired,
  children: PropTypes.node.isRequired,
  size: PropTypes.number,
};

const PAGE_SIZE = 20;

const AssessmentsPage = () => {
  const intl = useIntl();
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  const [status, setStatus] = useState('');
  const [course, setCourse] = useState('');
  const [kind, setKind] = useState('');
  const [period, setPeriod] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const listTop = useRef(null);

  const load = useCallback(() => {
    setFailed(false);
    getAuthenticatedHttpClient()
      .get(`${getConfig().LMS_BASE_URL}/titaned/api/v2/my-assessments/`)
      .then((response) => setData(response.data))
      // 403: the feature this page belongs to is not part of the site's plan.
      .catch((error) => setFailed(error?.response?.status === 403 ? 'unavailable' : true));
  }, []);
  useEffect(() => { load(); }, [load]);

  const now = useMemo(() => new Date(), [data]); // eslint-disable-line react-hooks/exhaustive-deps
  const items = useMemo(() => (data ? data.items.map((item) => ({
    ...item, dueDate: item.due ? new Date(item.due) : null,
  })) : []), [data]);

  // Every filter but the status one: the status chips count what the other filters leave.
  const scoped = useMemo(() => {
    const text = query.trim().toLowerCase();
    return items.filter((item) => (!course || item.course_id === course)
      && (!kind || item.kind === kind)
      && inPeriod(item.dueDate, period, now)
      && (!text || `${item.title} ${item.course} ${item.section} ${item.format}`.toLowerCase().includes(text)));
  }, [items, course, kind, period, query, now]);
  const shown = useMemo(() => scoped.filter((item) => !status || item.status === status), [scoped, status]);
  const counts = useMemo(
    () => scoped.reduce((all, item) => ({ ...all, [item.status]: (all[item.status] || 0) + 1 }), {}),
    [scoped],
  );

  const groups = useMemo(() => {
    const byGroup = {};
    shown.forEach((item) => { const key = groupOf(item, now); (byGroup[key] = byGroup[key] || []).push(item); });
    Object.entries(byGroup).forEach(([key, list]) => list.sort((a, b) => {
      if (!a.dueDate || !b.dueDate) { return (a.dueDate ? -1 : 0) - (b.dueDate ? -1 : 0); }
      // The closest date first; for what is over, the most recent first.
      return key === 'past_due' || key === 'submitted' ? b.dueDate - a.dueDate : a.dueDate - b.dueDate;
    }));
    return GROUPS.filter(([key]) => byGroup[key]).map(([key, label]) => ({ key, label, list: byGroup[key] }));
  }, [shown, now]);

  // PAGE_SIZE assessments per page; a group that does not fit goes on over the next page.
  useEffect(() => { setPage(1); }, [status, course, kind, period, query]);
  const pageCount = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageGroups = useMemo(() => {
    let skip = (currentPage - 1) * PAGE_SIZE;
    let room = PAGE_SIZE;
    return groups.map((group) => {
      const list = group.list.slice(skip, skip + room);
      skip = Math.max(0, skip - group.list.length);
      room -= list.length;
      return { ...group, total: group.list.length, list };
    }).filter((group) => group.list.length > 0);
  }, [groups, currentPage]);
  const goToPage = (number) => {
    setPage(number);
    if (listTop.current) { listTop.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  };

  const time = (date) => intl.formatTime(date, { hour: 'numeric', minute: '2-digit' });
  const day = (date) => intl.formatDate(date, {
    weekday: 'short', month: 'short', day: 'numeric', year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  });
  const dueText = (item) => {
    if (!item.dueDate) { return intl.formatMessage(messages.noDueDate); }
    const days = daysAway(item.dueDate, now);
    if (item.status === 'submitted') { return intl.formatMessage(item.dueDate < now ? messages.wasDue : messages.dueOn, { date: day(item.dueDate) }); }
    if (item.dueDate < now) { return intl.formatMessage(messages.overdueDays, { count: -days }); }
    if (days === 0) { return intl.formatMessage(messages.dueToday, { time: time(item.dueDate) }); }
    if (days === 1) { return intl.formatMessage(messages.dueTomorrow, { time: time(item.dueDate) }); }
    if (days <= 7) { return intl.formatMessage(messages.dueInDays, { count: days }); }
    return intl.formatMessage(messages.dueOn, { date: day(item.dueDate) });
  };
  const action = (item) => {
    if (item.status === 'submitted') { return messages.review; }
    if (item.status === 'past_due') { return messages.open; }
    return item.started ? messages.resume : messages.start;
  };

  const title = intl.formatMessage(messages.pageTitle);
  const filtered = Boolean(status || course || kind || period || query.trim());
  const clear = () => { setStatus(''); setCourse(''); setKind(''); setPeriod(''); setQuery(''); };

  let body;
  if (failed) {
    body = (
      <div className="tas-state" role="alert">
        <p>{intl.formatMessage(failed === 'unavailable' ? messages.unavailable : messages.error)}</p>
        {failed !== 'unavailable' && (
          <Button variant="outline-primary" onClick={load}>{intl.formatMessage(messages.retry)}</Button>
        )}
      </div>
    );
  } else if (!data) {
    body = <div className="tas-state"><Spinner animation="border" variant="primary" screenReaderText={intl.formatMessage(messages.loading)} /></div>;
  } else {
    const total = items.length;
    const all = items.reduce((sum, item) => ({ ...sum, [item.status]: (sum[item.status] || 0) + 1 }), {});
    const donePercent = total ? Math.round(((all.submitted || 0) / total) * 100) : 0;
    const waiting = items.filter((item) => item.status !== 'submitted');
    // The one to do now: the closest due date still open, else what is overdue, else anything open.
    const upNext = waiting.filter((item) => item.status !== 'past_due' && item.dueDate).sort((a, b) => a.dueDate - b.dueDate)[0]
      || waiting.filter((item) => item.status === 'past_due').sort((a, b) => b.dueDate - a.dueDate)[0]
      || waiting[0];
    let headline = intl.formatMessage(messages.heroOnTrack);
    if (total && !waiting.length) {
      headline = intl.formatMessage(messages.heroAllDone);
    } else if (all.past_due) {
      headline = intl.formatMessage(messages.heroPastDue, { count: all.past_due });
    } else if (all.due) {
      headline = intl.formatMessage(messages.heroDue, { count: all.due });
    }
    const kindsHere = Object.keys(KINDS).filter((key) => items.some((item) => item.kind === key));

    body = (
      <>
        <section className="tas-hero">
          <Ring percent={donePercent}>
            <strong>{intl.formatNumber(donePercent / 100, { style: 'percent' })}</strong>
            <small>{intl.formatMessage(messages.done)}</small>
          </Ring>
          <div className="tas-hero__text">
            <h1>{title}</h1>
            <p>{total ? headline : intl.formatMessage(messages.intro)}</p>
          </div>
          {upNext && (
            <a className="tas-next" href={upNext.url}>
              <span className="tas-next__label">{intl.formatMessage(messages.upNext)}</span>
              <strong>{upNext.title}</strong>
              <span className="tas-next__course">{upNext.course}</span>
              <span className="tas-next__due"><Icon src={Schedule} size="sm" /> {dueText(upNext)}</span>
              <span className="tas-next__go">
                {intl.formatMessage(action(upNext))} <Icon src={ArrowForward} size="sm" />
              </span>
            </a>
          )}
        </section>

        {total === 0 ? (
          <div className="tas-state tas-card">
            <Icon src={Assignment} className="tas-state__icon" />
            <h2>{intl.formatMessage(messages.emptyTitle)}</h2>
            <p>{intl.formatMessage(messages.emptyText)}</p>
            <Button variant="primary" href={`${getConfig().LMS_BASE_URL}/courses`}>{intl.formatMessage(messages.browseCourses)}</Button>
          </div>
        ) : (
          <>
            <div className="tas-chips" role="group" aria-label={title}>
              <button type="button" className={`tas-chip ${status === '' ? 'is-on' : ''}`} aria-pressed={status === ''} onClick={() => setStatus('')}>
                <span>{intl.formatMessage(messages.statusAll)}</span>
                <strong>{intl.formatNumber(scoped.length)}</strong>
              </button>
              {STATUS_ORDER.map((key) => (
                <button
                  type="button"
                  key={key}
                  className={`tas-chip tas-chip--${key} ${status === key ? 'is-on' : ''}`}
                  aria-pressed={status === key}
                  onClick={() => setStatus(status === key ? '' : key)}
                >
                  <Icon src={STATUSES[key].icon} size="sm" />
                  <span>{intl.formatMessage(STATUSES[key].label)}</span>
                  <strong>{intl.formatNumber(counts[key] || 0)}</strong>
                </button>
              ))}
            </div>

            <div className="tas-filters tas-card">
              <Form.Group controlId="tas-course">
                <Form.Label>{intl.formatMessage(messages.filterCourse)}</Form.Label>
                <Form.Control as="select" value={course} onChange={(event) => setCourse(event.target.value)}>
                  <option value="">{intl.formatMessage(messages.filterAllCourses)}</option>
                  {data.courses.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
                </Form.Control>
              </Form.Group>
              <Form.Group controlId="tas-kind">
                <Form.Label>{intl.formatMessage(messages.filterType)}</Form.Label>
                <Form.Control as="select" value={kind} onChange={(event) => setKind(event.target.value)}>
                  <option value="">{intl.formatMessage(messages.filterAllTypes)}</option>
                  {kindsHere.map((key) => (
                    <option key={key} value={key}>{intl.formatMessage(KINDS[key].label)}</option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Form.Group controlId="tas-due">
                <Form.Label>{intl.formatMessage(messages.filterDue)}</Form.Label>
                <Form.Control as="select" value={period} onChange={(event) => setPeriod(event.target.value)}>
                  <option value="">{intl.formatMessage(messages.filterAnyTime)}</option>
                  <option value="today">{intl.formatMessage(messages.filterToday)}</option>
                  <option value="tomorrow">{intl.formatMessage(messages.filterTomorrow)}</option>
                  <option value="week">{intl.formatMessage(messages.filterWeek)}</option>
                  <option value="month">{intl.formatMessage(messages.filterMonth)}</option>
                  <option value="year">{intl.formatMessage(messages.filterYear)}</option>
                </Form.Control>
              </Form.Group>
              <Form.Group controlId="tas-search" className="tas-filters__search">
                <Form.Label>{intl.formatMessage(messages.search)}</Form.Label>
                <Form.Control
                  type="search"
                  value={query}
                  leadingElement={<Icon src={Search} />}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </Form.Group>
              <div className="tas-filters__foot">
                <span aria-live="polite">{intl.formatMessage(messages.showing, { count: shown.length })}</span>
                {filtered && <Button variant="link" size="inline" onClick={clear}>{intl.formatMessage(messages.clearFilters)}</Button>}
              </div>
            </div>

            {shown.length === 0 && (
              <div className="tas-state tas-card">
                <h2>{intl.formatMessage(messages.noMatchTitle)}</h2>
                <Button variant="outline-primary" onClick={clear}>{intl.formatMessage(messages.clearFilters)}</Button>
              </div>
            )}

            <div ref={listTop} className="tas-list-top" />
            {pageGroups.map((group) => (
              <section key={group.key} className={`tas-group tas-group--${group.key}`}>
                <h2>{intl.formatMessage(group.label)} <span>{intl.formatNumber(group.total)}</span></h2>
                <ul className="tas-list">
                  {group.list.map((item) => {
                    const meta = KINDS[item.kind] || KINDS.quiz;
                    const progress = item.questions ? Math.round((item.answered / item.questions) * 100) : 0;
                    return (
                      <li key={item.id}>
                        <a className={`tas-item tas-item--${item.status}`} href={item.url}>
                          <span className="tas-item__icon"><Icon src={meta.icon} /></span>
                          <span className="tas-item__main">
                            <strong>{item.title}</strong>
                            <span className="tas-item__course">{item.course} · {item.section}</span>
                            <span className="tas-item__tags">
                              <span className="tas-tag">{intl.formatMessage(meta.label)}</span>
                              {item.format && item.format !== intl.formatMessage(meta.label) && <span className="tas-tag tas-tag--plain">{item.format}</span>}
                              <span className={`tas-tag tas-tag--${item.status}`}>
                                <Icon src={STATUSES[item.status].icon} size="xs" /> {intl.formatMessage(STATUSES[item.status].label)}
                              </span>
                              {item.awaiting_grade && (
                                <span className="tas-tag tas-tag--due"><Icon src={HourglassEmpty} size="xs" /> {intl.formatMessage(messages.awaitingGrade)}</span>
                              )}
                            </span>
                          </span>
                          <span className="tas-item__when">
                            <span className="tas-item__due"><Icon src={Schedule} size="sm" /> {dueText(item)}</span>
                            {item.dueDate && <small>{day(item.dueDate)}, {time(item.dueDate)}</small>}
                          </span>
                          <span className="tas-item__state">
                            {item.percent !== null && item.percent !== undefined ? (
                              <>
                                <span className="tas-item__score">{intl.formatNumber(item.percent / 100, { style: 'percent' })}</span>
                                <small>
                                  {intl.formatMessage(messages.scoreOf, {
                                    earned: intl.formatNumber(item.earned),
                                    possible: intl.formatNumber(item.possible),
                                  })}
                                </small>
                              </>
                            ) : (
                              <>
                                <span className="tas-meter" role="img" aria-label={intl.formatMessage(messages.answered, { answered: item.answered, total: item.questions })}>
                                  <span style={{ inlineSize: `${progress}%` }} />
                                </span>
                                <small>
                                  {item.answered > 0
                                    ? intl.formatMessage(messages.answered, {
                                      answered: item.answered, total: item.questions,
                                    })
                                    : intl.formatMessage(messages.questions, { count: item.questions })}
                                </small>
                              </>
                            )}
                          </span>
                          <span className="tas-item__go">
                            {intl.formatMessage(action(item))} <Icon src={ArrowForward} size="sm" />
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}

            {pageCount > 1 && (
              <div className="tas-pager">
                <span aria-live="polite">
                  {intl.formatMessage(messages.pageRange, {
                    from: (currentPage - 1) * PAGE_SIZE + 1,
                    to: Math.min(currentPage * PAGE_SIZE, shown.length),
                    total: shown.length,
                  })}
                </span>
                <Pagination
                  paginationLabel={intl.formatMessage(messages.paginationLabel)}
                  pageCount={pageCount}
                  currentPage={currentPage}
                  onPageSelect={goToPage}
                  buttonLabels={{
                    previous: intl.formatMessage(messages.pagePrevious),
                    next: intl.formatMessage(messages.pageNext),
                    page: intl.formatMessage(messages.pageWord),
                    currentPage: intl.formatMessage(messages.pageCurrent),
                    pageOfCount: intl.formatMessage(messages.pageOf),
                  }}
                />
              </div>
            )}
          </>
        )}
      </>
    );
  }

  return (
    <div className="tas-page">
      <Helmet>
        <title>{title}</title>
        <link rel="shortcut icon" href={getConfig().FAVICON_URL} type="image/x-icon" />
      </Helmet>
      <Container fluid size="xl" className="tas-container">{body}</Container>
    </div>
  );
};

export default AssessmentsPage;
