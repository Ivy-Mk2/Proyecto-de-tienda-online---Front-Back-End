import { useCallback, useEffect, useState } from 'react';

export type PageState = 'loading' | 'ready' | 'error';

export const usePageUXState = (initialDelay = 350) => {
  const [pageState, setPageState] = useState<PageState>('loading');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => setPageState('ready'), initialDelay);
    return () => window.clearTimeout(timer);
  }, [initialDelay]);

  const retry = useCallback(() => {
    setPageState('loading');
    const timer = window.setTimeout(() => setPageState('ready'), initialDelay);
    return () => window.clearTimeout(timer);
  }, [initialDelay]);

  const showSuccess = useCallback((message: string) => {
    setSuccessMessage(message);
    window.setTimeout(() => setSuccessMessage(''), 2200);
  }, []);

  return {
    pageState,
    setPageState,
    retry,
    successMessage,
    showSuccess,
  };
};
