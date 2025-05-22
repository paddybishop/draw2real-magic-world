import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash fragment from the URL
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        
        // Set the session using the access token
        const { error } = await supabase.auth.setSession({
          access_token: params.get('access_token') || '',
          refresh_token: params.get('refresh_token') || ''
        });
        
        if (error) throw error;
        
        // Redirect to the previous page or home
        const returnTo = sessionStorage.getItem('returnTo') || '/';
        sessionStorage.removeItem('returnTo');
        navigate(returnTo);
      } catch (error) {
        console.error('Error handling auth callback:', error);
        navigate('/');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-draw-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-draw-purple mb-4">Completing sign in...</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-draw-pink mx-auto"></div>
      </div>
    </div>
  );
};

export default AuthCallback; 