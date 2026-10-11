import React, { useMemo, useState, useEffect } from 'react';

import { useSelectSessionModal } from 'data/context';
import { useInitializeLearnerHome } from 'data/hooks';
import SelectSessionModal from 'containers/SelectSessionModal';
import CoursesPanel from 'containers/CoursesPanel';
import DashboardModalSlot from 'plugin-slots/DashboardModalSlot';

import LoadingView from './LoadingView';
import DashboardLayout from './DashboardLayout';
import hooks from './hooks';
import './index.scss';

export const Dashboard = () => {
  const [ready, setReady] = useState(false);

  // Performance fix: Show skeleton first, defer ALL operations
  useEffect(() => {
    const timer = setTimeout(() => {
      setReady(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Always call hooks (React requirement)
  const { data, isPending } = useInitializeLearnerHome();
  const { pageTitle } = hooks.useDashboardMessages();
  const { selectSessionModal } = useSelectSessionModal();
  const showSelectSessionModal = selectSessionModal.cardId !== null;

  const hasCourses = useMemo(() => data?.courses?.length > 0, [data]);

  // Performance fix: Show lightweight skeleton first
  if (!ready) {
    return (
      <div id="dashboard-container" className="d-flex flex-column p-2 pt-0" style={{ minHeight: '100vh' }}>
        <div style={{
          height: '40px', backgroundColor: '#f0f0f0', borderRadius: '4px', marginBottom: '20px', width: '300px',
        }}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{ height: '200px', backgroundColor: '#f0f0f0', borderRadius: '8px' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div id="dashboard-container" className="d-flex flex-column p-2 pt-0">
      <h1 className="sr-only">{pageTitle}</h1>
      {!isPending && (
        <>
          <DashboardModalSlot />
          {(hasCourses && showSelectSessionModal) && <SelectSessionModal />}
        </>
      )}
      <div id="dashboard-content" data-testid="dashboard-content">
        {isPending
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
