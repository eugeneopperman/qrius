import { useState } from 'react';
import { useQRStore } from '../../stores/qrStore';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Wifi } from 'lucide-react';
import { validateSsid, validateWifiPassword } from '../../utils/validators';

const encryptionOptions = [
  { value: 'WPA', label: 'WPA/WPA2/WPA3' },
  { value: 'WEP', label: 'WEP' },
  { value: 'nopass', label: 'No Password' },
];

export function WifiForm() {
  const { wifiData, setWifiData } = useQRStore();
  const [touched, setTouched] = useState({ ssid: false, password: false });

  const ssidValidation = touched.ssid ? validateSsid(wifiData.ssid) : { isValid: true };
  const passwordValidation = touched.password
    ? validateWifiPassword(wifiData.password || '', wifiData.encryption)
    : { isValid: true };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
        <Wifi className="w-5 h-5" />
        <h3 className="font-medium">WiFi Network</h3>
      </div>

      <Input
        label="Network Name (SSID)"
        type="text"
        value={wifiData.ssid}
        onChange={(e) => setWifiData({ ssid: e.target.value })}
        onBlur={() => setTouched((t) => ({ ...t, ssid: true }))}
        placeholder="MyWiFiNetwork"
        error={ssidValidation.error}
      />

      <Select
        label="Security Type"
        options={encryptionOptions}
        value={wifiData.encryption}
        onChange={(e) =>
          setWifiData({ encryption: e.target.value as 'WPA' | 'WEP' | 'nopass' })
        }
      />

      {wifiData.encryption !== 'nopass' && (
        <Input
          label="Password"
          type="password"
          value={wifiData.password || ''}
          onChange={(e) => setWifiData({ password: e.target.value })}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          placeholder="Network password"
          error={passwordValidation.error}
          hint={wifiData.encryption === 'WPA' ? 'WPA passwords must be 8-63 characters' : undefined}
        />
      )}

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={wifiData.hidden || false}
          onChange={(e) => setWifiData({ hidden: e.target.checked })}
          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">Hidden network</span>
      </label>
    </div>
  );
}
