import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import toast from "react-hot-toast";
import { PlusCircle } from "lucide-react";

interface CreateCategoryDialogProps {
  onCategoryCreated: () => void;
}

const CreateCategoryDialog: React.FC<CreateCategoryDialogProps> = ({ onCategoryCreated }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("O nome da categoria não pode estar vazio.");
      return;
    }
    setLoading(true);
    const toastId = toast.loading("Criando categoria...");

    try {
      const { error } = await supabase.from("categories").insert({ name });

      if (error) {
        throw error;
      }

      toast.success("Categoria criada com sucesso!", { id: toastId });
      onCategoryCreated(); // Refresh the category list in the parent component
      setOpen(false);
      setName("");
    } catch (error: any) {
      toast.error(error.message || "Ocorreu um erro.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="ml-2 p-1 h-auto">
          <PlusCircle className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Categoria</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="Ex: Anúncios"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit" onClick={handleSubmit} disabled={loading}>
            {loading ? "Salvando..." : "Salvar Categoria"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCategoryDialog;