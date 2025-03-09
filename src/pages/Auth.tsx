
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex flex-col min-h-screen bg-loro-white">
      {/* Header */}
      <header className="w-full py-6 border-b border-loro-sand/30">
        <div className="container max-w-screen-xl mx-auto px-6">
          <div className="flex justify-center">
            <img 
              src="/lovable-uploads/93989ed3-8a9e-4d33-9bd7-58c151ab1911.png" 
              alt="GADAIT Logo" 
              className="h-12" 
            />
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center">
            <h2 className="font-times text-2xl text-loro-navy mb-3">Welcome</h2>
            <p className="font-optima text-loro-text/70 text-sm">
              {isLogin 
                ? 'Please enter your login details' 
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
