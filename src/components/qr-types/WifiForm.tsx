import { useState } from 'react';
import { useQRStore } from '@/stores/qrStore';
import { useShallow } from 'zustand/react/shallow';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

import { validateSsid, validateWifiPassword } from '@/utils/validators';

const encryptionOptions = [
  { value: 'WPA', label: 'WPA/WPA2/WPA3' },
  { value: 'WEP', label: 'WEP' },
  { value: 'nopass', label: 'No Password' },
];

export function WifiForm() {
  const { wifiData, setWifiData } = useQRStore(useShallow((s) => ({ wifiData: s.wifiData, setWifiData: s.setWifiData })));
  const [touched, setTouched] = useState({ ssid: false, password: false });

  const ssidValidation = touched.ssid ? validateSsid(wifiData.ssid) : { isValid: true };
  const passwordValidation = touched.password
    ? validateWifiPassword(wifiData.password || '', wifiData.encryption)
    : { isValid: true };

  return (
    <div className="space-y-4">
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

      <label className="flex items-center gap-3 cursor-pointer min-h-[44px] touch-manipulation">
        <input
          type="checkbox"
          checked={wifiData.hidden || false}
          onChange={(e) => setWifiData({ hidden: e.target.checked })}
          className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">Hidden network</span>
      </label>
    </div>
  );
}
