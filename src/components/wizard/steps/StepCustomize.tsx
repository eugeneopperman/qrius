import { useWizardStore } from '@/stores/wizardStore';
import { ColorSection } from '@/components/customization/ColorSection';
import { LogoSection } from '@/components/customization/LogoSection';
import { StyleSection } from '@/components/customization/StyleSection';
import { FrameSection } from '@/components/customization/FrameSection';
import { MoreSection } from '@/components/customization/MoreSection';
import { TemplatePickerSection } from '@/components/customization/TemplatePickerSection';
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Layers, Palette, Image, Shapes, Frame, Sparkles } from 'lucide-react';

export function StepCustomize() {
  const { nextStep, prevStep } = useWizardStore();

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1">
          Customize your QR code
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Make it unique with colors, logos, and styles
        </p>
      </div>

      {/* Customization tabs */}
      <div className="card mb-6">
        <TabGroup defaultTab={0}>
          <TabList>
            <Tab icon={Layers}><span className="hidden sm:inline">Templates</span></Tab>
            <Tab icon={Palette}><span className="hidden sm:inline">Colors</span></Tab>
            <Tab icon={Image}><span className="hidden sm:inline">Logo</span></Tab>
            <Tab icon={Shapes}><span className="hidden sm:inline">Style</span></Tab>
            <Tab icon={Frame}><span className="hidden sm:inline">Frame</span></Tab>
            <Tab icon={Sparkles}><span className="hidden sm:inline">More</span></Tab>
          </TabList>
          <TabPanels className="pt-4">
            <TabPanel>
              <TemplatePickerSection />
            </TabPanel>
            <TabPanel>
              <ColorSection />
            </TabPanel>
            <TabPanel>
              <LogoSection />
            </TabPanel>
            <TabPanel>
              <StyleSection />
            </TabPanel>
            <TabPanel>
              <FrameSection />
            </TabPanel>
            <TabPanel>
              <MoreSection />
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <Button variant="primary" onClick={nextStep}>
          Download
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
