/* eslint-disable react/prop-types */
import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Card } from '@openedx/paragon';
import './Leaderboard.scss';
import messages from './messages';

const Leaderboard = ({ leaderboardData = [] }) => {
  const intl = useIntl();

  return (
    <Card className="sidebar-card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4>{intl.formatMessage(messages.leaderboardTitle)}</h4>
        <a
          href="www.google.com"
          style={{
            color: '#8B5CF6', textDecoration: 'none', fontSize: '14px', marginRight: '1rem', paddingBottom: '6px',
          }}
        >
          {intl.formatMessage(messages.viewAll)}
        </a>
      </div>
      <Card.Section className="card-section temp-flow">
        {leaderboardData.length > 0 ? (
          <div className="leaderboard-list">
            {leaderboardData.map((entry, index) => (
              <div className="leaderboard-item" key={`leaderboard-${entry.id || index}`}>
                <div className="rank-number">{entry.rank}</div>
                <div className="user-avatar">
                  <img
                    src={entry.avatar}
                    alt={entry.name}
                    style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                  />
                </div>
                <div className="user-info">
                  <div className="user-name">{entry.name}</div>
                  <div className="streak-info">
                    <span className="streak-icon">🔥</span>
                    <span className="streak-days">
                      {intl.formatMessage(messages.streakDays, { days: entry.streak })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted">{intl.formatMessage(messages.noLeaderboardData)}</p>
        )}
      </Card.Section>
    </Card>
  );
};

export default Leaderboard;
