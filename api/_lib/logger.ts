// Structured logger for API routes
// In production, this can be extended to send logs to external services (Datadog, LogRocket, etc.)

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

interface Logger {
  debug: (message: string, context?: LogContext) => void;
  info: (message: string, context?: LogContext) => void;
  warn: (message: string, context?: LogContext) => void;
  error: (message: string, context?: LogContext) => void;
}

// Environment configuration
const LOG_LEVEL: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Log level priority
const LOG_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function shouldLog(level: LogLevel): boolean {
  return LOG_PRIORITY[level] >= LOG_PRIORITY[LOG_LEVEL];
}

function formatMessage(level: LogLevel, module: string, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` ${JSON.stringify(context)}` : '';

  if (IS_PRODUCTION) {
    // JSON format for production (easier to parse by log aggregators)
    return JSON.stringify({
      timestamp,
      level,
      module,
      message,
      ...context,
    });
  }

  // Human-readable format for development
  return `[${timestamp}] [${level.toUpperCase()}] [${module}] ${message}${contextStr}`;
}

/**
 * Create a logger instance for a specific module
 * @param module - Module name for log identification (e.g., 'auth', 'billing', 'webhooks')
 */
export function createLogger(module: string): Logger {
  return {
    debug: (message: string, context?: LogContext) => {
      if (shouldLog('debug')) {
        console.debug(formatMessage('debug', module, message, context));
      }
    },

    info: (message: string, context?: LogContext) => {
      if (shouldLog('info')) {
        console.info(formatMessage('info', module, message, context));
      }
    },

    warn: (message: string, context?: LogContext) => {
      if (shouldLog('warn')) {
        console.warn(formatMessage('warn', module, message, context));
      }
    },

    error: (message: string, context?: LogContext) => {
      if (shouldLog('error')) {
        console.error(formatMessage('error', module, message, context));

        // In production, you could also send to error tracking service
        // Example: Sentry.captureException(new Error(message), { extra: context });
      }
    },
  };
}

// Pre-configured loggers for common modules
export const logger = {
  auth: createLogger('auth'),
  billing: createLogger('billing'),
  webhooks: createLogger('webhooks'),
  qrCodes: createLogger('qr-codes'),
  organizations: createLogger('organizations'),
  apiKeys: createLogger('api-keys'),
  redirect: createLogger('redirect'),
  kv: createLogger('kv'),
  notifications: createLogger('notifications'),
  domains: createLogger('domains'),
  folders: createLogger('folders'),
};

export default logger;
