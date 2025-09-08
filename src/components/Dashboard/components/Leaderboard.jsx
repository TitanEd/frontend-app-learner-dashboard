import React from 'react';
import { Card } from '@openedx/paragon';
import './Leaderboard.scss';

const Leaderboard = ({ leaderboardData = [] }) => (
  <Card className="sidebar-card">
    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h4>Leaderboard</h4>
      <a
        href="www.google.com"
        style={{
          color: '#8B5CF6', textDecoration: 'none', fontSize: '14px', marginRight: '1rem', paddingBottom: '6px',
        }}
      >
        View All
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
                  <span className="streak-days">{entry.streak} Days</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted">No leaderboard data available.</p>
      )}
    </Card.Section>
  </Card>
);

export default Leaderboard;
