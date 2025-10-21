import { Bell, MessageCircle, FileText, CheckCheck } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { ScrollArea } from './ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const NotificationItem = ({ 
  notification, 
  onNavigate 
}: { 
  notification: Notification;
  onNavigate: (link: string) => void;
}) => {
  // Determinar o ícone baseado no tipo de notificação
  const getIcon = () => {
    switch (notification.type) {
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'reply':
        return <MessageCircle className="h-4 w-4 text-purple-500" />;
      case 'new_post':
        return <FileText className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div 
      className="flex items-start gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors border-b last:border-b-0"
      onClick={() => onNavigate(notification.link)}
    >
      <div className="mt-1">
        {getIcon()}
      </div>
      <div className="flex-1">
        <p className={`text-sm ${!notification.is_read ? 'font-semibold' : ''}`}>
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(notification.created_at).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
      {!notification.is_read && (
        <div className="mt-2">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
        </div>
      )}
    </div>
  );
};

const Notifications = () => {
  const { notifications, unreadCount, loading, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMarking, setIsMarking] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    // Removido o auto-mark como lido ao abrir
  };

  const handleNavigate = (link: string) => {
    if (link) {
      navigate(link);
      setIsOpen(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    
    setIsMarking(true);
    await markAllAsRead();
    setIsMarking(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <>
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
              {/* Animação de pulsação */}
              <span className="absolute -top-1 -right-1 flex h-5 w-5 rounded-full bg-red-500 animate-ping opacity-75" />
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">Notificações</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <>
                <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                  {unreadCount} nova{unreadCount !== 1 ? 's' : ''}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={isMarking}
                  className="text-primary hover:text-primary"
                >
                  <CheckCheck className="h-4 w-4 mr-1" />
                  {isMarking ? 'Marcando...' : 'Marcar como Lidas'}
                </Button>
              </>
            )}
          </div>
        </div>
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
              <p className="text-sm text-muted-foreground mt-2">Carregando...</p>
            </div>
          ) : notifications.length > 0 ? (
            notifications.map(n => (
              <NotificationItem 
                key={n.id} 
                notification={n} 
                onNavigate={handleNavigate}
              />
            ))
          ) : (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default Notifications;