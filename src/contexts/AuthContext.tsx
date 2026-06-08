import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { User, UserRole } from '../types';

const KNOWN_ROLES: UserRole[] = ['super_admin', 'admin', 'support_tech', 'sales_marketing', 'accounts', 'sales', 'marketing', 'city_head', 'logistics', 'accounting'];

function normalizeRole(role: string | null | undefined): UserRole {
  if (!role || typeof role !== 'string') return 'admin';
  const normalized = role.trim().toLowerCase().replace(/\s+/g, '_');
  if ((KNOWN_ROLES as string[]).includes(normalized)) return normalized as UserRole;
  const map: Record<string, UserRole> = {
    'super_admin': 'super_admin',
    'superadmin': 'super_admin',
    'super admin': 'super_admin',
    'admin': 'admin',
    'city admin': 'admin',
    'org admin': 'admin',
  };
  return map[normalized] ?? 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
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
  const [isLoading, setIsLoading] = useState(true);
  const isInitialLoadRef = useRef(true);
  const userRef = useRef<User | null>(null);
  userRef.current = user;

  const PROFILE_FETCH_TIMEOUT_MS = 4000;

  const fetchUserProfile = async (email: string, userId?: string): Promise<User | null> => {
    const buildUser = (profile: any): User => {
      const org = profile?.organizations;
      const role = normalizeRole(profile?.role);
      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role,
        city: profile.city,
        phone: profile.phone,
        status: (profile.status as 'active' | 'inactive') || 'active',
        created_at: profile.created_at,
        last_login: profile.last_login,
        updated_at: profile.updated_at,
        organizationId: profile.organization_id ?? null,
        organizationName: org?.name ?? null
      } as User;
    };

    const fetchPromise = (async (): Promise<User | null> => {
      try {
        console.log(`[Auth] Fetching profile for: ${email}`);
        let { data: profile, error } = await supabase
          .from('users')
          .select('*, organizations!users_organization_id_fkey ( name )')
          .eq('email', email)
          .single();

        if (error && userId) {
          console.warn('[Auth] Profile by email failed, retrying by id:', error.message);
          const byId = await supabase
            .from('users')
            .select('*, organizations!users_organization_id_fkey ( name )')
            .eq('id', userId)
            .single();
          if (!byId.error && byId.data) {
            profile = byId.data;
            error = null;
          }
        }

        if (error || !profile) {
          if (error) console.warn('[Auth] Profile error:', error.message, error.code);
          return null;
        }
        console.log('[Auth] Profile loaded for:', email);
        return buildUser(profile);
      } catch (err: any) {
        console.warn('[Auth] Profile fetch failed:', err?.message ?? err);
        return null;
      }
    })();

    const timeoutPromise = new Promise<User | null>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), PROFILE_FETCH_TIMEOUT_MS)
    );

    try {
      return await Promise.race([fetchPromise, timeoutPromise]);
    } catch (err: any) {
      if (err?.message === 'timeout') {
        console.warn('[Auth] Profile fetch timed out, using fallback');
      }
      return null;
    }
  };

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      if (!cancelled) setIsLoading(false);
    }, 8000);

    // Run initial session check so after full-page redirect we have user and stop loading quickly
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.email!, session.user.id);
        if (cancelled) return;
        if (profile) {
          setUser(profile);
        } else {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: (session.user.user_metadata?.name as string) || session.user.email!.split('@')[0],
            role: 'admin',
            city: null,
            phone: null,
            status: 'active',
            created_at: session.user.created_at ?? new Date().toISOString(),
            last_login: null,
            updated_at: new Date().toISOString(),
            organizationId: null,
            organizationName: null
          } as User);
        }
      }
      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
        setIsLoading(false);
        clearTimeout(timer);
      }
    };
    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (cancelled) return;
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.email!, session.user.id);
        if (cancelled) return;
        if (profile) {
          setUser(profile);
        } else {
          const current = userRef.current;
          if (current?.id === session.user.id) {
            return;
          }
          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: (session.user.user_metadata?.name as string) || session.user.email!.split('@')[0],
            role: 'admin',
            city: null,
            phone: null,
            status: 'active',
            created_at: session.user.created_at ?? new Date().toISOString(),
            last_login: null,
            updated_at: new Date().toISOString(),
            organizationId: null,
            organizationName: null
          } as User);
        }
      } else {
        setUser(null);
      }
      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
        setIsLoading(false);
        clearTimeout(timer);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    if (!data?.user) return false;

    let profile = await fetchUserProfile(data.user.email!, data.user.id);
    if (!profile) {
      // Fallback: build minimal user from auth so dashboard still shows if public.users read fails (e.g. RLS)
      profile = {
        id: data.user.id,
        email: data.user.email!,
        name: (data.user.user_metadata?.name as string) || data.user.email!.split('@')[0],
        role: 'admin',
        city: null,
        phone: null,
        status: 'active',
        created_at: data.user.created_at ?? new Date().toISOString(),
        last_login: null,
        updated_at: new Date().toISOString(),
        organizationId: null,
        organizationName: null
      } as User;
      console.warn('[Auth] Using fallback user from auth (public.users profile not found)');
    }
    setUser(profile);

    // Update last_login in background; don't block
    supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('email', email)
      .then(() => {})
      .catch(() => {});

    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const hasRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const isSuperAdmin = user?.role === 'super_admin';
  const isOrgAdmin = user?.role === 'admin' && !!user?.organizationId;

  return (
    <AuthContext.Provider value={{ user, login, logout, hasRole, isSuperAdmin, isOrgAdmin, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
