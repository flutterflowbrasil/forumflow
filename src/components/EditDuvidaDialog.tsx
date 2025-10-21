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
import { Pencil } from "lucide-react";
import { Duvida } from "./DuvidaCard";
import MarkdownToolbar from "./MarkdownToolbar";
import { useDuvidas } from "@/providers/DuvidaProvider";

interface Category {
  id: string;
  name: string;
}

interface EditDuvidaDialogProps {
  duvida: Duvida;
  onSuccess?: () => void;
}

const EditDuvidaDialog: React.FC<EditDuvidaDialogProps> = ({ duvida, onSuccess }) => {
  const { refreshDuvidas } = useDuvidas();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(duvida.title);
  const [body, setBody] = useState(duvida.body);
  const [categoryId, setCategoryId] = useState(duvida.category_id);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(duvida.image_url || null);
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
      setTitle(duvida.title);
      setBody(duvida.body);
      setCategoryId(duvida.category_id);
      setImageFile(null);
      setImagePreview(duvida.image_url || null);
    }
  }, [open, duvida]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim() || !categoryId) {
      toast.error("Por favor, preencha a categoria, o título e a descrição.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Atualizando sua dúvida...");

    try {
      let newImageUrl = duvida.image_url;

      if (imageFile) {
        if (duvida.image_url) {
          const oldFilePath = duvida.image_url.split('/thread-images/')[1];
          if (oldFilePath) {
            await supabase.storage.from('thread-images').remove([oldFilePath]);
          }
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado.");
        
        const filePath = `${user.id}/${Date.now()}_${imageFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("thread-images")
          .upload(filePath, imageFile);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("thread-images")
          .getPublicUrl(filePath);
        newImageUrl = publicUrl;
      }

      const { error } = await supabase
        .from("duvidas")
        .update({
          title,
          body,
          category_id: categoryId,
          image_url: newImageUrl,
        })
        .eq("id", duvida.id);

      if (error) throw error;

      toast.success("Dúvida atualizada com sucesso!", { id: toastId });
      refreshDuvidas();
      if (onSuccess) onSuccess();
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Ocorreu um erro.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Dúvida</DialogTitle>
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
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="picture" className="text-right pt-2">
              Imagem
            </Label>
            <div className="col-span-3">
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="w-full h-auto rounded-md mb-2 object-cover max-h-40" />
              )}
              <Input id="picture" type="file" onChange={handleFileChange} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit" onClick={handleSubmit} disabled={loading || !title || !body || !categoryId}>
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditDuvidaDialog;