import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/authStore';
import { useTemplateStore } from '@/stores/templateStore';
import { useQRStore } from '@/stores/qrStore';
import { toast } from '@/stores/toastStore';
import { Button } from '@/components/ui/Button';
import { QrCode, ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingWelcome } from '@/components/onboarding/OnboardingWelcome';
import { OnboardingBrandTemplate } from '@/components/onboarding/OnboardingBrandTemplate';
import { OnboardingFirstQR } from '@/components/onboarding/OnboardingFirstQR';
import { OnboardingComplete } from '@/components/onboarding/OnboardingComplete';

type OnboardingStep = 1 | 2 | 3 | 4;

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { createOrganization, setOnboardingComplete } = useAuthStore();
  const { saveTemplate, updateDraft, updateDraftStyle } = useTemplateStore();
  const { setUrlData, setStyleOptions } = useQRStore();
  const [step, setStep] = useState<OnboardingStep>(1);
  const [orgName, setOrgName] = useState('');
  const [brandColor, setBrandColor] = useState('#6366F1');
  const [quickUrl, setQuickUrl] = useState('');
  const [isCreatingOrg, setIsCreatingOrg] = useState(false);

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleNext = async () => {
    if (step === 1) {
      // Create organization if name provided
      if (orgName.trim()) {
        setIsCreatingOrg(true);
        const { error } = await createOrganization(orgName.trim());
        setIsCreatingOrg(false);
        if (error) {
          toast.error(error.message);
          return;
        }
      }
      setStep(2);
    } else if (step === 2) {
      // Save brand template if color was changed
      if (brandColor !== '#6366F1') {
        updateDraft({ name: `${orgName || 'My'} Brand` });
        updateDraftStyle({
          dotsColor: brandColor,
          backgroundColor: '#ffffff',
          dotsType: 'rounded',
          cornersSquareType: 'extra-rounded',
          cornersDotType: 'dot',
          errorCorrectionLevel: 'H',
        });
        saveTemplate();
      }
      setStep(3);
    } else if (step === 3) {
      // Apply URL if provided
      if (quickUrl.trim()) {
        setUrlData({ url: quickUrl.trim() });
        setStyleOptions({ dotsColor: brandColor });
      }
      setStep(4);
    } else {
      // Complete onboarding
      setOnboardingComplete();
      navigate({ to: '/dashboard' });
    }
  };

  const handleSkip = () => {
    if (step < 4) {
      setStep((step + 1) as OnboardingStep);
    } else {
      setOnboardingComplete();
      navigate({ to: '/dashboard' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-800 z-50">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <header className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">Qrius</span>
        </div>
        <button
          onClick={handleSkip}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Skip
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg animate-fade-in" key={step}>
          {step === 1 && (
            <OnboardingWelcome orgName={orgName} setOrgName={setOrgName} />
          )}
          {step === 2 && (
            <OnboardingBrandTemplate brandColor={brandColor} setBrandColor={setBrandColor} />
          )}
          {step === 3 && (
            <OnboardingFirstQR quickUrl={quickUrl} setQuickUrl={setQuickUrl} brandColor={brandColor} />
          )}
          {step === 4 && <OnboardingComplete />}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            {step > 1 ? (
              <Button variant="ghost" onClick={() => setStep((step - 1) as OnboardingStep)}>
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            ) : (
              <div />
            )}
            <Button onClick={handleNext} disabled={isCreatingOrg}>
              {step === 4 ? 'Go to Dashboard' : 'Continue'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Step indicator */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-2 h-2 rounded-full transition-colors ${
                  s === step
                    ? 'bg-orange-500'
                    : s < step
                    ? 'bg-orange-300'
                    : 'bg-gray-300 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
