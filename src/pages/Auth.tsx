
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { signInWithGoogle } = useAuth();

  // Check for query parameters that might indicate a password reset or email confirmation
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const type = queryParams.get('type');
    
    // Handle email confirmation or password reset
    if (type === 'recovery' || type === 'signup') {
      setIsSignUp(true);
      toast({
        title: type === 'recovery' ? "Réinitialisation de mot de passe" : "Confirmation d'email",
        description: type === 'recovery' 
          ? "Veuillez définir votre nouveau mot de passe." 
          : "Votre email a été confirmé. Vous pouvez maintenant vous connecter.",
      });
    }
  }, [location, toast]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = isSignUp 
        ? await supabase.auth.signUp({ 
            email, 
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth`
            }
          }) 
        : await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;
      
      if (isSignUp) {
        toast({
          title: "Compte créé avec succès",
          description: "Veuillez vérifier votre email pour confirmer votre compte.",
        });
      } else {
        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur votre espace Immofusion.",
        });
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue avec Google",
        variant: "destructive",
      });
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast({
        title: "Email requis",
        description: "Veuillez entrer votre adresse email pour réinitialiser votre mot de passe.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?type=recovery`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Email envoyé",
        description: "Veuillez vérifier votre email pour les instructions de réinitialisation du mot de passe.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAdminAccount = async () => {
    const adminEmail = "christelle@gadait-international.com";
    const adminPassword = "@Christelle2025";
    
    try {
      setLoading(true);
      
      // Try to sign up the admin user
      const { data, error } = await supabase.auth.signUp({ 
        email: adminEmail, 
        password: adminPassword,
        options: {
          data: {
            role: 'admin'
          }
        }
      });
      
      if (error) {
        // If the user already exists, try to update their password
        if (error.message.includes("User already registered")) {
          toast({
            title: "Utilisateur existe déjà",
            description: "L'utilisateur admin existe déjà. Essayez de vous connecter.",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Compte admin créé",
          description: "Le compte admin a été créé avec succès. Veuillez vous connecter.",
        });
        // Pre-fill the form with admin credentials
        setEmail(adminEmail);
        setPassword(adminPassword);
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création du compte admin",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-loro-white/80 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <span className="font-futura text-3xl tracking-tight text-loro-navy uppercase">GADAIT.</span>
        </div>
      </div>
      
      <Card className="w-full max-w-md shadow-luxury">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-times text-loro-hazel">
            {isSignUp ? 'Créer un compte' : 'Connexion'}
          </CardTitle>
          <CardDescription className="font-times text-chocolate-light">
            {isSignUp 
              ? 'Créez votre compte pour accéder à toutes les fonctionnalités' 
              : 'Connectez-vous pour accéder à votre espace personnel'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="luxury-input"
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="luxury-input"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-loro-hazel text-white hover:bg-loro-hazel/90"
              disabled={loading}
            >
              {loading ? 'Chargement...' : isSignUp ? 'Créer un compte' : 'Se connecter'}
            </Button>
            
            {!isSignUp && (
              <div className="text-center mt-2">
                <Button 
                  variant="link" 
                  onClick={handleResetPassword}
                  className="text-loro-hazel hover:text-loro-hazel/90 text-sm"
                  type="button"
                >
                  Mot de passe oublié ?
                </Button>
              </div>
            )}
          </form>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-loro-sand" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground font-times">
                Ou
              </span>
            </div>
          </div>
          <Button 
            onClick={handleGoogleAuth}
            variant="outline" 
            className="w-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 48 48" className="mr-2">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
            </svg>
            Continuer avec Google
          </Button>
          
          {/* Admin account creation button - only shown in development for ease of use */}
          {import.meta.env.DEV && (
            <div className="mt-4">
              <Button 
                onClick={createAdminAccount}
                variant="outline" 
                className="w-full text-sm"
                disabled={loading}
              >
                Créer compte admin (Christelle)
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-center block">
          <Button 
            variant="link" 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-loro-hazel hover:text-loro-hazel/90"
          >
            {isSignUp ? 'Déjà un compte ? Se connecter' : 'Créer un compte'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
