import { get, set } from 'idb-keyval';

const USER_EVENTS_STORE = 'userEvents';

interface UserEvent {
  userId: string;
  eventId: string;
  role: 'owner' | 'participant';
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const userEventAPI = {
  async getUserEvents(userId: string): Promise<string[]> {
    await delay(100);
    const userEvents = await get<UserEvent[]>(USER_EVENTS_STORE) || [];
    return userEvents
      .filter(ue => ue.userId === userId)
      .map(ue => ue.eventId);
  },

  async addUserEvent(userId: string, eventId: string, role: 'owner' | 'participant' = 'owner'): Promise<void> {
    await delay(100);
    const userEvents = await get<UserEvent[]>(USER_EVENTS_STORE) || [];
    if (!userEvents.some(ue => ue.userId === userId && ue.eventId === eventId)) {
      userEvents.push({ userId, eventId, role });
      await set(USER_EVENTS_STORE, userEvents);
    }
  },

  async removeUserEvent(userId: string, eventId: string): Promise<void> {
    await delay(100);
    const userEvents = await get<UserEvent[]>(USER_EVENTS_STORE) || [];
    const filtered = userEvents.filter(
      ue => !(ue.userId === userId && ue.eventId === eventId)
    );
    await set(USER_EVENTS_STORE, filtered);
  }
};