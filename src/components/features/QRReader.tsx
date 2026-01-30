import { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Upload, X, Copy, Check, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';

export function QRReader() {
  const [mode, setMode] = useState<'camera' | 'file' | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startCameraScanning = async () => {
    setError(null);
    setResult(null);
    setMode('camera');

    try {
      scannerRef.current = new Html5Qrcode('qr-reader-viewport');
      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          setResult(decodedText);
          stopScanning();
        },
        () => {
          // Ignore scan errors (no QR found yet)
        }
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to access camera. Please ensure camera permissions are granted.'
      );
      setMode(null);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setResult(null);
    setMode('file');

    try {
      const scanner = new Html5Qrcode('qr-reader-file');
      const decodedText = await scanner.scanFile(file, true);
      setResult(decodedText);
      await scanner.clear();
    } catch (err) {
      setError('No QR code found in the image. Please try another image.');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCopy = async () => {
    if (result) {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    stopScanning();
    setMode(null);
    setResult(null);
    setError(null);
  };

  const isUrl = result?.startsWith('http://') || result?.startsWith('https://');

  return (
    <div className="space-y-4">
      {/* Mode Selection */}
      {!mode && !result && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={startCameraScanning}
            className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
          >
            <Camera className="w-8 h-8 text-gray-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Scan with Camera
            </span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
          >
            <Upload className="w-8 h-8 text-gray-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Upload Image
            </span>
          </button>
        </div>
      )}

      {/* Camera Viewport */}
      {mode === 'camera' && !result && (
        <div className="space-y-3">
          <div
            id="qr-reader-viewport"
            className="w-full aspect-square max-w-sm mx-auto rounded-lg overflow-hidden bg-black"
          />
          <div className="flex justify-center">
            <Button variant="secondary" onClick={handleReset}>
              <X className="w-4 h-4" />
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Hidden file input and container for file scanning */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      <div id="qr-reader-file" className="hidden" />

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <Button variant="secondary" size="sm" onClick={handleReset} className="mt-2">
            Try Again
          </Button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <Check className="w-5 h-5" />
            <span className="font-medium">QR Code Decoded!</span>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-200 dark:border-green-700">
            <p className="text-sm font-mono break-all text-gray-900 dark:text-gray-100">
              {result}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={handleCopy}>
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </Button>

            {isUrl && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.open(result, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
                Open Link
              </Button>
            )}

            <Button variant="ghost" size="sm" onClick={handleReset}>
              Scan Another
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
