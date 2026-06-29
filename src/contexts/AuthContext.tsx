import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe, login as apiLogin, logout as apiLogout, type AuthUser } from '../lib/authApi';
import { User, UserRole } from '../types';

const KNOWN_ROLES: UserRole[] = [
  'super_admin',
  'system_support',
  'admin',
  'support_tech',
  'sales_marketing',
  'accounts',
  'sales',
  'marketing',
  'city_head',
  'logistics',
  'accounting',
];

function normalizeRole(role: string | null | undefined): UserRole {
  if (!role || typeof role !== 'string') return 'admin';
  const normalized = role.trim().toLowerCase().replace(/\s+/g, '_');
  if ((KNOWN_ROLES as string[]).includes(normalized)) return normalized as UserRole;
  return 'admin';
}

function toUser(authUser: AuthUser): User {
  return {
    id: authUser.id,
    email: authUser.email,
    name: authUser.name,
    role: normalizeRole(authUser.role),
    city: null,
    phone: null,
    status: 'active',
    created_at: new Date().toISOString(),
    last_login: null,
    updated_at: new Date().toISOString(),
    organizationId: authUser.organizationId,
    organizationName: authUser.organizationName,
    mustChangePassword: authUser.mustChangePassword ?? false,
  } as User & { mustChangePassword?: boolean };
}

interface AuthContextType {
  user: User | null;
  mustChangePassword: boolean;
  login: (email: string, password: string) => Promise<{ mustChangePassword: boolean }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
  isSuperAdmin: boolean;
  isOrgAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    const { data, error } = await getMe();
    if (error || !data) {
      setUser(null);
      setMustChangePassword(false);
      return;
    }
    const u = toUser(data);
    setUser(u);
    setMustChangePassword(Boolean(data.mustChangePassword));
  };

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await apiLogin(email, password);
    if (error) throw new Error(error.message);
    if (!data?.user) throw new Error('Login failed');

    const { data: me, error: meError } = await getMe();
    if (meError || !me) {
      throw new Error(meError?.message ?? 'Session could not be established. Ensure login returns a token field.');
    }

    const u = toUser(me);
    setUser(u);
    setMustChangePassword(Boolean(me.mustChangePassword ?? data.mustChangePassword));
    return { mustChangePassword: Boolean(me.mustChangePassword ?? data.mustChangePassword) };
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
    setMustChangePassword(false);
  };

  const hasRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const isSuperAdmin = user?.role === 'super_admin';
  const isOrgAdmin = user?.role === 'admin' && !!user?.organizationId;

  return (
    <AuthContext.Provider
      value={{
        user,
        mustChangePassword,
        login,
        logout,
        refreshUser,
        hasRole,
        isSuperAdmin,
        isOrgAdmin,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
