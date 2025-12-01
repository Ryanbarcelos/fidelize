import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface AuditLogParams {
  cardId?: string;
  action: string;
  status: 'success' | 'failed';
  errorMessage?: string;
  latitude?: number;
  longitude?: number;
}

export const useAuditLog = () => {
  const { user } = useAuth();

  const logAction = async ({
    cardId,
    action,
    status,
    errorMessage,
    latitude,
    longitude,
  }: AuditLogParams): Promise<void> => {
    if (!user) return;

    try {
      // Capturar informações do dispositivo e navegador
      const userAgent = navigator.userAgent;
      const deviceInfo = {
        platform: navigator.platform,
        language: navigator.language,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      // Obter IP (será capturado no backend se necessário)
      // Por enquanto, deixamos como null e pode ser adicionado via edge function

      await supabase.from('audit_logs').insert({
        user_id: user.id,
        card_id: cardId,
        action,
        status,
        error_message: errorMessage,
        user_agent: userAgent,
        device_info: JSON.stringify(deviceInfo),
        latitude,
        longitude,
      });
    } catch (error) {
      console.error("Error logging action:", error);
      // Não bloqueamos a operação se o log falhar
    }
  };

  const getLocation = (): Promise<{ latitude: number; longitude: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          // Se o usuário negar permissão, continuamos sem localização
          resolve(null);
        },
        { timeout: 5000 }
      );
    });
  };

  return {
    logAction,
    getLocation,
  };
};
