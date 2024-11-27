import { useState, useEffect } from 'react';
import { XMarkIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../stores/authStore';
import { Person } from '../types';
import type { User } from '../api/userAPI';

interface ParticipantPickerProps {
  onClose: () => void;
  onAdd: (participant: Person) => void;
  currentParticipants: Person[];
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
  '#698B69'  // Dark Sea Green
];

export function ParticipantPicker({ onClose, onAdd, currentParticipants }: ParticipantPickerProps) {
  const { getAllUsers } = useAuthStore();
  const [users, setUsers] = useState<Omit<User, 'password'>[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const allUsers = await getAllUsers();
        setUsers(allUsers);
      } catch (error) {
        setError('Failed to load users');
      }
    };
    loadUsers();
  }, [getAllUsers]);

  const filteredUsers = users.filter(user => 
    !currentParticipants.some(p => p.id === user.id) &&
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddParticipant = (user: Omit<User, 'password'>) => {
    const participant: Person = {
      id: user.id,
      name: user.name,
      initials: user.name.split(' ').map(n => n[0]).join('').toUpperCase(),
      color: COLORS[currentParticipants.length % COLORS.length],
      interests: []
    };
    onAdd(participant);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Add Participant</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users..."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
          />

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="max-h-60 overflow-y-auto">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleAddParticipant(user)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <UserPlusIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{user.name}</span>
                </button>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">
                {searchTerm ? 'No users found' : 'No users available'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}