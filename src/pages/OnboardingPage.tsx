import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '../stores/authStore';
import { useTemplateStore } from '../stores/templateStore';
import { useQRStore } from '../stores/qrStore';
import { toast } from '../stores/toastStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  QrCode,
  ArrowRight,
  ArrowLeft,
  Palette,
  Sparkles,
  Check,
  Building2,
  Globe,
} from 'lucide-react';

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
            <StepWelcome
              orgName={orgName}
              setOrgName={setOrgName}
            />
          )}
          {step === 2 && (
            <StepBrand
              brandColor={brandColor}
              setBrandColor={setBrandColor}
            />
          )}
          {step === 3 && (
            <StepFirstQR
              quickUrl={quickUrl}
              setQuickUrl={setQuickUrl}
              brandColor={brandColor}
            />
          )}
          {step === 4 && <StepComplete />}

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

function StepWelcome({ orgName, setOrgName }: { orgName: string; setOrgName: (v: string) => void }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Welcome to Qrius!
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Let's set up your workspace in a few quick steps.
      </p>
      <div className="text-left">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Building2 className="w-4 h-4 inline mr-2" />
          Workspace name
        </label>
        <Input
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          placeholder="e.g., My Company, Marketing Team"
          className="text-center"
        />
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500 text-center">
          You can change this later in Settings
        </p>
      </div>
    </div>
  );
}

function StepBrand({ brandColor, setBrandColor }: { brandColor: string; setBrandColor: (v: string) => void }) {
  const colors = [
    '#6366F1', '#3B82F6', '#06B6D4', '#10B981',
    '#F59E0B', '#F97316', '#EF4444', '#EC4899',
    '#8B5CF6', '#000000',
  ];

  return (
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
        <Palette className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Choose your brand color
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Pick a color for your QR codes. This creates your first brand template.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => setBrandColor(color)}
            className={`w-12 h-12 rounded-xl transition-all ${
              brandColor === color
                ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-950 ring-orange-500 scale-110'
                : 'hover:scale-105'
            }`}
            style={{ backgroundColor: color }}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Or enter a custom color
        </label>
        <Input
          type="text"
          value={brandColor}
          onChange={(e) => setBrandColor(e.target.value)}
          placeholder="#6366F1"
          className="text-center max-w-[200px] mx-auto"
        />
      </div>
    </div>
  );
}

function StepFirstQR({ quickUrl, setQuickUrl, brandColor }: { quickUrl: string; setQuickUrl: (v: string) => void; brandColor: string }) {
  return (
    <div className="text-center">
      <div
        className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center"
        style={{ backgroundColor: brandColor }}
      >
        <Globe className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Create your first QR code
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Enter a URL to generate a branded QR code instantly.
      </p>
      <div className="text-left">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Website URL
        </label>
        <Input
          type="url"
          value={quickUrl}
          onChange={(e) => setQuickUrl(e.target.value)}
          placeholder="https://example.com"
        />
      </div>

      {/* Preview hint */}
      {quickUrl && (
        <div className="mt-6 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <div
            className="w-32 h-32 mx-auto rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${brandColor}10`, border: `2px solid ${brandColor}` }}
          >
            <QrCode className="w-16 h-16" style={{ color: brandColor }} />
          </div>
          <p className="mt-3 text-xs text-gray-400">
            Your QR code will be generated with your brand color
          </p>
        </div>
      )}
    </div>
  );
}

function StepComplete() {
  return (
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-6 bg-green-500 rounded-2xl flex items-center justify-center">
        <Check className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        You're all set!
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Your workspace is ready. Start creating QR codes and tracking scans.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
        <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <QrCode className="w-6 h-6 text-orange-500 mb-2" />
          <h3 className="font-medium text-gray-900 dark:text-white text-sm">Create QR Codes</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">URL, WiFi, vCard, and more</p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <Palette className="w-6 h-6 text-indigo-500 mb-2" />
          <h3 className="font-medium text-gray-900 dark:text-white text-sm">Brand Templates</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Save and reuse your styles</p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <Sparkles className="w-6 h-6 text-pink-500 mb-2" />
          <h3 className="font-medium text-gray-900 dark:text-white text-sm">Track Scans</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Real-time analytics</p>
        </div>
      </div>
    </div>
  );
}
