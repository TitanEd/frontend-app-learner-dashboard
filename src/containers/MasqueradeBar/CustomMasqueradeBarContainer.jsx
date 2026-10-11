import React, { useMemo } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';

import { useMasquerade } from 'data/context';
import { useInitializeLearnerHome } from 'data/hooks';
import CustomMasqueradeBar from './CustomMasqueradeBar';
import messages from './messages';

// Custom UI masquerade bar: same data logic as the stock MasqueradeBar
// (index.jsx), rendered with CustomMasqueradeBar (no shadow box, inline with
// the course filter buttons) as on tels/sumac.1.
const CustomMasqueradeBarContainer = () => {
  const { formatMessage } = useIntl();
  const { isError, error, isPending } = useInitializeLearnerHome();
  const { authenticatedUser } = React.useContext(AppContext);
  const [masqueradeInput, setMasqueradeInput] = React.useState('');
  const canMasquerade = authenticatedUser?.administrator;
  const { masqueradeUser, setMasqueradeUser } = useMasquerade();
  const handleMasqueradeInputChange = (e) => setMasqueradeInput(e.target.value);
  const handleClearMasquerade = () => {
    setMasqueradeUser(undefined);
    setMasqueradeInput('');
  };
  const handleMasqueradeSubmit = (user) => (e) => {
    setMasqueradeUser(user);
    e.preventDefault();
  };

  const isMasqueradingFailed = !!masqueradeUser && masqueradeInput && isError;
  const isMasqueradingPending = !!masqueradeUser && isPending;
  const isMasquerading = !!masqueradeUser && !isError && !isPending;
  const masqueradeErrorMessage = useMemo(() => {
    if (masqueradeUser && error) {
      return (error.customAttributes?.httpErrorStatus === 404 ? messages.NoStudentFound : messages.UnknownError);
    }
    return null;
  }, [error, masqueradeUser]);

  return (
    <CustomMasqueradeBar
      canMasquerade={canMasquerade}
      isMasquerading={isMasquerading}
      isMasqueradingFailed={isMasqueradingFailed}
      isMasqueradingPending={isMasqueradingPending}
      masqueradeInput={masqueradeInput}
      masqueradeErrorMessage={masqueradeErrorMessage}
      handleMasqueradeInputChange={handleMasqueradeInputChange}
      handleClearMasquerade={handleClearMasquerade}
      handleMasqueradeSubmit={handleMasqueradeSubmit}
      formatMessage={formatMessage}
    />
  );
};

export default CustomMasqueradeBarContainer;
