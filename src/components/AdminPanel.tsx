import { useState, useEffect } from 'react';
import { XMarkIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../stores/authStore';

interface AdminPanelProps {
  onClose: () => void;
}

export function AdminPanel({ onClose }: AdminPanelProps) {
  const { getAllUsers, deleteUser, updateUser, user: currentUser, logout } = useAuthStore();
  const [users, setUsers] = useState<Array<{ id: string; name: string; role: string }>>([]);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<'admin' | 'user'>('user');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const allUsers = await getAllUsers();
    setUsers(allUsers);
  };

  const handleDeleteUser = async (id: string) => {
    if (id === currentUser?.id) {
      if (!window.confirm('Are you sure you want to delete your own account? You will be logged out.')) {
        return;
      }
    } else {
      if (!window.confirm('Are you sure you want to delete this user?')) {
        return;
      }
    }

    try {
      await deleteUser(id);
      if (id === currentUser?.id) {
        onClose();
        logout();
      } else {
        await loadUsers();
      }
      setError(null);
    } catch (err) {
      setError("Failed to delete user");
    }
  };

  const handleUpdateUser = async (id: string) => {
    try {
      await updateUser(id, { role: editRole });
      setEditingUser(null);
      await loadUsers();
      setError(null);
    } catch (err) {
      setError("Failed to update user");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">User Management</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Username</th>
                <th className="text-left p-2">Role</th>
                <th className="text-right p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b">
                  <td className="p-2">
                    {user.name}
                    {user.id === currentUser?.id && (
                      <span className="ml-2 text-sm text-gray-500">(You)</span>
                    )}
                  </td>
                  <td className="p-2">
                    {editingUser === user.id ? (
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value as 'admin' | 'user')}
                        className="border rounded px-2 py-1"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className={user.role === 'admin' ? 'text-blue-600' : ''}>
                        {user.role}
                      </span>
                    )}
                  </td>
                  <td className="p-2 text-right">
                    {editingUser === user.id ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleUpdateUser(user.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingUser(null);
                            setError(null);
                          }}
                          className="text-gray-600 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingUser(user.id);
                            setEditRole(user.role as 'admin' | 'user');
                            setError(null);
                          }}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-700"
                          title={user.id === currentUser?.id ? "Delete your account" : "Delete user"}
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}