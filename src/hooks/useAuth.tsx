
import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the shape of our AuthContext
export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  user: any | null;
  signInWithGoogle?: () => Promise<void>; // Add optional signInWithGoogle method
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  user: null,
  signInWithGoogle: async () => {}, // Add default implementation
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component to wrap the app and provide auth context
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      try {
        // This would normally be a call to your auth service
        const savedUser = localStorage.getItem('user');
        
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // This would be a real authentication call
      const mockUser = { id: '1', email, name: 'Test User' };
      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  // Add signInWithGoogle method
  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      // Mock Google auth for now
      const mockGoogleUser = { id: '2', email: 'google-user@example.com', name: 'Google User' };
      localStorage.setItem('user', JSON.stringify(mockGoogleUser));
      setUser(mockGoogleUser);
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    user,
    signInWithGoogle, // Add the method to the context value
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
