import { Event } from '../types';
import { MapPinIcon, CalendarIcon, PencilIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface EventHeaderProps {
  event: Event;
  onEdit: () => void;
}

export function EventHeader({ event, onEdit }: EventHeaderProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-[#4A4A4A] mb-2">{event.title}</h1>
          <div className="space-y-1">
            <p className="flex items-center gap-2 text-[#6B6B6B]">
              <MapPinIcon className="w-5 h-5" />
              {event.location}
            </p>
            <p className="flex items-center gap-2 text-[#6B6B6B]">
              <CalendarIcon className="w-5 h-5" />
              {format(event.startDate, 'PP')} - {format(event.endDate, 'PP')}
            </p>
          </div>
        </div>
        <button
          onClick={onEdit}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <PencilIcon className="w-5 h-5 text-[#4A4A4A]" />
        </button>
      </div>
    </div>
  );
}