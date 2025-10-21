import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const ManageDuvidas = () => {
  const [duvidas, setDuvidas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDuvidas = async () => {
    setLoading(true);
    
    try {
      // Query direta ao invés de RPC
      const { data, error } = await supabase
        .from('duvidas')
        .select(`
          *,
          category:categories(name),
          author:profiles(display_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar dúvidas:', error);
        toast.error("Falha ao buscar dúvidas: " + error.message);
        setDuvidas([]);
      } else if (data) {
        const formattedData = data.map(d => ({
          ...d,
          author_name: d.author?.display_name || 'Desconhecido',
          category_name: d.category?.name || 'Sem categoria'
        }));
        setDuvidas(formattedData);
      }
    } catch (err: any) {
      console.error('Erro ao carregar dúvidas:', err);
      toast.error("Erro ao carregar dúvidas.");
      setDuvidas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDuvidas();
  }, []);

  const toggleVisibility = async (id: string, currentState: boolean) => {
    const { error } = await supabase
      .from("duvidas")
      .update({ is_hidden: !currentState })
      .eq("id", id);

    if (error) {
      toast.error("Falha ao atualizar a visibilidade.");
    } else {
      toast.success("Visibilidade atualizada.");
      fetchDuvidas();
    }
  };

  const toggleResolved = async (id: string, currentState: boolean) => {
    const { error } = await supabase
      .from("duvidas")
      .update({ is_resolved: !currentState })
      .eq("id", id);

    if (error) {
      toast.error("Falha ao atualizar o status.");
    } else {
      toast.success("Status da dúvida atualizado.");
      fetchDuvidas();
    }
  };

  const deleteDuvida = async (id: string) => {
    const { error } = await supabase.from("duvidas").delete().eq("id", id);
    if (error) {
      toast.error("Falha ao deletar a dúvida.");
    } else {
      toast.success("Dúvida deletada com sucesso.");
      fetchDuvidas();
    }
  };

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-6">Gerenciar Dúvidas</h1>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead className="text-center">Visibilidade</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {duvidas.map((duvida) => (
                <TableRow key={duvida.id}>
                  <TableCell className="font-medium">{duvida.title}</TableCell>
                  <TableCell>{duvida.author_name}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <Switch
                        id={`visibility-switch-${duvida.id}`}
                        checked={!duvida.is_hidden}
                        onCheckedChange={() => toggleVisibility(duvida.id, duvida.is_hidden)}
                      />
                      <Label htmlFor={`visibility-switch-${duvida.id}`} className="text-xs text-muted-foreground">
                        {duvida.is_hidden ? "Oculto" : "Visível"}
                      </Label>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                     <div className="flex flex-col items-center gap-1">
                        <Switch
                          id={`resolved-switch-${duvida.id}`}
                          checked={duvida.is_resolved}
                          onCheckedChange={() => toggleResolved(duvida.id, duvida.is_resolved)}
                        />
                        <Badge variant={duvida.is_resolved ? "default" : "destructive"} className={`text-xs ${duvida.is_resolved ? "bg-green-500" : ""}`}>
                          {duvida.is_resolved ? "Resolvida" : "Em Aberto"}
                        </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Essa ação não pode ser desfeita. Isso irá deletar permanentemente a dúvida e seus dados associados.
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
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </MainLayout>
  );
};

export default ManageDuvidas;