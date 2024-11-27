import { create } from 'zustand';
import { Event, Person, Day } from '../types';
import { format, eachDayOfInterval, parseISO } from 'date-fns';
import { eventAPI } from '../api/eventAPI';
import { userEventAPI } from '../api/userEventAPI';
import { useAuthStore } from './authStore';

interface EventState {
  events: Record<string, Event>;
  userEvents: string[];
  loading: boolean;
  error: string | null;
  shareUrl: string | null;
  createEvent: (eventData: Partial<Event>) => Promise<Event>;
  updateEvent: (id: string, event: Partial<Event>) => Promise<Event>;
  getEvent: (id: string) => Promise<Event | null>;
  getUserEvents: () => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  shareEvent: (id: string) => Promise<void>;
  initialize: () => Promise<void>;
  getSharedParticipants: () => Promise<Person[]>;
  importEvent: (id: string) => Promise<void>;
}

import { formatISO } from 'date-fns';

const generateDaysFromDateRange = (startDate: Date, endDate: Date): Day[] => {
  return eachDayOfInterval({ start: startDate, end: endDate })
    .map(date => ({
      id: formatISO(date, { representation: 'date' }), // Use date string as ID
      title: format(date, 'EEEE'), // We'll adjust the title later
      date: date,
      cards: []
    }));
};


const ensureDateObject = (date: Date | string): Date => {
  return typeof date === 'string' ? parseISO(date) : date;
};

export const useEventStore = create<EventState>((set, get) => ({
  events: {},
  userEvents: [],
  loading: false,
  error: null,
  shareUrl: null,

  initialize: async () => {
    try {
      const events = await eventAPI.getAll();
      const eventsMap = events.reduce((acc, event) => {
        // Ensure dates are properly converted
        const processedEvent = {
          ...event,
          startDate: ensureDateObject(event.startDate),
          endDate: ensureDateObject(event.endDate),
          days: event.days.map(day => ({
            ...day,
            date: ensureDateObject(day.date)
          }))
        };
        acc[event.id] = processedEvent;
        return acc;
      }, {} as Record<string, Event>);
      set({ events: eventsMap });
    } catch (error) {
      set({ error: 'Failed to initialize events' });
    }
  },



  createEvent: async (eventData: Partial<Event>) => {
    set({ loading: true, error: null });
    try {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('User not authenticated');

      const startDate = ensureDateObject(eventData.startDate || new Date());
      const endDate = ensureDateObject(eventData.endDate || new Date());

      const newEvent: Event = {
        id: crypto.randomUUID(),
        title: eventData.title || 'New Event',
        location: eventData.location || '',
        startDate,
        endDate,
        people: [
          {
            id: user.id,
            name: user.name,
            initials: user.name.split(' ').map(n => n[0]).join('').toUpperCase(),
            color: '#8B4513',
            interests: []
          }
        ],
        days: generateDaysFromDateRange(startDate, endDate),
        floatingCards: [],
        ownerId: user.id
      };

      const createdEvent = await eventAPI.create(newEvent);
      await userEventAPI.addUserEvent(user.id, createdEvent.id, 'owner');

      set(state => ({
        events: { ...state.events, [createdEvent.id]: createdEvent },
        userEvents: [...state.userEvents, createdEvent.id],
        loading: false
      }));

      return createdEvent;
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
      throw error;
    }
  },

  updateEvent: async (id: string, eventData: Partial<Event>) => {
    set({ loading: true, error: null });
    try {
      const currentEvent = get().events[id];
      if (!currentEvent) throw new Error('Event not found');

      // If dates are being updated, regenerate the days
      let updatedDays = currentEvent.days;
      if (eventData.startDate || eventData.endDate) {
        const newStartDate = ensureDateObject(eventData.startDate || currentEvent.startDate);
        const newEndDate = ensureDateObject(eventData.endDate || currentEvent.endDate);
        
        const newDays = generateDaysFromDateRange(newStartDate, newEndDate);
        
        // Transfer existing cards to matching dates
        updatedDays = newDays.map(newDay => {
          const existingDay = currentEvent.days.find(day => day.id === newDay.id);
          
          return existingDay ? { ...existingDay, title: newDay.title } : newDay;
        });

        const orphanedCards = currentEvent.days
            .filter(day => !updatedDays.some(newDay => newDay.id === day.id))
            .flatMap(day => day.cards);

        if (orphanedCards.length > 0) {
          currentEvent.floatingCards = [...currentEvent.floatingCards, ...orphanedCards];
        }
      }

      const updatedEvent = {
        ...currentEvent,
        ...eventData,
        startDate: eventData.startDate ? ensureDateObject(eventData.startDate) : currentEvent.startDate,
        endDate: eventData.endDate ? ensureDateObject(eventData.endDate) : currentEvent.endDate,
        days: updatedDays
      };

      const savedEvent = await eventAPI.update(id, updatedEvent);

      set(state => ({
        events: { ...state.events, [id]: savedEvent },
        loading: false
      }));

      return savedEvent;
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
      throw error;
    }
  },

  getEvent: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const event = await eventAPI.getById(id);
      if (event) {
        // Ensure dates are properly converted
        const processedEvent = {
          ...event,
          startDate: ensureDateObject(event.startDate),
          endDate: ensureDateObject(event.endDate),
          days: event.days.map(day => ({
            ...day,
            date: ensureDateObject(day.date)
          }))
        };
        
        set(state => ({
          events: { ...state.events, [id]: processedEvent },
          loading: false
        }));
        return processedEvent;
      }
      return null;
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
      return null;
    }
  },

  getUserEvents: async () => {
    set({ loading: true, error: null });
    try {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('User not authenticated');

      const eventIds = await userEventAPI.getUserEvents(user.id);
      const events = await Promise.all(
        eventIds.map(id => eventAPI.getById(id))
      );

      const eventsMap = events.reduce((acc, event) => {
        if (event) {
          // Ensure dates are properly converted
          const processedEvent = {
            ...event,
            startDate: ensureDateObject(event.startDate),
            endDate: ensureDateObject(event.endDate),
            days: event.days.map(day => ({
              ...day,
              date: ensureDateObject(day.date)
            }))
          };
          acc[event.id] = processedEvent;
        }
        return acc;
      }, {} as Record<string, Event>);

      set(state => ({
        events: { ...state.events, ...eventsMap },
        userEvents: eventIds,
        loading: false
      }));
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
    }
  },

  deleteEvent: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('User not authenticated');
  
      const event = get().events[id];
      if (!event) throw new Error('Event not found');
  
      if (event.ownerId !== user.id) throw new Error('You do not have permission to delete this event');
  
      // Delete the event from the backend
      await eventAPI.delete(id);
  
      // Remove the event from the user's events
      await userEventAPI.removeUserEvent(user.id, id);
  
      // Update local state
      set((state) => {
        const newEvents = { ...state.events };
        delete newEvents[id];
  
        return {
          events: newEvents,
          userEvents: state.userEvents.filter((eventId) => eventId !== id),
          loading: false,
        };
      });
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
      throw error;
    }
  },
  

  shareEvent: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { shareUrl } = await eventAPI.share(id);
      set({ shareUrl, loading: false });
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
      throw error;
    }
  },

  getSharedParticipants: async () => {
    const { events, userEvents } = get();
    const participants = new Map<string, Person>();

    userEvents.forEach(eventId => {
      const event = events[eventId];
      if (event) {
        event.people.forEach(person => {
          if (!participants.has(person.id)) {
            participants.set(person.id, person);
          }
        });
      }
    });

    return Array.from(participants.values());
  },

  importEvent: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('User not authenticated');

      const event = await eventAPI.getById(id);
      if (!event) throw new Error('Event not found');

      if (!event.people.some(p => p.id === user.id)) {
        const updatedEvent = {
          ...event,
          people: [
            ...event.people,
            {
              id: user.id,
              name: user.name,
              initials: user.name.split(' ').map(n => n[0]).join('').toUpperCase(),
              color: '#8B4513',
              interests: []
            }
          ]
        };
        await eventAPI.update(id, updatedEvent);
        set(state => ({
          events: { ...state.events, [id]: updatedEvent }
        }));
      }

      if (!get().userEvents.includes(id)) {
        await userEventAPI.addUserEvent(user.id, id, 'participant');
        set(state => ({
          userEvents: [...state.userEvents, id]
        }));
      }

      set({ loading: false });
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
      throw error;
    }
  }
}));