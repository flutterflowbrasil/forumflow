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
      console.log('[AuthProvider] ==== INICIANDO ====');
      setLoading(true);
      
      safetyTimeout = setTimeout(() => {
        if (isMounted) {
          console.warn('[AuthProvider] TIMEOUT! Liberando tela');
          setLoading(false);
        }
      }, 5000);
      
      try {
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (sessionError) {
          console.error('[AuthProvider] Erro:', sessionError);
          throw sessionError;
        }
        
        console.log('[AuthProvider] Sessão:', currentSession?.user.email || 'Nenhuma');
        setSession(currentSession);
        
        if (currentSession?.user) {
          console.log('[AuthProvider] Buscando perfil...');
          
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .single();
          
          if (!isMounted) return;
          
          if (profileError) {
            console.error('[AuthProvider] Erro no perfil:', profileError);
          } else if (profileData) {
            console.log('[AuthProvider] Perfil OK:', {
              email: profileData.email,
              role: profileData.role,
              name: profileData.display_name
            });
            setProfile(profileData);
          }
        } else {
          setProfile(null);
        }
        
        clearTimeout(safetyTimeout);
      } catch (error) {
        console.error('[AuthProvider] ERRO:', error);
        clearTimeout(safetyTimeout);
      } finally {
        if (isMounted) {
          console.log('[AuthProvider] ==== FINALIZADO ====');
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listener de mudanças - SEM recarregar perfil para evitar conflitos
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!isMounted) return;
        
        console.log('[AuthProvider] Evento:', event);
        
        // SÓ atualizar session, NÃO mexer no perfil durante eventos automáticos
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setProfile(null);
        } else if (event === 'SIGNED_IN' && newSession) {
          setSession(newSession);
          // Recarregar perfil APENAS no SIGNED_IN real (login manual)
          if (newSession.user) {
            supabase
              .from('profiles')
              .select('*')
              .eq('id', newSession.user.id)
              .single()
              .then(({ data }) => {
                if (isMounted && data) {
                  console.log('[AuthProvider] Perfil atualizado:', data.role);
                  setProfile(data);
                }
              });
          }
        }
        // Para outros eventos (TOKEN_REFRESHED, etc), NÃO fazer nada
      }
    );

    return () => {
      console.log('[AuthProvider] Cleanup');
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