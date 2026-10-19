/*
 * "My Meetings" (left navigation of the learner dashboard): the Zoom live classes of every
 * course the learner is enrolled in (and of the classes they were invited to), one row per class
 * (a repeating meeting gives one row per occurrence). Tabs Live now / Upcoming / Past; filters
 * course, status, date, repeating or one-off, search. Join opens the class from shortly before
 * its start until its end; "Add to calendar" downloads an .ics file; past classes link to their
 * recording when Zoom has one.
 *
 * Data: GET {LMS}/titaned/api/v2/my-meetings/ (control-hub zoom_integration/my_meetings.py).
 * Times are shown in the time zone of the learner's account settings, else the browser's.
 * Only with the sold feature "Live Classes with Zoom" (zoom_integration): 403 otherwise.
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
  Cancel, CheckCircle, EventAvailable, OndemandVideo, Person, PlayCircle, Repeat, Schedule, Search, VideoCall,
} from '@openedx/paragon/icons';

import messages from './messages';
import {
  PAGE_SIZE, daysAway, downloadIcs, groupByDay, inPeriod, matchesText, paginateGroups, prepare, rangeParams, tabOf,
  zoneNameOf,
} from './meetingUtils';
import './style.scss';

const STATUSES = {
  upcoming: { icon: Schedule, label: messages.statusUpcoming },
  live: { icon: VideoCall, label: messages.statusLive },
  ended: { icon: CheckCircle, label: messages.statusEnded },
  cancelled: { icon: Cancel, label: messages.statusCancelled },
};
const TABS = [
  ['live', messages.tabLive, VideoCall],
  ['upcoming', messages.tabUpcoming, Schedule],
  ['past', messages.tabPast, EventAvailable],
];
const EMPTY = {
  live: [messages.emptyLiveTitle, messages.emptyLiveText],
  upcoming: [messages.emptyUpcomingTitle, messages.emptyUpcomingText],
  past: [messages.emptyPastTitle, messages.emptyPastText],
};

const useFormatters = (intl, timeZone, now) => useMemo(() => {
  const zone = timeZone || undefined;
  const time = (date) => intl.formatTime(date, { hour: 'numeric', minute: '2-digit', timeZone: zone });
  const day = (date) => intl.formatDate(date, {
    weekday: 'long', month: 'long', day: 'numeric', timeZone: zone,
  });
  const dayLabel = (date) => {
    const away = daysAway(date, now, timeZone);
    if (away === 0) { return intl.formatMessage(messages.today); }
    if (away === 1) { return intl.formatMessage(messages.tomorrow); }
    if (away === -1) { return intl.formatMessage(messages.yesterday); }
    return day(date);
  };
  const zoneName = zoneNameOf(intl.locale, timeZone, now);
  return {
    time,
    day,
    dayLabel,
    zoneName,
    month: (date) => intl.formatDate(date, { month: 'short', timeZone: zone }),
    dayNumber: (date) => intl.formatDate(date, { day: 'numeric', timeZone: zone }),
    range: (item) => `${time(item.startDate)} – ${intl.formatTime(item.endDate, {
      hour: 'numeric', minute: '2-digit', timeZone: zone, timeZoneName: 'short',
    })}`,
  };
}, [intl, timeZone, now]);

export const RecordingButton = ({ item, labels }) => {
  const [state, setState] = useState('');
  if (item.recording_url) {
    return (
      <Button variant="outline-primary" size="sm" iconBefore={PlayCircle} href={item.recording_url} target="_blank" rel="noopener noreferrer">
        {labels.recording}
      </Button>
    );
  }
  const look = () => {
    setState('loading');
    getAuthenticatedHttpClient()
      .get(`${getConfig().LMS_BASE_URL}/api/v1/live-classes/recordings/${item.meeting_id}/`)
      .then(({ data }) => {
        const found = (data.recordings || [])
          .find((entry) => !entry.occurrence_internal_id || entry.occurrence_internal_id === item.id)
          || (data.recordings || [])[0];
        if (data.success && found && found.play_url) {
          window.open(found.play_url, '_blank', 'noopener');
          setState('');
        } else {
          setState('none');
        }
      })
      .catch(() => setState('none'));
  };
  return (
    <>
      <Button variant="outline-primary" size="sm" iconBefore={OndemandVideo} onClick={look} disabled={state === 'loading'}>
        {state === 'loading' ? labels.recordingLoading : labels.recording}
      </Button>
      {state === 'none' && <span className="mtg-item__hint" role="status">{labels.recordingNone}</span>}
    </>
  );
};

RecordingButton.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string, meeting_id: PropTypes.string, recording_url: PropTypes.string,
  }).isRequired,
  labels: PropTypes.objectOf(PropTypes.string).isRequired,
};

const MeetingsPage = () => {
  const intl = useIntl();
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  const [tab, setTab] = useState('');
  const [course, setCourse] = useState('');
  const [status, setStatus] = useState('');
  const [period, setPeriod] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [kind, setKind] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [now, setNow] = useState(() => new Date());
  const listTop = useRef(null);

  const params = useMemo(() => rangeParams(period, from, to), [period, from, to]);
  const load = useCallback(() => {
    setFailed(false);
    getAuthenticatedHttpClient()
      .get(`${getConfig().LMS_BASE_URL}/titaned/api/v2/my-meetings/`, { params })
      .then((response) => { setData(response.data); setNow(new Date()); })
      // 403: live classes are not part of the site's plan.
      .catch((error) => setFailed(error?.response?.status === 403 ? 'unavailable' : true));
  }, [params]);
  useEffect(() => { load(); }, [load]);
  // The join buttons open and the classes move on as time passes.
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const timeZone = data?.time_zone || '';
  const format = useFormatters(intl, timeZone, now);
  const items = useMemo(() => (data ? prepare(data.items, now) : []), [data, now]);

  const scoped = useMemo(() => {
    const text = query.trim().toLowerCase();
    return items.filter((item) => (!course || item.course_id === course)
      && (!status || item.status === status)
      && (!kind || (kind === 'recurring') === item.is_recurring)
      && inPeriod(item.startDate, period, now, timeZone, from, to)
      && matchesText(item, text));
  }, [items, course, status, kind, period, from, to, query, now, timeZone]);
  const counts = useMemo(() => scoped.reduce((all, item) => {
    const key = tabOf(item, now);
    return { ...all, [key]: (all[key] || 0) + 1 };
  }, {}), [scoped, now]);
  // The first visit opens the tab with something in it.
  const shownTab = tab || (counts.live ? 'live' : 'upcoming');
  const shown = useMemo(() => scoped.filter((item) => tabOf(item, now) === shownTab), [scoped, shownTab, now]);
  const groups = useMemo(() => groupByDay(shown, timeZone, shownTab === 'past'), [shown, timeZone, shownTab]);

  useEffect(() => { setPage(1); }, [shownTab, course, status, kind, period, from, to, query]);
  const pageCount = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageGroups = useMemo(() => paginateGroups(groups, currentPage), [groups, currentPage]);
  const goToPage = (number) => {
    setPage(number);
    if (listTop.current) { listTop.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  };

  const labels = {
    recording: intl.formatMessage(messages.recording),
    recordingLoading: intl.formatMessage(messages.recordingLoading),
    recordingNone: intl.formatMessage(messages.recordingNone),
  };
  const icsLabels = {
    joinLabel: intl.formatMessage(messages.calendarJoin),
    courseLabel: intl.formatMessage(messages.calendarCourse),
  };
  const title = intl.formatMessage(messages.pageTitle);
  const filtered = Boolean(course || status || kind || period || query.trim());
  const clear = () => {
    setCourse(''); setStatus(''); setKind(''); setPeriod(''); setFrom(''); setTo(''); setQuery('');
  };

  const joinHint = (item) => {
    if (item.canJoin || item.status !== 'upcoming') { return null; }
    const sameDay = daysAway(item.opensDate, now, timeZone) === 0;
    return sameDay
      ? intl.formatMessage(messages.joinOpens, { time: format.time(item.opensDate) })
      : intl.formatMessage(messages.joinOpensDay, {
        date: format.dayLabel(item.opensDate), time: format.time(item.opensDate),
      });
  };

  const renderItem = (item) => {
    const meta = STATUSES[item.status] || STATUSES.upcoming;
    const hint = joinHint(item);
    return (
      <li key={item.id}>
        <article className={`mtg-item mtg-item--${item.status}`} aria-label={item.topic}>
          <span className="mtg-item__date" aria-hidden="true">
            <strong>{format.dayNumber(item.startDate)}</strong>
            <span>{format.month(item.startDate)}</span>
          </span>
          <div className="mtg-item__main">
            <h3 className="mtg-item__title">{item.topic}</h3>
            {item.course && <span className="mtg-item__course">{item.course}</span>}
            <div className="mtg-item__meta">
              <span><Icon src={Schedule} size="sm" /> {format.range(item)}</span>
              <span>{intl.formatMessage(messages.minutes, { count: item.duration })}</span>
              {item.host && <span><Icon src={Person} size="sm" /> {intl.formatMessage(messages.host, { name: item.host })}</span>}
            </div>
            <div className="mtg-item__meta">
              <span className={`mtg-tag mtg-tag--${item.status}`}>
                {item.status === 'live' ? <span className="mtg-dot" /> : <Icon src={meta.icon} size="xs" />}
                {intl.formatMessage(meta.label)}
              </span>
              {item.is_recurring && <span className="mtg-tag"><Icon src={Repeat} size="xs" /> {intl.formatMessage(messages.repeats)}</span>}
              {item.status === 'upcoming' && daysAway(item.startDate, now, timeZone) === 0 && item.startDate - now < 60 * 60 * 1000 && (
                <span className="mtg-tag mtg-tag--good">
                  {intl.formatMessage(messages.startsIn, {
                    count: Math.max(1, Math.round((item.startDate - now) / 60000)),
                  })}
                </span>
              )}
            </div>
            {item.agenda && <p className="mtg-item__agenda">{item.agenda}</p>}
          </div>
          <div className="mtg-item__actions">
            {(item.status === 'upcoming' || item.status === 'live') && (
              <Button
                variant={item.status === 'live' ? 'danger' : 'primary'}
                size="sm"
                iconBefore={VideoCall}
                href={item.canJoin ? item.join_url : undefined}
                target="_blank"
                rel="noopener noreferrer"
                disabled={!item.canJoin}
                aria-disabled={!item.canJoin}
              >
                {intl.formatMessage(messages.join)}
              </Button>
            )}
            {item.status !== 'ended' && item.status !== 'cancelled' && (
              <Button variant="outline-primary" size="sm" iconBefore={EventAvailable} onClick={() => downloadIcs(item, icsLabels)}>
                {intl.formatMessage(messages.addToCalendar)}
              </Button>
            )}
            {item.status === 'ended' && <RecordingButton item={item} labels={labels} />}
            {hint && <span className="mtg-item__hint">{hint}</span>}
          </div>
        </article>
      </li>
    );
  };

  let body;
  if (failed) {
    body = (
      <div className="mtg-state mtg-card" role="alert">
        <p>{intl.formatMessage(failed === 'unavailable' ? messages.unavailable : messages.error)}</p>
        {failed !== 'unavailable' && <Button variant="outline-primary" onClick={load}>{intl.formatMessage(messages.retry)}</Button>}
      </div>
    );
  } else if (!data) {
    body = <div className="mtg-state"><Spinner animation="border" variant="primary" screenReaderText={intl.formatMessage(messages.loading)} /></div>;
  } else {
    const live = items.filter((item) => item.status === 'live').sort((a, b) => a.startDate - b.startDate);
    const upcoming = items.filter((item) => item.status === 'upcoming').sort((a, b) => a.startDate - b.startDate);
    const next = live[0] || upcoming[0];
    const today = upcoming.filter((item) => daysAway(item.startDate, now, timeZone) === 0).length;
    const week = upcoming.filter((item) => inPeriod(item.startDate, 'week', now, timeZone)).length;
    let headline = intl.formatMessage(messages.heroCalm);
    if (live.length) {
      headline = intl.formatMessage(messages.heroLive, { count: live.length });
    } else if (today) {
      headline = intl.formatMessage(messages.heroToday, { count: today });
    } else if (week) {
      headline = intl.formatMessage(messages.heroWeek, { count: week });
    }
    const [emptyTitle, emptyText] = EMPTY[shownTab];

    body = (
      <>
        <section className="mtg-hero">
          <div className="mtg-hero__text">
            <div>
              <h1>{title}</h1>
              <p>{items.length ? headline : intl.formatMessage(messages.intro)}</p>
            </div>
            <p>{intl.formatMessage(messages.timeZoneNote, { zone: format.zoneName })}</p>
          </div>
          {next && (
            <div className={`mtg-next ${next.status === 'live' ? 'mtg-next--live' : ''}`}>
              <span className="mtg-next__label">
                {next.status === 'live' && <span className="mtg-dot" />}
                {intl.formatMessage(next.status === 'live' ? messages.liveNow : messages.upNext)}
              </span>
              <strong>{next.topic}</strong>
              <span className="mtg-next__course">{next.course}</span>
              <span className="mtg-next__when">{format.dayLabel(next.startDate)}, {format.range(next)}</span>
              {next.canJoin ? (
                <Button variant={next.status === 'live' ? 'danger' : 'primary'} iconBefore={VideoCall} href={next.join_url} target="_blank" rel="noopener noreferrer">
                  {intl.formatMessage(messages.join)}
                </Button>
              ) : (
                <Button variant="outline-primary" iconBefore={EventAvailable} onClick={() => downloadIcs(next, icsLabels)}>
                  {intl.formatMessage(messages.addToCalendar)}
                </Button>
              )}
            </div>
          )}
        </section>

        <div className="mtg-tabs" role="tablist" aria-label={intl.formatMessage(messages.tabsLabel)}>
          {TABS.map(([key, label, icon]) => (
            <button
              type="button"
              role="tab"
              key={key}
              id={`mtg-tab-${key}`}
              aria-selected={shownTab === key}
              aria-controls="mtg-panel"
              className={`mtg-tab mtg-tab--${key} ${shownTab === key ? 'is-on' : ''}`}
              onClick={() => setTab(key)}
            >
              {key === 'live' && counts.live ? <span className="mtg-dot" style={{ color: 'var(--mtg-live)' }} /> : <Icon src={icon} size="sm" />}
              <span>{intl.formatMessage(label)}</span>
              <span className="mtg-tab__count">{intl.formatNumber(counts[key] || 0)}</span>
            </button>
          ))}
        </div>

        <div className="mtg-filters mtg-card">
          <Form.Group controlId="mtg-course">
            <Form.Label>{intl.formatMessage(messages.filterCourse)}</Form.Label>
            <Form.Control as="select" value={course} onChange={(event) => setCourse(event.target.value)}>
              <option value="">{intl.formatMessage(messages.filterAllCourses)}</option>
              {data.courses.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="mtg-status">
            <Form.Label>{intl.formatMessage(messages.filterStatus)}</Form.Label>
            <Form.Control as="select" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">{intl.formatMessage(messages.filterAnyStatus)}</option>
              {Object.entries(STATUSES).map(([key, entry]) => (
                <option key={key} value={key}>{intl.formatMessage(entry.label)}</option>
              ))}
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="mtg-date">
            <Form.Label>{intl.formatMessage(messages.filterDate)}</Form.Label>
            <Form.Control as="select" value={period} onChange={(event) => setPeriod(event.target.value)}>
              <option value="">{intl.formatMessage(messages.filterAnyDate)}</option>
              <option value="today">{intl.formatMessage(messages.filterToday)}</option>
              <option value="week">{intl.formatMessage(messages.filterWeek)}</option>
              <option value="month">{intl.formatMessage(messages.filterMonth)}</option>
              <option value="custom">{intl.formatMessage(messages.filterCustom)}</option>
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="mtg-type">
            <Form.Label>{intl.formatMessage(messages.filterType)}</Form.Label>
            <Form.Control as="select" value={kind} onChange={(event) => setKind(event.target.value)}>
              <option value="">{intl.formatMessage(messages.filterAnyType)}</option>
              <option value="recurring">{intl.formatMessage(messages.filterRecurring)}</option>
              <option value="oneoff">{intl.formatMessage(messages.filterOneOff)}</option>
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="mtg-search" className="mtg-filters__search">
            <Form.Label>{intl.formatMessage(messages.search)}</Form.Label>
            <Form.Control type="search" value={query} leadingElement={<Icon src={Search} />} onChange={(event) => setQuery(event.target.value)} />
          </Form.Group>
          {period === 'custom' && (
            <div className="mtg-filters__range">
              <Form.Group controlId="mtg-from">
                <Form.Label>{intl.formatMessage(messages.filterFrom)}</Form.Label>
                <Form.Control type="date" value={from} max={to || undefined} onChange={(event) => setFrom(event.target.value)} />
              </Form.Group>
              <Form.Group controlId="mtg-to">
                <Form.Label>{intl.formatMessage(messages.filterTo)}</Form.Label>
                <Form.Control type="date" value={to} min={from || undefined} onChange={(event) => setTo(event.target.value)} />
              </Form.Group>
            </div>
          )}
          <div className="mtg-filters__foot">
            <span aria-live="polite">{intl.formatMessage(messages.showing, { count: shown.length })}</span>
            {filtered && <Button variant="link" size="inline" onClick={clear}>{intl.formatMessage(messages.clearFilters)}</Button>}
          </div>
        </div>

        {data.truncated && <p className="mtg-note" role="status">{intl.formatMessage(messages.truncated)}</p>}

        <div id="mtg-panel" role="tabpanel" aria-labelledby={`mtg-tab-${shownTab}`}>
          <div ref={listTop} />
          {shown.length === 0 && (
            <div className="mtg-state mtg-card">
              <Icon src={TABS.find(([key]) => key === shownTab)[2]} className="mtg-state__icon" />
              <h2>{intl.formatMessage(filtered ? messages.noMatchTitle : emptyTitle)}</h2>
              {filtered
                ? <Button variant="outline-primary" onClick={clear}>{intl.formatMessage(messages.clearFilters)}</Button>
                : <p>{intl.formatMessage(emptyText)}</p>}
            </div>
          )}
          {pageGroups.map((group) => (
            <section key={group.key} className="mtg-day">
              <h2>{format.dayLabel(group.date)} <span>{intl.formatNumber(group.total)}</span></h2>
              <ul className="mtg-list">{group.list.map(renderItem)}</ul>
            </section>
          ))}
          {pageCount > 1 && (
            <div className="mtg-pager">
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
        </div>
      </>
    );
  }

  return (
    <div className="mtg-page">
      <Helmet>
        <title>{title}</title>
        <link rel="shortcut icon" href={getConfig().FAVICON_URL} type="image/x-icon" />
      </Helmet>
      <Container fluid size="xl" className="mtg-container">{body}</Container>
    </div>
  );
};

export default MeetingsPage;
