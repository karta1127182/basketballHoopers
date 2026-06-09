import { createContext, PropsWithChildren, useContext, useState } from 'react';
import { Platform } from 'react-native';

export type UserRole = 'ADMIN' | 'COACH' | 'MEMBER';

export type AuthUser = {
  userId: number;
  name: string;
  phone: string;
  token: string;
  role: UserRole;
  roles?: UserRole[];
};

type AuthContextValue = {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
};

const STORAGE_KEY = 'hoopers.auth-user';
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function loadStoredUser() {
  if (Platform.OS !== 'web') return null;

  try {
    const storedUser = globalThis.localStorage?.getItem(STORAGE_KEY);
    return storedUser ? (JSON.parse(storedUser) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, updateUser] = useState<AuthUser | null>(loadStoredUser);

  function setUser(nextUser: AuthUser | null) {
    updateUser(nextUser);
    if (Platform.OS !== 'web') return;

    if (nextUser) {
      globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      globalThis.localStorage?.removeItem(STORAGE_KEY);
    }
  }

  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error('useAuth must be used within AuthProvider');
  return auth;
}
