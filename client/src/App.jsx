import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { FiltersProvider } from './context/FiltersContext';
import { ToastProvider } from './context/ToastContext';
import DashboardPage from './pages/DashboardPage';
import FeedbackPage from './pages/FeedbackPage';
import IssuesPage from './pages/IssuesPage';
import ReportsPage from './pages/ReportsPage';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <FiltersProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<DashboardPage />} />
              <Route path="feedback" element={<FeedbackPage />} />
              <Route path="issues" element={<IssuesPage />} />
              <Route path="reports" element={<ReportsPage />} />
            </Route>
          </Routes>
        </FiltersProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
