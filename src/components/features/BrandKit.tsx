import { useState, useRef } from 'react';
import { useQRStore } from '../../stores/qrStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Palette, Plus, Trash2, Download, Upload, Check, X, AlertCircle } from 'lucide-react';

export function BrandKitManager() {
  const { styleOptions, setStyleOptions } = useQRStore();
  const { brandKits, addBrandKit, deleteBrandKit, exportBrandKits, importBrandKits } =
    useSettingsStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newKitName, setNewKitName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveKit = () => {
    if (!newKitName.trim()) {
      setError('Please enter a name for the brand kit');
      return;
    }

    addBrandKit(newKitName.trim(), {
      dotsColor: styleOptions.dotsColor,
      backgroundColor: styleOptions.backgroundColor,
      dotsType: styleOptions.dotsType,
      cornersSquareType: styleOptions.cornersSquareType,
      cornersDotType: styleOptions.cornersDotType,
      errorCorrectionLevel: styleOptions.errorCorrectionLevel,
      logoUrl: styleOptions.logoUrl,
      logoSize: styleOptions.logoSize,
    });

    setNewKitName('');
    setIsAdding(false);
    setSuccess('Brand kit saved!');
    setTimeout(() => setSuccess(null), 2000);
  };

  const handleApplyKit = (kit: (typeof brandKits)[0]) => {
    setStyleOptions(kit.style);
    setSuccess(`Applied "${kit.name}" style`);
    setTimeout(() => setSuccess(null), 2000);
  };

  const handleExport = () => {
    const json = exportBrandKits();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'brand-kits.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const json = event.target?.result as string;
      const success = importBrandKits(json);
      if (success) {
        setSuccess('Brand kits imported successfully!');
      } else {
        setError('Failed to import brand kits. Invalid file format.');
      }
      setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 3000);
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Success/Error Messages */}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-400">
          <Check className="w-4 h-4" />
          {success}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Brand Kits List */}
      {brandKits.length > 0 && (
        <div className="space-y-2">
          {brandKits.map((kit) => (
            <div
              key={kit.id}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              {/* Color Preview */}
              <div className="flex gap-1">
                <div
                  className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: kit.style.dotsColor || '#000000' }}
                  title="QR Color"
                />
                <div
                  className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: kit.style.backgroundColor || '#ffffff' }}
                  title="Background"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                  {kit.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(kit.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-1">
                <Button variant="secondary" size="sm" onClick={() => handleApplyKit(kit)}>
                  Apply
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteBrandKit(kit.id)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {brandKits.length === 0 && !isAdding && (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          <Palette className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No brand kits saved yet</p>
          <p className="text-xs">Save your current style as a brand kit for quick reuse</p>
        </div>
      )}

      {/* Add New Kit Form */}
      {isAdding ? (
        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg space-y-3">
          <Input
            label="Brand Kit Name"
            value={newKitName}
            onChange={(e) => setNewKitName(e.target.value)}
            placeholder="e.g., Company Brand, Marketing Campaign"
            autoFocus
          />
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={handleSaveKit}>
              <Check className="w-4 h-4" />
              Save Kit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsAdding(false);
                setNewKitName('');
                setError(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="secondary" size="sm" onClick={() => setIsAdding(true)} className="w-full">
          <Plus className="w-4 h-4" />
          Save Current Style as Brand Kit
        </Button>
      )}

      {/* Import/Export */}
      {brandKits.length > 0 && (
        <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <Button variant="ghost" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4" />
            Import
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
