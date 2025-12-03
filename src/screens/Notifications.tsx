import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Bell, Calendar, CheckCheck } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Notifications = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const [selectedNotification, setSelectedNotification] = useState<any>(null);

  useEffect(() => {
    if (!currentUser || currentUser.accountType !== "customer") {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const handleNotificationClick = (notification: any) => {
    setSelectedNotification(notification);
    markAsRead(notification.id);
  };

  if (!currentUser || currentUser.accountType !== "customer") {
    return null;
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center relative">
                  <Bell className="w-5 h-5 text-primary" />
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center">
                      {unreadCount}
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Notificações</h1>
                  <p className="text-sm text-muted-foreground">
                    {unreadCount > 0 ? `${unreadCount} não ${unreadCount === 1 ? 'lida' : 'lidas'}` : 'Tudo em dia!'}
                  </p>
                </div>
              </div>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-primary"
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 animate-fade-in">
        {notifications.length === 0 ? (
          <Card className="p-8 text-center border-0 shadow-md">
            <div className="w-16 h-16 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhuma notificação no momento
            </h3>
            <p className="text-sm text-muted-foreground">
              Quando suas lojas favoritas enviarem promoções, elas aparecerão aqui.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`p-4 border-0 shadow-md hover:shadow-lg transition-all cursor-pointer ${
                  !notification.read ? "bg-primary/5 border-l-4 border-l-primary" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex gap-4">
                  {notification.imageUrl ? (
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={notification.imageUrl}
                        alt={notification.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : notification.notificationType === 'achievement' ? (
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">🏆</span>
                    </div>
                  ) : null}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5"></div>
                      )}
                    </div>
                    {notification.storeName && (
                      <p className="text-sm text-primary font-medium mb-1">
                        {notification.storeName}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {notification.description}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {format(new Date(notification.receivedAt), "dd/MM/yyyy - HH:mm", {
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-primary hover:text-primary hover:bg-primary/10"
                  >
                    Ver mais detalhes
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Notification Detail Dialog */}
      <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
        <DialogContent className="rounded-3xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">Detalhes da Promoção</DialogTitle>
          </DialogHeader>
          {selectedNotification && (
            <div className="space-y-4 py-4">
              {selectedNotification.imageUrl && (
                <div className="w-full aspect-video rounded-xl overflow-hidden bg-muted">
                  <img
                    src={selectedNotification.imageUrl}
                    alt={selectedNotification.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {selectedNotification.title}
                </h3>
                <p className="text-sm font-semibold text-primary mb-3">
                  {selectedNotification.storeName}
                </p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedNotification.description}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-border">
                <Calendar className="w-4 h-4" />
                <span>
                  Recebido em {format(new Date(selectedNotification.receivedAt), "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Notifications;
