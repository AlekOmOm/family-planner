import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { LocationInput } from './LocationInput';

interface LocationPickerProps {
  currentLocation?: string;
  onSave: (location: string) => void;
  onClose: () => void;
}

export function LocationPicker({ currentLocation, onSave, onClose }: LocationPickerProps) {
  const [location, setLocation] = useState(currentLocation || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(location);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Set Location</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <LocationInput
              id="location"
              value={location}
              onChange={setLocation}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md border"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}