import { Header } from './components/Header';
import { TypeSelector } from './components/TypeSelector';
import { InputForm } from './components/InputForm';
import { QRPreview } from './components/QRPreview';
import { ColorSection } from './components/customization/ColorSection';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Type Selector */}
        <div className="mb-8">
          <TypeSelector />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Forms */}
          <div className="space-y-6">
            <InputForm />

            {/* Customization */}
            <div className="card">
              <h2 className="section-title mb-4">Customization</h2>
              <ColorSection />
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="card">
              <h2 className="section-title mb-4 text-center">Preview</h2>
              <QRPreview />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Internal QR Code Generator - All data processed locally in your browser
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
