import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/');
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Handle login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        toast.success('Successfully signed in!');
        navigate('/');
      } else {
        // Handle signup (disabled for now since we're using predetermined accounts)
        toast.error('Signup is currently disabled. Please contact an administrator.');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      // No need for success toast here as the page will redirect
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during Google authentication');
    } finally {
      setGoogleLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex flex-col min-h-screen bg-loro-white">
      {/* Header */}
      <header className="w-full py-6 border-b border-loro-sand/30">
        <div className="container max-w-screen-xl mx-auto px-6">
          <div className="flex justify-center">
            <h1 className="font-futura text-3xl text-loro-navy tracking-wider">GADAIT.</h1>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center">
            <h1 className="font-optima text-2xl text-loro-navy mb-3">Welcome</h1>
            <p className="font-optima text-loro-text/70 text-sm">
              {isLogin 
                ? 'Please enter your login details or sign in with Google' 
                : 'Please contact an administrator to create an account'}
            </p>
          </div>
          
          <form onSubmit={handleAuth} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-optima text-loro-text/80 uppercase tracking-wide">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="border-loro-sand/50 focus-visible:ring-loro-hazel py-6"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-optima text-loro-text/80 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="border-loro-sand/50 focus-visible:ring-loro-hazel pr-10 py-6"
                  />
                  <button 
                    type="button" 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-loro-text/50 hover:text-loro-hazel"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-loro-hazel hover:bg-loro-hazel/90 py-6 uppercase tracking-wider font-optima text-sm"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-loro-sand/30"></div>
              <span className="flex-shrink mx-4 text-loro-text/60 text-sm font-optima">OR</span>
              <div className="flex-grow border-t border-loro-sand/30"></div>
            </div>
            
            <Button 
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 py-6 uppercase tracking-wider font-optima text-sm flex items-center justify-center space-x-2"
              disabled={googleLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                <path fill="none" d="M1 1h22v22H1z" />
              </svg>
              <span>{googleLoading ? 'Signing in...' : 'Sign In with Google'}</span>
            </Button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-loro-sand/30 text-center">
            <p className="text-sm font-times text-loro-text/70 italic">
              Gadait International Business Solutions
            </p>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-4 text-center text-xs text-loro-text/50 font-optima border-t border-loro-sand/30">
        <p>&copy; {new Date().getFullYear()} Gadait International. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Auth;
