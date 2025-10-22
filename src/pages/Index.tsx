import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import DuvidaCard from "@/components/DuvidaCard";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDuvidas } from "@/providers/DuvidaProvider";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebar } from "@/providers/SidebarProvider";
import CreateDuvidaDialog from "@/components/CreateDuvidaDialog";

const Index = () => {
  const { duvidas, loading, setSearchTerm } = useDuvidas();
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const isMobile = useIsMobile();
  const { isOpen } = useSidebar();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(e.target.value);
    setSearchTerm(e.target.value);
  };

  return (
    <MainLayout>
      <div className="sticky top-16 z-30 bg-background pb-4 -mt-4 pt-4 -mx-4 px-4 lg:-mx-6 lg:px-6 border-b mb-4">
        <div className="flex items-center gap-2 md:gap-4">
          <h1 className="text-lg md:text-3xl font-bold text-left whitespace-nowrap flex-shrink-0">Feed Principal</h1>
          <div className="flex-1 max-w-md">
            <Input 
              placeholder="Buscar dúvidas..."
              value={localSearchTerm}
              onChange={handleSearchChange}
            />
          </div>
          {(isMobile || !isOpen) && (
            <div className="md:hidden flex-shrink-0">
              <CreateDuvidaDialog compact />
            </div>
          )}
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
        ) : duvidas.length > 0 ? (
          duvidas.map((duvida) => (
            <DuvidaCard key={duvida.id} duvida={duvida} />
          ))
        ) : (
          <p className="text-center text-muted-foreground mt-8">Nenhuma dúvida encontrada.</p>
        )}
      </div>
    </MainLayout>
  );
};

export default Index;