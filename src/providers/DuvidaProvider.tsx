import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Duvida } from '@/components/DuvidaCard';
import toast from 'react-hot-toast';

type DuvidaContextType = {
  duvidas: Duvida[];
  loading: boolean;
  setSearchTerm: (term: string) => void;
  refreshDuvidas: () => void;
};

const DuvidaContext = createContext<DuvidaContextType | undefined>(undefined);

export const DuvidaProvider = ({ children }: { children: React.ReactNode }) => {
  const [duvidas, setDuvidas] = useState<Duvida[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchDuvidas = useCallback(async () => {
    let isMounted = true;
    setLoading(true);
    
    // Timeout de segurança
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('[DuvidaProvider] Timeout - liberando tela');
        setLoading(false);
      }
    }, 8000);
    
    try {
      const controller = new AbortController();
      const abortTimeout = setTimeout(() => controller.abort(), 7000);
      
      let query = supabase
        .from('duvidas')
        .select(`
          *,
          category:categories(name),
          author:profiles(display_name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .abortSignal(controller.signal);

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,body.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      
      clearTimeout(timeoutId);
      clearTimeout(abortTimeout);

      if (!isMounted) return;

      if (error) {
        if (error.message.includes('abort')) {
          console.warn('Request cancelada por timeout');
          return;
        }
        console.error("Erro ao buscar dúvidas:", error);
        toast.error('Erro: ' + error.message, { duration: 3000 });
        setDuvidas([]);
      } else if (!data || data.length === 0) {
        setDuvidas([]);
      } else {
        const formattedData = (data || []).map((duvida: any) => ({
          id: duvida.id,
          title: duvida.title,
          body: duvida.body,
          snippet: duvida.body.substring(0, 150),
          likes: 0,
          comments: 0,
          userHasLiked: false,
          lastActivity: new Date(duvida.last_activity_at || duvida.created_at).toLocaleDateString(),
          author: {
            name: duvida.author?.display_name || 'Usuário Desconhecido',
            avatarUrl: duvida.author?.avatar_url || ''
          },
          author_id: duvida.author_id,
          tags: [],
          image_url: duvida.image_url,
          category_id: duvida.category_id,
          category_name: duvida.category?.name || '',
          is_resolved: duvida.is_resolved || false,
          is_hidden: duvida.is_hidden || false
        }));
        
        const visibleDuvidas = formattedData.filter(d => !d.is_hidden);
        setDuvidas(visibleDuvidas);
      }
    } catch (err: any) {
        clearTimeout(timeoutId);
        
        if (!isMounted) return;
        
        if (err.name === 'AbortError' || err.message?.includes('abort')) {
          console.warn('Request cancelada');
          return;
        }
        
        console.error("Erro ao carregar dúvidas:", err);
        setDuvidas([]);
    } finally {
        if (isMounted) {
          setLoading(false);
        }
    }
    
    return () => {
      isMounted = false;
    };
  }, [searchTerm]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      fetchDuvidas();
    }, 300);

    return () => clearTimeout(timerId);
  }, [fetchDuvidas, refreshTrigger]);

  const refreshDuvidas = () => {
    setRefreshTrigger(c => c + 1);
  };

  return (
    <DuvidaContext.Provider value={{ duvidas, loading, setSearchTerm, refreshDuvidas }}>
      {children}
    </DuvidaContext.Provider>
  );
};

export const useDuvidas = () => {
  const context = useContext(DuvidaContext);
  if (context === undefined) {
    throw new Error('useDuvidas must be used within a DuvidaProvider');
  }
  return context;
};