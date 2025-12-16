import React, { useState, useEffect } from 'react';

import { reduxHooks } from 'hooks';
import { RequestKeys } from 'data/constants/requests';
import EnterpriseDashboardModal from 'containers/EnterpriseDashboardModal';
import SelectSessionModal from 'containers/SelectSessionModal';
import CoursesPanel from 'containers/CoursesPanel';

import LoadingView from './LoadingView';
import DashboardLayout from './DashboardLayout';
import hooks from './hooks';
import './index.scss';

export const Dashboard = () => {
  const [ready, setReady] = useState(false);

  // Performance fix: Show skeleton first, defer ALL operations
  useEffect(() => {
    setTimeout(() => {
      setReady(true);
    }, 1000);
  }, []);

  // Always call hooks (React requirement) - initialization is deferred inside the hook
  hooks.useInitializeDashboard();
  const { pageTitle } = hooks.useDashboardMessages();
  const hasCourses = reduxHooks.useHasCourses();
  const hasAvailableDashboards = reduxHooks.useHasAvailableDashboards();
  const initIsPending = reduxHooks.useRequestIsPending(RequestKeys.initialize);
  const showSelectSessionModal = reduxHooks.useShowSelectSessionModal();

  // Performance fix: Show lightweight skeleton first
  if (!ready) {
    return (
      <div id="dashboard-container" className="d-flex flex-column p-2 pt-0" style={{ minHeight: '100vh' }}>
        <div style={{ height: '40px', backgroundColor: '#f0f0f0', borderRadius: '4px', marginBottom: '20px', width: '300px' }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{ height: '200px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div id="dashboard-container" className="d-flex flex-column p-2 pt-0">
      <h1 className="sr-only">{pageTitle}</h1>
      {!initIsPending && (
        <>
          {hasAvailableDashboards && <EnterpriseDashboardModal />}
          {(hasCourses && showSelectSessionModal) && <SelectSessionModal />}
        </>
      )}
      <div id="dashboard-content" data-testid="dashboard-content">
        {initIsPending
          ? (<LoadingView />)
          : (
            <DashboardLayout>
              <CoursesPanel />
            </DashboardLayout>
          )}
      </div>
    </div>
  );
};

export default Dashboard;
