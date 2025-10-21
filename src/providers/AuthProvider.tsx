import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

interface Profile {
  id: string;
  role: 'admin' | 'user';
  [key: string]: any;
}

type AuthContextType = {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  profile: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let safetyTimeout: NodeJS.Timeout;
    
    const initAuth = async () => {
      setLoading(true);
      
      safetyTimeout = setTimeout(() => {
        if (isMounted) {
          setLoading(false);
        }
      }, 5000);
      
      try {
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (sessionError) {
          throw sessionError;
        }
        
        setSession(currentSession);
        
        if (currentSession?.user) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .single();
          
          if (!isMounted) return;
          
          if (!profileError && profileData) {
            setProfile(profileData);
          }
        } else {
          setProfile(null);
        }
        
        clearTimeout(safetyTimeout);
      } catch (error) {
        clearTimeout(safetyTimeout);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listener de mudanças - SEM recarregar perfil para evitar conflitos
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!isMounted) return;
        
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setProfile(null);
        } else if (event === 'SIGNED_IN' && newSession) {
          setSession(newSession);
          if (newSession.user) {
            supabase
              .from('profiles')
              .select('*')
              .eq('id', newSession.user.id)
              .single()
              .then(({ data }) => {
                if (isMounted && data) {
                  setProfile(data);
                }
              });
          }
        }
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};