/*
 * "My Achievements" (left navigation of the learner dashboard): the learner's level, points
 * and rank, the badges earned, the badges within reach with the next step for each, the ways
 * to earn points and the leaderboard.
 *
 * Data: GET {LMS}/titaned/api/v2/achievements/ (control-hub achievements/summary.py).
 */
import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button, Container, Icon, Spinner,
} from '@openedx/paragon';
import {
  ArrowForward, Bolt, EmojiEvents, Lock, Star, TrendingUp,
} from '@openedx/paragon/icons';

import messages from './messages';
import './style.scss';

const Ring = ({ percent, children, size = 132 }) => {
  const radius = 52;
  const length = 2 * Math.PI * radius;
  return (
    <span className="ta-ring" style={{ inlineSize: size }}>
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle className="ta-ring__track" cx="60" cy="60" r={radius} />
        <circle
          className="ta-ring__value"
          cx="60"
          cy="60"
          r={radius}
          strokeDasharray={length}
          strokeDashoffset={length * (1 - Math.min(100, percent) / 100)}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <span className="ta-ring__inside">{children}</span>
    </span>
  );
};

Ring.propTypes = {
  percent: PropTypes.number.isRequired,
  children: PropTypes.node.isRequired,
  size: PropTypes.number,
};

const BadgeArt = ({ badge, locked }) => (
  <span className={`ta-art ${locked ? 'is-locked' : ''}`}>
    {badge.icon ? <img src={badge.icon} alt="" /> : <Icon src={EmojiEvents} />}
    {locked && <span className="ta-art__lock"><Icon src={Lock} size="xs" /></span>}
  </span>
);

BadgeArt.propTypes = {
  badge: PropTypes.shape({ icon: PropTypes.string }).isRequired,
  locked: PropTypes.bool,
};

const AchievementsPage = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(() => {
    setFailed(false);
    getAuthenticatedHttpClient()
      .get(`${getConfig().LMS_BASE_URL}/titaned/api/v2/achievements/`)
      .then((response) => setData(response.data))
      // 403: the feature this page belongs to is not part of the site's plan.
      .catch((error) => setFailed(error?.response?.status === 403 ? 'unavailable' : true));
  }, []);
  useEffect(() => { load(); }, [load]);

  const go = (place) => {
    if (place === 'courses') {
      window.location.href = `${getConfig().LMS_BASE_URL}/courses`;
    } else if (place === 'studio') {
      window.location.href = getConfig().COURSE_AUTHORING_MICROFRONTEND_URL || getConfig().STUDIO_BASE_URL;
    } else {
      navigate('/my-courses');
    }
  };
  const cta = { courses: messages.goCourses, studio: messages.goStudio, learning: messages.goLearning };
  const title = intl.formatMessage(messages.pageTitle);

  let body;
  if (failed) {
    body = (
      <div className="ta-state" role="alert">
        <p>{intl.formatMessage(failed === 'unavailable' ? messages.unavailable : messages.error)}</p>
        {failed !== 'unavailable' && (
          <Button variant="outline-primary" onClick={load}>{intl.formatMessage(messages.retry)}</Button>
        )}
      </div>
    );
  } else if (!data) {
    body = (
      <div className="ta-state">
        <Spinner animation="border" variant="primary" screenReaderText={intl.formatMessage(messages.loading)} />
      </div>
    );
  } else {
    const { level } = data;
    const next = data.ahead[0];
    body = (
      <>
        <section className="ta-hero">
          <Ring percent={level.percent}>
            <small>{intl.formatMessage(messages.level, { number: level.number })}</small>
            <strong>{level.name}</strong>
          </Ring>
          <div className="ta-hero__text">
            <h1>{title}</h1>
            <p>{intl.formatMessage(messages.intro)}</p>
            <div className="ta-hero__bar" role="img" aria-label={`${level.percent}%`}>
              <span style={{ inlineSize: `${level.percent}%` }} />
            </div>
            <p className="ta-hero__next">
              <Icon src={TrendingUp} size="sm" />
              {level.next_name
                ? intl.formatMessage(messages.toNextLevel, { count: level.points_to_next, name: level.next_name })
                : intl.formatMessage(messages.topLevel)}
            </p>
          </div>
          <dl className="ta-hero__figures">
            <div><dt>{intl.formatMessage(messages.pointsLabel)}</dt><dd>{intl.formatNumber(data.points)}</dd></div>
            <div>
              <dt>{intl.formatMessage(messages.badgesLabel)}</dt>
              <dd>{data.earned.length}<small>/{data.total_badges}</small></dd>
            </div>
            <div>
              <dt>{intl.formatMessage(messages.rankLabel)}</dt>
              <dd>{data.rank ? intl.formatMessage(messages.rankOf, { rank: data.rank, total: data.ranked }) : '—'}</dd>
            </div>
          </dl>
          <ol className="ta-path" aria-label={intl.formatMessage(messages.levelPath)}>
            {level.levels.map((step) => (
              <li key={step.number} className={`${step.number < level.number ? 'is-done' : ''} ${step.number === level.number ? 'is-now' : ''}`}>
                <span className="ta-path__dot">{step.number}</span>
                <span className="ta-path__name">{step.name}</span>
                <small>{intl.formatNumber(step.floor)}</small>
              </li>
            ))}
          </ol>
        </section>

        <div className="ta-columns">
          <div className="ta-main">
            <section className="ta-card ta-next">
              <h2><Icon src={Bolt} /> {intl.formatMessage(messages.nextReward)}</h2>
              {next ? (
                <div className="ta-next__body">
                  <Ring percent={next.percent} size={104}><BadgeArt badge={next} locked /></Ring>
                  <div className="ta-next__text">
                    <strong>{next.title}</strong>
                    <p>{next.description}</p>
                    <p className="ta-next__left">
                      {next.current > 0
                        ? intl.formatMessage(messages.nextRewardLeft, { count: next.remaining })
                        : intl.formatMessage(messages.nextRewardStart)}
                      {next.step && ` · ${next.step}`}
                    </p>
                  </div>
                  <Button variant="primary" iconAfter={ArrowForward} onClick={() => go(next.place)}>
                    {intl.formatMessage(cta[next.place] || messages.goLearning)}
                  </Button>
                </div>
              ) : <p className="ta-muted">{intl.formatMessage(messages.allEarned)}</p>}
            </section>

            <section className="ta-card">
              <h2>
                <Icon src={EmojiEvents} /> {intl.formatMessage(messages.earnedTitle)}
                <span className="ta-count">{intl.formatMessage(messages.earnedCount, { earned: data.earned.length, total: data.total_badges })}</span>
              </h2>
              {data.earned.length > 0 ? (
                <ul className="ta-badges">
                  {data.earned.map((badge) => (
                    <li key={badge.id} className="ta-badge is-earned">
                      <BadgeArt badge={badge} />
                      <strong>{badge.title}</strong>
                      <p>{badge.description}</p>
                      <small>{intl.formatMessage(messages.earnedOn, { date: intl.formatDate(badge.earned, { year: 'numeric', month: 'short', day: 'numeric' }) })}</small>
                    </li>
                  ))}
                </ul>
              ) : <p className="ta-muted">{intl.formatMessage(messages.earnedEmpty)}</p>}
            </section>

            {data.ahead.length > 0 && (
              <section className="ta-card">
                <h2><Icon src={Lock} /> {intl.formatMessage(messages.aheadTitle)}</h2>
                <ul className="ta-badges">
                  {data.ahead.map((badge) => (
                    <li key={badge.id} className="ta-badge">
                      <BadgeArt badge={badge} locked />
                      <strong>{badge.title}</strong>
                      <p>{badge.step || badge.description}</p>
                      <span className="ta-meter" role="img" aria-label={intl.formatMessage(messages.aheadProgress, { current: badge.current, target: badge.target })}>
                        <span style={{ inlineSize: `${badge.percent}%` }} />
                      </span>
                      <small>
                        {intl.formatMessage(messages.aheadProgress, { current: badge.current, target: badge.target })}
                        {' · '}
                        {intl.formatMessage(messages.aheadLeft, { count: badge.remaining })}
                      </small>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="ta-side">
            <section className="ta-card">
              <h2><Icon src={EmojiEvents} /> {intl.formatMessage(messages.leaderboardTitle)}</h2>
              {data.leaderboard.length > 0 ? (
                <ol className="ta-ranks">
                  {data.leaderboard.map((row) => (
                    <li key={`${row.rank}-${row.name}`} className={row.me ? 'is-me' : ''}>
                      <span className={`ta-ranks__place ta-ranks__place--${row.rank}`}>{row.rank}</span>
                      <span className="ta-ranks__name">
                        {row.name}
                        {row.me && <span className="ta-chip">{intl.formatMessage(messages.you)}</span>}
                      </span>
                      <strong>{intl.formatNumber(row.points)}</strong>
                    </li>
                  ))}
                </ol>
              ) : null}
              <p className="ta-muted ta-ranks__note">
                {!data.rank && intl.formatMessage(messages.noPoints)}
                {data.rank === 1 && intl.formatMessage(messages.leading)}
                {data.rank > 1 && data.points_to_overtake
                  && intl.formatMessage(messages.overtake, { count: data.points_to_overtake })}
              </p>
            </section>

            <section className="ta-card">
              <h2><Icon src={Star} /> {intl.formatMessage(messages.waysTitle)}</h2>
              <p className="ta-muted">{intl.formatMessage(messages.waysIntro)}</p>
              <ul className="ta-ways">
                {data.ways.map((way) => (
                  <li key={`${way.trigger}-${way.name}`}>
                    <span>{way.name}</span>
                    <strong>+{intl.formatNumber(way.points)}</strong>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </>
    );
  }

  return (
    <div className="ta-page">
      <Helmet>
        <title>{title}</title>
        <link rel="shortcut icon" href={getConfig().FAVICON_URL} type="image/x-icon" />
      </Helmet>
      <Container fluid size="xl" className="ta-container">{body}</Container>
    </div>
  );
};

export default AchievementsPage;
