import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { UserProfile, UserRole } from '../types';
import { supabaseAuth, supabaseProfile } from '../services/supabaseService';
import { initialProfile } from '../data/initialData';

interface AuthContextType {
  user: any | null;
  session: any | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, pass: string, name: string, role?: UserRole) => Promise<{ success: boolean; error?: string; user?: any }>;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  signOut: () => Promise<void>;
  updateProfileState: (updated: Partial<UserProfile>) => void;
  demoLogin: (role?: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_SESSION_KEY = 'jeevancare_demo_authenticated';
const DEMO_USER_KEY = 'jeevancare_demo_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<any | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        setIsLoading(true);
        // Check Supabase session first
        const currentSession = await supabaseAuth.getCurrentSession();
        if (currentSession?.user) {
          if (isMounted) {
            setSession(currentSession);
            setUser(currentSession.user);
            setIsAuthenticated(true);
            const userProf = await supabaseProfile.fetchProfile(currentSession.user.id);
            if (userProf) {
              setProfile(userProf);
            } else {
              setProfile({
                ...initialProfile,
                id: currentSession.user.id,
                email: currentSession.user.email || initialProfile.email,
                name: currentSession.user.user_metadata?.name || 'Jevan Care User',
              });
            }
          }
        } else {
          // Check local persistent demo authentication session
          const isDemoAuth = localStorage.getItem(DEMO_SESSION_KEY) === 'true';
          const savedDemoUser = localStorage.getItem(DEMO_USER_KEY);
          if (isDemoAuth) {
            const parsedUser = savedDemoUser ? JSON.parse(savedDemoUser) : initialProfile;
            if (isMounted) {
              setUser({ id: parsedUser.id, email: parsedUser.email, user_metadata: { name: parsedUser.name } });
              setProfile(parsedUser);
              setIsAuthenticated(true);
            }
          } else {
            if (isMounted) {
              setIsAuthenticated(false);
              setUser(null);
              setSession(null);
            }
          }
        }
      } catch (err: any) {
        console.warn('Auth initialization error:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    // Subscribe to Supabase Auth state changes
    const subscription = supabaseAuth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return;

      if (newSession?.user) {
        setSession(newSession);
        setUser(newSession.user);
        setIsAuthenticated(true);
        const userProf = await supabaseProfile.fetchProfile(newSession.user.id);
        if (userProf) {
          setProfile(userProf);
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
        localStorage.removeItem(DEMO_SESSION_KEY);
        localStorage.removeItem(DEMO_USER_KEY);
      }
    });

    return () => {
      isMounted = false;
      if (subscription?.unsubscribe) subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, pass: string) => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const res = await supabaseAuth.signIn(email, pass);
      if (res.error) {
        setAuthError(res.error);
        setIsLoading(false);
        return { success: false, error: res.error };
      }

      if (res.user) {
        setUser(res.user);
        setSession(res.session);
        setIsAuthenticated(true);
        const userProf = await supabaseProfile.fetchProfile(res.user.id);
        if (userProf) setProfile(userProf);
      }
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to sign in. Please try again.';
      setAuthError(errorMsg);
      setIsLoading(false);
      return { success: false, error: errorMsg };
    }
  }, []);

  const signUp = useCallback(async (email: string, pass: string, name: string, role: UserRole = 'patient') => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const res = await supabaseAuth.signUp(email, pass, name, role);
      if (res.error) {
        setAuthError(res.error);
        setIsLoading(false);
        return { success: false, error: res.error };
      }

      if (res.user) {
        const newProf: UserProfile = {
          ...initialProfile,
          id: res.user.id,
          name,
          email,
          role,
        };
        setUser(res.user);
        setProfile(newProf);
        setIsAuthenticated(true);
      }
      setIsLoading(false);
      return { success: true, user: res.user };
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to create account.';
      setAuthError(errorMsg);
      setIsLoading(false);
      return { success: false, error: errorMsg };
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setAuthError(null);
    try {
      const res = await supabaseAuth.resetPasswordForEmail(email);
      if (res.error) {
        return { success: false, error: res.error };
      }
      return { success: true, message: res.message || 'Reset instructions sent.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error requesting password reset.' };
    }
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await supabaseAuth.signOut();
    } catch (e) {
      console.warn('Signout error:', e);
    } finally {
      localStorage.removeItem(DEMO_SESSION_KEY);
      localStorage.removeItem(DEMO_USER_KEY);
      setUser(null);
      setSession(null);
      setProfile(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, []);

  const demoLogin = useCallback((role: UserRole = 'patient') => {
    const demoProf: UserProfile = {
      ...initialProfile,
      name: role === 'doctor' ? 'Dr. Vikramaditya Sen' : 'Aarav Sharma',
      email: role === 'doctor' ? 'dr.sen@jeevancare.in' : 'aarav.sharma@health.in',
      role,
    };
    localStorage.setItem(DEMO_SESSION_KEY, 'true');
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoProf));
    setUser({ id: demoProf.id, email: demoProf.email, user_metadata: { name: demoProf.name } });
    setProfile(demoProf);
    setIsAuthenticated(true);
  }, []);

  const updateProfileState = useCallback((updated: Partial<UserProfile>) => {
    setProfile((prev) => {
      if (!prev) return initialProfile;
      const next = { ...prev, ...updated };
      if (localStorage.getItem(DEMO_SESSION_KEY) === 'true') {
        localStorage.setItem(DEMO_USER_KEY, JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      session,
      profile,
      isAuthenticated,
      isLoading,
      authError,
      signIn,
      signUp,
      resetPassword,
      signOut,
      updateProfileState,
      demoLogin,
    }),
    [
      user,
      session,
      profile,
      isAuthenticated,
      isLoading,
      authError,
      signIn,
      signUp,
      resetPassword,
      signOut,
      updateProfileState,
      demoLogin,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
