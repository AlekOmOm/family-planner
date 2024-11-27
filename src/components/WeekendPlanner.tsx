import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { HomeIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../stores/authStore';
import { useEventStore } from '../stores/eventStore';
import type { Card } from '../types';
import { EventHeader } from './EventHeader';
import { UserMenu } from './UserMenu';
import { ShareButton } from './ShareButton';
import { PersonBubble } from './PersonBubble';
import { TripCard } from './TripCard';
import { AddButton } from './AddButton';
import { EventForm } from './EventForm';
import { LocationPicker } from './LocationPicker';
import { format } from 'date-fns';


interface WeekendPlannerProps {
  eventId: string;
}

export function WeekendPlanner({ eventId }: WeekendPlannerProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { events, updateEvent } = useEventStore();
  const [showEventForm, setShowEventForm] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState<string | null>(
    null
  );
  const event = events[eventId];

  useEffect(() => {
    if (!event) return;

    if (user && !event.people.some((p) => p.id === user.id)) {
      updateEvent(eventId, {
        ...event,
        people: [
          ...event.people,
          {
            id: user.id,
            name: user.name,
            initials: user.name
              .split(' ')
              .map((part) => part[0])
              .join('')
              .toUpperCase(),
            interests: [],
            color: '#' + Math.floor(Math.random() * 16777215).toString(16),
          },
        ],
      });
    }
  }, [user, event?.people, eventId, updateEvent, event]);

  if (!event) return null;

  const addPerson = () => {
    const name = prompt('Name:');
    if (!name) return;

    updateEvent(eventId, {
      ...event,
      people: [
        ...event.people,
        {
          id: crypto.randomUUID(),
          name,
          initials: name
            .split(' ')
            .map((part) => part[0])
            .join('')
            .toUpperCase(),
          interests: [],
          color: COLORS[event.people.length % COLORS.length],
        },
      ],
    });
  };

  const removePerson = (id: string) => {
    updateEvent(eventId, {
      ...event,
      people: event.people.filter((p) => p.id !== id),
    });
  };

  const editInterests = (personId: string) => {
    const person = event.people.find((p) => p.id === personId);
    if (!person) return;

    const interests: string[] = [];
    let interest;
    do {
      interest = prompt(
        'Add interest (or leave empty to finish):',
        person.interests.join('\n')
      );
      if (interest) interests.push(interest);
    } while (interest);

    updateEvent(eventId, {
      ...event,
      people: event.people.map((p) =>
        p.id === personId ? { ...p, interests } : p
      ),
    });
  };

  const addCard = (dayId?: string) => {
    const title = prompt('Title:');
    if (!title) return;

    const time = prompt('Time:');
    const newCard: Card = {
      id: crypto.randomUUID(),
      title,
      time: time || undefined,
      notes: [],
      dayId: dayId,
      location: undefined,
    };

    if (dayId) {
      const updatedDays = event.days.map((day) =>
        day.id === dayId ? { ...day, cards: [...day.cards, newCard] } : day
      );
      updateEvent(eventId, { ...event, days: updatedDays });
    } else {
      updateEvent(eventId, {
        ...event,
        floatingCards: [...event.floatingCards, newCard],
      });
    }
  };

  const removeCard = (cardId: string, dayId?: string) => {
    if (dayId) {
      updateEvent(eventId, {
        ...event,
        days: event.days.map((day) =>
          day.id === dayId
            ? { ...day, cards: day.cards.filter((c) => c.id !== cardId) }
            : day
        ),
      });
    } else {
      updateEvent(eventId, {
        ...event,
        floatingCards: event.floatingCards.filter((c) => c.id !== cardId),
      });
    }
  };

  const addNote = (cardId: string, dayId?: string) => {
    const text = prompt('Note:');
    if (!text) return;

    const newNote = {
      id: crypto.randomUUID(),
      text,
      createdAt: new Date(),
    };

    if (dayId) {
      updateEvent(eventId, {
        ...event,
        days: event.days.map((day) =>
          day.id === dayId
            ? {
                ...day,
                cards: day.cards.map((card) =>
                  card.id === cardId
                    ? { ...card, notes: [...card.notes, newNote] }
                    : card
                ),
              }
            : day
        ),
      });
    } else {
      updateEvent(eventId, {
        ...event,
        floatingCards: event.floatingCards.map((card) =>
          card.id === cardId
            ? { ...card, notes: [...card.notes, newNote] }
            : card
        ),
      });
    }
  };

  const editNote = (
    cardId: string,
    noteId: string,
    text: string,
    dayId?: string
  ) => {
    if (dayId) {
      updateEvent(eventId, {
        ...event,
        days: event.days.map((day) =>
          day.id === dayId
            ? {
                ...day,
                cards: day.cards.map((card) =>
                  card.id === cardId
                    ? {
                        ...card,
                        notes: card.notes.map((note) =>
                          note.id === noteId ? { ...note, text } : note
                        ),
                      }
                    : card
                ),
              }
            : day
        ),
      });
    } else {
      updateEvent(eventId, {
        ...event,
        floatingCards: event.floatingCards.map((card) =>
          card.id === cardId
            ? {
                ...card,
                notes: card.notes.map((note) =>
                  note.id === noteId ? { ...note, text } : note
                ),
              }
            : card
        ),
      });
    }
  };

  const deleteNote = (cardId: string, noteId: string, dayId?: string) => {
    if (dayId) {
      updateEvent(eventId, {
        ...event,
        days: event.days.map((day) =>
          day.id === dayId
            ? {
                ...day,
                cards: day.cards.map((card) =>
                  card.id === cardId
                    ? {
                        ...card,
                        notes: card.notes.filter((note) => note.id !== noteId),
                      }
                    : card
                ),
              }
            : day
        ),
      });
    } else {
      updateEvent(eventId, {
        ...event,
        floatingCards: event.floatingCards.map((card) =>
          card.id === cardId
            ? {
                ...card,
                notes: card.notes.filter((note) => note.id !== noteId),
              }
            : card
        ),
      });
    }
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const sourceId = result.source.droppableId;
    const destId = result.destination.droppableId;
    const itemId = result.draggableId;

    if (sourceId === destId) return;

    let card;
    if (sourceId === 'floating') {
      card = event.floatingCards.find((c) => c.id === itemId);
      updateEvent(eventId, {
        ...event,
        floatingCards: event.floatingCards.filter((c) => c.id !== itemId),
      });
    } else {
      const sourceDay = event.days.find((d) => d.id === sourceId);
      card = sourceDay?.cards.find((c) => c.id === itemId);
      updateEvent(eventId, {
        ...event,
        days: event.days.map((day) =>
          day.id === sourceId
            ? { ...day, cards: day.cards.filter((c) => c.id !== itemId) }
            : day
        ),
      });
    }

    if (card) {
      if (destId === 'floating') {
        updateEvent(eventId, {
          ...event,
          floatingCards: [
            ...event.floatingCards,
            { ...card, dayId: undefined },
          ],
        });
      } else {
        updateEvent(eventId, {
          ...event,
          days: event.days.map((day) =>
            day.id === destId
              ? { ...day, cards: [...day.cards, { ...card, dayId: destId }] }
              : day
          ),
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC] via-[#E8DFD1] to-[#F0EAD6] p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex-1 w-full sm:w-auto">
            <EventHeader event={event} onEdit={() => setShowEventForm(true)} />
          </div>
          <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
            <UserMenu />
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-md border shadow-sm w-full sm:w-auto justify-center"
              >
                <HomeIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
              <ShareButton eventId={event.id} />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left sidebar with people */}
          <div className="w-full lg:w-80 bg-[#FFFAF0]/90 backdrop-blur-sm p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-[#4A4A4A]">
                Participants
              </h2>
              <AddButton onClick={addPerson} label="+" compact />
            </div>
            <div className="space-y-4">
              {event.people
                .slice()
                .sort((a, b) =>
                  a.id === user?.id ? 1 : b.id === user?.id ? -1 : 0
                )
                .map((person) => (
                  <PersonBubble
                    key={person.id}
                    person={person}
                    onRemove={removePerson}
                    onEditInterests={editInterests}
                  />
                ))}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1">
            <DragDropContext onDragEnd={onDragEnd}>
              {/* Floating cards */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-[#4A4A4A]">
                      General Notes
                    </h2>
                    <AddButton onClick={() => addCard()} label="+" compact />
                  </div>
                </div>
                <Droppable droppableId="floating">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                      {event.floatingCards.map((card, index) => (
                        <Draggable
                          key={card.id}
                          draggableId={card.id}
                          index={index}
                        >
                          {(provided) => (
                            <TripCard
                              card={card}
                              provided={provided}
                              onRemove={removeCard}
                              onAddNote={addNote}
                              onEditNote={editNote}
                              onDeleteNote={deleteNote}
                              onEditLocation={(cardId) =>
                                setShowLocationPicker(cardId)
                              }
                            />
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>

              {/* Days */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {event.days.map((day) => (
                  <div
                    key={day.id}
                    className="bg-[#FFFAF0]/90 backdrop-blur-sm p-6 rounded-xl shadow-lg"
                  >
                    {/* Day Header */}
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-[#4A4A4A]">
                        {day.title} {/* Day of the Week */}
                      </h2>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#4A4A4A]">
                          {format(day.date, 'dd-MM-yyyy')} {/* Date in dd-MM-yyyy format */}
                        </span>
                        <AddButton onClick={() => addCard(day.id)} label="+" compact />
                      </div>
                    </div>

                    {/* Droppable Area for Cards */}
                    <Droppable droppableId={day.id}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="space-y-4"
                        >
                          {day.cards
                            .sort((a, b) => {
                              if (!a.time || !b.time) return 0;
                              return a.time.localeCompare(b.time);
                            })
                            .map((card, index) => (
                              <Draggable
                                key={card.id}
                                draggableId={card.id}
                                index={index}
                              >
                                {(provided) => (
                                  <TripCard
                                    card={card}
                                    provided={provided}
                                    isDayCard
                                    onRemove={(id) => removeCard(id, day.id)}
                                    onAddNote={(id) => addNote(id, day.id)}
                                    onEditNote={(cardId, noteId, text) =>
                                      editNote(cardId, noteId, text, day.id)
                                    }
                                    onDeleteNote={(cardId, noteId) =>
                                      deleteNote(cardId, noteId, day.id)
                                    }
                                    onEditLocation={(cardId) =>
                                      setShowLocationPicker(cardId)
                                    }
                                  />
                                )}
                              </Draggable>
                            ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>

            </DragDropContext>
          </div>
        </div>

        {showEventForm && (
          <EventForm
            event={event}
            onSave={(updatedEvent) => {
              updateEvent(eventId, updatedEvent);
              setShowEventForm(false);
            }}
            onClose={() => setShowEventForm(false)}
          />
        )}

        {showLocationPicker && (
          <LocationPicker
            currentLocation={
              event.floatingCards.find((c) => c.id === showLocationPicker)
                ?.location ||
              event.days
                .flatMap((d) => d.cards)
                .find((c) => c.id === showLocationPicker)?.location
            }
            onSave={(location) => {
              const card = event.floatingCards.find(
                (c) => c.id === showLocationPicker
              );
              if (card) {
                updateEvent(eventId, {
                  ...event,
                  floatingCards: event.floatingCards.map((c) =>
                    c.id === showLocationPicker ? { ...c, location } : c
                  ),
                });
              } else {
                updateEvent(eventId, {
                  ...event,
                  days: event.days.map((day) => ({
                    ...day,
                    cards: day.cards.map((c) =>
                      c.id === showLocationPicker ? { ...c, location } : c
                    ),
                  })),
                });
              }
              setShowLocationPicker(null);
            }}
            onClose={() => setShowLocationPicker(null)}
          />
        )}
      </div>
    </div>
  );
}

const COLORS = [
  '#8B4513', // Saddle Brown
  '#1B4B6B', // Navy
  '#2F4F4F', // Dark Slate Gray
  '#CD5C5C', // Indian Red
  '#DAA520', // Golden Rod
  '#556B2F', // Olive
  '#4A708B', // Steel Blue
  '#8B7355', // Burly Wood
  '#CD853F', // Peru
  '#698B69', // Dark Sea Green
];
