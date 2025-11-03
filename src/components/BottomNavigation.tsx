import { Home, MapPin, Trophy, UserCircle, Bell } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/useNotifications';

export function BottomNavigation() {
  const location = useLocation();
  const { getUnreadCount } = useNotifications();
  const unreadCount = getUnreadCount();
  
  const navItems = [
    { icon: Home, label: 'Início', path: '/' },
    { icon: Bell, label: 'Notificações', path: '/notifications', badge: unreadCount },
    { icon: Trophy, label: 'Metas', path: '/achievements' },
    { icon: UserCircle, label: 'Perfil', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16">
        {navItems.map(({ icon: Icon, label, path, badge }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors relative",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon className={cn("w-6 h-6", isActive && "scale-110")} />
                {badge && badge > 0 && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center">
                    {badge > 9 ? '9+' : badge}
                  </div>
                )}
              </div>
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
