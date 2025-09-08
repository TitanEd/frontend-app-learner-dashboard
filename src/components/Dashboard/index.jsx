import React from 'react';
import {
  Container, Row, Col, Card, Button,
} from '@openedx/paragon';
import {
  Home, LibraryBooks, Calendar, Analytics, Lightbulb, Assistant,
} from '@openedx/paragon/icons';
import './index.scss';

const Dashboard = () => {
  const quickActions = [
    {
      title: 'My Courses',
      description: 'View and manage your enrolled courses',
      icon: <LibraryBooks />,
      path: '/my-courses',
      color: 'primary',
    },
    {
      title: 'Calendar',
      description: 'Check your upcoming assignments and events',
      icon: <Calendar />,
      path: '/calendar',
      color: 'success',
    },
    {
      title: 'Insights & Reports',
      description: 'View your learning progress and analytics',
      icon: <Analytics />,
      path: '/reports',
      color: 'info',
    },
    {
      title: 'Titan AI',
      description: 'Get help from our AI assistant',
      icon: <Assistant />,
      path: '/ai-assistant',
      color: 'warning',
    },
  ];

  const recentActivities = [
    {
      title: 'Course Progress Update',
      description: 'You completed 3 lessons in "Introduction to React"',
      time: '2 hours ago',
      type: 'success',
    },
    {
      title: 'New Assignment',
      description: 'Assignment 2 is now available in "Advanced JavaScript"',
      time: '1 day ago',
      type: 'info',
    },
    {
      title: 'Course Reminder',
      description: 'Live session starts in 30 minutes',
      time: '2 days ago',
      type: 'warning',
    },
  ];

  const handleQuickAction = (path) => {
    if (path === '/my-courses') {
      window.location.href = `${window.LMS_BASE_URL || ''}/dashboard`;
    } else {
      // For other routes, you can implement navigation logic here
      console.log(`Navigate to ${path}`);
    }
  };

  return (
    <div className="dashboard">
      <Container fluid size="xl">
        {/* Welcome Section */}
        <Row className="mb-4">
          <Col>
            <div className="welcome-section">
              <h1 className="welcome-title">Welcome to TitanEd Learning Platform</h1>
              <p className="welcome-subtitle">
                Your personalized learning dashboard to track progress, access courses,
                and enhance your educational journey.
              </p>
            </div>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Row className="mb-5">
          <Col>
            <h2 className="section-title mb-4">Quick Actions</h2>
            <Row>
              {quickActions.map((action, index) => (
                <Col key={index} xs={12} sm={6} lg={3} className="mb-3">
                  <Card
                    className={`quick-action-card h-100 ${action.color}`}
                    onClick={() => handleQuickAction(action.path)}
                  >
                    <Card.Body className="text-center">
                      <div className="action-icon mb-3">
                        {action.icon}
                      </div>
                      <h5 className="action-title">{action.title}</h5>
                      <p className="action-description">{action.description}</p>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="mt-2"
                      >
                        Go to {action.title}
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>

        {/* Recent Activities */}
        <Row>
          <Col lg={8}>
            <h2 className="section-title mb-4">Recent Activities</h2>
            <div className="activities-list">
              {recentActivities.map((activity, index) => (
                <Card key={index} className="mb-3 activity-card">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <h6 className="activity-title">{activity.title}</h6>
                        <p className="activity-description mb-0">{activity.description}</p>
                      </div>
                      <small className="activity-time text-muted">{activity.time}</small>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </Col>

          {/* Learning Progress */}
          <Col lg={4}>
            <h2 className="section-title mb-4">Learning Progress</h2>
            <Card className="progress-card">
              <Card.Body>
                <div className="progress-stats">
                  <div className="stat-item">
                    <h4 className="stat-number">12</h4>
                    <p className="stat-label">Courses Enrolled</p>
                  </div>
                  <div className="stat-item">
                    <h4 className="stat-number">8</h4>
                    <p className="stat-label">Courses Completed</p>
                  </div>
                  <div className="stat-item">
                    <h4 className="stat-number">156</h4>
                    <p className="stat-label">Lessons Completed</p>
                  </div>
                  <div className="stat-item">
                    <h4 className="stat-number">92%</h4>
                    <p className="stat-label">Average Score</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Dashboard;
