import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import { Star, Phone, MessageSquare, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Provider, useAppStore } from '@/store/useAppStore';

// Fix for default markers in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color: string, isUser: boolean = false) => {
  const size = isUser ? 40 : 32;
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${isUser ? 'linear-gradient(135deg, #0d9488, #14b8a6)' : color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="
          transform: rotate(45deg);
          font-size: ${isUser ? '16px' : '12px'};
        ">${isUser ? '📍' : '👤'}</span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  });
};

const userIcon = createCustomIcon('#0d9488', true);
const providerIcon = createCustomIcon('#1e3a5f');
const availableProviderIcon = createCustomIcon('#22c55e');

interface MapCenterProps {
  center: [number, number];
}

function MapCenter({ center }: MapCenterProps) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14);
  }, [center, map]);
  return null;
}

interface ProviderMapProps {
  providers: Provider[];
  onProviderSelect?: (provider: Provider) => void;
  showUserLocation?: boolean;
  className?: string;
}

export function ProviderMap({ 
  providers, 
  onProviderSelect, 
  showUserLocation = true,
  className = ''
}: ProviderMapProps) {
  const { t } = useTranslation();
  const { userLocation } = useAppStore();
  const [mapCenter, setMapCenter] = useState<[number, number]>([11.0168, 76.9558]); // Coimbatore default

  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng]);
    }
  }, [userLocation]);

  return (
    <div className={`rounded-xl overflow-hidden shadow-lg ${className}`}>
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapCenter center={mapCenter} />

        {/* User Location Marker */}
        {showUserLocation && userLocation && (
          <Marker 
            position={[userLocation.lat, userLocation.lng]} 
            icon={userIcon}
          >
            <Popup>
              <div className="text-center p-2">
                <p className="font-semibold">Your Location</p>
                <p className="text-sm text-muted-foreground">
                  {userLocation.address || 'Current location'}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Provider Markers */}
        {providers.map((provider) => (
          <Marker
            key={provider.id}
            position={[provider.location.lat, provider.location.lng]}
            icon={provider.isAvailable ? availableProviderIcon : providerIcon}
            eventHandlers={{
              click: () => onProviderSelect?.(provider),
            }}
          >
            <Popup maxWidth={300}>
              <div className="p-1 min-w-[220px]">
                <div className="flex items-start gap-3">
                  <img
                    src={provider.avatar}
                    alt={provider.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground truncate">
                      {provider.name}
                    </h4>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 fill-warning text-warning" />
                      <span className="text-sm font-medium">{provider.rating}</span>
                      <span className="text-xs text-muted-foreground">
                        ({provider.reviewCount})
                      </span>
                    </div>
                    <Badge 
                      variant={provider.isAvailable ? 'default' : 'secondary'} 
                      className="mt-1 text-xs"
                    >
                      {provider.isAvailable ? t('providers.available') : t('providers.busy')}
                    </Badge>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-muted-foreground">
                      {provider.distance} {t('providers.distance')}
                    </span>
                    <span className="font-semibold text-accent">
                      ₹{provider.hourlyRate}{t('providers.perHour')}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 h-8">
                      <Phone className="w-3 h-3 mr-1" />
                      {t('providers.callNow')}
                    </Button>
                    <Button size="sm" className="flex-1 h-8 accent-gradient text-accent-foreground">
                      <Calendar className="w-3 h-3 mr-1" />
                      {t('common.book')}
                    </Button>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
