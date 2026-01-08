import React from 'react';

import { StrictDict } from 'utils';
import { reduxHooks, apiHooks } from 'hooks';

import * as module from './hooks';

export const state = StrictDict({
  toggle: (val) => React.useState(val), // eslint-disable-line
});

export const useEmailData = ({
  closeModal,
  cardId,
}) => {
  const { hasOptedOutOfEmail } = reduxHooks.useCardEnrollmentData(cardId);
  const [isOptedOut, setIsOptedOut] = module.state.toggle(hasOptedOutOfEmail);
  const updateEmailSettings = apiHooks.useUpdateEmailSettings(cardId);
  const savedValueRef = React.useRef(hasOptedOutOfEmail);
  const initialReduxValueRef = React.useRef(hasOptedOutOfEmail);

  React.useEffect(() => {
    if (initialReduxValueRef.current !== hasOptedOutOfEmail) {
      initialReduxValueRef.current = hasOptedOutOfEmail;
      savedValueRef.current = hasOptedOutOfEmail;
    }
  }, [hasOptedOutOfEmail]);

  const resetToReduxValue = React.useCallback(() => {
    setIsOptedOut(savedValueRef.current);
  }, [setIsOptedOut]);

  const onToggle = () => setIsOptedOut(!isOptedOut);
  const save = () => {
    const enableEmails = !isOptedOut;
    updateEmailSettings(enableEmails);
    savedValueRef.current = isOptedOut;
    closeModal();
  };

  return {
    onToggle,
    save,
    isOptedOut,
    resetToReduxValue,
  };
};

export default useEmailData;
