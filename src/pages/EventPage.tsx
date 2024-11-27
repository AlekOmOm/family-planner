import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { WeekendPlanner } from '../components/WeekendPlanner';
import { useEventStore } from '../stores/eventStore';

export function EventPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getEvent } = useEventStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }

    getEvent(id).then(event => {
      if (!event) {
        setError('Event not found');
      }
      setLoading(false);
    }).catch(() => {
      setError('Failed to load event');
      setLoading(false);
    });
  }, [id, navigate, getEvent]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{error}</h2>
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-500"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <WeekendPlanner eventId={id} />;
}