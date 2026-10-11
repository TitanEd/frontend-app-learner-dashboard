import React, { useMemo } from 'react';

import { useSelectSessionModal } from 'data/context';
import { useInitializeLearnerHome } from 'data/hooks';
import SelectSessionModal from 'containers/SelectSessionModal';
import CustomCoursesPanel from 'containers/CoursesPanel/CustomCoursesPanel';
import DashboardModalSlot from 'plugin-slots/DashboardModalSlot';
import CustomDashboardLayoutWidget from 'plugins/CustomDashboardLayoutWidget/CustomDashboardLayoutWidget';

import LoadingView from './LoadingView';
import hooks from './customHooks';
import './index.scss';

export const CustomDashboard = () => {
  const { data, isPending } = useInitializeLearnerHome();
  const { pageTitle } = hooks.useDashboardMessages();
  const { selectSessionModal } = useSelectSessionModal();
  const showSelectSessionModal = selectSessionModal.cardId !== null;

  const hasCourses = useMemo(() => data?.courses?.length > 0, [data]);

  return (
    <div id="dashboard-container" className="d-flex flex-column px-2 pb-2 pt-0">
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
            <CustomDashboardLayoutWidget>
              <CustomCoursesPanel />
            </CustomDashboardLayoutWidget>
          )}
      </div>
    </div>
  );
};

export default CustomDashboard;
