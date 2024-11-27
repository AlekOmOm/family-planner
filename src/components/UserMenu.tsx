import { useState } from 'react';
import { UserCircleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../stores/authStore';
import { AuthModal } from './AuthModal';
import { AdminPanel } from './AdminPanel';

export function UserMenu() {
  const { user, logout } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const isAdmin = user?.role === 'admin';

  return (
    <>
      <div className="flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-[#F0EAD6] rounded-lg">
              <span className="text-lg font-semibold text-[#8B4513]">
                {user.name}
                {isAdmin && (
                  <span className="ml-2 text-sm text-[#8B4513] opacity-75">
                    (Admin)
                  </span>
                )}
              </span>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowAdminPanel(true)}
                className="p-2 text-[#1B4B6B] hover:text-[#123448] rounded-full hover:bg-[#F0EAD6] transition-colors"
                title="Admin Panel"
              >
                <Cog6ToothIcon className="w-6 h-6" />
              </button>
            )}
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-white bg-[#1B4B6B] hover:bg-[#123448] rounded-md"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#4A4A4A] hover:text-[#8B4513]"
          >
            <UserCircleIcon className="w-6 h-6" />
            Sign In
          </button>
        )}
      </div>

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}

      {showAdminPanel && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}
    </>
  );
}