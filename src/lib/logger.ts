/**
 * Production-safe logging service
 * Replaces console statements with environment-aware logging
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

interface LogMessage {
  level: LogLevel;
  message: string;
  context?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

class Logger {
  private level: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.level = this.isDevelopment ? LogLevel.DEBUG : LogLevel.ERROR;
  }

  private shouldLog(logLevel: LogLevel): boolean {
    return logLevel >= this.level;
  }

  private formatMessage(logMessage: LogMessage): string {
    const timestamp = logMessage.timestamp.toISOString();
    const levelName = LogLevel[logMessage.level];
    
    return `[${timestamp}] ${levelName}${logMessage.context ? ` [${logMessage.context}]` : ''}: ${logMessage.message}${
      logMessage.metadata ? ` ${JSON.stringify(logMessage.metadata)}` : ''
    }`;
  }

  private log(logLevel: LogLevel, message: string, context?: string, metadata?: Record<string, any>) {
    if (!this.shouldLog(logLevel)) return;

    const logMessage: LogMessage = {
      level: logLevel,
      message,
      context,
      metadata,
      timestamp: new Date()
    };

    const formattedMessage = this.formatMessage(logMessage);

    // In development, use console
    if (this.isDevelopment) {
      switch (logLevel) {
        case LogLevel.DEBUG:
          console.log(formattedMessage);
          break;
        case LogLevel.INFO:
          console.info(formattedMessage);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage);
          break;
        case LogLevel.ERROR:
          console.error(formattedMessage);
          break;
      }
    } else {
      // In production, send to monitoring service (e.g., Sentry, DataDog)
      this.sendToMonitoringService(logMessage);
    }
  }

  private sendToMonitoringService(logMessage: LogMessage) {
    // Only send ERROR level logs to monitoring in production
    if (logMessage.level === LogLevel.ERROR) {
      // TODO: Integrate with monitoring service like Sentry
      // Sentry.captureMessage(logMessage.message, 'error', { extra: logMessage.metadata });
    }
  }

  // Public methods
  debug(message: string, context?: string, metadata?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, context, metadata);
  }

  info(message: string, context?: string, metadata?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context, metadata);
  }

  warn(message: string, context?: string, metadata?: Record<string, any>) {
    this.log(LogLevel.WARN, message, context, metadata);
  }

  error(message: string, context?: string, metadata?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, context, metadata);
  }

  // Convenient methods for common scenarios
  setContext(context: string) {
    return {
      debug: (message: string, metadata?: Record<string, any>) => this.debug(message, context, metadata),
      info: (message: string, metadata?: Record<string, any>) => this.info(message, context, metadata),
      warn: (message: string, metadata?: Record<string, any>) => this.warn(message, context, metadata),
      error: (message: string, metadata?: Record<string, any>) => this.error(message, context, metadata),
    };
  }
}

// Export singleton instance
export const logger = new Logger();

export default logger;
