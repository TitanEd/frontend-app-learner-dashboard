import React from 'react';

import { StrictDict } from 'utils';
import { useUpdateEmailSettings } from 'data/hooks';
import { useCourseData } from 'hooks';

import * as module from './hooks';

export const state = StrictDict({
  toggle: (val) => React.useState(val), // eslint-disable-line
});

export const useEmailData = ({
  closeModal,
  cardId,
}) => {
  const courseData = useCourseData(cardId);
  const hasOptedOutOfEmail = courseData?.enrollment?.hasOptedOutOfEmail || false;
  const courseId = courseData?.courseRun?.courseId;
  const [isOptedOut, setIsOptedOut] = module.state.toggle(hasOptedOutOfEmail);
  const { mutate: updateEmailSettings } = useUpdateEmailSettings();
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
    updateEmailSettings({ courseId, enable: enableEmails });
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
