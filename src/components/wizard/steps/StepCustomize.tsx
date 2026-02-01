import { useWizardStore } from '../../../stores/wizardStore';
import { ColorSection } from '../../customization/ColorSection';
import { LogoSection } from '../../customization/LogoSection';
import { StyleSection } from '../../customization/StyleSection';
import { FrameSection } from '../../customization/FrameSection';
import { MoreSection } from '../../customization/MoreSection';
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '../../ui/Tabs';
import { Button } from '../../ui/Button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Palette, Image, Shapes, Frame, Sparkles } from 'lucide-react';

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
            <Tab icon={Palette}>Colors</Tab>
            <Tab icon={Image}>Logo</Tab>
            <Tab icon={Shapes}>Style</Tab>
            <Tab icon={Frame}>Frame</Tab>
            <Tab icon={Sparkles}>More</Tab>
          </TabList>
          <TabPanels className="pt-4">
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
