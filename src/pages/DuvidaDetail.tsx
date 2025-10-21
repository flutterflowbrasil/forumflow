import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import MainLayout from '@/components/layout/MainLayout';
import { Duvida } from '@/components/DuvidaCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Comment, { CommentType } from '@/components/Comment';
import { useAuth } from '@/providers/AuthProvider';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const DuvidaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuth();
  const [duvida, setDuvida] = useState<Duvida | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [loadingComment, setLoadingComment] = useState(false);

  const fetchComments = async () => {
    if (!id) return;
    const { data, error } = await supabase
      .from('comments')
      .select('*, profiles(display_name, avatar_url)')
      .eq('duvida_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      toast.error('Falha ao carregar comentários.');
      setComments([]);
    } else {
      const commentsById: { [key: string]: CommentType & { replies: CommentType[] } } = {};
      data.forEach(comment => {
        commentsById[comment.id] = { ...comment, replies: [] };
      });

      const nestedComments: CommentType[] = [];
      data.forEach(comment => {
        if (comment.parent_comment_id && commentsById[comment.parent_comment_id]) {
          commentsById[comment.parent_comment_id].replies.push(commentsById[comment.id]);
        } else {
          nestedComments.push(commentsById[comment.id]);
        }
      });
      setComments(nestedComments);
    }
  };

  useEffect(() => {
    const fetchDuvidaAndComments = async () => {
      if (!id) return;
      setLoading(true);

      const { data: duvidaData, error: duvidaError } = await supabase
        .from('duvidas')
        .select(`
          *,
          category:categories(name),
          author:profiles(display_name, avatar_url, role)
        `)
        .eq('id', id)
        .single();

      if (duvidaError || !duvidaData) {
        toast.error('Não foi possível carregar a dúvida.');
        setLoading(false);
        return;
      }
      
      const formattedDuvida = {
          ...duvidaData,
          snippet: duvidaData.body.substring(0, 150),
          likes: 0,
          comments: 0,
          userHasLiked: false,
          lastActivity: new Date(duvidaData.last_activity_at || new Date()).toLocaleDateString(),
          author: {
              name: duvidaData.author.display_name,
              avatarUrl: duvidaData.author.avatar_url,
              role: duvidaData.author.role,
          },
          tags: [],
          category_name: duvidaData.category.name,
      };
      setDuvida(formattedDuvida as Duvida);

      await fetchComments();
      setLoading(false);
    };

    fetchDuvidaAndComments();
  }, [id]);

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !session || !id) return;

    setLoadingComment(true);
    const { error } = await supabase.from('comments').insert({
      duvida_id: id,
      author_id: session.user.id,
      body: newComment,
    });
    setLoadingComment(false);

    if (error) {
      toast.error('Falha ao enviar comentário.');
    } else {
      setNewComment('');
      fetchComments();
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-4">
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/4 mb-8" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6 mb-8" />
          <Skeleton className="h-24 w-full" />
        </div>
      </MainLayout>
    );
  }

  if (!duvida) {
    return (
      <MainLayout>
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold">Dúvida não encontrada</h2>
          <p className="text-muted-foreground">O link pode estar quebrado ou a dúvida foi removida.</p>
          <Button asChild className="mt-4">
            <Link to="/">Voltar para a Home</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  // Verificar se é uma informação de admin (Novidades ou Dicas)
  const isAdminInfo = (duvida.author as any).role === 'admin' && 
                     (duvida.category_name === 'Novidades' || duvida.category_name === 'Dicas');

  return (
    <MainLayout>
      <div>
        <div className="bg-card p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            {duvida.category_name && <Badge variant="outline">{duvida.category_name}</Badge>}
            {!isAdminInfo && (
              duvida.is_resolved ? (
                <Badge className="bg-green-600 hover:bg-green-700 text-white">Resolvida</Badge>
              ) : (
                <Badge variant="destructive">Em Aberto</Badge>
              )
            )}
          </div>
          <h1 className="text-3xl font-bold mt-2 mb-4">{duvida.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6 border-b pb-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={duvida.author.avatarUrl} />
                <AvatarFallback>{duvida.author.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>{duvida.author.name}</span>
            </div>
            <span>•</span>
            <span>{duvida.lastActivity}</span>
          </div>
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{duvida.body}</ReactMarkdown>
          </div>
        </div>

        <div id="comments" className="bg-card p-6 rounded-lg shadow-sm mt-6">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Comentários</h2>
          <div className="space-y-4">
            {comments.map(comment => (
              <Comment key={comment.id} comment={comment} duvidaId={duvida.id} onReplySuccess={fetchComments} />
            ))}
          </div>
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-2">Deixe um comentário</h3>
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escreva seu comentário aqui..."
              className="min-h-[100px]"
            />
            <div className="flex justify-end mt-2">
              <Button onClick={handleCommentSubmit} disabled={loadingComment || !session}>
                {session ? (loadingComment ? 'Enviando...' : 'Enviar Comentário') : 'Faça login para comentar'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DuvidaDetail;