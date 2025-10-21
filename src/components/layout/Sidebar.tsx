import { Button } from "@/components/ui/button";
import { Home, User, LogOut, Shield, Users, List, X } from "lucide-react";
import CreateDuvidaDialog from "@/components/CreateDuvidaDialog";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { useSidebar } from "@/providers/SidebarProvider";
import { useEffect } from "react";

const Sidebar = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { isOpen, closeSidebar } = useSidebar();

  // Fechar sidebar ao clicar em qualquer link
  const handleLinkClick = () => {
    closeSidebar();
  };

  // Fechar sidebar ao pressionar ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSidebar();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevenir scroll no body quando sidebar está aberto
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeSidebar]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
    closeSidebar();
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={closeSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-screen w-[280px] z-50
        border-r bg-background
        transition-transform duration-300 ease-in-out
        md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:w-[220px] lg:w-[280px]
      `}>
        <div className="flex h-full flex-col gap-2 overflow-y-auto">
          {/* Header com botão fechar no mobile */}
          <div className="flex h-14 items-center justify-between border-b px-4 lg:h-[60px] lg:px-6">
            <Link to="/" onClick={handleLinkClick} className="flex items-center gap-2 font-semibold">
              <span className="text-lg">Fórum Flow</span>
            </Link>
            <Button 
              variant="ghost" 
              size="icon"
              className="md:hidden"
              onClick={closeSidebar}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <Link
                to="/"
                onClick={handleLinkClick}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Home className="h-4 w-4" />
                Home
              </Link>
              <Link
                to="/minhas-duvidas"
                onClick={handleLinkClick}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <List className="h-4 w-4" />
                Minhas Dúvidas
              </Link>
              <Link
                to="/profile"
                onClick={handleLinkClick}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <User className="h-4 w-4" />
                Perfil
              </Link>
            </nav>
          </div>

          {profile?.role === 'admin' && (
            <div className="mt-auto p-4">
              <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase mb-2">Admin</h3>
              <nav className="grid items-start gap-1 px-2 text-sm font-medium lg:px-4">
                <Link 
                  to="/admin/duvidas" 
                  onClick={handleLinkClick}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <Shield className="h-4 w-4" />
                  Gerenciar Dúvidas
                </Link>
                <Link 
                  to="/admin/users" 
                  onClick={handleLinkClick}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <Users className="h-4 w-4" />
                  Gerenciar Usuários
                </Link>
              </nav>
            </div>
          )}
          
          <div className="mt-auto p-4">
            <div className="px-2 lg:px-4 mb-4">
              <CreateDuvidaDialog />
            </div>
            <Button variant="ghost" className="justify-start w-full" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;