import { useEffect, useState, useCallback } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
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
import EditDuvidaDialog from "@/components/EditDuvidaDialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const MinhasDuvidas = () => {
  const { session, loading: authLoading } = useAuth();
  const [duvidas, setDuvidas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDuvidas = useCallback(async () => {
    if (!session?.user) {
      if (!authLoading) setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("duvidas")
      .select(`id, title, created_at, is_resolved, body, category_id, image_url`)
      .eq('author_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Falha ao buscar suas dúvidas.");
      console.error(error);
    } else {
      setDuvidas(data);
    }
    setLoading(false);
  }, [session, authLoading]);

  useEffect(() => {
    if (!authLoading) {
      fetchDuvidas();
    }
  }, [authLoading, fetchDuvidas]);

  const deleteDuvida = async (id: string) => {
    const { error } = await supabase.from("duvidas").delete().eq("id", id);
    if (error) {
      toast.error("Falha ao deletar a dúvida.");
    } else {
      toast.success("Dúvida deletada com sucesso.");
      fetchDuvidas();
    }
  };

  const isLoading = authLoading || loading;

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-6">Minhas Dúvidas</h1>
      {isLoading ? (
        <div className="border rounded-lg p-4 space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {duvidas.length > 0 ? (
                duvidas.map((duvida) => (
                  <TableRow key={duvida.id}>
                    <TableCell className="font-medium">{duvida.title}</TableCell>
                    <TableCell>
                      <Badge variant={duvida.is_resolved ? "default" : "destructive"} className={duvida.is_resolved ? "bg-green-500" : ""}>
                        {duvida.is_resolved ? "Resolvida" : "Em Aberto"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(duvida.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <EditDuvidaDialog duvida={duvida} onSuccess={fetchDuvidas} />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Essa ação não pode ser desfeita. Isso irá deletar permanentemente a dúvida.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteDuvida(duvida.id)}>Deletar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Você ainda não criou nenhuma dúvida.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </MainLayout>
  );
};

export default MinhasDuvidas;