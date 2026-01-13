import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);

      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        setIsAuthenticated(false);
        setUser(null);
      } else if (session?.user) {
        // Authenticate the user from the session
        setUser(session.user);
        setIsAuthenticated(true);
        
        // Check if user exists in the users table (for profile data)
        // This is just for logging - we don't block authentication
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (userError) {
          console.warn('Error checking user profile:', userError.message);
        } else if (!userData) {
          console.info('User authenticated but no profile in users table. Create profile in public.users table for additional features.');
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setAuthError(error.message);
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setAuthError(error.message);
        return { error };
      }

      setUser(data.user);
      setIsAuthenticated(true);
      return { data };
    } catch (error) {
      setAuthError(error.message);
      return { error };
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const signUp = async (email, password, userData = {}) => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) {
        setAuthError(error.message);
        return { error };
      }

      return { data };
    } catch (error) {
      setAuthError(error.message);
      return { error };
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoadingAuth(true);
      const { error } = await supabase.auth.signOut();

      if (error) {
        setAuthError(error.message);
        return { error };
      }

      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (error) {
      setAuthError(error.message);
      return { error };
    } finally {
      setIsLoadingAuth(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        authError,
        signIn,
        signUp,
        signOut,
        checkUserAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
