import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
  permissionGranted: boolean;
}

export function useLocation() {
  const [locationPermission, setLocationPermission] = useLocalStorage<boolean>('locationPermission', false);
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
    permissionGranted: locationPermission,
  });

  const requestLocationPermission = () => {
    setLocation(prev => ({ ...prev, loading: true, error: null }));

    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        loading: false,
        error: 'Geolocalização não é suportada pelo seu navegador.',
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
          permissionGranted: true,
        });
        setLocationPermission(true);
      },
      (error) => {
        let errorMessage = 'Erro ao obter localização.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Permissão de localização negada.';
        }
        setLocation(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
          permissionGranted: false,
        }));
        setLocationPermission(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m de você`;
    }
    return `${distance.toFixed(1)}km de você`;
  };

  useEffect(() => {
    if (locationPermission && !location.latitude) {
      requestLocationPermission();
    }
  }, []);

  return {
    ...location,
    requestLocationPermission,
    calculateDistance,
    formatDistance,
  };
}
