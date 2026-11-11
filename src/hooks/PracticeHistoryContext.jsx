import { useCallback, useEffect, useMemo, useState } from 'react';
import PracticeHistoryContext from './practiceHistoryContext.js';
import {
  clearPracticeHistory as removePracticeHistory,
  readPracticeHistory,
  writePracticeHistory,
} from '../services/practiceHistory.js';

export function PracticeHistoryProvider({ children }) {
  const [history, setHistory] = useState(readPracticeHistory);

  useEffect(() => {
    if (!history.clearCorrupted) return;

    let active = true;
    Promise.resolve().then(() => {
      const removed = removePracticeHistory();
      if (active) {
        setHistory((previous) => ({
          ...previous,
          clearCorrupted: false,
          warning: removed
            ? previous.warning.replace('will be cleared', 'has been cleared')
            : 'Saved practice history was invalid and could not be removed from this browser.',
        }));
      }
    });

    return () => {
      active = false;
    };
  }, [history.clearCorrupted]);

  const addSession = useCallback((session) => {
    const sessions = [session, ...history.sessions];
    const persisted = writePracticeHistory(sessions);
    setHistory({
      sessions,
      warning: persisted ? '' : 'This session is available until you leave, but could not be saved to this browser.',
    });
    return persisted;
  }, [history.sessions]);

  const clearHistory = useCallback(() => {
    const persisted = writePracticeHistory([]);
    setHistory({
      sessions: [],
      warning: persisted ? '' : 'History was cleared for this session but could not be removed from browser storage.',
    });
  }, []);

  const value = useMemo(
    () => ({
      sessions: history.sessions,
      warning: history.warning,
      addSession,
      clearHistory,
    }),
    [history, addSession, clearHistory],
  );

  return <PracticeHistoryContext.Provider value={value}>{children}</PracticeHistoryContext.Provider>;
}
