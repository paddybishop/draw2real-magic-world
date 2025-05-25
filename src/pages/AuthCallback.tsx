import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      console.log('AuthCallback: Checking sessionStorage for returnTo...', sessionStorage.getItem('returnTo'));
      // Parse the URL for OAuth response (handles both hash and search params)
      // Supabase client handles the session parsing from the redirect URL
      const { data } = await supabase.auth.getSession();

      if (data?.session) {
        // User is signed in
        console.log('AuthCallback: User signed in', data.session.user);

        // Check for a stored returnTo path in sessionStorage
        const returnTo = sessionStorage.getItem('returnTo');
        sessionStorage.removeItem('returnTo'); // Clean up

        if (returnTo) {
          console.log('AuthCallback: Redirecting to stored path:', returnTo);
          console.log('AuthCallback: Taking returnTo path.');
          navigate(returnTo, { replace: true });
        } else {
          // Default redirect if no returnTo path is found
          console.log('AuthCallback: No stored path, redirecting to welcome.');
          console.log('AuthCallback: Taking default path.');
          navigate('/', { replace: true });
        }
      } else {
        // Handle errors or no session found after callback
        console.error('AuthCallback: No session found or error after callback.');
        // Optionally show an error message or redirect to a login/error page
        navigate('/', { replace: true }); // Redirect to home or an error page
      }
    };

    handleCallback();
  }, [navigate]);

  // You might render a loading spinner or message here while handling the callback
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <p>Loading...</p>
    </div>
  );
};

export default AuthCallback; 