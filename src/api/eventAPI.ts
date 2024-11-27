import { get, set } from 'idb-keyval';
import { Event } from '../types';

const EVENTS_STORE = 'events';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const eventAPI = {
  async getAll(): Promise<Event[]> {
    await delay(100);
    const events = await get<Event[]>(EVENTS_STORE) || [];
    return events;
  },

  async getById(id: string): Promise<Event | null> {
    await delay(100);
    const events = await get<Event[]>(EVENTS_STORE) || [];
    return events.find(e => e.id === id) || null;
  },

  async create(event: Event): Promise<Event> {
    await delay(100);
    const events = await get<Event[]>(EVENTS_STORE) || [];
    events.push(event);
    await set(EVENTS_STORE, events);
    return event;
  },

  async update(id: string, event: Event): Promise<Event> {
    await delay(100);
    const events = await get<Event[]>(EVENTS_STORE) || [];
    const index = events.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Event not found');
    events[index] = event;
    await set(EVENTS_STORE, events);
    return event;
  },

  async share(id: string): Promise<{ shareUrl: string }> {
    await delay(100);
    const event = await this.getById(id);
    if (!event) throw new Error('Event not found');
    const shareUrl = `${window.location.origin}/event/${id}`;
    return { shareUrl };
  }
};