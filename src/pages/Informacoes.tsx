import { useState, useEffect, useCallback } from "react";
import MainLayout from "@/components/layout/MainLayout";
import DuvidaCard from "@/components/DuvidaCard";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Duvida } from "@/components/DuvidaCard";
import { Info } from "lucide-react";

const Informacoes = () => {
  const [informacoes, setInformacoes] = useState<Duvida[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInformacoes = useCallback(async () => {
    setLoading(true);
    
    try {
      // Primeiro, buscar as categorias "Novidades" e "Dicas"
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('id, name')
        .in('name', ['Novidades', 'Dicas']);

      if (catError) {
        console.error("Erro ao buscar categorias:", catError);
        setInformacoes([]);
        setLoading(false);
        return;
      }

      const categoryIds = (categories || []).map(cat => cat.id);

      if (categoryIds.length === 0) {
        setInformacoes([]);
        setLoading(false);
        return;
      }

      // Buscar posts dessas categorias
      const { data, error } = await supabase
        .from('duvidas')
        .select(`
          *,
          category:categories(name),
          author:profiles(display_name, avatar_url, role)
        `)
        .in('category_id', categoryIds)
        .eq('is_hidden', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Erro ao buscar informações:", error);
        setInformacoes([]);
        return;
      }

      // Filtrar apenas posts de admins
      const adminPosts = (data || []).filter((post: any) => 
        post.author?.role === 'admin'
      );

      const formattedData = adminPosts.map((duvida: any) => ({
        id: duvida.id,
        title: duvida.title,
        body: duvida.body,
        snippet: duvida.body.substring(0, 150),
        likes: 0,
        comments: 0,
        userHasLiked: false,
        lastActivity: new Date(duvida.last_activity_at || duvida.created_at).toLocaleDateString(),
        author: {
          name: duvida.author?.display_name || 'Administrador',
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

      setInformacoes(formattedData);
    } catch (err) {
      console.error("Erro ao carregar informações:", err);
      setInformacoes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInformacoes();
  }, [fetchInformacoes]);

  return (
    <MainLayout>
      <div className="sticky top-16 z-30 bg-background pb-4 -mt-4 pt-4 -mx-4 px-4 lg:-mx-6 lg:px-6 border-b mb-4">
        <div className="flex items-center gap-3">
          <Info className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-left">Informações</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Novidades e dicas publicadas pela equipe
            </p>
          </div>
        </div>
      </div>
      
      <div>
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="mb-4 p-6 border rounded-lg">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-1/2 mb-6" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))
        ) : informacoes.length > 0 ? (
          informacoes.map((info) => (
            <DuvidaCard key={info.id} duvida={info} hideStatusBadge />
          ))
        ) : (
          <div className="text-center py-12">
            <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhuma informação publicada ainda.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Informacoes;
