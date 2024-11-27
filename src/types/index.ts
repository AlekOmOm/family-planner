export interface Person {
  id: string;
  initials: string;
  name: string;
  color: string;
  interests: string[];
}

export interface Note {
  id: string;
  text: string;
  createdAt: Date;
}

export interface Card {
  id: string;
  title: string;
  time?: string;
  location?: string;
  notes: Note[];
  dayId?: string;
}

export interface Day {
  id: string;
  title: string;
  date: Date;
  cards: Card[];
}

export interface Event {
  id: string;
  title: string;
  location: string;
  startDate: Date;
  endDate: Date;
  people: Person[];
  days: Day[];
  floatingCards: Card[];
  ownerId: string;
}

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'user';
}