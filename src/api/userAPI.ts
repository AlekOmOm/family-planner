import { get, set } from 'idb-keyval';

const USERS_STORE = 'users';

export interface User {
  id: string;
  name: string;
  password: string;
  role: 'admin' | 'user';
}

interface LoginCredentials {
  name: string;
  password: string;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const userAPI = {
  async login({ name, password }: LoginCredentials): Promise<Omit<User, 'password'>> {
    await delay(100);
    
    const users = await get<User[]>(USERS_STORE) || [];
    const user = users.find(
      u => u.name === name && u.password === password
    );
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  async register({ name, password }: LoginCredentials): Promise<Omit<User, 'password'>> {
    await delay(100);

    const users = await get<User[]>(USERS_STORE) || [];
    if (users.some(u => u.name === name)) {
      throw new Error('Username already exists');
    }

    const newUser = {
      id: crypto.randomUUID(),
      name,
      password,
      role: 'user' as const
    };

    await set(USERS_STORE, [...users, newUser]);
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },

  async getCurrentUser(): Promise<Omit<User, 'password'> | null> {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    return JSON.parse(userJson);
  },

  async getAllUsers(): Promise<Omit<User, 'password'>[]> {
    await delay(100);
    const users = await get<User[]>(USERS_STORE) || [];
    return users.map(({ password, ...user }) => user);
  },

  async deleteUser(id: string): Promise<void> {
    await delay(100);
    const users = await get<User[]>(USERS_STORE) || [];
    const updatedUsers = users.filter(user => user.id !== id);
    await set(USERS_STORE, updatedUsers);
    
    // If deleting current user, clear localStorage
    const currentUser = await this.getCurrentUser();
    if (currentUser?.id === id) {
      localStorage.removeItem('user');
    }
  },

  async updateUser(id: string, updates: Partial<Omit<User, 'id' | 'password'>>): Promise<Omit<User, 'password'>> {
    await delay(100);
    const users = await get<User[]>(USERS_STORE) || [];
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const updatedUser = { ...users[userIndex], ...updates };
    users[userIndex] = updatedUser;
    await set(USERS_STORE, users);

    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  },

  async initializeDefaultUsers() {
    const users = await get<User[]>(USERS_STORE);
    if (!users || users.length === 0) {
      const defaultUsers = [
        {
          id: crypto.randomUUID(),
          name: 'admin',
          password: 'admin123',
          role: 'admin' as const
        }
      ];
      await set(USERS_STORE, defaultUsers);
    }
  }
};