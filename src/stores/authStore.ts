import { create } from 'zustand';
import { User, userAPI } from '../api/userAPI';

interface AuthState {
  user: Omit<User, 'password'> | null;
  loading: boolean;
  error: string | null;
  login: (name: string, password: string) => Promise<void>;
  register: (name: string, password: string) => Promise<void>;
  logout: () => void;
  initialize: () => Promise<void>;
  getAllUsers: () => Promise<Omit<User, 'password'>[]>;
  deleteUser: (id: string) => Promise<void>;
  updateUser: (id: string, updates: Partial<Omit<User, 'id' | 'password'>>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,

  initialize: async () => {
    try {
      const user = await userAPI.getCurrentUser();
      set({ user });
    } catch (error) {
      set({ error: 'Failed to initialize auth' });
    }
  },

  login: async (name: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const user = await userAPI.login({ name, password });
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  register: async (name: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const user = await userAPI.register({ name, password });
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('user');
    set({ user: null });
  },

  getAllUsers: async () => {
    try {
      return await userAPI.getAllUsers();
    } catch (error) {
      console.error('Failed to get users:', error);
      return [];
    }
  },

  deleteUser: async (id: string) => {
    try {
      await userAPI.deleteUser(id);
      // If deleting current user, log them out
      const currentUser = await userAPI.getCurrentUser();
      if (currentUser?.id === id) {
        localStorage.removeItem('user');
        set({ user: null });
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  },

  updateUser: async (id: string, updates: Partial<Omit<User, 'id' | 'password'>>) => {
    try {
      const updatedUser = await userAPI.updateUser(id, updates);
      // Update current user if it's them
      const currentUser = await userAPI.getCurrentUser();
      if (currentUser?.id === id) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        set({ user: updatedUser });
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  }
}));