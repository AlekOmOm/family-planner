import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { UserMenu } from '../components/UserMenu';
import { useEventStore } from '../stores/eventStore';
import { useAuthStore } from '../stores/authStore';
import { format } from 'date-fns';

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    events,
    userEvents,
    getUserEvents,
    createEvent,
    importEvent,
    deleteEvent,
  } = useEventStore();
  const [importInput, setImportInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      getUserEvents();
    }
  }, [user, getUserEvents]);

  const handleCreateEvent = async () => {
    try {
      const event = await createEvent({
        title: '',
        location: '',
        startDate: new Date(),
        endDate: new Date(),
      });
      navigate(`/event/${event.id}`);
    } catch (err) {
      setError('Failed to create event');
    }
  };

  const handleImportEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('Please sign in to import events');
      return;
    }

    let eventId = importInput.trim();
    if (eventId.includes('/')) {
      eventId = eventId.split('/').pop() || '';
    }

    if (!eventId) {
      setError('Please enter a valid event ID or URL');
      return;
    }

    try {
      await importEvent(eventId);
      navigate(`/event/${eventId}`);
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this event?');
    if (!confirmDelete) return;

    try {
      await deleteEvent(eventId);
      await getUserEvents();
    } catch (err) {
      setError('Failed to delete event');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC] via-[#E8DFD1] to-[#F0EAD6]">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#4A4A4A]">Weekend Planner</h1>
          <UserMenu />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left side - Event List */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-semibold text-[#4A4A4A]">Your Events</h2>

            {user ? (
              userEvents.length > 0 ? (
                <div className="grid gap-4">
                  {userEvents.map((eventId) => {
                    const event = events[eventId];
                    if (!event) return null;

                    // Check if the user is the owner of the event
                    const isOwner = user?.id === event.ownerId;

                    return (
                      <div
                        key={event.id}
                        className="relative w-full bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                      >
                        {/* Delete Button */}
                        {isOwner && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent the parent button's onClick
                              handleDeleteEvent(event.id);
                            }}
                            className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
                          >
                            <span className="text-xl font-bold">-</span>
                          </button>
                        )}

                        {/* Event Content */}
                        <button
                          onClick={() => navigate(`/event/${event.id}`)}
                          className="w-full text-left"
                        >
                          <h3 className="text-lg font-semibold text-[#4A4A4A] mb-2">
                            {event.title || 'Untitled Event'}
                          </h3>
                          <div className="text-sm text-[#6B6B6B] space-y-1">
                            {event.location && <p>📍 {event.location}</p>}
                            <p>
                              📅 {format(new Date(event.startDate), 'PPP')} -{' '}
                              {format(new Date(event.endDate), 'PPP')}
                            </p>
                            <p>👥 {event.people.length} participants</p>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[#6B6B6B]">No events yet. Create one to get started!</p>
              )
            ) : (
              <p className="text-[#6B6B6B]">Sign in to see your events</p>
            )}
          </div>

          {/* Right side - Create & Import */}
          <div className="space-y-6">
            {/* Create Event */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-[#4A4A4A] mb-4">
                Create New Event
              </h2>
              <p className="text-[#6B6B6B] mb-6">
                Start planning a new weekend event with your family and friends.
              </p>
              <button
                onClick={handleCreateEvent}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#1B4B6B] text-white rounded-lg hover:bg-[#123448] transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                Create Event
              </button>
            </div>

            {/* Import Event */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-[#4A4A4A] mb-4">
                Import Event
              </h2>
              <form onSubmit={handleImportEvent} className="space-y-4">
                <input
                  type="text"
                  value={importInput}
                  onChange={(e) => {
                    setImportInput(e.target.value);
                    setError('');
                  }}
                  placeholder="Paste event URL or ID"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1B4B6B] focus:border-[#1B4B6B]"
                />
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-6 py-2 bg-[#1B4B6B] text-white rounded-lg hover:bg-[#123448] transition-colors"
                >
                  <ArrowRightIcon className="w-5 h-5" />
                  Join Event
                </button>
              </form>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
