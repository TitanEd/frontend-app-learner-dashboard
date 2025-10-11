import React, { useState, useEffect } from 'react';
import {
  Card,
  Icon,
} from '@openedx/paragon';
import {
  RadioButtonUnchecked,
} from '@openedx/paragon/icons';
import './index.scss';
// import { CSS } from '@dnd-kit/utilities';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';
import { useInitializeDashboard } from '../../containers/Dashboard/hooks';
import customStarsIcon from '../../assets/custom-stars.svg';
import MetricCard from './components/MetricCard';
import Leaderboard from './components/Leaderboard';
import messages from './components/messages';
// import ContinueLearning from './ContinueLearning';
import ContinueLearningProgressBar from './ContinueLearningProgressBar';
import useWidgets from '../../hooks/useWidgets';
import WidgetCard from './components/WidgetCard';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTodoEnabled, setIsTodoEnabled] = useState(false);
  const [isTitanAISuggestionEnabled, setIsTitanAISuggestionEnabled] = useState(false);

  // Initialize dashboard to load course data
  useInitializeDashboard();

  // Fetch widgets data
  const {
    widgets, loading: widgetsLoading, error: widgetsError, refreshWidgets,
  } = useWidgets();

  const intl = useIntl();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // const isLocal = process.env.NODE_ENV !== 'prod' && process.env.NODE_ENV !== 'production';
        // const isLocal = true;
        // console.log(isLocal, 'TEST');
        // console.log(process.env.NODE_ENV, 'process.env.NODE_ENV');
        // if (isLocal) {
        //   // Local mock API
        //   const response = await fetch('http://localhost:3003/dashboard');
        //   const data = await response.json();
        //   console.log(data);
        //   setDashboardData(data);
        // } else {
        //   // Real API endpoints
        //   const baseUrl = `${getConfig().LMS_BASE_URL}/titaned/api/v1/instructor-dashboard`;
        //   const client = getAuthenticatedHttpClient();
        //   // Fetch all in parallel, but handle errors for each
        //   const [metricsRes, aiRes, todoRes] = await Promise.allSettled([
        //     client.get(`${baseUrl}/metrics`),
        //     client.get(`${baseUrl}/widgets`),
        //     client.get(`${baseUrl}/ai-suggestions`),
        //     client.get(`${baseUrl}/todo-list`),
        //   ]);

        //   const metrics = metricsRes.status === 'fulfilled' ? metricsRes.value.data : [];
        //   const titanAISuggestions = aiRes.status === 'fulfilled' ? aiRes.value.data : [];
        //   const todoList = todoRes.status === 'fulfilled' ? todoRes.value.data : [];

        //   setDashboardData({
        //     metrics, titanAISuggestions, todoList,
        //   });
        // }
        const baseUrl = `${getConfig().LMS_BASE_URL}/titaned/api/v1/instructor-dashboard`;
        const client = getAuthenticatedHttpClient();
        // Fetch all in parallel, but handle errors for each
        const [metricsRes, aiRes, todoRes] = await Promise.allSettled([
          client.get(`${baseUrl}/metrics`),
          client.get(`${baseUrl}/ai-suggestions`),
          client.get(`${baseUrl}/todo-list`),
        ]);

        const metrics = metricsRes.status === 'fulfilled' ? metricsRes.value.data : [];
        const titanAISuggestions = aiRes.status === 'fulfilled' ? aiRes.value.data : [];
        const todoList = todoRes.status === 'fulfilled' ? todoRes.value.data : [];

        setDashboardData({
          metrics, titanAISuggestions, todoList,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSideBarRenderCardData = async () => {
      try {
        const response = await getAuthenticatedHttpClient().get(`${getConfig().LMS_BASE_URL}/titaned/api/v1/menu-config/`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data?.is_todo_enabled) {
          setIsTodoEnabled(true);
        }
        if (data?.titanai_suggestion_is_enabled) {
          setIsTitanAISuggestionEnabled(true);
        }
      } catch (error) {
        setIsTodoEnabled(false);
        setIsTitanAISuggestionEnabled(false);
      }
    };

    fetchDashboardData();
    fetchSideBarRenderCardData();
  }, []);

  if (loading) {
    return <div>{intl.formatMessage(messages.loading)}</div>;
  }

  if (!dashboardData) {
    return <div>{intl.formatMessage(messages.errorLoadingData)}</div>;
  }

  // Provide default suggestions if none are present
  const aiSuggestions = dashboardData.titanAISuggestions;

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-main-content">
        {/* Top Metric Cards */}
        <div className="dashboard-header">{intl.formatMessage(messages.dashboardPageTitle)}</div>
        <div className="metrics-container">
          {dashboardData.metrics && dashboardData.metrics.map((metric, index) => (
            <MetricCard
              key={metric.id}
              icon={metric.icon}
              value={metric.value}
              label={metric.label}
              index={index}
            />
          ))}
        </div>

        {/* Overview Section */}
        <div className="overview-section">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="mb-0">{intl.formatMessage(messages.continueLearningTitle)}</h3>
            <a
              href="my-courses"
              style={{
                color: '#11047A', textDecoration: 'none', fontSize: '14px', fontWeight: '600',
              }}
            >
              {intl.formatMessage(messages.viewAll)}
            </a>
          </div>
          {/* <ContinueLearning /> */}
          <ContinueLearningProgressBar />
        </div>

        {/* Individual Widget Sections */}
        {widgetsLoading && (
          <div className="overview-section">
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">{intl.formatMessage(messages.loadingWidgetsSr)}</span>
              </div>
            </div>
          </div>
        )}

        {widgetsError && (
          <div className="overview-section">
            <div className="alert alert-warning" role="alert">
              <strong>{intl.formatMessage(messages.warningLabel)}</strong> {widgetsError}
            </div>
          </div>
        )}

        {!widgetsLoading && widgets.length > 0 && widgets
          .filter(widget => widget.enabled)
          .map(widget => (
            <div key={widget.id} className="overview-section">
              <h3 className="mb-3">{widget.title}</h3>
              <WidgetCard
                type={widget.type}
                title=""
                content={widget.content}
                styles={widget.styles}
              />
            </div>
          ))}

        {!widgetsLoading && widgets.length === 0 && (
          <div className="overview-section">
            <div className="text-center py-5">
              <p className="text-muted">{intl.formatMessage(messages.noWidgetsAvailable)}</p>
              <button
                type="button"
                onClick={refreshWidgets}
                className="btn btn-primary"
                // style={{ backgroundColor: '#2B2399', borderColor: '#2B2399' }}
              >
                {intl.formatMessage(messages.loadWidgets)}
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Sidebar */}
      <div
        className={
          !isTodoEnabled && !isTitanAISuggestionEnabled
            ? 'dashboard-sidebar-no-display'
            : 'dashboard-sidebar'
        }
      >
        {/* Titan AI Suggestions */}
        { isTitanAISuggestionEnabled && (
          <Card className="sidebar-card">
            <h4
              className="card-header"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {intl.formatMessage(messages.titanAiSuggestion)}
              <img
                src={customStarsIcon}
                alt="Custom Stars"
                style={{ width: '23px', height: '25px' }}
              />
            </h4>
            <Card.Section className="card-section temp-flow">
              {aiSuggestions?.length > 0 ? (
                <div className="card-list ai-suggestion-list">
                  {aiSuggestions?.map((suggestion) => (
                    <div
                      className="ai-suggestion-item"
                      key={`suggestion-${suggestion}`}
                      style={{ position: 'relative' }}
                    >
                      {suggestion}
                      <img
                        src={customStarsIcon}
                        alt="Custom Stars"
                        className="ai-suggestions-icon"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">
                  {intl.formatMessage(messages.noSuggestionsYet)}
                </p>
              )}
            </Card.Section>
          </Card>
        )}

        {/* Todo List */}
        { isTodoEnabled && (
          <Card className="sidebar-card">
            <h4 className="card-header">{intl.formatMessage(messages.todoList)}</h4>
            <Card.Section className="card-section temp-flow">
              {dashboardData?.todoList?.length > 0 ? (
                <div className="card-list todo-list">
                  {dashboardData?.todoList?.map((todo) => (
                    <div className="todo-item" key={`todo-${todo}`}>
                      <Icon
                        src={RadioButtonUnchecked}
                        style={{
                          marginRight: '0.75rem',
                          color: '#454545',
                          minWidth: 22,
                          minHeight: 22,
                        }}
                      />
                      {todo}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">
                  {intl.formatMessage(messages.noTasksAdded)}
                </p>
              )}
            </Card.Section>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
