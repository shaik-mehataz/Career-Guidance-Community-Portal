// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import LoadingSpinner from './components/common/LoadingSpinner';
import { useAuth } from './context/AuthContext';

// Lazy loaded pages
const ResourcesPage = lazy(() => import('./pages/resources/ResourcesPage'));
const ResourceDetailPage = lazy(() => import('./pages/resources/ResourceDetailPage'));
const JobsPage = lazy(() => import('./pages/jobs/JobsPage'));
const JobDetailPage = lazy(() => import('./pages/jobs/JobDetailPage'));
const JobApplicationPage = lazy(() => import('./pages/jobs/JobApplicationPage'));
const EventsPage = lazy(() => import('./pages/events/EventsPage'));
const EventDetailPage = lazy(() => import('./pages/events/EventDetailPage'));
const EventRegistrationPage = lazy(() => import('./pages/events/EventRegistrationPage'));
const EventHostingPage = lazy(() => import('./pages/events/EventHostingPage'));
const MentorsPage = lazy(() => import('./pages/mentors/MentorsPage'));
const MentorDetailPage = lazy(() => import('./pages/mentors/MentorDetailPage'));
const MentorChatPage = lazy(() => import('./pages/mentors/MentorChatPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const SignupPage = lazy(() => import('./pages/auth/SignupPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const ResumeBuilderPage = lazy(() => import('./pages/tools/ResumeBuilderPage'));
const EventPaymentPage = lazy(() => import('./pages/events/EventPaymentPage'));

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />

          <Route path="resources">
            <Route index element={<ResourcesPage />} />
            <Route path=":id" element={<ResourceDetailPage />} />
          </Route>

          <Route path="jobs">
            <Route index element={<JobsPage />} />
            <Route path=":id" element={<JobDetailPage />} />
            <Route path=":id/apply" element={<JobApplicationPage />} />
          </Route>

          <Route path="events">
            <Route index element={<EventsPage />} />
            <Route path=":id" element={<EventDetailPage />} />
            <Route path=":id/register" element={<EventRegistrationPage />} />
            <Route path=":id/payment" element={<EventPaymentPage />} />
            <Route path="host" element={<EventHostingPage />} />
          </Route>

          <Route path="mentors">
            <Route index element={<MentorsPage />} />
            <Route path=":id" element={<MentorDetailPage />} />
            <Route path=":id/chat" element={<MentorChatPage />} />
          </Route>

          <Route path="tools">
            <Route path="resume-builder" element={<ResumeBuilderPage />} />
          </Route>

          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
