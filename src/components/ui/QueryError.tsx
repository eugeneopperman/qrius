import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface QueryErrorProps {
  message?: string;
  retry?: () => void;
}

export function QueryError({ message, retry }: QueryErrorProps) {
  return (
    <div className="glass rounded-2xl p-8 text-center">
      <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
        {message || 'Something went wrong loading this data.'}
      </p>
      {retry && (
        <Button onClick={retry} variant="secondary" size="sm" className="mt-3">
          <RefreshCw className="w-3.5 h-3.5" />
          Try again
        </Button>
      )}
    </div>
  );
}
