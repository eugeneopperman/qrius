import { useRef, useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useWizardStore } from '@/stores/wizardStore';
import { useQRStore } from '@/stores/qrStore';
import { useAuthStore } from '@/stores/authStore';
import { QRPreview, type QRPreviewHandle } from '@/components/QRPreview';
import { Button } from '@/components/ui/Button';
import { toast } from '@/stores/toastStore';
import { getSession } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Download, Copy, RotateCcw, Check, Settings2, Loader2, ExternalLink } from 'lucide-react';
import type { AutosaveState } from '@/hooks/useAutosave';

interface StepDownloadProps {
  autosave?: AutosaveState;
}

export function StepDownload({ autosave }: StepDownloadProps) {
  const { prevStep, reset } = useWizardStore();
  const qrPreviewRef = useRef<QRPreviewHandle>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const user = useAuthStore((s) => s.user);
  const activeType = useQRStore((s) => s.activeType);
  const getCurrentData = useQRStore((s) => s.getCurrentData);
  const getQRValue = useQRStore((s) => s.getQRValue);

  // --- Fallback local save state (when autosave prop is not provided) ---
  const [localIsSaving, setLocalIsSaving] = useState(false);
  const [localSavedQRCodeId, setLocalSavedQRCodeId] = useState<string | null>(null);
  const [localTrackingUrl, setLocalTrackingUrl] = useState<string | null>(null);
  const [localSaveAttempted, setLocalSaveAttempted] = useState(false);

  // Resolve which save state to use
  const isSaving = autosave ? autosave.isSaving : localIsSaving;
  const savedQRCodeId = autosave ? autosave.savedQRCodeId : localSavedQRCodeId;
  const trackingUrl = autosave ? autosave.trackingUrl : localTrackingUrl;

  // Auto-save on mount: either via autosave hook or local fallback
  useEffect(() => {
    if (autosave) {
      // Use autosave's saveNow to ensure final state is persisted
      autosave.saveNow();
    } else {
      // Fallback: local save logic
      if (!user || localSaveAttempted) return;
      setLocalSaveAttempted(true);
      saveToDatabaseLocal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  async function saveToDatabaseLocal() {
    if (!user) return;

    setLocalIsSaving(true);
    try {
      const session = await getSession();
      if (!session?.access_token) return;

      const qrValue = getQRValue();
      const currentData = getCurrentData();
      const { campaignName, styleOptions } = useQRStore.getState();

      const name = campaignName.trim()
        || (activeType === 'url' ? (currentData.data as { url?: string }).url?.slice(0, 100) : `${activeType.toUpperCase()} QR Code`);

      const style_options: Record<string, unknown> = {
        dotsColor: styleOptions.dotsColor,
        backgroundColor: styleOptions.backgroundColor,
        dotsType: styleOptions.dotsType,
        cornersSquareType: styleOptions.cornersSquareType,
        cornersDotType: styleOptions.cornersDotType,
        errorCorrectionLevel: styleOptions.errorCorrectionLevel,
      };
      if (styleOptions.useGradient) style_options.useGradient = true;
      if (styleOptions.gradient) style_options.gradient = styleOptions.gradient;
      if (styleOptions.logoUrl) style_options.logoUrl = styleOptions.logoUrl;
      if (styleOptions.logoShape) style_options.logoShape = styleOptions.logoShape;
      if (styleOptions.logoMargin !== undefined) style_options.logoMargin = styleOptions.logoMargin;
      if (styleOptions.logoSize !== undefined) style_options.logoSize = styleOptions.logoSize;
      if (styleOptions.qrRoundness !== undefined) style_options.qrRoundness = styleOptions.qrRoundness;
      if (styleOptions.qrPattern) style_options.qrPattern = styleOptions.qrPattern;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const response = await fetch('/api/qr-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          destination_url: qrValue,
          qr_type: activeType,
          original_data: currentData.data,
          name,
          style_options,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 403) {
          toast.info('QR code limit reached. Download still works as a static QR code.');
          return;
        }
        throw new Error(data.error || 'Failed to save');
      }

      const data = await response.json();
      setLocalSavedQRCodeId(data.id);
      if (data.tracking_url) {
        setLocalTrackingUrl(data.tracking_url);
      }
      queryClient.invalidateQueries({ queryKey: ['qr-codes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('QR code saved to your dashboard');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        toast.error('Save timed out. Your QR code still works — try refreshing.');
      } else if (import.meta.env.DEV) {
        console.error('Failed to save QR to DB:', error);
      }
    } finally {
      setLocalIsSaving(false);
    }
  }

  const handleQuickDownload = () => {
    qrPreviewRef.current?.download();
    setDownloadSuccess(true);
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }
    successTimeoutRef.current = setTimeout(() => setDownloadSuccess(false), 2000);
  };

  const handleCopy = () => {
    qrPreviewRef.current?.copy();
  };

  const handleShowFormatPicker = () => {
    qrPreviewRef.current?.showFormatPicker();
  };

  const handleCreateAnother = () => {
    if (autosave) {
      autosave.reset();
    } else {
      setLocalSavedQRCodeId(null);
      setLocalTrackingUrl(null);
      setLocalSaveAttempted(false);
    }
    reset();
  };

  const handleViewDetails = () => {
    if (savedQRCodeId) {
      navigate({ to: '/qr-codes/$id', params: { id: savedQRCodeId } });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white mb-2">
          Your QR code is ready!
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          {isSaving ? 'Saving to your dashboard...' : 'Download or share your QR code'}
        </p>
      </div>

      {/* Large QR Preview */}
      <div className="card mb-6 p-4 sm:p-8">
        <div className="max-w-[300px] mx-auto">
          <QRPreview
            ref={qrPreviewRef}
            overrideData={activeType === 'url' && trackingUrl ? trackingUrl : undefined}
          />
        </div>
      </div>

      {/* Saved status indicator */}
      {user && (
        <div className="mb-4">
          {isSaving && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving to dashboard...
            </div>
          )}
          {savedQRCodeId && !isSaving && (
            <div className="flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm rounded-full">
                <Check className="w-3.5 h-3.5" />
                Saved as dynamic QR code
              </span>
              <button
                onClick={handleViewDetails}
                className="inline-flex items-center gap-1 text-sm text-orange-600 dark:text-orange-400 hover:underline"
              >
                View details
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Primary Download Button */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Button
          variant="primary"
          size="lg"
          className="flex-1 py-4 text-lg bg-orange-500 hover:bg-orange-600"
          onClick={handleQuickDownload}
          disabled={isSaving}
        >
          {downloadSuccess ? (
            <>
              <Check className="w-5 h-5" />
              Downloaded!
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Quick Download (PNG)
            </>
          )}
        </Button>

        <Button
          variant="secondary"
          size="lg"
          className="py-4"
          onClick={handleShowFormatPicker}
          disabled={isSaving}
        >
          <Settings2 className="w-5 h-5" />
          More Formats
        </Button>
      </div>

      {/* Secondary Actions */}
      <div className="flex flex-wrap gap-3 justify-center mb-8">
        <Button variant="secondary" onClick={handleCopy}>
          <Copy className="w-4 h-4" />
          Copy to Clipboard
        </Button>

        <Button variant="secondary" onClick={handleCreateAnother}>
          <RotateCcw className="w-4 h-4" />
          Create Another
        </Button>
      </div>

      {/* Back button */}
      <div className="text-center">
        <Button variant="ghost" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4" />
          Back to customize
        </Button>
      </div>
    </div>
  );
}
