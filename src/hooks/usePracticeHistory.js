import { useContext } from 'react';
import PracticeHistoryContext from './practiceHistoryContext.js';

export function usePracticeHistory() {
  const context = useContext(PracticeHistoryContext);
  if (!context) {
    throw new Error('usePracticeHistory must be used within PracticeHistoryProvider.');
  }
  return context;
}
