import { useQRStore } from '../../stores/qrStore';
import { Input } from '../ui/Input';
import { Link } from 'lucide-react';

export function UrlForm() {
  const { urlData, setUrlData } = useQRStore();

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let url = e.target.value;
    setUrlData({ url });
  };

  const handleUrlBlur = () => {
    let url = urlData.url.trim();
    if (url && !url.match(/^https?:\/\//i) && !url.startsWith('//')) {
      url = 'https://' + url;
      setUrlData({ url });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
        <Link className="w-5 h-5" />
        <h3 className="font-medium">Website URL</h3>
      </div>

      <Input
        label="Enter URL"
        type="url"
        value={urlData.url}
        onChange={handleUrlChange}
        onBlur={handleUrlBlur}
        placeholder="https://example.com"
        hint="Enter the full URL including https://"
      />

      {urlData.url && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <span className="font-medium">Characters:</span> {urlData.url.length}
          {urlData.url.length > 100 && (
            <span className="ml-2 text-amber-600 dark:text-amber-400">
              (Consider shortening for easier scanning)
            </span>
          )}
        </div>
      )}
    </div>
  );
}
