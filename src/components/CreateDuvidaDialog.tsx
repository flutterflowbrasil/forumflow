import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import toast from "react-hot-toast";
import { PlusCircle } from "lucide-react";
import CreateCategoryDialog from "./CreateCategoryDialog";
import { useAuth } from "@/providers/AuthProvider";
import MarkdownToolbar from "./MarkdownToolbar";
import { useDuvidas } from "@/providers/DuvidaProvider";

interface Category {
  id: string;
  name: string;
}

interface CreateDuvidaDialogProps {
  compact?: boolean;
}

const CreateDuvidaDialog = ({ compact = false }: CreateDuvidaDialogProps) => {
  const { profile } = useAuth();
  const { refreshDuvidas } = useDuvidas();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("id, name");
    if (data) setCategories(data);
  };

  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim() || !categoryId) {
        toast.error("Por favor, preencha a categoria, o título e a descrição.");
        return;
    }

    setLoading(true);
    const toastId = toast.loading("Criando sua dúvida...");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Você precisa estar logado para criar uma dúvida.");
      }

      let imageUrl = null;
      if (imageFile) {
        const filePath = `${user.id}/${Date.now()}_${imageFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("thread-images")
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("thread-images")
          .getPublicUrl(filePath);
        imageUrl = publicUrl;
      }

      const { error: insertError } = await supabase.from("duvidas").insert({
        title,
        body,
        author_id: user.id,
        image_url: imageUrl,
        category_id: categoryId,
      });

      if (insertError) throw insertError;

      toast.success("Dúvida criada com sucesso!", { id: toastId });
      refreshDuvidas();
      setOpen(false);
      setTitle("");
      setBody("");
      setCategoryId("");
      setImageFile(null);
    } catch (error: any) {
      toast.error(error.message || "Ocorreu um erro.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={compact ? "w-auto px-3 text-sm" : "w-full"}>
          <PlusCircle className="h-4 w-4" />
          {!compact && <span className="ml-2">Tirar Dúvidas</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
        <DialogHeader>
          <DialogTitle>Qual a sua dúvida?</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Categoria
            </Label>
            <div className="col-span-3 flex items-center">
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {profile?.role === 'admin' && <CreateCategoryDialog onCategoryCreated={fetchCategories} />}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Título
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="Ex: Como criar um row no supabase?"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="body" className="text-right pt-2">
              Descrição
            </Label>
            <div className="col-span-3">
              <MarkdownToolbar textareaRef={textareaRef} onValueChange={setBody} />
              <Textarea
                ref={textareaRef}
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="min-h-[200px] rounded-t-none focus-visible:ring-offset-0"
                placeholder="Descreva seu problema em detalhes... Você pode usar Markdown."
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="picture" className="text-right">
              Imagem
            </Label>
            <Input id="picture" type="file" onChange={handleFileChange} className="col-span-3" />
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button type="button" variant="secondary" className="w-full sm:w-auto">
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit" onClick={handleSubmit} disabled={loading || !title || !body || !categoryId} className="w-full sm:w-auto">
            {loading ? "Publicando..." : "Publicar Dúvida"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDuvidaDialog;