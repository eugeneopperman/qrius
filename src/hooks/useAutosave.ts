import { useRef, useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useQRStore } from '@/stores/qrStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useWizardStore } from '@/stores/wizardStore';
import { getSession } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { AUTOSAVE } from '@/config/constants';

export interface AutosaveState {
  savedQRCodeId: string | null;
  trackingUrl: string | null;
  lastSavedAt: Date | null;
  isSaving: boolean;
  saveNow: () => Promise<void>;
  reset: () => void;
}

/** Build the save payload from current QR store state */
function buildSavePayload() {
  const {
    activeType,
    getCurrentData,
    getQRValue,
    campaignName,
    styleOptions,
  } = useQRStore.getState();

  const qrValue = getQRValue();
  const currentData = getCurrentData();

  // Determine name: use campaignName if provided, otherwise auto-generate
  const name =
    campaignName.trim() ||
    (activeType === 'url'
      ? (currentData.data as { url?: string }).url?.slice(0, 100)
      : `${activeType.toUpperCase()} QR Code`);

  // Serialize rendering-relevant style options
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

  return {
    destination_url: qrValue,
    qr_type: activeType,
    original_data: currentData.data,
    name: name || undefined,
    style_options,
  };
}

/** Check whether the user has entered real content (not just defaults/fallbacks) */
function hasRealContent(): boolean {
  const state = useQRStore.getState();
  switch (state.activeType) {
    case 'url':
      return state.urlData.url.length > 0;
    case 'text':
      return state.textData.text.length > 0;
    case 'email':
      return state.emailData.email.length > 0;
    case 'phone':
      return state.phoneData.phone.length > 0;
    case 'sms':
      return state.smsData.phone.length > 0;
    case 'wifi':
      return state.wifiData.ssid.length > 0;
    case 'vcard':
      return (state.vcardData.firstName.length > 0 || state.vcardData.lastName.length > 0);
    case 'event':
      return state.eventData.title.length > 0;
    case 'location':
      return (String(state.locationData.latitude).length > 0 && String(state.locationData.longitude).length > 0);
    default:
      return false;
  }
}

export function useAutosave(): AutosaveState {
  const [savedQRCodeId, setSavedQRCodeId] = useState<string | null>(null);
  const [trackingUrl, setTrackingUrl] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const lastPayloadHashRef = useRef<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);
  const limitReachedRef = useRef(false);
  const savedIdRef = useRef<string | null>(null);

  const queryClient = useQueryClient();

  // Keep savedIdRef in sync so interval callback uses latest value
  useEffect(() => {
    savedIdRef.current = savedQRCodeId;
  }, [savedQRCodeId]);

  const performSave = useCallback(async () => {
    // Guard: must be authenticated
    const user = useAuthStore.getState().user;
    if (!user) return;

    // Guard: autosave must be enabled
    if (!useSettingsStore.getState().autosaveEnabled) return;

    // Guard: must be on step >= MIN_STEP
    const currentStep = useWizardStore.getState().currentStep;
    if (currentStep < AUTOSAVE.MIN_STEP) return;

    // Guard: must have real content
    if (!hasRealContent()) return;

    // Guard: plan limit reached — stop trying
    if (limitReachedRef.current) return;

    const payload = buildSavePayload();
    const payloadHash = JSON.stringify(payload);

    // Skip if nothing changed
    if (payloadHash === lastPayloadHashRef.current) return;

    // Abort any in-flight request
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsSaving(true);
    try {
      const session = await getSession();
      if (!session?.access_token) return;

      const isUpdate = savedIdRef.current !== null;
      const url = isUpdate
        ? `/api/qr-codes/${savedIdRef.current}`
        : '/api/qr-codes';

      const response = await fetch(url, {
        method: isUpdate ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status === 403) {
          limitReachedRef.current = true;
        }
        return;
      }

      const data = await response.json();

      lastPayloadHashRef.current = payloadHash;
      setLastSavedAt(new Date());

      if (!isUpdate && data.id) {
        setSavedQRCodeId(data.id);
        savedIdRef.current = data.id;
      }
      if (data.tracking_url) {
        setTrackingUrl(data.tracking_url);
      }

      queryClient.invalidateQueries({ queryKey: ['qr-codes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    } catch (error) {
      // Ignore abort errors
      if (error instanceof DOMException && error.name === 'AbortError') return;
      if (import.meta.env.DEV) console.error('Autosave failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [queryClient]);

  // Set up the autosave interval
  useEffect(() => {
    const intervalId = setInterval(() => {
      performSave();
    }, AUTOSAVE.INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
      abortControllerRef.current?.abort();
    };
  }, [performSave]);

  const saveNow = useCallback(async () => {
    await performSave();
  }, [performSave]);

  const reset = useCallback(() => {
    setSavedQRCodeId(null);
    setTrackingUrl(null);
    setLastSavedAt(null);
    lastPayloadHashRef.current = '';
    savedIdRef.current = null;
    limitReachedRef.current = false;
  }, []);

  return {
    savedQRCodeId,
    trackingUrl,
    lastSavedAt,
    isSaving,
    saveNow,
    reset,
  };
}
