import { useState } from 'react';
import { useQRStore } from '../../stores/qrStore';
import { Input } from '../ui/Input';

import { validateLatitude, validateLongitude } from '../../utils/validators';

export function LocationForm() {
  const { locationData, setLocationData } = useQRStore();
  const [touched, setTouched] = useState({ latitude: false, longitude: false });

  const latValidation = touched.latitude ? validateLatitude(locationData.latitude) : { isValid: true };
  const lngValidation = touched.longitude ? validateLongitude(locationData.longitude) : { isValid: true };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Latitude"
          type="text"
          value={locationData.latitude}
          onChange={(e) => setLocationData({ latitude: e.target.value })}
          onBlur={() => setTouched((t) => ({ ...t, latitude: true }))}
          placeholder="40.7128"
          hint={latValidation.isValid ? "Range: -90 to 90" : undefined}
          error={latValidation.error}
        />
        <Input
          label="Longitude"
          type="text"
          value={locationData.longitude}
          onChange={(e) => setLocationData({ longitude: e.target.value })}
          onBlur={() => setTouched((t) => ({ ...t, longitude: true }))}
          placeholder="-74.0060"
          hint={lngValidation.isValid ? "Range: -180 to 180" : undefined}
          error={lngValidation.error}
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
