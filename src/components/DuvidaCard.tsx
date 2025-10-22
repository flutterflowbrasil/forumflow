import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ThumbsUp, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import toast from "react-hot-toast";
import EditDuvidaDialog from "./EditDuvidaDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { useDuvidas } from "@/providers/DuvidaProvider";
import { useIsMobile } from "@/hooks/use-mobile";

export interface Duvida {
  id: string;
  title: string;
  body: string;
  snippet: string;
  likes: number;
  comments: number;
  userHasLiked: boolean;
  lastActivity: string;
  author: {
    name: string;
    avatarUrl: string;
  };
  author_id: string;
  tags: string[];
  image_url?: string;
  category_id: string;
  category_name?: string;
  is_resolved?: boolean;
}

interface DuvidaCardProps {
  duvida: Duvida;
  hideStatusBadge?: boolean;
}

const DuvidaCard: React.FC<DuvidaCardProps> = ({ duvida, hideStatusBadge = false }) => {
  const { session, profile } = useAuth();
  const { refreshDuvidas } = useDuvidas();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [likeCount, setLikeCount] = useState(duvida.likes);
  const [hasLiked, setHasLiked] = useState(duvida.userHasLiked);
  const [isLiking, setIsLiking] = useState(false);

  const isAuthor = session?.user.id === duvida.author_id;
  const isAdmin = profile?.role === 'admin';
  const canEdit = isAuthor || isAdmin;

  const handleLike = async () => {
    if (!session || isLiking) return;

    setIsLiking(true);
    const user_id = session.user.id;
    const duvida_id = duvida.id;

    setHasLiked(!hasLiked);
    setLikeCount(hasLiked ? likeCount - 1 : likeCount + 1);

    if (hasLiked) {
      const { error } = await supabase
        .from("duvidas_likes")
        .delete()
        .match({ user_id, duvida_id });
      
      if (error) {
        toast.error("Erro ao descurtir.");
        setHasLiked(true);
        setLikeCount(likeCount + 1);
      }
    } else {
      const { error } = await supabase
        .from("duvidas_likes")
        .insert({ user_id, duvida_id });

      if (error) {
        toast.error("Erro ao curtir.");
        setHasLiked(false);
        setLikeCount(likeCount - 1);
      }
    }
    setIsLiking(false);
  };

  const handleDeleteDuvida = async () => {
    const { error } = await supabase.from('duvidas').delete().eq('id', duvida.id);
    if (error) {
      toast.error('Falha ao deletar o post.');
    } else {
      toast.success('Post deletado.');
      refreshDuvidas();
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Não navegar se clicar em botões, links ou elementos interativos
    const target = e.target as HTMLElement;
    if (
      target.closest('button') || 
      target.closest('a') || 
      target.closest('[role="button"]')
    ) {
      return;
    }
    
    if (isMobile) {
      navigate(`/duvida/${duvida.id}`);
    }
  };

  return (
    <div 
      className={`mb-4 p-6 border rounded-lg bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow ${
        isMobile ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''
      }`}
      onClick={handleCardClick}
    >
      <div className="flex items-start space-x-4">
        <Avatar>
          <AvatarImage src={duvida.author?.avatarUrl} alt={duvida.author?.name} />
          <AvatarFallback>{duvida.author?.name?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                {duvida.category_name && <Badge variant="outline">{duvida.category_name}</Badge>}
                {!hideStatusBadge && (
                  duvida.is_resolved ? (
                    <Badge className="bg-green-600 hover:bg-green-700 text-white">Resolvida</Badge>
                  ) : (
                    <Badge variant="destructive">Em Aberto</Badge>
                  )
                )}
              </div>
              <h2 className="text-xl font-semibold mt-1">
                <Link to={`/duvida/${duvida.id}`} className="hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded">
                  {duvida.title}
                </Link>
              </h2>
              <p className="text-sm text-muted-foreground">
                por {duvida.author?.name || 'Usuário Desconhecido'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-shrink-0">
                <span>{duvida.lastActivity}</span>
                {canEdit && <EditDuvidaDialog duvida={duvida} />}
                {isAdmin && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Deletar este post?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteDuvida}>
                          Deletar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
            </div>
          </div>
          <p className="mt-2 text-muted-foreground">{duvida.snippet}...</p>
          {duvida.image_url && (
            <div className="mt-4">
              <img 
                src={duvida.image_url} 
                alt="Duvida image" 
                className="max-h-80 rounded-lg object-cover"
              />
            </div>
          )}
          <div className="mt-4 flex justify-between items-center">
            <div className="flex space-x-2">
              {duvida.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center transition-colors ${hasLiked ? 'text-blue-500' : 'hover:text-blue-500'}`}
              >
                <ThumbsUp className={`h-4 w-4 mr-1 ${hasLiked ? 'fill-current' : ''}`} /> {likeCount}
              </button>
              <Link to={`/duvida/${duvida.id}#comments`} className="flex items-center hover:text-blue-500 transition-colors">
                <MessageSquare className="h-4 w-4 mr-1" /> {duvida.comments}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DuvidaCard;