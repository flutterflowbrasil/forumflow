import { ThemeToggle } from "@/components/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import { useSidebar } from "@/providers/SidebarProvider";
import { Menu } from "lucide-react";
import Notifications from "../Notifications";

const Header = () => {
  const { profile, loading } = useAuth();
  const { toggleSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      {/* Botão Menu Mobile */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      <div className="flex items-center gap-4 ml-auto">
        {/* Debug info - remover depois */}
        {loading && (
          <span className="text-xs text-muted-foreground">Carregando...</span>
        )}
        {!loading && profile && (
          <span className="text-xs text-muted-foreground" title={`ID: ${profile.id}`}>
            {profile.role === 'admin' ? '🔑 Admin' : '👤 User'}
          </span>
        )}
        
        <ThemeToggle />
        <Notifications />
        <Avatar>
          <AvatarImage src={profile?.avatar_url} />
          <AvatarFallback>{profile?.display_name?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default Header;