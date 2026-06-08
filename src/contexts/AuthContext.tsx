import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  password: string; // base64 hashed (demo)
  role: 'admin' | 'user';
  specialty?: string;
  institution?: string;
  avatar?: string;
  joinDate: string;
  bookmarks: number[];
  readingHistory: { bookId: number; progress: number; lastRead: string }[];
}

export interface AuthContextType {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string, specialty?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateProfile: (data: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = 'neuro_users';
const CURRENT_USER_KEY = 'neuro_current_user';

// Simple base64 hash for demo purposes
function simpleHash(password: string): string {
  try {
    return btoa(password + '_neuro_salt');
  } catch {
    return password;
  }
}

function generateId(): string {
  return 'u-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

function getDefaultUsers(): AuthUser[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'admin-default',
      name: 'Dr. Admin',
      email: 'admin@neurolibrary.id',
      password: simpleHash('admin123'),
      role: 'admin',
      specialty: 'Neurologi Umum',
      institution: 'NeuroLibrary Indonesia',
      joinDate: now,
      bookmarks: [],
      readingHistory: [],
    },
    {
      id: 'user-default',
      name: 'Dr. User',
      email: 'user@neurolibrary.id',
      password: simpleHash('user123'),
      role: 'user',
      specialty: 'Neurochirurgi',
      institution: 'RS Universitas',
      joinDate: now,
      bookmarks: [],
      readingHistory: [],
    },
    // 5 NEW USERS:
    {
      id: 'user-oni',
      name: 'Oni',
      email: 'oni@neurolibrary.id',
      password: simpleHash('oni123'),
      role: 'user',
      specialty: 'Neurofisiologi',
      institution: 'RSUD Jakarta',
      joinDate: now,
      bookmarks: [],
      readingHistory: [],
    },
    {
      id: 'user-azka',
      name: 'Azka',
      email: 'azka@neurolibrary.id',
      password: simpleHash('azka123'),
      role: 'user',
      specialty: 'Neuroimaging',
      institution: 'RSCM Jakarta',
      joinDate: now,
      bookmarks: [],
      readingHistory: [],
    },
    {
      id: 'user-devi',
      name: 'Devi',
      email: 'devi@neurolibrary.id',
      password: simpleHash('devi123'),
      role: 'user',
      specialty: 'Neurologi Klinis',
      institution: 'RS Hasan Sadikin',
      joinDate: now,
      bookmarks: [],
      readingHistory: [],
    },
    {
      id: 'user-bio',
      name: 'Bio',
      email: 'bio@neurolibrary.id',
      password: simpleHash('bio123'),
      role: 'user',
      specialty: 'Neuro-onkologi',
      institution: 'RS Dharmais',
      joinDate: now,
      bookmarks: [],
      readingHistory: [],
    },
    {
      id: 'user-youngky',
      name: 'Youngky',
      email: 'youngky@neurolibrary.id',
      password: simpleHash('youngky123'),
      role: 'user',
      specialty: 'Pediatri Neurologi',
      institution: 'RS Sardjito',
      joinDate: now,
      bookmarks: [],
      readingHistory: [],
    },
  ];
}

function loadUsers(): AuthUser[] {
  try {
    const stored = window.localStorage.getItem(USERS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as AuthUser[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  const defaults = getDefaultUsers();
  window.localStorage.setItem(USERS_KEY, JSON.stringify(defaults));
  return defaults;
}

function saveUsers(users: AuthUser[]): void {
  try {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    // silently fail
  }
}

function loadCurrentUser(): AuthUser | null {
  try {
    const stored = window.localStorage.getItem(CURRENT_USER_KEY);
    if (stored) {
      return JSON.parse(stored) as AuthUser;
    }
  } catch {
    // ignore
  }
  return null;
}

function saveCurrentUser(user: AuthUser | null): void {
  try {
    if (user) {
      window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch {
    // silently fail
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadCurrentUser);
  const isLoggedIn = user !== null;
  const isAdmin = user?.role === 'admin';

  // Sync user state with localStorage on mount
  useEffect(() => {
    const current = loadCurrentUser();
    if (current) {
      // Verify user still exists in users list
      const users = loadUsers();
      const found = users.find((u) => u.id === current.id);
      if (found) {
        setUser(found);
      } else {
        saveCurrentUser(null);
      }
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
      const trimmedEmail = email.trim().toLowerCase();
      if (!trimmedEmail || !password) {
        return { success: false, message: 'Email dan password wajib diisi.' };
      }

      const users = loadUsers();
      const found = users.find((u) => u.email.toLowerCase() === trimmedEmail);
      if (!found) {
        return { success: false, message: 'Email tidak terdaftar.' };
      }

      const hashed = simpleHash(password);
      if (found.password !== hashed) {
        return { success: false, message: 'Password salah.' };
      }

      setUser(found);
      saveCurrentUser(found);
      return { success: true, message: `Selamat datang, ${found.name}!` };
    },
    [],
  );

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      specialty?: string,
    ): Promise<{ success: boolean; message: string }> => {
      const trimmedName = name.trim();
      const trimmedEmail = email.trim().toLowerCase();

      if (!trimmedName) {
        return { success: false, message: 'Nama lengkap wajib diisi.' };
      }
      if (!trimmedEmail) {
        return { success: false, message: 'Email wajib diisi.' };
      }
      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        return { success: false, message: 'Format email tidak valid.' };
      }
      if (!password || password.length < 6) {
        return { success: false, message: 'Password minimal 6 karakter.' };
      }

      const users = loadUsers();
      if (users.some((u) => u.email.toLowerCase() === trimmedEmail)) {
        return { success: false, message: 'Email sudah terdaftar.' };
      }

      const newUser: AuthUser = {
        id: generateId(),
        name: trimmedName,
        email: trimmedEmail,
        password: simpleHash(password),
        role: 'user',
        specialty,
        joinDate: new Date().toISOString(),
        bookmarks: [],
        readingHistory: [],
      };

      const updatedUsers = [...users, newUser];
      saveUsers(updatedUsers);
      setUser(newUser);
      saveCurrentUser(newUser);

      return { success: true, message: 'Akun berhasil dibuat!' };
    },
    [],
  );

  const logout = useCallback(() => {
    setUser(null);
    saveCurrentUser(null);
  }, []);

  const updateProfile = useCallback((data: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      // Also update in users list
      const users = loadUsers();
      const idx = users.findIndex((u) => u.id === prev.id);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...data };
        saveUsers(users);
      }
      saveCurrentUser(updated);
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn, isAdmin, login, register, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
