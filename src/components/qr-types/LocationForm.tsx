import { useQRStore } from '../../stores/qrStore';
import { Input } from '../ui/Input';
import { MapPin } from 'lucide-react';

export function LocationForm() {
  const { locationData, setLocationData } = useQRStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
        <MapPin className="w-5 h-5" />
        <h3 className="font-medium">Geographic Location</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Latitude"
          type="text"
          value={locationData.latitude}
          onChange={(e) => setLocationData({ latitude: e.target.value })}
          placeholder="40.7128"
          hint="e.g., 40.7128"
        />
        <Input
          label="Longitude"
          type="text"
          value={locationData.longitude}
          onChange={(e) => setLocationData({ longitude: e.target.value })}
          placeholder="-74.0060"
          hint="e.g., -74.0060"
        />
      </div>

      <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm text-gray-600 dark:text-gray-400">
        <p className="font-medium mb-1">Tip: Finding coordinates</p>
        <p>
          Right-click any location on Google Maps and select the coordinates to copy them.
        </p>
      </div>
    </div>
  );
}
