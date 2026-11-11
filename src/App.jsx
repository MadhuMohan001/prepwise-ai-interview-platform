import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout.jsx';
import { PracticeHistoryProvider } from './hooks/PracticeHistoryContext.jsx';

const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const HistoryPage = lazy(() => import('./pages/HistoryPage.jsx'));
const PracticePage = lazy(() => import('./pages/PracticePage.jsx'));

function PageLoading() {
  return (
    <p role="status" aria-live="polite" className="rounded-xl border border-slate-200 bg-white p-5 text-sm font-medium text-slate-600">
      Loading page...
    </p>
  );
}

function App() {
  return (
    <PracticeHistoryProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Suspense fallback={<PageLoading />}><DashboardPage /></Suspense>} />
            <Route path="/practice" element={<Suspense fallback={<PageLoading />}><PracticePage /></Suspense>} />
            <Route path="/history" element={<Suspense fallback={<PageLoading />}><HistoryPage /></Suspense>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </PracticeHistoryProvider>
  );
}

export default App;
