import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import toast from "react-hot-toast";
import { useAuth } from '@/providers/AuthProvider';
import { Pencil, Trash2 } from 'lucide-react';
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

export interface CommentType {
  id: string;
  body: string;
  created_at: string;
  author_id: string;
  profiles: {
    display_name: string;
    avatar_url: string;
  };
  replies: CommentType[];
}

interface CommentProps {
  comment: CommentType;
  duvidaId: string;
  onReplySuccess: () => void;
}

const Comment: React.FC<CommentProps> = ({ comment, duvidaId, onReplySuccess }) => {
  const { session, profile } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [loadingReply, setLoadingReply] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editedBody, setEditedBody] = useState(comment.body);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const isAuthor = session?.user.id === comment.author_id;
  const isAdmin = profile?.role === 'admin';
  const canEdit = isAuthor || isAdmin;

  const handleReplySubmit = async () => {
    if (!replyBody.trim() || !session) return;

    setLoadingReply(true);
    const { error } = await supabase.from('comments').insert({
      duvida_id: duvidaId,
      author_id: session.user.id,
      body: replyBody,
      parent_comment_id: comment.id,
    });
    setLoadingReply(false);

    if (error) {
      toast.error('Falha ao enviar resposta.');
    } else {
      setReplyBody('');
      setShowReplyForm(false);
      onReplySuccess();
    }
  };

  const handleUpdateComment = async () => {
    if (!editedBody.trim()) return;
    setLoadingEdit(true);
    const { error } = await supabase
      .from('comments')
      .update({ body: editedBody })
      .eq('id', comment.id);
    setLoadingEdit(false);

    if (error) {
      toast.error('Falha ao atualizar comentário.');
    } else {
      toast.success('Comentário atualizado!');
      setIsEditing(false);
      comment.body = editedBody;
      onReplySuccess();
    }
  };

  const handleDeleteComment = async () => {
    const { error } = await supabase.from('comments').delete().eq('id', comment.id);
    if (error) {
      toast.error('Falha ao deletar comentário.');
    } else {
      toast.success('Comentário deletado.');
      onReplySuccess();
    }
  };

  return (
    <div className="flex items-start space-x-4 mt-4">
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.profiles.avatar_url} />
        <AvatarFallback>{comment.profiles.display_name?.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="bg-muted rounded-lg p-3">
          <p className="font-semibold text-sm">{comment.profiles.display_name}</p>
          {isEditing ? (
            <div className="mt-2">
              <Textarea
                value={editedBody}
                onChange={(e) => setEditedBody(e.target.value)}
                className="min-h-[60px]"
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancelar</Button>
                <Button size="sm" onClick={handleUpdateComment} disabled={loadingEdit}>
                  {loadingEdit ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{comment.body}</p>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
          <span>{new Date(comment.created_at).toLocaleDateString()}</span>
          <button onClick={() => setShowReplyForm(!showReplyForm)} className="font-semibold hover:underline">
            Responder
          </button>
          {canEdit && !isEditing && (
            <button onClick={() => setIsEditing(true)} className="font-semibold hover:underline flex items-center gap-1">
              <Pencil className="h-3 w-3" /> Editar
            </button>
          )}
          {isAdmin && (
             <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="font-semibold hover:underline flex items-center gap-1 text-destructive">
                    <Trash2 className="h-3 w-3" /> Deletar
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Deletar este comentário?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteComment}>
                      Deletar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
          )}
        </div>

        {showReplyForm && (
          <div className="mt-2">
            <Textarea
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder={`Responder a ${comment.profiles.display_name}...`}
              className="min-h-[60px]"
            />
            <div className="flex justify-end mt-2">
              <Button size="sm" onClick={handleReplySubmit} disabled={loadingReply}>
                {loadingReply ? 'Enviando...' : 'Enviar'}
              </Button>
            </div>
          </div>
        )}

        <div className="pl-6 border-l-2 border-muted">
          {comment.replies?.map((reply) => (
            <Comment key={reply.id} comment={reply} duvidaId={duvidaId} onReplySuccess={onReplySuccess} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Comment;