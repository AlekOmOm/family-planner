import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { useEventStore } from './stores/eventStore';
import { userAPI } from './api/userAPI';
import { Dashboard } from './pages/Dashboard';
import { EventPage } from './pages/EventPage';

export default function App() {
  const { initialize: initAuth } = useAuthStore();
  const { initialize: initEvents } = useEventStore();

  useEffect(() => {
    const init = async () => {
      await userAPI.initializeDefaultUsers();
      await initAuth();
      await initEvents();
    };
    init();
  }, [initAuth, initEvents]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/event/:id" element={<EventPage />} />
      </Routes>
    </BrowserRouter>
  );
}